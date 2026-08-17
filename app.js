// DETAIL v0.8 — Home hub, join mission, teams, tappable phases, photos screen

let currentRole = null;
let currentTeam = "TEAM1";
let currentMission = null;
let currentPhaseIndex = 0;
let missions = [];
let paperworkLibrary = []; // preloaded templates/docs for missions
let pendingPhotoContext = null;
let pendingPaperTarget = "mission"; // "mission" | "library"
let joinTargetId = null;
let currentFormInstance = null; // { templateId, values, missionId }

const TEAMS = [
  { id: "TEAM1", name: "TEAM 1" },
  { id: "TEAM2", name: "TEAM 2" }
];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goHome() {
  updateHubStatus();
  showScreen("home-screen");
}

function loadMissions() {
  try {
    const raw = localStorage.getItem("detail_missions_v3");
    missions = raw ? JSON.parse(raw) : [];
  } catch { missions = []; }
  try {
    const lib = localStorage.getItem("detail_paperwork_lib");
    paperworkLibrary = lib ? JSON.parse(lib) : [];
  } catch { paperworkLibrary = []; }
}

function saveMissions() {
  localStorage.setItem("detail_missions_v3", JSON.stringify(missions));
}

function savePaperworkLibrary() {
  localStorage.setItem("detail_paperwork_lib", JSON.stringify(paperworkLibrary));
}

function ensureBuiltinForms() {
  Object.values(FORM_TEMPLATES).forEach(t => {
    if (paperworkLibrary.some(x => x.templateId === t.id)) return;
    paperworkLibrary.push({
      id: "tpl_" + t.id,
      name: t.title,
      mime: "application/x-detail-form",
      isPdf: false,
      isForm: true,
      templateId: t.id,
      dataUrl: null,
      created: Date.now(),
      fillable: true,
      fields: null,
      defaultValues: {} // persists across missions — edit once, reuse
    });
  });
  // ensure defaultValues key exists on older library entries
  paperworkLibrary.forEach(x => {
    if (x.isForm && x.defaultValues == null) x.defaultValues = {};
  });
  savePaperworkLibrary();
}

function getFormDefaults(templateId) {
  const item = paperworkLibrary.find(x => x.templateId === templateId);
  return (item && item.defaultValues) ? { ...item.defaultValues } : {};
}

function updateFormDefaults(templateId, values) {
  const item = paperworkLibrary.find(x => x.templateId === templateId);
  if (!item) return;
  item.defaultValues = { ...values };
  item.updated = Date.now();
  savePaperworkLibrary();
}


function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: +pos.coords.latitude.toFixed(6),
        lon: +pos.coords.longitude.toFixed(6),
        acc: Math.round(pos.coords.accuracy),
        alt: pos.coords.altitude != null ? Math.round(pos.coords.altitude) : null
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  });
}

function ensureMissionArrays(m) {
  if (!m.reports) m.reports = [];
  if (!m.photos) m.photos = [];
  if (!m.paperwork) m.paperwork = [];
  if (!m.marks) m.marks = [];
  if (!m.teams) m.teams = ["TEAM1", "TEAM2"];
  if (!m.phaseLogged) m.phaseLogged = {};
}

function openAppMenu() {
  const existing = document.querySelector(".app-menu-panel");
  if (existing) { existing.remove(); return; }
  const panel = document.createElement("div");
  panel.className = "app-menu-panel";
  panel.innerHTML = `
    <div class="app-menu-sheet">
      <div class="menu-header">MENU</div>
      <button class="menu-option" data-action="home" type="button">Home</button>
      <button class="menu-option" data-action="export" type="button">Export records</button>
      <button class="menu-option" data-action="import" type="button">Import records</button>
      <button class="menu-option" data-action="sops" type="button">SOPs</button>
      <button class="menu-option" data-action="settings" type="button">Settings</button>
      <button class="menu-option" data-action="about" type="button">About</button>
      <button class="menu-cancel" type="button">CLOSE</button>
    </div>`;
  document.body.appendChild(panel);
  panel.querySelector(".menu-cancel").addEventListener("click", () => panel.remove());
  panel.addEventListener("click", (e) => { if (e.target === panel) panel.remove(); });
  panel.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const a = btn.dataset.action;
      panel.remove();
      if (a === "home") goHome();
      else if (a === "export") exportAllRecords();
      else if (a === "import") document.getElementById("import-input").click();
      else if (a === "sops") alert("SOPs library — next.");
      else if (a === "settings") openSyncSettings();
      else if (a === "about") alert("THE DETAIL\nEP operations · multi-device sync when configured.");
    });
  });
}

function updateHubStatus() {
  const el = document.getElementById("hub-status");
  if (!el) return;
  const syncLine = `<div class="hub-sync">${typeof syncStatusText === "function" ? syncStatusText() : ""}</div>`;
  if (currentMission && currentRole) {
    el.innerHTML = `<div class="hub-active">ACTIVE: <strong>${currentMission.code || "—"}</strong> · ${currentTeam} · <span style="color:${ROLES[currentRole].color}">${ROLES[currentRole].name}</span>
      <button class="btn secondary hub-resume" id="resume-mission-btn" type="button">RESUME</button></div>${syncLine}`;
    const r = document.getElementById("resume-mission-btn");
    if (r) r.addEventListener("click", () => { showScreen("mission-screen"); renderMissionPhase(); });
  } else if (currentMission) {
    el.innerHTML = `<div class="hub-active">Mission <strong>${currentMission.code || "—"}</strong> — pick role
      <button class="btn secondary hub-resume" id="pick-role-btn" type="button">SELECT ROLE</button></div>${syncLine}`;
    const b = document.getElementById("pick-role-btn");
    if (b) b.addEventListener("click", openRoleSelect);
  } else {
    el.innerHTML = `<div class="hub-idle">No active mission</div>${syncLine}`;
  }
}

function deleteMission(id) {
  if (!confirm("Delete this mission? This cannot be undone.")) return;
  missions = missions.filter(m => m.id !== id);
  if (currentMission && currentMission.id === id) {
    currentMission = null;
    currentRole = currentRole; // keep role
  }
  saveMissions();
  renderMissionList();
  updateHubStatus();
}

function clearAllMissions() {
  if (!missions.length) return;
  if (!confirm("Delete ALL missions on this device? This cannot be undone.")) return;
  missions = [];
  currentMission = null;
  saveMissions();
  renderMissionList();
  updateHubStatus();
}

function renderMissionList() {
  const list = document.getElementById("mission-list");
  if (!missions.length) {
    list.innerHTML = `<div class="empty-state">No missions yet.<br>Create or join one.</div>`;
    return;
  }
  list.innerHTML = missions.slice().reverse().map(m => {
    const phase = PHASES[m.phaseIndex || 0];
    const n = (m.reports && m.reports.length) || 0;
    return `
      <div class="mission-card-row">
        <div class="mission-card" data-id="${m.id}">
          <h3>${m.title}</h3>
          <div class="meta">Code <strong>${m.code || "—"}</strong> · ${m.status === "complete" ? "Complete" : phase.name} · ${n} events</div>
        </div>
        <button class="btn mission-delete" data-delete="${m.id}" type="button" title="Delete">✕</button>
      </div>`;
  }).join("");
  list.querySelectorAll(".mission-card").forEach(card => {
    card.addEventListener("click", () => {
      joinTargetId = card.dataset.id;
      openRoleSelect();
    });
  });
  list.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteMission(btn.dataset.delete);
    });
  });
}

