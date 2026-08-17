// DETAIL — Local Encryption Layer
// Uses Web Crypto API. All operational data encrypted at rest.
// Designed so true multi-device E2E can be layered later.

const CryptoHelper = (() => {
  const SALT_KEY = "detail_salt_v1";
  const VERIFIER_KEY = "detail_verifier_v1";

  async function deriveKey(pin, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(pin),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 310000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  function getOrCreateSalt() {
    let saltB64 = localStorage.getItem(SALT_KEY);
    if (!saltB64) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      saltB64 = btoa(String.fromCharCode(...salt));
      localStorage.setItem(SALT_KEY, saltB64);
    }
    return Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  }

  async function setupPin(pin) {
    const salt = getOrCreateSalt();
    const key = await deriveKey(pin, salt);
    // Store a verifier so we can check PIN later without keeping the key
    const verifier = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      new TextEncoder().encode("DETAIL_OK")
    );
    localStorage.setItem(VERIFIER_KEY, btoa(String.fromCharCode(...new Uint8Array(verifier))));
    return key;
  }

  async function unlock(pin) {
    const salt = getOrCreateSalt();
    const key = await deriveKey(pin, salt);
    const verifierB64 = localStorage.getItem(VERIFIER_KEY);
    if (!verifierB64) {
      // First run
      await setupPin(pin);
      return key;
    }
    try {
      const verifier = Uint8Array.from(atob(verifierB64), c => c.charCodeAt(0));
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        key,
        verifier
      );
      return key;
    } catch {
      throw new Error("Invalid PIN");
    }
  }

  async function encrypt(data, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    };
  }

  async function decrypt(payload, key) {
    const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(payload.data), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  return { unlock, encrypt, decrypt, setupPin };
})();
