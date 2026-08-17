// DETAIL multi-device sync — Supabase Realtime Broadcast
let supabaseClient = null;
let syncChannel = null;
let syncReady = false;
let syncSubscribed = false;
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
    supabaseClient = window.supabase.createClient(cfg.url, cfg.key, {
      realtime: { params: { eventsPerSecond: 20 } }
    });
    syncReady = true;
    return true;
  } catch (err) {
    console.error("Sync init failed", err);
    syncReady = false;
    return false;
  }
}

function leaveSyncChannel() {
  syncSubscribed = false;
  if (syncChannel && supabaseClient) {
    try { supabaseClient.removeChannel(syncChannel); } catch (e) {}
  }
  syncChannel = null;
}

async function joinMissionSync(mission) {
  leaveSyncChannel();
  if (!syncReady || !supabaseClient || !mission || !mission.code) {
    if (typeof updateHubStatus === "function") updateHubStatus();
    return;
  }

  const topic = "detail-mission-" + String(mission.code).toUpperCase();
  syncChannel = supabaseClient.channel(topic, {
    config: { broadcast: { self: false, ack: true } }
  });

  syncChannel
    .on("broadcast", { event: "log" }, ({ payload }) => {
      applyRemoteLog(payload);
    })
    .on("broadcast", { event: "mark" }, ({ payload }) => {
      applyRemoteMark(payload);
    })
    .on("broadcast", { event: "hello" }, ({ payload }) => {
      if (payload && payload.role) {
        showLogToast("ONLINE: " + (payload.role || "?") + " · " + (payload.team || ""), payload.role);
      }
    })
    .subscribe((status) => {
      syncSubscribed = (status === "SUBSCRIBED");
      if (typeof updateHubStatus === "function") updateHubStatus();
      if (status === "SUBSCRIBED") {
        showLogToast("SYNC CONNECTED", currentRole || "SL");
        syncChannel.send({
          type: "broadcast",
          event: "hello",
          payload: {
            role: currentRole,
            team: currentTeam,
            time: Date.now()
          }
        });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        showLogToast("SYNC ERROR: " + status, currentRole || "SL");
      }
    });
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
  // Refresh log if open
  const logEl = document.getElementById("live-log-content");
  if (logEl && document.getElementById("log-screen") && document.getElementById("log-screen").classList.contains("active")) {
    if (typeof showLiveLog === "function") showLiveLog();
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
  if (!syncChannel || !syncSubscribed) {
    console.warn("publishLog: not subscribed yet");
    return;
  }
  try {
    const res = await syncChannel.send({
      type: "broadcast",
      event: "log",
      payload: entry
    });
    if (res !== "ok") console.warn("publishLog result", res);
  } catch (e) {
    console.warn("publishLog failed", e);
  }
}

async function publishMark(mark) {
  if (!mark || !syncChannel || !syncSubscribed) return;
  try {
    await syncChannel.send({
      type: "broadcast",
      event: "mark",
      payload: mark
    });
  } catch (e) {
    console.warn("publishMark failed", e);
  }
}

function syncStatusText() {
  if (!isSyncConfigured()) return "Sync off — local only";
  if (!syncReady) return "Sync configured — connecting…";
  if (syncChannel && syncSubscribed) return "Sync live · code " + (currentMission && currentMission.code ? currentMission.code : "—");
  if (syncChannel) return "Sync connecting… · code " + (currentMission && currentMission.code ? currentMission.code : "—");
  return "Sync ready — join a mission";
}