function openRoleSelect() {
  const m = missions.find(x => x.id === joinTargetId) || currentMission;
  document.getElementById("join-mission-label").textContent = m
    ? `${m.title} · Code ${m.code || "—"}`
    : "Select team and role";

  const teamRow = document.getElementById("team-row");
  teamRow.innerHTML = TEAMS.map(t => `
    <button class="team-chip${currentTeam === t.id ? " active" : ""}" data-team="${t.id}" type="button">${t.name}</button>
  `).join("");
  teamRow.querySelectorAll(".team-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTeam = btn.dataset.team;
      localStorage.setItem("detail_team", currentTeam);
      openRoleSelect();
    });
  });

  const grid = document.getElementById("role-grid");
  grid.innerHTML = Object.values(ROLES).map(r => `
    <div class="role-card" data-role="${r.id}">
      <div class="role-dot" style="background:${r.color}"></div>
      <div><h3>${r.name}</h3><p>${r.full}</p></div>
    </div>`).join("");
  grid.querySelectorAll(".role-card").forEach(card => {
    card.addEventListener("click", () => {
      currentRole = card.dataset.role;
      localStorage.setItem("detail_role", currentRole);
      localStorage.setItem("detail_team", currentTeam);
      if (joinTargetId) {
        currentMission = missions.find(m => m.id === joinTargetId);
        joinTargetId = null;
      }
      if (!currentMission) { showScreen("missions-screen"); renderMissionList(); return; }
      ensureMissionArrays(currentMission);
      currentPhaseIndex = currentMission.phaseIndex || 0;
      showScreen("mission-screen");
      renderMissionPhase();
    });
  });
  showScreen("role-screen");
}

function createMission() {
  const code = genCode();
  const id = "msn_" + Date.now();
  const m = {
    id,
    code,
    type: "movement",
    title: "Mission " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}),
    created: Date.now(),
    updated: Date.now(),
    status: "in_progress",
    phaseIndex: 0,
    teams: ["TEAM1", "TEAM2"],
    checks: {},
    reports: [],
    photos: [],
    paperwork: [],
    marks: []
  };
  Object.keys(ROLE_CHECKLISTS).forEach(role => {
    m.checks[role] = {};
    Object.keys(ROLE_CHECKLISTS[role]).forEach(phaseId => {
      m.checks[role][phaseId] = {};
      ROLE_CHECKLISTS[role][phaseId].forEach(item => {
        m.checks[role][phaseId][item.id] = { checked: false };
      });
    });
  });
  missions.push(m);
  saveMissions();
  currentMission = m;
  joinTargetId = m.id;
  alert("Mission created.\n\nCODE: " + code + "\n\nShare this code with the other team so they can join.");
  openRoleSelect();
}

function joinMissionPrompt() {
  const code = (prompt("Enter mission code:") || "").trim().toUpperCase();
  if (!code) return;
  let m = missions.find(x => (x.code || "").toUpperCase() === code);
  if (!m) {
    // Cross-device join: create a local shell for this code and attach to sync channel
    if (!isSyncConfigured()) {
      alert("No mission with that code on this device.\n\nTurn on Sync in Settings (Supabase URL + key) on both devices, then join with the code.");
      return;
    }
    const id = "msn_join_" + code + "_" + Date.now();
    m = {
      id,
      code,
      type: "movement",
      title: "Mission " + code,
      created: Date.now(),
      updated: Date.now(),
      status: "in_progress",
      phaseIndex: 0,
      teams: ["TEAM1", "TEAM2"],
      checks: {},
      reports: [],
      photos: [],
      paperwork: [],
      marks: [],
      joinedRemote: true
    };
    Object.keys(ROLE_CHECKLISTS).forEach(role => {
      m.checks[role] = {};
      Object.keys(ROLE_CHECKLISTS[role]).forEach(phaseId => {
        m.checks[role][phaseId] = {};
        ROLE_CHECKLISTS[role][phaseId].forEach(item => {
          m.checks[role][phaseId][item.id] = { checked: false };
        });
      });
    });
    missions.push(m);
    saveMissions();
  }
  joinTargetId = m.id;
  currentMission = m;
  openRoleSelect();
}

function syncMissionToList() {
  if (!currentMission) return;
  const idx = missions.findIndex(m => m.id === currentMission.id);
  if (idx >= 0) missions[idx] = currentMission;
  else missions.push(currentMission);
}

