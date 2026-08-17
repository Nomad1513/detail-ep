// DETAIL multi-device sync — Supabase Realtime Broadcast (optional)
// Without config, app stays local-only. With URL + anon key, devices share a mission by code.

let supabaseClient = null;
let syncChannel = null;
let syncReady = false;
let lastPush = 0;
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
  if (!isSyncConfigured()) {
    supabaseClient = null;
    syncReady = false;
    return false;
  }
  if (typeof window.supabase === "undefined") {
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
  if (syncChannel) {
    try { supabaseClient.removeChannel(syncChannel); } catch (e) {}
    syncChannel = null;
  }
}

async function joinMissionSync(mission) {
  leaveSyncChannel();
  if (!syncReady || !supabaseClient || !mission || !mission.code) return;

  const topic = "detail-mission-" + String(mission.code).toUpperCase();
  syncChannel = supabaseClient.channel(topic, {
    config: { broadcast: { self: false } }
  });

  syncChannel
    .on("broadcast", { event: "log" }, ({ payload }) => {
      applyRemoteLog(payload);
    })
    .on("broadcast", { event: "mark" }, ({ payload }) => {
      applyRemoteMark(payload);
    })
    .on("broadcast", { event: "phase" }, ({ payload }) => {
      applyRemotePhase(payload);
    })
    .on("broadcast", { event: "hello" }, ({ payload }) => {
      if (payload && payload.role) {
        showLogToast("ONLINE: " + (payload.role || "?") + " · " + (payload.team || ""), payload.role);
      }
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        syncChannel.send({
          type: "broadcast",
          event: "hello",
          payload: {
            role: currentRole,
            team: currentTeam,
            time: Date.now()
          }
        });
      }
    });
}

function applyRemoteLog(entry) {
  if (!currentMission || !entry) return;
  const key = eventKey(entry);
  if (seenEventKeys.has(key)) return;
  seenEventKeys.add(key);

  ensureMissionArrays(currentMission);
  // Don't re-apply our own echo if any
  const dup = currentMission.reports.some(
    r => r.time === entry.time && r.label === entry.label && r.role === entry.role
  );
  if (dup) return;

  currentMission.reports.push(entry);
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
  showLogToast(entry.label, entry.role);
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

function applyRemotePhase(payload) {
  // informational only for now — each role owns their checklist locally
  if (!payload) return;
}

async function publishLog(entry) {
  if (!syncChannel || !entry) return;
  seenEventKeys.add(eventKey(entry));
  try {
    await syncChannel.send({
      type: "broadcast",
      event: "log",
      payload: entry
    });
  } catch (e) {
    console.warn("publishLog failed", e);
  }
}

async function publishMark(mark) {
  if (!syncChannel || !mark) return;
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
  if (syncChannel) return "Sync live · code " + (currentMission && currentMission.code ? currentMission.code : "—");
  return "Sync ready — join a mission";
}
