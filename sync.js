// DETAIL multi-device sync — Supabase table + realtime (reliable)
let supabaseClient = null;
let syncChannel = null;
let syncReady = false;
let syncSubscribed = false;
let lastEventId = 0;
let pollTimer = null;
const seenEventKeys = new Set();

function loadSyncConfig() {
  try {
    return JSON.parse(localStorage.getItem("detail_sync_config") || "null") || { url: "", key: "" };
  } catch {
    return { url: "", key: "" };
  }
}

function saveSyncConfig(cfg) {
  localStorage.setItem("detail_sync_config", JSON.stringify(cfg));
}

function isSyncConfigured() {
  const c = loadSyncConfig();
  return !!(c.url && c.key && c.url.includes("http"));
}

function eventKey(e) {
  return [e.time, e.role, e.team || "", e.label].join("|");
}

async function initSync() {
  syncReady = false;
  syncSubscribed = false;
  stopPoll();
  if (!isSyncConfigured()) {
    supabaseClient = null;
    return false;
  }
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.warn("Supabase SDK not loaded");
    return false;
  }
  const cfg = loadSyncConfig();
  try {
    supabaseClient = window.supabase.createClient(cfg.url, cfg.key);
    syncReady = true;
    return true;
  } catch (err) {
    console.error("Sync init failed", err);
    return false;
  }
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function leaveSyncChannel() {
  syncSubscribed = false;
  stopPoll();
  if (syncChannel && supabaseClient) {
    try { supabaseClient.removeChannel(syncChannel); } catch (e) {}
  }
  syncChannel = null;
}

function startPoll(code) {
  stopPoll();
  pollTimer = setInterval(() => pullEvents(code), 2500);
  pullEvents(code);
}

async function pullEvents(code) {
  if (!supabaseClient || !code) return;
  try {
    const { data, error } = await supabaseClient
      .from("detail_events")
      .select("id, payload")
      .eq("code", String(code).toUpperCase())
      .gt("id", lastEventId)
      .order("id", { ascending: true })
      .limit(100);
    if (error) {
      console.warn("pullEvents", error);
      // surface once-ish on pull failures
      if (!window.__detailPullErrShown) {
        window.__detailPullErrShown = true;
        showLogToast("SYNC READ: " + (error.message || "fail").slice(0, 70), currentRole || "SL");
      }
      return;
    }
    (data || []).forEach(row => {
      if (row.id > lastEventId) lastEventId = row.id;
      const p = row.payload;
      if (!p) return;
      if (p.kind === "log") applyRemoteLog(p.entry);
      else if (p.kind === "mark") applyRemoteMark(p.entry);
      else if (p.kind === "hello") {
        if (p.entry && p.entry.role) {
          showLogToast("ONLINE: " + p.entry.role + " · " + (p.entry.team || ""), p.entry.role);
        }
      }
    });
  } catch (e) {
    console.warn("pullEvents fail", e);
  }
}

async function joinMissionSync(mission) {
  leaveSyncChannel();
  lastEventId = 0;
  if (!syncReady || !supabaseClient || !mission || !mission.code) {
    if (typeof updateHubStatus === "function") updateHubStatus();
    return;
  }

  const code = String(mission.code).toUpperCase();

  // Realtime (best effort)
  try {
    syncChannel = supabaseClient
      .channel("detail-ev-" + code)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "detail_events", filter: "code=eq." + code },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.id > lastEventId) lastEventId = row.id;
          const p = row.payload;
          if (!p) return;
          if (p.kind === "log") applyRemoteLog(p.entry);
          else if (p.kind === "mark") applyRemoteMark(p.entry);
          else if (p.kind === "hello" && p.entry) {
            showLogToast("ONLINE: " + (p.entry.role || "?") + " · " + (p.entry.team || ""), p.entry.role);
          }
        }
      )
      .subscribe((status) => {
        syncSubscribed = status === "SUBSCRIBED";
        if (typeof updateHubStatus === "function") updateHubStatus();
      });
  } catch (e) {
    console.warn("realtime subscribe failed", e);
  }

  // Polling always on as backup
  startPoll(code);
  syncSubscribed = true;
  if (typeof updateHubStatus === "function") updateHubStatus();
  showLogToast("SYNC CONNECTED", currentRole || "SL");

  // announce
  publishPayload({ kind: "hello", entry: { role: currentRole, team: currentTeam, time: Date.now() } });
}

async function publishPayload(payload) {
  if (!supabaseClient || !currentMission || !currentMission.code) return false;
  try {
    const { error } = await supabaseClient.from("detail_events").insert({
      code: String(currentMission.code).toUpperCase(),
      payload
    });
    if (error) {
      console.warn("publish error", error);
      const msg = (error.message || "send fail").slice(0, 80);
      showLogToast("SYNC ERR: " + msg, currentRole || "SL");
      return false;
    }
    return true;
  } catch (e) {
    console.warn("publish fail", e);
    return false;
  }
}

function applyRemoteLog(entry) {
  if (!currentMission || !entry) return;
  const key = eventKey(entry);
  if (seenEventKeys.has(key)) return;
  seenEventKeys.add(key);
  ensureMissionArrays(currentMission);
  const dup = currentMission.reports.some(
    r => r.time === entry.time && r.label === entry.label && r.role === entry.role
  );
  if (dup) return;
  currentMission.reports.push(entry);
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
  showLogToast(entry.label, entry.role);
  const logScreen = document.getElementById("log-screen");
  if (logScreen && logScreen.classList.contains("active") && typeof showLiveLog === "function") {
    showLiveLog();
  }
}

function applyRemoteMark(mark) {
  if (!currentMission || !mark) return;
  ensureMissionArrays(currentMission);
  const dup = currentMission.marks.some(
    m => m.time === mark.time && m.lat === mark.lat && m.lon === mark.lon && m.label === mark.label
  );
  if (dup) return;
  currentMission.marks.push(mark);
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
}

async function publishLog(entry) {
  if (!entry) return;
  seenEventKeys.add(eventKey(entry));
  await publishPayload({ kind: "log", entry });
}

async function publishMark(mark) {
  if (!mark) return;
  await publishPayload({ kind: "mark", entry: mark });
}

function syncStatusText() {
  if (!isSyncConfigured()) return "Sync off — local only";
  if (!syncReady) return "Sync configured — connecting…";
  if (currentMission && currentMission.code && (syncChannel || pollTimer)) {
    return "Sync live · code " + currentMission.code;
  }
  return "Sync ready — join a mission";
}