function showLogToast(label, role) {
  const roleInfo = ROLES[role] || { color: "#888", name: role || "?" };
  const toast = document.createElement("div");
  toast.className = "toast toast-log";
  toast.innerHTML = `<span class="toast-role" style="background:${roleInfo.color}">${roleInfo.name}</span> <span class="toast-label">${label}</span>`;
  toast.addEventListener("click", () => { toast.remove(); showLiveLog(); });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

let focusMarkCoords = null; // {lat, lon, label} when opening GPS from a log entry

async function logEvent(label, extra, opts) {
  if (!currentMission) return;
  ensureMissionArrays(currentMission);
  const options = opts || {};
  const shouldMark = options.mark !== false && !String(label).startsWith("CHECK:");

  // Write the log entry immediately so it always appears in the log
  const entry = {
    time: Date.now(),
    role: currentRole,
    team: currentTeam,
    phase: PHASES[currentPhaseIndex].id,
    label: label
  };
  if (extra) Object.assign(entry, extra);
  currentMission.reports.push(entry);
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
  if (typeof seenEventKeys !== "undefined") seenEventKeys.add(eventKey(entry));
  if (typeof publishLog === "function") publishLog(entry);

  showLogToast(label, currentRole);

  // GPS mark in the background (does not block the log entry)
  if (shouldMark) {
    let pos = (extra && extra.lat != null) ? { lat: extra.lat, lon: extra.lon, acc: extra.acc } : null;
    if (!pos) {
      try { pos = await getPosition(); } catch (e) { pos = null; }
    }
    if (pos) {
      entry.lat = pos.lat;
      entry.lon = pos.lon;
      if (pos.acc != null) entry.acc = pos.acc;
      const mark = {
        time: entry.time,
        role: currentRole,
        team: currentTeam,
        phase: entry.phase,
        type: "report",
        label: label,
        lat: pos.lat,
        lon: pos.lon,
        acc: pos.acc || null
      };
      currentMission.marks.push(mark);
      currentMission.updated = Date.now();
      syncMissionToList();
      saveMissions();
      if (typeof publishMark === "function") publishMark(mark);
    }
  }
}

function closeMenus() {
  document.querySelectorAll(".menu-panel").forEach(p => p.remove());
}

function openMenu(title, options, onSelect) {
  closeMenus();
  const panel = document.createElement("div");
  panel.className = "menu-panel";
  panel.innerHTML = `
    <div class="menu-sheet">
      <div class="menu-header">${title}</div>
      <div class="menu-list">
        ${options.map((o, i) => `<button class="menu-option" data-idx="${i}" type="button">${o.label}</button>`).join("")}
      </div>
      <button class="menu-cancel" type="button">CANCEL</button>
    </div>`;
  document.body.appendChild(panel);
  panel.querySelector(".menu-cancel").addEventListener("click", closeMenus);
  panel.addEventListener("click", (e) => { if (e.target === panel) closeMenus(); });
  panel.querySelectorAll(".menu-option").forEach(btn => {
    btn.addEventListener("click", () => {
      onSelect(options[parseInt(btn.dataset.idx, 10)]);
      closeMenus();
    });
  });
}

function renderTimeline() {
  const el = document.getElementById("timeline-fixed");
  if (!el) return;
  el.innerHTML = `<div class="timeline-inner"><span class="tl-label">T-LINE</span>${TIMELINE.map(t => `<span class="tl-item"><b>${t.t}</b> ${t.desc}</span>`).join("")}</div>`;
}

function isActivePhase(phaseId) {
  return ACTIVE_PHASES.indexOf(phaseId) !== -1;
}

function openEmergencyConfirm() {
  if (document.querySelector(".emerg-panel")) return;
  const panel = document.createElement("div");
  panel.className = "emerg-panel";
  panel.innerHTML = `
    <div class="emerg-sheet">
      <div class="emerg-title">EMERGENCY</div>
      <p class="emerg-copy">This will log the event and open your phone dialer to <strong>911</strong>.</p>
      <p class="emerg-copy dim">Only continue if this is a real emergency.</p>
      <button class="btn emerg-call" id="emerg-confirm-btn" type="button">HOLD TO CALL 911</button>
      <button class="btn emerg-cancel" id="emerg-cancel-btn" type="button">CANCEL</button>
    </div>
  `;
  document.body.appendChild(panel);

  const cancel = () => panel.remove();
  panel.querySelector("#emerg-cancel-btn").addEventListener("click", cancel);
  panel.addEventListener("click", (e) => { if (e.target === panel) cancel(); });

  // Require press-and-hold ~1.2s so a quick tap cannot fire it
  const holdBtn = panel.querySelector("#emerg-confirm-btn");
  let holdTimer = null;
  let holdStarted = 0;

  const clearHold = () => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    holdBtn.classList.remove("holding");
    holdBtn.textContent = "HOLD TO CALL 911";
  };

  const startHold = (e) => {
    e.preventDefault();
    holdStarted = Date.now();
    holdBtn.classList.add("holding");
    holdBtn.textContent = "KEEP HOLDING…";
    holdTimer = setTimeout(async () => {
      holdTimer = null;
      panel.remove();
      await logEvent("⚠ EMERGENCY — ALL HANDS");
      // Opens native dialer — user still must tap Call on most phones
      window.location.href = "tel:911";
    }, 1200);
  };

  holdBtn.addEventListener("mousedown", startHold);
  holdBtn.addEventListener("touchstart", startHold, { passive: false });
  holdBtn.addEventListener("mouseup", clearHold);
  holdBtn.addEventListener("mouseleave", clearHold);
  holdBtn.addEventListener("touchend", clearHold);
  holdBtn.addEventListener("touchcancel", clearHold);
}

function renderMissionPhase() {
  if (!currentMission || !currentRole) return;
  const phase = PHASES[currentPhaseIndex];
  document.getElementById("mission-title").textContent = phase.name.toUpperCase();

  const meta = document.getElementById("mission-meta-bar");
  meta.innerHTML = `<span>Code <strong>${currentMission.code || "—"}</strong></span>
    <span>${currentTeam}</span>
    <span style="color:${ROLES[currentRole].color}">${ROLES[currentRole].name}</span>`;

  // Tappable phase chips — green only when all checks for that phase are done
  function isPhaseComplete(phaseId) {
    const list = (ROLE_CHECKLISTS[currentRole] && ROLE_CHECKLISTS[currentRole][phaseId]) || [];
    if (!list.length) return false;
    return list.every(item => {
      const st = currentMission.checks[currentRole] &&
        currentMission.checks[currentRole][phaseId] &&
        currentMission.checks[currentRole][phaseId][item.id];
      return st && st.checked;
    });
  }

  const bar = document.getElementById("phase-bar");
  bar.innerHTML = PHASES.map((p, i) => {
    let cls = "phase-chip";
    if (i === currentPhaseIndex) cls += " active";
    if (isPhaseComplete(p.id)) cls += " done";
    return `<button type="button" class="${cls}" data-phase="${i}">${p.name}</button>`;
  }).join("");
  bar.querySelectorAll(".phase-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      goToPhase(parseInt(chip.dataset.phase, 10));
    });
  });

  const content = document.getElementById("mission-content");
  const role = currentRole;
  const items = (ROLE_CHECKLISTS[role] && ROLE_CHECKLISTS[role][phase.id]) || [];
  const active = isActivePhase(phase.id);

  let html = `<div class="step-header"><h2>${phase.label}</h2><p>${phase.desc}</p></div>`;
  if (!items.length) {
    html += `<div class="empty-state">No items for this role in this phase.</div>`;
  } else {
    html += `<div class="checklist">`;
    items.forEach(item => {
      const state = (currentMission.checks[role] && currentMission.checks[role][phase.id] && currentMission.checks[role][phase.id][item.id]) || { checked: false };
      html += `<button class="tap-item${state.checked ? " done" : ""}" data-item="${item.id}" type="button">
        <span class="tap-check">${state.checked ? "✓" : ""}</span>
        <span class="tap-text">${item.text}</span>
      </button>`;
    });
    html += `</div>`;
  }

  if (active) {
    html += `
      <div class="action-row">
        <button class="btn action-btn" id="report-btn" type="button">REPORT</button>
        <button class="btn action-btn sig-action" id="sig-btn" type="button">SIGNIFICANT</button>
      </div>
      <button class="btn emergency-btn" id="emergency-btn" type="button">⚠ EMERGENCY</button>`;
  }

  content.innerHTML = html;
  renderTimeline();

  content.querySelectorAll(".tap-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.item;
      if (!currentMission.checks[role][phase.id]) currentMission.checks[role][phase.id] = {};
      if (!currentMission.checks[role][phase.id][itemId]) currentMission.checks[role][phase.id][itemId] = { checked: false };
      const st = currentMission.checks[role][phase.id][itemId];
      st.checked = !st.checked;
      currentMission.updated = Date.now();
      syncMissionToList();
      saveMissions();
      btn.classList.toggle("done", st.checked);
      btn.querySelector(".tap-check").textContent = st.checked ? "✓" : "";
      // Refresh phase chip green state without full re-render
      document.querySelectorAll("#phase-bar .phase-chip").forEach(chip => {
        const pi = parseInt(chip.dataset.phase, 10);
        const pid = PHASES[pi].id;
        const list = (ROLE_CHECKLISTS[currentRole] && ROLE_CHECKLISTS[currentRole][pid]) || [];
        const complete = list.length > 0 && list.every(it => {
          const s = currentMission.checks[currentRole] && currentMission.checks[currentRole][pid] && currentMission.checks[currentRole][pid][it.id];
          return s && s.checked;
        });
        chip.classList.toggle("done", complete);
        if (pi === currentPhaseIndex) chip.classList.add("active");
      });
      // Log phase complete once when all checks for this role/phase are done
      if (st.checked) {
        ensureMissionArrays(currentMission);
        const list = (ROLE_CHECKLISTS[role] && ROLE_CHECKLISTS[role][phase.id]) || [];
        const complete = list.length > 0 && list.every(it => {
          const s = currentMission.checks[role][phase.id] && currentMission.checks[role][phase.id][it.id];
          return s && s.checked;
        });
        const key = role + ":" + phase.id;
        if (complete && !currentMission.phaseLogged[key]) {
          currentMission.phaseLogged[key] = true;
          logEvent("Phase " + phase.num + " (" + phase.name + ") : Complete", null, { mark: false });
        }
      }
    });
  });

  const reportBtn = document.getElementById("report-btn");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      const phaseReports = QUICK_REPORTS_BY_PHASE[phase.id] || [];
      if (!phaseReports.length) { alert("No quick reports for this phase."); return; }
      openMenu("REPORT — " + phase.name.toUpperCase(), phaseReports, (opt) => logEvent(opt.label));
    });
  }
  const sigBtn = document.getElementById("sig-btn");
  if (sigBtn) {
    sigBtn.addEventListener("click", () => {
      openMenu("SIGNIFICANT EVENT", SIGNIFICANT_EVENTS, (opt) => logEvent("SIG: " + opt.label));
    });
  }
  const emergBtn = document.getElementById("emergency-btn");
  if (emergBtn) {
    emergBtn.addEventListener("click", () => openEmergencyConfirm());
  }

  document.getElementById("prev-phase-btn").disabled = currentPhaseIndex === 0;
  document.getElementById("next-phase-btn").textContent =
    currentPhaseIndex === PHASES.length - 1 ? "FINISH / ENDEX" : "NEXT PHASE";
}

document.getElementById("camera-input").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file || !currentMission) return;
  const pos = await getPosition();
  const reader = new FileReader();
  reader.onload = () => {
    ensureMissionArrays(currentMission);
    currentMission.photos.push({
      time: Date.now(), role: currentRole, team: currentTeam,
      phase: PHASES[currentPhaseIndex].id,
      label: (pendingPhotoContext && pendingPhotoContext.label) || "PHOTO",
      dataUrl: reader.result,
      lat: pos ? pos.lat : null, lon: pos ? pos.lon : null,
      acc: pos ? pos.acc : null, alt: pos ? pos.alt : null
    });
    const geoStr = pos ? ` @ ${pos.lat}, ${pos.lon}` : " (no GPS)";
    logEvent("PHOTO" + geoStr, { lat: pos && pos.lat, lon: pos && pos.lon, hasPhoto: true });
    saveMissions();
    pendingPhotoContext = null;
  };
  reader.readAsDataURL(file);
});

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("paperwork-input").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    alert("File is too large (max ~4MB for device storage).\nCompress the PDF or use a photo of the page.");
    return;
  }
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const dataUrl = await readFileAsDataUrl(file);
  const name = file.name || (isPdf ? "document.pdf" : "scan.jpg");
  const mime = file.type || (isPdf ? "application/pdf" : "image/jpeg");

  if (pendingPaperTarget === "library") {
    paperworkLibrary.push({
      id: "lib_" + Date.now(),
      name,
      mime,
      isPdf: !!isPdf,
      dataUrl,
      created: Date.now(),
      // future: fillable form schema
      fillable: false,
      fields: null
    });
    savePaperworkLibrary();
    pendingPaperTarget = "mission";
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = "ADDED TO LIBRARY: " + name;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1400);
    showScreen("files-screen");
    renderFilesScreen();
    return;
  }

  if (!currentMission) {
    alert("Join or create a mission first, or add to Library from Media.");
    return;
  }
  const pos = await getPosition();
  ensureMissionArrays(currentMission);
  currentMission.paperwork.push({
    time: Date.now(),
    role: currentRole,
    team: currentTeam,
    phase: PHASES[currentPhaseIndex] ? PHASES[currentPhaseIndex].id : null,
    name,
    mime,
    isPdf: !!isPdf,
    dataUrl,
    lat: pos ? pos.lat : null,
    lon: pos ? pos.lon : null,
    fromLibrary: false
  });
  const geoStr = pos ? ` @ ${pos.lat}, ${pos.lon}` : "";
  logEvent("PAPERWORK: " + name + geoStr, { lat: pos && pos.lat, lon: pos && pos.lon, hasPaperwork: true });
  saveMissions();
});

function attachLibraryItemToMission(libId) {
  if (!currentMission) {
    alert("Open or create a mission first, then attach.");
    return;
  }
  const item = paperworkLibrary.find(x => x.id === libId);
  if (!item) return;

  // Fillable digital form
  if (item.isForm && item.templateId && FORM_TEMPLATES[item.templateId]) {
    ensureMissionArrays(currentMission);
    let existing = currentMission.paperwork.find(p => p.isForm && p.templateId === item.templateId);
    if (!existing) {
      currentMission.paperwork.push({
        time: Date.now(),
        role: currentRole,
        team: currentTeam,
        name: item.name,
        isForm: true,
        templateId: item.templateId,
        values: getFormDefaults(item.templateId),
        filled: false,
        fromLibrary: true,
        libraryId: item.id
      });
      syncMissionToList();
      saveMissions();
      logEvent("FORM ATTACHED: " + item.name, { templateId: item.templateId }, { mark: false });
      existing = currentMission.paperwork.find(p => p.isForm && p.templateId === item.templateId);
    }
    openFillableForm(item.templateId, existing && existing.values);
    return;
  }

  ensureMissionArrays(currentMission);
  if (currentMission.paperwork.some(p => p.libraryId === libId)) {
    alert("Already attached to this mission.");
    return;
  }
  currentMission.paperwork.push({
    time: Date.now(),
    role: currentRole,
    team: currentTeam,
    phase: null,
    name: item.name,
    mime: item.mime,
    isPdf: item.isPdf,
    dataUrl: item.dataUrl,
    libraryId: item.id,
    fromLibrary: true,
    fillable: !!item.fillable,
    fields: item.fields ? JSON.parse(JSON.stringify(item.fields)) : null,
    filled: false
  });
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
  logEvent("PAPERWORK ATTACHED: " + item.name, null, { mark: false });
  showScreen("files-screen");
  renderFilesScreen();
}

function deleteLibraryItem(libId) {
  if (!confirm("Remove this file from the paperwork library?")) return;
  paperworkLibrary = paperworkLibrary.filter(x => x.id !== libId);
  savePaperworkLibrary();
  renderFilesScreen();
}


function goToPhase(newIndex, opts) {
  if (!currentMission || newIndex < 0 || newIndex >= PHASES.length) return;
  if (newIndex === currentPhaseIndex && !(opts && opts.force)) return;
  currentPhaseIndex = newIndex;
  currentMission.phaseIndex = currentPhaseIndex;
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
  // No log on tab jump — only PHASE COMPLETE when all checks done
  renderMissionPhase();
  const mc = document.getElementById("mission-content");
  if (mc) mc.scrollTop = 0;
}

function nextPhase() {
  if (currentPhaseIndex < PHASES.length - 1) {
    goToPhase(currentPhaseIndex + 1);
  } else {
    currentMission.status = "complete";
    currentMission.updated = Date.now();
    syncMissionToList();
    saveMissions();
    showReport();
  }
}

function prevPhase() {
  if (currentPhaseIndex > 0) goToPhase(currentPhaseIndex - 1);
}

function buildLogHTML() {
  ensureMissionArrays(currentMission);
  let html = `<div class="report-section"><h3>Mission</h3>
    <p>${currentMission.title}<br><small>Code ${currentMission.code || "—"} · ${new Date(currentMission.created).toLocaleString()}</small></p>
    <p>${currentTeam} · <strong style="color:${ROLES[currentRole].color}">${ROLES[currentRole].name}</strong></p></div>`;

  const events = currentMission.reports
    .filter(r => !String(r.label).startsWith("CHECK:"))
    .slice()
    .sort((a, b) => b.time - a.time);
  if (events.length) {
    html += `<div class="report-section"><h3>Activity Log</h3>`;
    events.forEach(r => {
      const roleInfo = ROLES[r.role] || { color: "#888", name: r.role || "?" };
      const geo = r.lat != null ? `<span class="log-geo">${r.lat}, ${r.lon}</span>` : "";
      const team = r.team ? r.team + " · " : "";
      const label = String(r.label);
      const isEmerg = label.includes("EMERGENCY");
      const isSig = label.startsWith("SIG:") || isEmerg;
      const isPhase = label.startsWith("Phase ");
      const isPhoto = label.startsWith("PHOTO");
      const isForm = label.startsWith("FORM ");
      const isPaper = label.startsWith("PAPERWORK");
      const isReport = !isSig && !isPhase && !isPhoto && !isPaper && !isForm;
      let typeBadge = "";
      let typeClass = "";
      if (isEmerg) { typeBadge = "EMERGENCY"; typeClass = "log-emerg"; }
      else if (isSig) { typeBadge = "SIGNIFICANT"; typeClass = "log-sig"; }
      else if (isPhase) { typeBadge = ""; typeClass = "log-phase-ev"; }
      else if (isForm) { typeBadge = "FORM"; typeClass = "log-paper log-form-tap"; }
      else if (isPaper) { typeBadge = "PAPERWORK"; typeClass = "log-paper"; }
      else if (isPhoto) { typeBadge = "PHOTO"; typeClass = "log-photo"; }
      else if (isReport) { typeBadge = "REPORT"; typeClass = "log-report"; }
      const typeHtml = typeBadge ? `<span class="log-type ${typeClass}">${typeBadge}</span>` : "";
      const phaseRight = isPhase ? "" : (r.phase || "");
      // Resolve templateId from event or by matching form name on mission
      let tid = r.templateId || "";
      if (isForm && !tid) {
        const fname = label.replace(/^FORM ATTACHED:\s*/i, "").trim();
        const match = (currentMission.paperwork || []).find(p => p.isForm && p.name === fname);
        if (match) tid = match.templateId;
      }
      let tapAttr = "";
      let tapHint = `<div class="log-meta">${team}${geo}</div>`;
      let extraClass = typeClass;
      if (isPhase) {
        // phase complete is not interactive
        tapAttr = "";
      } else if (isForm && tid) {
        tapAttr = ` data-open-form="${tid}"`;
        tapHint = `<div class="log-meta">Tap to open form</div>`;
        extraClass += " log-tap";
      } else if (isPhoto) {
        tapAttr = ` data-open-photo="1" data-photo-time="${r.time}"`;
        tapHint = `<div class="log-meta">Tap to view photo · ${team}${geo}</div>`;
        extraClass += " log-tap";
      } else if (!isPhase && r.lat != null && r.lon != null) {
        tapAttr = ` data-open-map="1" data-lat="${r.lat}" data-lon="${r.lon}" data-label="${String(r.label).replace(/"/g, "&quot;")}"`;
        tapHint = `<div class="log-meta">Tap for map pin · ${team}${geo}</div>`;
        extraClass += " log-tap";
      }
      html += `
        <div class="log-entry ${extraClass}" style="border-left-color:${roleInfo.color}"${tapAttr}>
          <div class="log-top">
            <span class="log-role" style="background:${roleInfo.color}">${roleInfo.name}</span>
            ${typeHtml}
            <span class="log-time">${new Date(r.time).toLocaleTimeString()}</span>
            <span class="log-phase">${phaseRight}</span>
          </div>
          <div class="log-label">${r.label}</div>
          ${tapHint}
        </div>`;
    });
    html += `</div>`;
  } else html += `<div class="empty-state">No reports yet.</div>`;

  if (currentMission.marks.length) {
    html += `<div class="report-section"><h3>Marks</h3>`;
    currentMission.marks.slice().reverse().forEach(m => {
      const roleInfo = ROLES[m.role] || { color: "#888", name: m.role || "?" };
      html += `
        <div class="log-entry" style="border-left-color:${roleInfo.color}">
          <div class="log-top">
            <span class="log-role" style="background:${roleInfo.color}">${roleInfo.name}</span>
            <span class="log-time">${new Date(m.time).toLocaleTimeString()}</span>
            <span class="log-phase">📍 MARK</span>
          </div>
          <div class="log-label">${m.label}</div>
          <div class="log-meta">${m.team || ""} · ${m.lat}, ${m.lon}</div>
        </div>`;
    });
    html += `</div>`;
  }
  return html;
}

function openPhotoLightbox(dataUrl, meta) {
  const box = document.getElementById("photo-lightbox");
  document.getElementById("lightbox-img").src = dataUrl;
  document.getElementById("lightbox-meta").textContent = meta || "";
  box.style.display = "flex";
}

function wireLogInteractions(container) {
  if (!container) return;
  // Forms
  container.querySelectorAll("[data-open-form]").forEach(el => {
    el.addEventListener("click", () => {
      const tid = el.dataset.openForm;
      if (!tid || !currentMission) return;
      ensureMissionArrays(currentMission);
      const existing = currentMission.paperwork.find(p => p.isForm && p.templateId === tid);
      openFillableForm(tid, existing && existing.values);
    });
  });
  // Reports / sigs with GPS → map
  container.querySelectorAll("[data-open-map]").forEach(el => {
    el.addEventListener("click", () => {
      const lat = parseFloat(el.dataset.lat);
      const lon = parseFloat(el.dataset.lon);
      const label = el.dataset.label || "Mark";
      if (isNaN(lat) || isNaN(lon)) return;
      focusMarkCoords = { lat, lon, label };
      showScreen("gps-screen");
      renderGpsScreen();
    });
  });
  // Photos
  container.querySelectorAll("[data-open-photo]").forEach(el => {
    el.addEventListener("click", () => {
      const time = parseInt(el.dataset.photoTime, 10);
      if (!currentMission) return;
      ensureMissionArrays(currentMission);
      const photo = (currentMission.photos || []).find(p => p.time === time)
        || missions.flatMap(m => m.photos || []).find(p => p.time === time);
      if (photo && photo.dataUrl) {
        openPhotoLightbox(photo.dataUrl, new Date(photo.time).toLocaleString() + (photo.lat != null ? " · " + photo.lat + ", " + photo.lon : ""));
      }
    });
  });
}


function showLiveLog() {
  document.getElementById("live-log-content").innerHTML = buildLogHTML();
  showScreen("log-screen");
  wireLogInteractions(document.getElementById("live-log-content"));
}

function showReport() {
  document.getElementById("report-content").innerHTML = buildLogHTML();
  wireLogInteractions(document.getElementById("report-content"));
  showScreen("report-screen");
}


function openFillableForm(templateId, existingValues) {
  const tpl = FORM_TEMPLATES[templateId];
  if (!tpl) { alert("Form template not found."); return; }
  // Priority: this mission's saved values > library defaults (last submit) > empty
  const defaults = getFormDefaults(templateId);
  const base = existingValues && Object.keys(existingValues).length
    ? { ...existingValues }
    : { ...defaults };
  currentFormInstance = {
    templateId,
    values: base,
    missionId: currentMission ? currentMission.id : null
  };
  document.getElementById("form-title").textContent = tpl.title.toUpperCase();
  renderFormEditor(tpl);
  showScreen("form-screen");
}

function renderFormEditor(tpl) {
  const el = document.getElementById("form-content");
  let html = "";
  tpl.sections.forEach(sec => {
    html += `<div class="form-section"><h3>${sec.name}</h3>`;
    sec.fields.forEach(f => {
      const val = currentFormInstance.values[f.id];
      if (f.type === "yesno") {
        const yes = val === "yes" ? " on" : "";
        const no = val === "no" ? " on" : "";
        html += `<div class="form-field">
          <div class="form-label">${f.label}</div>
          <div class="yesno-row">
            <button type="button" class="yesno-btn yes${yes}" data-field="${f.id}" data-val="yes">YES</button>
            <button type="button" class="yesno-btn no${no}" data-field="${f.id}" data-val="no">NO</button>
          </div>
        </div>`;
      } else if (f.type === "textarea") {
        html += `<div class="form-field">
          <div class="form-label">${f.label}</div>
          <textarea class="form-input form-textarea" data-field="${f.id}" rows="4">${val ? String(val).replace(/</g,"") : ""}</textarea>
        </div>`;
      } else {
        html += `<div class="form-field">
          <div class="form-label">${f.label}</div>
          <input class="form-input" type="text" data-field="${f.id}" value="${val != null ? String(val).replace(/"/g,"&quot;") : ""}" />
        </div>`;
      }
    });
    html += `</div>`;
  });
  el.innerHTML = html;

  el.querySelectorAll(".form-input").forEach(inp => {
    inp.addEventListener("input", () => {
      currentFormInstance.values[inp.dataset.field] = inp.value;
    });
  });
  el.querySelectorAll(".yesno-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const fid = btn.dataset.field;
      currentFormInstance.values[fid] = btn.dataset.val;
      el.querySelectorAll(`.yesno-btn[data-field="${fid}"]`).forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
    });
  });
}

function saveCurrentForm() {
  if (!currentFormInstance) return;
  const tpl = FORM_TEMPLATES[currentFormInstance.templateId];
  if (!currentMission) {
    alert("Attach this form to a mission first (create/join, then open form from Media).");
    return;
  }
  ensureMissionArrays(currentMission);
  const existingIdx = currentMission.paperwork.findIndex(
    p => p.isForm && p.templateId === currentFormInstance.templateId
  );
  const entry = {
    time: Date.now(),
    role: currentRole,
    team: currentTeam,
    phase: PHASES[currentPhaseIndex] ? PHASES[currentPhaseIndex].id : null,
    name: tpl.title,
    mime: "application/x-detail-form",
    isPdf: false,
    isForm: true,
    templateId: currentFormInstance.templateId,
    values: { ...currentFormInstance.values },
    filled: true,
    fromLibrary: true
  };
  if (existingIdx >= 0) currentMission.paperwork[existingIdx] = entry;
  else currentMission.paperwork.push(entry);
  currentMission.updated = Date.now();
  syncMissionToList();
  saveMissions();
  // Persist as defaults for next mission (only tweak date/name next time)
  updateFormDefaults(currentFormInstance.templateId, currentFormInstance.values);
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "SAVED: " + tpl.title;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1400);
  showScreen("files-screen");
  renderFilesScreen();
}

function renderPhotosScreen() {
  const el = document.getElementById("photos-content");
  if (!el) return;
  const allPhotos = [];
  missions.forEach(m => {
    ensureMissionArrays(m);
    (m.photos || []).forEach(p => allPhotos.push({ ...p, mission: m.title, code: m.code }));
  });
  allPhotos.sort((a, b) => b.time - a.time);
  if (!allPhotos.length) {
    el.innerHTML = `<div class="empty-state">No photos yet.<br>Use CAMERA on the home screen during a mission.</div>`;
    return;
  }
  el.innerHTML = `<div class="photo-grid">` + allPhotos.map(p => {
    const geo = p.lat != null ? (p.lat + ", " + p.lon) : "no GPS";
    return `<div class="photo-card"><img src="${p.dataUrl}" alt=""/><div class="photo-meta">${new Date(p.time).toLocaleString()}<br>${geo}<br>${p.code || ""}</div></div>`;
  }).join("") + `</div>`;
}

function renderFilesScreen() {
  const el = document.getElementById("files-content");
  if (!el) return;
  let html = "";
  html += `<div class="report-section">
    <h3>Paperwork Library</h3>
    <p class="subtitle" style="margin-top:0">Preload forms/files here, then attach to any mission.</p>
    <button class="btn secondary full" id="add-lib-paper-btn" type="button">+ ADD TO LIBRARY</button>`;
  if (!paperworkLibrary.length) {
    html += `<div class="empty-state" style="padding:1rem 0">Library empty.<br>Add PDFs or images before the job.</div>`;
  } else {
    paperworkLibrary.slice().reverse().forEach(item => {
      const icon = item.isForm ? "FORM" : (item.isPdf ? "PDF" : "IMG");
      const actionLabel = item.isForm ? "Fill on mission" : "Attach to mission";
      html += `<div class="paper-row">
        <div class="paper-icon${item.isForm ? " form" : ""}">${icon}</div>
        <div class="paper-info">
          <div class="paper-name">${item.name}</div>
          <div class="photo-meta">${item.isForm ? "Digital fillable form" : new Date(item.created).toLocaleDateString()}</div>
          <div class="paper-actions">
            <button class="btn secondary paper-act" data-attach="${item.id}" type="button">${actionLabel}</button>
            ${item.isForm ? "" : `<button class="btn secondary paper-act danger" data-libdel="${item.id}" type="button">Remove</button>`}
          </div>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  const allPaper = [];
  missions.forEach(m => {
    ensureMissionArrays(m);
    (m.paperwork || []).forEach(p => allPaper.push({ ...p, mission: m.title, code: m.code }));
  });
  allPaper.sort((a, b) => b.time - a.time);

  html += `<div class="report-section"><h3>On Missions</h3>`;
  if (!allPaper.length) {
    html += `<div class="empty-state" style="padding:0.75rem 0">No paperwork on missions yet.</div>`;
  } else {
    allPaper.forEach(p => {
      if (p.isForm) {
        html += `<div class="paper-row">
          <div class="paper-icon form">FORM</div>
          <div class="paper-info">
            <div class="paper-name">${p.name || "Form"}</div>
            <div class="photo-meta">${p.code || ""} · ${p.filled ? "Filled" : "Not filled"} · ${new Date(p.time).toLocaleString()}</div>
            <div class="paper-actions">
              <button class="btn secondary paper-act" data-openform="${p.templateId}" type="button">${p.filled ? "Edit form" : "Fill form"}</button>
            </div>
          </div>
        </div>`;
      } else {
        const tag = p.fromLibrary ? "from library" : "uploaded";
        html += `<div class="paper-row">
          <div class="paper-icon">${p.isPdf ? "PDF" : "IMG"}</div>
          <div class="paper-info">
            <div class="paper-name">${p.name || "document"}</div>
            <div class="photo-meta">${p.code || ""} · ${tag} · ${new Date(p.time).toLocaleString()}</div>
            ${p.dataUrl ? `<a class="paper-open" href="${p.dataUrl}" download="${p.name || "file"}">Open / Download</a>` : ""}
          </div>
        </div>`;
      }
    });
  }
  html += `</div>`;
  el.innerHTML = html;

  const addBtn = document.getElementById("add-lib-paper-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      pendingPaperTarget = "library";
      document.getElementById("paperwork-input").click();
    });
  }
  el.querySelectorAll("[data-attach]").forEach(btn => {
    btn.addEventListener("click", () => attachLibraryItemToMission(btn.dataset.attach));
  });
  el.querySelectorAll("[data-libdel]").forEach(btn => {
    btn.addEventListener("click", () => deleteLibraryItem(btn.dataset.libdel));
  });
  el.querySelectorAll("[data-openform]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tid = btn.dataset.openform;
      if (!currentMission) {
        alert("Resume the mission first, then edit the form.");
        return;
      }
      ensureMissionArrays(currentMission);
      const existing = currentMission.paperwork.find(p => p.isForm && p.templateId === tid);
      openFillableForm(tid, existing && existing.values);
    });
  });
}

function renderGpsScreen() {
  const el = document.getElementById("gps-content");
  if (!currentMission) {
    el.innerHTML = `<div class="empty-state">Join a mission to see marks.<br>Full map comes next.</div>`;
    return;
  }
  ensureMissionArrays(currentMission);
  if (!currentMission.marks.length && !focusMarkCoords) {
    el.innerHTML = `<div class="empty-state">No marks yet.<br>REPORT and SIGNIFICANT auto-mark GPS.</div>`;
    return;
  }
  let html = "";
  if (focusMarkCoords) {
    const f = focusMarkCoords;
    const mapsUrl = "https://maps.google.com/maps?q=" + encodeURIComponent(f.lat + "," + f.lon);
    html += `<div class="report-section focus-mark">
      <h3>Selected pin</h3>
      <div class="log-label">${f.label}</div>
      <div class="photo-meta">${f.lat}, ${f.lon}</div>
      <a class="btn primary full" style="margin-top:0.75rem;display:block;text-align:center;text-decoration:none" href="${mapsUrl}" target="_blank" rel="noopener">Open in Maps</a>
    </div>`;
  }
  html += `<div class="report-section"><h3>Marks — ${currentMission.code || ""}</h3>`;
  currentMission.marks.slice().reverse().forEach(m => {
    html += `<div class="report-item"><span class="status done">📍</span><span><strong>${m.label}</strong><br><small style="color:var(--text-dim)">${m.lat}, ${m.lon} · ${new Date(m.time).toLocaleTimeString()} · ${m.team} ${m.role}</small></span></div>`;
  });
  html += `</div><p class="subtitle">Map view next — pins will render here.</p>`;
  el.innerHTML = html;
}

function downloadBlob(filename, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function exportReport() {
  if (!currentMission) return;
  ensureMissionArrays(currentMission);
  let t = "DETAIL — MISSION LOG\n" + currentMission.title + "\nCode: " + (currentMission.code || "") + "\n" + new Date(currentMission.created).toLocaleString() + "\n\n=== ACTIVITY ===\n";
  currentMission.reports.forEach(r => {
    t += new Date(r.time).toLocaleTimeString() + " | " + (r.team || "") + " | " + r.role + " | " + r.label + (r.lat != null ? " | " + r.lat + "," + r.lon : "") + "\n";
  });
  // forms summary
  (currentMission.paperwork || []).filter(p => p.isForm).forEach(p => {
    t += "\n=== FORM: " + p.name + " ===\n";
    if (p.values) Object.keys(p.values).forEach(k => { t += k + ": " + p.values[k] + "\n"; });
  });
  downloadBlob("mission_" + (currentMission.code || currentMission.id) + "_log.txt", new Blob([t], { type: "text/plain" }));
}

/** Full archive for external secure drive — missions + form defaults + library meta */
function exportAllRecords() {
  const payload = {
    app: "DETAIL",
    version: 1,
    exportedAt: new Date().toISOString(),
    missions: missions,
    paperworkLibrary: paperworkLibrary.map(item => {
      // include form defaults; include file dataUrls for uploaded docs
      return item;
    })
  };
  const json = JSON.stringify(payload);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob("DETAIL_records_" + stamp + ".json", new Blob([json], { type: "application/json" }));
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "EXPORTED " + missions.length + " MISSION(S)";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

function exportCurrentMissionFull() {
  if (!currentMission) {
    alert("No active mission.");
    return;
  }
  ensureMissionArrays(currentMission);
  const payload = {
    app: "DETAIL",
    version: 1,
    exportedAt: new Date().toISOString(),
    missions: [currentMission]
  };
  downloadBlob("DETAIL_mission_" + (currentMission.code || currentMission.id) + ".json", new Blob([JSON.stringify(payload)], { type: "application/json" }));
}

function importRecordsFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || data.app !== "DETAIL") {
        alert("Not a DETAIL export file.");
        return;
      }
      let added = 0;
      (data.missions || []).forEach(m => {
        if (!m.id) return;
        const exists = missions.findIndex(x => x.id === m.id);
        if (exists >= 0) {
          if (confirm("Mission " + (m.code || m.id) + " already exists. Replace?")) {
            missions[exists] = m;
            added++;
          }
        } else {
          missions.push(m);
          added++;
        }
      });
      if (Array.isArray(data.paperworkLibrary)) {
        data.paperworkLibrary.forEach(item => {
          if (item.templateId) {
            const i = paperworkLibrary.findIndex(x => x.templateId === item.templateId);
            if (i >= 0) {
              // merge defaults from import
              paperworkLibrary[i].defaultValues = item.defaultValues || paperworkLibrary[i].defaultValues || {};
            } else if (!item.isForm) {
              paperworkLibrary.push(item);
            }
          } else if (item.id && !paperworkLibrary.some(x => x.id === item.id)) {
            paperworkLibrary.push(item);
          }
        });
        savePaperworkLibrary();
      }
      saveMissions();
      renderMissionList();
      updateHubStatus();
      alert("Import complete.\nMissions added/updated: " + added);
    } catch (err) {
      alert("Could not read file.\n" + err.message);
    }
  };
  reader.readAsText(file);
}

function openSyncSettings() {
  const cfg = loadSyncConfig();
  const urlEl = document.getElementById("sync-url-input");
  const keyEl = document.getElementById("sync-key-input");
  const st = document.getElementById("sync-settings-status");
  if (urlEl) urlEl.value = cfg.url || "";
  if (keyEl) keyEl.value = cfg.key || "";
  if (st) st.textContent = typeof syncStatusText === "function" ? syncStatusText() : "";
  showScreen("settings-screen");
}

function saveSyncSettingsFromForm() {
  const url = (document.getElementById("sync-url-input").value || "").trim();
  const key = (document.getElementById("sync-key-input").value || "").trim();
  saveSyncConfig({ url, key });
  initSync().then(ok => {
    const st = document.getElementById("sync-settings-status");
    if (st) st.textContent = ok
      ? "Sync ON — create/join a mission to go live."
      : "Sync OFF — local only. Check URL and anon key.";
    if (ok && currentMission) joinMissionSync(currentMission);
    updateHubStatus();
  });
}

function clearSyncSettings() {
  saveSyncConfig({ url: "", key: "" });
  if (typeof leaveSyncChannel === "function") leaveSyncChannel();
  if (typeof supabaseClient !== "undefined") supabaseClient = null;
  if (typeof syncReady !== "undefined") syncReady = false;
  const u = document.getElementById("sync-url-input");
  const k = document.getElementById("sync-key-input");
  const s = document.getElementById("sync-settings-status");
  if (u) u.value = "";
  if (k) k.value = "";
  if (s) s.textContent = "Sync cleared — local only.";
  updateHubStatus();
}

// Boot
loadMissions();
ensureBuiltinForms();
initSync().then(() => updateHubStatus());
currentRole = localStorage.getItem("detail_role");
currentTeam = localStorage.getItem("detail_team") || "TEAM1";
updateHubStatus();

document.querySelectorAll("[data-hub]").forEach(btn => {
  btn.addEventListener("click", () => {
    const hub = btn.dataset.hub;
    if (hub === "missions") { showScreen("missions-screen"); renderMissionList(); }
    else if (hub === "chat") showScreen("chat-screen");
    else if (hub === "camera") {
      if (!currentMission) { alert("Join or create a mission first."); return; }
      pendingPhotoContext = { label: "PHOTO" };
      document.getElementById("camera-input").click();
    }
    else if (hub === "photos") { showScreen("photos-screen"); renderPhotosScreen(); }
    else if (hub === "files") { showScreen("files-screen"); renderFilesScreen(); }
    else if (hub === "gps") { showScreen("gps-screen"); renderGpsScreen(); }
  });
});

["home-from-missions","home-from-role","home-from-mission","home-from-log","home-from-photos","home-from-files","home-from-chat","home-from-gps","home-from-report","home-from-settings"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", goHome);
});

document.getElementById("menu-btn-home").addEventListener("click", openAppMenu);
document.getElementById("menu-btn-missions").addEventListener("click", openAppMenu);
document.getElementById("menu-btn-role").addEventListener("click", openAppMenu);
document.getElementById("menu-btn-mission").addEventListener("click", openAppMenu);
document.getElementById("new-mission-btn").addEventListener("click", createMission);
document.getElementById("join-mission-btn").addEventListener("click", joinMissionPrompt);
const clearBtn = document.getElementById("clear-all-missions-btn");
if (clearBtn) clearBtn.addEventListener("click", clearAllMissions);
document.getElementById("prev-phase-btn").addEventListener("click", prevPhase);
document.getElementById("next-phase-btn").addEventListener("click", nextPhase);
document.getElementById("log-btn").addEventListener("click", showLiveLog);
document.getElementById("back-from-log-btn").addEventListener("click", () => showScreen("mission-screen"));
document.getElementById("export-from-log-btn").addEventListener("click", exportReport);
document.getElementById("back-from-report-btn").addEventListener("click", goHome);
document.getElementById("export-btn").addEventListener("click", exportReport);
document.getElementById("photo-capture-btn").addEventListener("click", () => {
  if (!currentMission) { alert("Join or create a mission first."); return; }
  pendingPhotoContext = { label: "PHOTO" };
  document.getElementById("camera-input").click();
});
document.getElementById("paperwork-upload-btn").addEventListener("click", () => {
  // Header 📄 on Media = add to library (preload)
  pendingPaperTarget = "library";
  document.getElementById("paperwork-input").click();
});

document.getElementById("save-form-btn").addEventListener("click", saveCurrentForm);
document.getElementById("back-from-form-btn").addEventListener("click", () => {
  showScreen("files-screen");
  renderFilesScreen();
});


document.getElementById("import-input").addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = "";
  if (f) importRecordsFile(f);
});
const exportAllBtn = document.getElementById("export-all-btn");
if (exportAllBtn) exportAllBtn.addEventListener("click", exportAllRecords);
const importRecBtn = document.getElementById("import-records-btn");
if (importRecBtn) importRecBtn.addEventListener("click", () => document.getElementById("import-input").click());

const fabLog = document.getElementById("fab-log-btn");
if (fabLog) fabLog.addEventListener("click", showLiveLog);
const lbClose = document.getElementById("lightbox-close");
if (lbClose) lbClose.addEventListener("click", () => {
  document.getElementById("photo-lightbox").style.display = "none";
});
const lb = document.getElementById("photo-lightbox");
if (lb) lb.addEventListener("click", (e) => {
  if (e.target === lb) lb.style.display = "none";
});

const syncSave = document.getElementById("sync-save-btn");
if (syncSave) syncSave.addEventListener("click", saveSyncSettingsFromForm);
const syncClear = document.getElementById("sync-clear-btn");
if (syncClear) syncClear.addEventListener("click", clearSyncSettings);

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
