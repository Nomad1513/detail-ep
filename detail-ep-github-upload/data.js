// DETAIL — Content from Operator SOP
// Roles, Phases, and Role-Specific Checklists

const ROLES = {
  SL: {
    id: "SL",
    name: "SL",
    full: "Shift Lead / OIC",
    color: "#3b82f6"
  },
  ADVANCE: {
    id: "ADVANCE",
    name: "Advance",
    full: "Advance Agent / Scout",
    color: "#22c55e"
  },
  LIMO: {
    id: "LIMO",
    name: "Limo",
    full: "Protective Driver",
    color: "#f59e0b"
  },
  C2: {
    id: "C2",
    name: "C2",
    full: "HQ / TOC Support",
    color: "#a855f7"
  }
};

const PHASES = [
  { id: "WARNO",  num: 1, name: "WARNO",     label: "Phase 1 — WARNO",     desc: "Mission receipt & planning. Equipment/Comm checks (PCCs/PCIs)." },
  { id: "SP",     num: 2, name: "SP",        label: "Phase 2 — SP",        desc: "Start Point. Advance departs / mission clock starts." },
  { id: "ENROUTE",num: 3, name: "En Route",  label: "Phase 3 — En Route",  desc: "Route surveys and reconnaissance in progress." },
  { id: "STAGED", num: 4, name: "Staged",    label: "Phase 4 — Staged",    desc: "All advances complete, teams staged, final brief." },
  { id: "MOVING", num: 5, name: "Moving",    label: "Phase 5 — Moving",    desc: "Principal movement begins (T-0)." },
  { id: "SECURE", num: 6, name: "Secure",    label: "Phase 6 — Secure",    desc: "Safe arrival, client secured at destination." },
  { id: "RTB",    num: 7, name: "RTB",       label: "Phase 7 — RTB",       desc: "Returning to Base." },
  { id: "ENDEX",  num: 8, name: "Endex",     label: "Phase 8 — Endex",     desc: "Operation complete. AAR initiated." }
];

// Role-specific checklist items by phase
// Drawn directly from the operator SOP

const ROLE_CHECKLISTS = {

  // ---------- SHIFT LEAD ----------
  SL: {
    WARNO: [
      { id: "sl_w1", text: "Issue Warning Order (WARNO)" },
      { id: "sl_w2", text: "Assign roles and routes" },
      { id: "sl_w3", text: "Confirm team has equipment & comms (PCCs/PCIs)" },
      { id: "sl_w4", text: "Confirm Signal group is active (Primary)" },
      { id: "sl_w5", text: "Confirm ITAK / alternate channels ready" }
    ],
    SP: [
      { id: "sl_sp1", text: "Confirm Advance has departed (SP called)" },
      { id: "sl_sp2", text: "Mission execution clock started" }
    ],
    ENROUTE: [
      { id: "sl_er1", text: "Monitor Advance reports (route conditions, hazards)" },
      { id: "sl_er2", text: "Track overall tempo" }
    ],
    STAGED: [
      { id: "sl_st1", text: "Confirm Advance is fully staged by T-60" },
      { id: "sl_st2", text: "Conduct final briefing (Phase 4)" },
      { id: "sl_st3", text: "Confirm Limo staged by T-30" },
      { id: "sl_st4", text: "Issue 15-minute arrival warning" },
      { id: "sl_st5", text: "Issue 5-minute arrival warning" }
    ],
    MOVING: [
      { id: "sl_mv1", text: "Control tempo during movement" },
      { id: "sl_mv2", text: "Monitor for significant events from Advance" },
      { id: "sl_mv3", text: "Make key decisions as required" }
    ],
    SECURE: [
      { id: "sl_se1", text: "Confirm client secured at destination" },
      { id: "sl_se2", text: "Confirm on/off-boarding executed cleanly" }
    ],
    RTB: [
      { id: "sl_rt1", text: "Direct RTB" },
      { id: "sl_rt2", text: "Confirm all personnel accounted for" }
    ],
    ENDEX: [
      { id: "sl_en1", text: "Declare Endex" },
      { id: "sl_en2", text: "Initiate AAR" },
      { id: "sl_en3", text: "Document any deviations from SOP" }
    ]
  },

  // ---------- ADVANCE ----------
  ADVANCE: {
    WARNO: [
      { id: "ad_w1", text: "Receive WARNO and role assignment" },
      { id: "ad_w2", text: "Equipment & comms check complete (PCCs/PCIs)" },
      { id: "ad_w3", text: "Confirm Signal + ITAK ready" }
    ],
    SP: [
      { id: "ad_sp1", text: "Depart at T-180 (SP)" },
      { id: "ad_sp2", text: "Begin sequential route survey" }
    ],
    ENROUTE: [
      { id: "ad_er1", text: "Primary route driven" },
      { id: "ad_er2", text: "Secondary route driven" },
      { id: "ad_er3", text: "Tertiary / emergency route driven" },
      { id: "ad_er4", text: "Chokepoints / construction / hazards noted" },
      { id: "ad_er5", text: "Hospital routes + ETAs identified" }
    ],
    STAGED: [
      { id: "ad_st1", text: "Departure site recon complete" },
      { id: "ad_st2", text: "Arrival site recon complete" },
      { id: "ad_st3", text: "Site security noted (entries / exits / staging)" },
      { id: "ad_st4", text: "Intel & photos sent via Signal" },
      { id: "ad_st5", text: "Report Phase 4 (Staged) by T-60" },
      { id: "ad_st6", text: "Overwatch set" },
      { id: "ad_st7", text: "Respond to SL 15-min warning" },
      { id: "ad_st8", text: "Respond to SL 5-min warning" }
    ],
    MOVING: [
      { id: "ad_mv1", text: "Maintain overwatch during movement" }
    ],
    SECURE: [
      { id: "ad_se1", text: "Arrival site still clear" },
      { id: "ad_se2", text: "Support off-boarding / aircraft transition if required" },
      { id: "ad_se3", text: "Aircraft boarding / exit photos if applicable" }
    ],
    RTB: [
      { id: "ad_rt1", text: "RTB as directed" }
    ],
    ENDEX: [
      { id: "ad_en1", text: "Participate in AAR" },
      { id: "ad_en2", text: "Note any deviations observed" }
    ]
  },

  // ---------- LIMO ----------
  LIMO: {
    WARNO: [
      { id: "li_w1", text: "Receive WARNO and role assignment" },
      { id: "li_w2", text: "Perform vehicle PMCS" },
      { id: "li_w3", text: "Gear check complete" },
      { id: "li_w4", text: "Confirm comms (Signal / ITAK / Zello / ION)" }
    ],
    SP: [
      { id: "li_sp1", text: "Stand by for staging time" }
    ],
    ENROUTE: [
      { id: "li_er1", text: "Monitor Advance route reports" },
      { id: "li_er2", text: "Mentally rehearse primary + alternate routes" }
    ],
    STAGED: [
      { id: "li_st1", text: "Stage vehicle by T-30" },
      { id: "li_st2", text: "Proper positioning confirmed" },
      { id: "li_st3", text: "Escape route clear" },
      { id: "li_st4", text: "Receive final brief from SL" }
    ],
    MOVING: [
      { id: "li_mv1", text: "Execute tactical driving (Phase 5)" },
      { id: "li_mv2", text: "Maintain proper vehicle alignment for on-boarding" },
      { id: "li_mv3", text: "Door control during load" }
    ],
    SECURE: [
      { id: "li_se1", text: "Execute clean off-boarding / covered transition" },
      { id: "li_se2", text: "Vehicle secured / staged as required" }
    ],
    RTB: [
      { id: "li_rt1", text: "RTB as directed" }
    ],
    ENDEX: [
      { id: "li_en1", text: "Participate in AAR" },
      { id: "li_en2", text: "Note vehicle / driving issues" }
    ]
  },

  // ---------- C2 / HQ ----------
  C2: {
    WARNO: [
      { id: "c2_w1", text: "Receive WARNO" },
      { id: "c2_w2", text: "Confirm monitoring tools ready (ITAK, Football, flight tracking)" },
      { id: "c2_w3", text: "Mission log started in Signal" },
      { id: "c2_w4", text: "External liaison contacts identified if needed" }
    ],
    SP: [
      { id: "c2_sp1", text: "Log SP / Advance departure" },
      { id: "c2_sp2", text: "Begin real-time monitoring" }
    ],
    ENROUTE: [
      { id: "c2_er1", text: "Monitor Advance via ITAK / tracking" },
      { id: "c2_er2", text: "Push traffic / medical / intel updates as needed" },
      { id: "c2_er3", text: "Maintain running mission log" }
    ],
    STAGED: [
      { id: "c2_st1", text: "Confirm team staged status" },
      { id: "c2_st2", text: "Log final brief complete" },
      { id: "c2_st3", text: "Stand by for movement" }
    ],
    MOVING: [
      { id: "c2_mv1", text: "Track Team + Client movement in real time" },
      { id: "c2_mv2", text: "Provide real-time intel / traffic / medical support" },
      { id: "c2_mv3", text: "Handle external liaison as directed by SL" }
    ],
    SECURE: [
      { id: "c2_se1", text: "Log Phase 6 — Client secured" },
      { id: "c2_se2", text: "Confirm no outstanding issues" }
    ],
    RTB: [
      { id: "c2_rt1", text: "Log RTB" },
      { id: "c2_rt2", text: "Continue monitoring until all clear" }
    ],
    ENDEX: [
      { id: "c2_en1", text: "Log Endex" },
      { id: "c2_en2", text: "Finalize mission log" },
      { id: "c2_en3", text: "Support AAR with log extracts" }
    ]
  }
};

// Phase-specific quick reports for Advance (and shared where relevant)
// Only the options that belong to that phase appear
const QUICK_REPORTS_BY_PHASE = {
  SP: [
    { id: "departed",    label: "DEPARTED / SP" },
    { id: "traffic",     label: "TRAFFIC ISSUE" }
  ],
  ENROUTE: [
    { id: "traffic_lt",  label: "TRAFFIC — LIGHT" },
    { id: "traffic_mod", label: "TRAFFIC — MODERATE" },
    { id: "traffic_hvy", label: "TRAFFIC — HEAVY" },
    { id: "traffic_ss",  label: "TRAFFIC — STANDSTILL" },
    { id: "route_clear", label: "ROUTE CLEAR" },
    { id: "hazard",      label: "HAZARD / CHOKEPOINT" }
  ],
  STAGED: [
    { id: "staged_ok",   label: "STAGED / READY" },
    { id: "site_clear",  label: "SITE CLEAR" },
    { id: "overwatch",   label: "OVERWATCH SET" },
    { id: "sus_person",  label: "SUSPICIOUS PERSON" },
    { id: "sus_activity",label: "SUSPICIOUS ACTIVITY" }
  ],
  MOVING: [
    { id: "eyes_on",     label: "EYES ON CLIENT" },
    { id: "wheels_up",   label: "WHEELS UP" },
    { id: "wheels_down", label: "WHEELS DOWN" },
    { id: "sus_person",  label: "SUSPICIOUS PERSON" },
    { id: "sus_activity",label: "SUSPICIOUS ACTIVITY" }
  ],
  SECURE: [
    { id: "eyes_on",     label: "EYES ON CLIENT" },
    { id: "client_sec",  label: "CLIENT SECURE" },
    { id: "site_clear",  label: "SITE CLEAR" }
  ]
};

// Significant = escalations only (not routine status)
const SIGNIFICANT_EVENTS = [
  { id: "sig_traffic",  label: "TRAFFIC AFFECTING ETA" },
  { id: "sig_closure",  label: "ROAD CLOSURE / ACCIDENT / PROTEST" },
  { id: "sig_surveil",  label: "SURVEILLANCE / THREAT" },
  { id: "sig_access",   label: "VENUE ACCESS PROBLEM" },
  { id: "sig_deviate",  label: "PLAN DEVIATION — SAFETY / TIMING" }
];

// Standard rapid timeline reference
const TIMELINE = [
  { t: "T-180", desc: "Advance departs (SP)" },
  { t: "T-60",  desc: "Advance fully staged (Phase 4)" },
  { t: "T-45",  desc: "Final briefing" },
  { t: "T-30",  desc: "Drivers staged" },
  { t: "T-0",   desc: "Movement begins (Phase 5)" },
  { t: "Phase 6", desc: "Client secured" }
];

// Active mission phases where quick reports + significant event are available
const ACTIVE_PHASES = ["SP", "ENROUTE", "STAGED", "MOVING", "SECURE"];

// Fillable form templates — digital versions of paper advance packets
const FORM_TEMPLATES = {
  private_air_travel: {
    id: "private_air_travel",
    title: "EP Private Air Travel",
    sections: [
      {
        name: "Departure Location",
        fields: [
          { id: "dep_airport", label: "Airport Name", type: "text" },
          { id: "dep_address", label: "Address", type: "text" },
          { id: "dep_web", label: "Web Address", type: "text" },
          { id: "sec_office", label: "Security Contact — Office Phone", type: "text" },
          { id: "sec_mobile", label: "Security Contact — Mobile", type: "text" },
          { id: "airport_police", label: "Airport Police", type: "text" },
          { id: "airport_police_phone", label: "Police Phone Number", type: "text" },
          { id: "airport_police_contact", label: "Police Contact Person", type: "text" },
          { id: "fbo_name", label: "FBO", type: "text" },
          { id: "fbo_address", label: "FBO Address", type: "text" },
          { id: "fbo_contact", label: "FBO Contact Person", type: "text" },
          { id: "fbo_hours", label: "Hours of Operation", type: "text" },
          { id: "police_jurisdiction", label: "Police Jurisdiction", type: "text" },
          { id: "police_jurisdiction_phone", label: "Jurisdiction Phone", type: "text" },
          { id: "ems_service", label: "EMS Service", type: "text" },
          { id: "ems_phone", label: "EMS Phone", type: "text" },
          { id: "hospital_name", label: "Nearest Hospital", type: "text" },
          { id: "hospital_address", label: "Hospital Address", type: "text" },
          { id: "trauma_center", label: "Trauma Center", type: "yesno" },
          { id: "trauma_level", label: "Trauma Center Level", type: "text" },
          { id: "map_airport", label: "Map of Airport", type: "yesno" },
          { id: "fbo_security_ok", label: "FBO Security Appear Adequate", type: "yesno" },
          { id: "fbo_access_control", label: "FBO Access Control", type: "yesno" },
          { id: "secure_waiting", label: "Secure Waiting Area", type: "yesno" },
          { id: "need_transport", label: "Need / Have Transportation", type: "yesno" },
          { id: "luggage_restricted", label: "Luggage Free of Restricted Items", type: "yesno" },
          { id: "drive_ramp", label: "Allowed to Drive onto Ramp", type: "yesno" },
          { id: "best_dropoff", label: "Best Drop Off Location", type: "text" }
        ]
      },
      {
        name: "Aircraft Information",
        fields: [
          { id: "ac_type", label: "Aircraft Type", type: "text" },
          { id: "ac_year", label: "Year", type: "text" },
          { id: "ac_tail", label: "Tail Number", type: "text" },
          { id: "ac_operator", label: "Operator", type: "text" },
          { id: "ac_flight_time", label: "Hours of Flight Time", type: "text" },
          { id: "ac_fuel_range", label: "Fuel Range", type: "text" },
          { id: "ac_pax_cap", label: "Passenger Capacity", type: "text" },
          { id: "ac_lug_cap", label: "Luggage Capacity", type: "text" },
          { id: "ac_flight_staff", label: "Number of Flight Staff", type: "text" },
          { id: "ac_chief_pilot", label: "Chief Pilot Name", type: "text" },
          { id: "ac_chief_phone", label: "Chief Pilot Mobile", type: "text" },
          { id: "ac_copilot", label: "Copilot Name", type: "text" },
          { id: "ac_copilot_phone", label: "Copilot Mobile", type: "text" },
          { id: "principal_medical", label: "Principal Medical Info Available", type: "yesno" },
          { id: "firearms", label: "EP Staff Transporting Firearms", type: "yesno" }
        ]
      },
      {
        name: "Arrival / Destination",
        fields: [
          { id: "arr_eta", label: "Expected Arrival Time", type: "text" },
          { id: "arr_airport", label: "Airport Name", type: "text" },
          { id: "arr_address", label: "Address", type: "text" },
          { id: "arr_runway", label: "Runway Length", type: "text" },
          { id: "arr_night", label: "Restriction (night landing)", type: "text" },
          { id: "arr_phone", label: "Airport Phone Number", type: "text" },
          { id: "alt_fbo_airport", label: "Alternate FBO — Airport Name", type: "text" },
          { id: "alt_fbo_address", label: "Alternate FBO — Address", type: "text" },
          { id: "alt_runway", label: "Alternate Runway Length", type: "text" },
          { id: "alt_night", label: "Alternate Restriction (night landing)", type: "text" },
          { id: "alt_phone", label: "Alternate Airport Phone", type: "text" },
          { id: "alt_distance", label: "Distance from Primary", type: "text" },
          { id: "ground_transport", label: "Ground Transportation from those sites", type: "text" },
          { id: "advance_all_fbos", label: "Advance of all FBO's", type: "yesno" },

          { id: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },

  emergency_medical: {
    id: "emergency_medical",
    title: "EP Emergency Medical Care",
    sections: [
      {
        name: "Hospital Information",
        fields: [
          { id: "hosp_name", label: "Hospital Name", type: "text" },
          { id: "hosp_address", label: "Address", type: "text" },
          { id: "hosp_phone", label: "Phone", type: "text" },
          { id: "hosp_web", label: "Web Site", type: "text" },
          { id: "er_contact", label: "ER Contact Person", type: "text" },
          { id: "er_phone", label: "ER Phone", type: "text" },
          { id: "level1_trauma", label: "Level 1 or 2 Trauma Center", type: "yesno" },
          { id: "heli_pad", label: "Helicopter Pad Available", type: "yesno" },
          { id: "outside_us_eligible", label: "If outside US — Principal Eligible to use Hospital", type: "yesno" },
          { id: "blood_supply", label: "Suitable Blood Supply", type: "yesno" },
          { id: "english_docs", label: "English Speaking Doctors or Translators", type: "yesno" },
          { id: "insurance_accepted", label: "Principal Insurance Accepted", type: "yesno" },
          { id: "evac_procedures", label: "Procedures to Evac Principal back to US", type: "yesno" },
          { id: "specialists_on_staff", label: "Specialists Hospital has on staff", type: "text" },
          { id: "time_from_hotel", label: "Time from Hotel", type: "text" },
          { id: "time_from_restaurant", label: "Time from Restaurant", type: "text" },
          { id: "time_from_meeting", label: "Time from Meeting Location", type: "text" },
          { id: "ep_staff_remain", label: "Hospital allow EP staff to remain at all times", type: "yesno" }
        ]
      },
      {
        name: "Pharmacy & Clergy",
        fields: [
          { id: "pharm_name", label: "24hr Pharmacy Name", type: "text" },
          { id: "pharm_address", label: "Pharmacy Address", type: "text" },
          { id: "pharm_phone", label: "Pharmacy Phone", type: "text" },
          { id: "pharm_web", label: "Pharmacy Web Site", type: "text" },
          { id: "clergy_available", label: "Principal choice of Clergy available if needed", type: "yesno" }
        ]
      },
      {
        name: "Physicians",
        fields: [
          { id: "pcp_name", label: "Primary Care Physician — Name", type: "text" },
          { id: "pcp_address", label: "PCP Address", type: "text" },
          { id: "pcp_phone", label: "PCP Phone", type: "text" },
          { id: "spec_name", label: "Other Specialist — Name", type: "text" },
          { id: "spec_address", label: "Specialist Address", type: "text" },
          { id: "spec_phone", label: "Specialist Phone", type: "text" }
        ]
      },
      {
        name: "Principal Medical",
        fields: [
          { id: "prev_conditions", label: "Previous Medical Conditions (diagnoses / date / treatment)", type: "textarea" },
          { id: "medications", label: "Current Medications (name / dosage / taken)", type: "textarea" },
          { id: "allergies", label: "Known Allergies (name / reaction)", type: "textarea" },
          { id: "blood_type", label: "Principal Blood Type", type: "text" },
          { id: "prosthetics", label: "Prosthetics", type: "text" },
          { id: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },

  ground_transport: {
    id: "ground_transport",
    title: "EP Ground Transportation",
    sections: [
      {
        name: "Vehicles",
        fields: [
          { id: "num_vehicles", label: "Number of Vehicles", type: "text" },
          { id: "rental_agency", label: "Car Rental Agency", type: "text" },
          { id: "rental_phone", label: "Rental Phone Number", type: "text" },
          { id: "rental_res", label: "Rental Reservation Number", type: "text" },
          { id: "car_service", label: "Car Service", type: "text" },
          { id: "car_service_phone", label: "Car Service Phone", type: "text" },
          { id: "car_service_res", label: "Car Service Reservation", type: "text" },
          { id: "ep_car_service", label: "Contacted EP Car Service", type: "text" },
          { id: "ep_car_phone", label: "EP Car Service Phone", type: "text" },
          { id: "ep_car_res", label: "EP Car Service Reservation", type: "text" },
          { id: "principal_car", label: "Principal Personal Car", type: "text" },
          { id: "company_car", label: "Company Car", type: "text" },
          { id: "armored", label: "Armored Car to be Used", type: "yesno" },
          { id: "veh1_info", label: "Vehicle 1 (Make / Model / Color / Tag)", type: "text" },
          { id: "veh2_info", label: "Vehicle 2 (Make / Model / Color / Tag)", type: "text" },
          { id: "veh3_info", label: "Vehicle 3 (Make / Model / Color / Tag)", type: "text" },
          { id: "secure_parking", label: "Secure Parking Arranged", type: "yesno" },
          { id: "lead_car", label: "Detail Use Lead Car", type: "yesno" },
          { id: "seat_principal", label: "Preferred Seating — Principal", type: "text" },
          { id: "seat_guest1", label: "Preferred Seating — Guest 1", type: "text" },
          { id: "seat_guest2", label: "Preferred Seating — Guest 2", type: "text" },
          { id: "seat_eps", label: "Preferred Seating — EPS", type: "text" },
          { id: "maint_ok", label: "Vehicle Maintenance up to Date", type: "yesno" },
          { id: "gas_full", label: "Gas Tank Full", type: "yesno" },
          { id: "veh_clean", label: "Vehicle Clean Inside & Out", type: "yesno" },
          { id: "sec_check", label: "Vehicle Security Check Conducted", type: "yesno" }
        ]
      },
      {
        name: "Equipment",
        fields: [
          { id: "eq_bomb_mirror", label: "Bomb Mirror", type: "yesno" },
          { id: "eq_spare", label: "Spare Tire & Jack", type: "yesno" },
          { id: "eq_flashlight", label: "Flashlight", type: "yesno" },
          { id: "eq_flares", label: "Flares and Reflectors", type: "yesno" },
          { id: "eq_umbrella", label: "Umbrella", type: "yesno" },
          { id: "eq_tools", label: "Basic Tools", type: "yesno" },
          { id: "eq_gps", label: "GPS", type: "yesno" },
          { id: "eq_fuel_cash", label: "Cash / Credit Card for Fuel", type: "yesno" },
          { id: "eq_extinguisher", label: "Fire Extinguisher", type: "yesno" },
          { id: "eq_jumper", label: "Jumper Cables", type: "yesno" },
          { id: "eq_firstaid", label: "Advance First Aid Kit", type: "yesno" },
          { id: "eq_aed", label: "AED", type: "yesno" },
          { id: "eq_maps", label: "Maps", type: "yesno" },
          { id: "eq_reg_ins", label: "Registration and Proof of Insurance", type: "yesno" },
          { id: "eq_toll", label: "Toll Pass", type: "yesno" },
          { id: "eq_charger", label: "Cell Phone Charger", type: "yesno" }
        ]
      },
      {
        name: "Drivers",
        fields: [
          { id: "drv_briefed", label: "Drivers briefed on threats (kidnap / run-off / carjack / assassination)", type: "yesno" },
          { id: "drv_security_measures", label: "Security measures briefed (doors locked, unattended, motor running)", type: "yesno" },
          { id: "drv_courtesies", label: "Courtesies outlined (dress, radio, phones silent)", type: "yesno" },
          { id: "drv_valet_cash", label: "Driver has cash to tip valets", type: "yesno" },
          { id: "drv1", label: "Driver 1 (Name / DL / TX)", type: "text" },
          { id: "drv2", label: "Driver 2 (Name / DL / TX)", type: "text" },
          { id: "drv3", label: "Driver 3 (Name / DL / TX)", type: "text" },
          { id: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },

  route_survey: {
    id: "route_survey",
    title: "EP Route Survey",
    sections: [
      {
        name: "Movement Info",
        fields: [
          { id: "date_movement", label: "Date of Movement", type: "text" },
          { id: "sched_depart", label: "Scheduled Departure Time", type: "text" },
          { id: "start_address", label: "Starting Address", type: "text" },
          { id: "dest_address", label: "Destination Address", type: "text" },
          { id: "contact_person", label: "Contact Person (dest)", type: "text" },
          { id: "contact_phone", label: "Contact Phone Number", type: "text" },
          { id: "distance", label: "Distance", type: "text" },
          { id: "travel_time", label: "Expected Travel Time", type: "text" },
          { id: "principal_name", label: "Principal Name", type: "text" },
          { id: "party_size", label: "Number in Party", type: "text" },
          { id: "num_vehicles", label: "Number of Vehicles", type: "text" }
        ]
      },
      {
        name: "Routes",
        fields: [
          { id: "primary_route", label: "Primary Route", type: "textarea" },
          { id: "secondary_route", label: "Secondary Route", type: "textarea" },
          { id: "tertiary_route", label: "Tertiary Route", type: "textarea" }
        ]
      },
      {
        name: "Conditions / Chokepoints",
        fields: [
          { id: "traffic_problems", label: "Possible Traffic Problems", type: "yesno" },
          { id: "road_closures", label: "Road Closures", type: "yesno" },
          { id: "special_events", label: "Special Events in the Area", type: "yesno" },
          { id: "bridges", label: "Bridges", type: "yesno" },
          { id: "overpasses", label: "Overpasses", type: "yesno" },
          { id: "railroad", label: "Railroad Tracks", type: "yesno" },
          { id: "school_zones", label: "School Zones", type: "yesno" },
          { id: "toll_plazas", label: "Toll Plazas", type: "yesno" },
          { id: "construction", label: "Construction Zones", type: "yesno" },
          { id: "driven_same_time", label: "Route driven by EPS same time of day/week as transport", type: "yesno" }
        ]
      },
      {
        name: "Safe Havens",
        fields: [
          { id: "haven_hospital", label: "Hospital along route", type: "text" },
          { id: "haven_police", label: "Police Station along route", type: "text" },
          { id: "haven_fire", label: "Fire Station along route", type: "text" },
          { id: "countersurveillance", label: "Countersurveillance used during transport", type: "yesno" },
          { id: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },

  pre_advance: {
    id: "pre_advance",
    title: "EP Pre-Advance Checklist",
    sections: [
      {
        name: "Trip Basics",
        fields: [
          { id: "date_notified", label: "Date / Time EP Notified of Trip", type: "text" },
          { id: "point_of_contact", label: "Point of Contact / Position", type: "text" },
          { id: "primary_phone", label: "Primary Phone", type: "text" },
          { id: "principal_name", label: "Principal Name", type: "text" },
          { id: "title", label: "Title", type: "text" },
          { id: "office_phone", label: "Office Phone", type: "text" },
          { id: "mobile_phone", label: "Mobile Phone", type: "text" },
          { id: "home_phone", label: "Home Phone", type: "text" },
          { id: "destination", label: "Destination", type: "text" },
          { id: "departure_date", label: "Departure Date", type: "text" },
          { id: "return_date", label: "Return Date", type: "text" },
          { id: "trip_coordinator", label: "Trip Coordinator", type: "text" },
          { id: "coord_title", label: "Coordinator Title", type: "text" },
          { id: "coord_email", label: "Coordinator E-mail", type: "text" },
          { id: "coord_office", label: "Coordinator Office Phone", type: "text" },
          { id: "num_specialists", label: "Number of EP Specialists Assigned", type: "text" },
          { id: "pos_supervisor", label: "Position assigned — Supervisor", type: "yesno" },
          { id: "pos_driver", label: "Position assigned — Driver", type: "yesno" },
          { id: "pos_advance", label: "Position assigned — Advance", type: "yesno" },
          { id: "pos_closein", label: "Position assigned — Close-in", type: "yesno" }
        ]
      },
      {
        name: "EP Detail / Specialists",
        fields: [
          { id: "spec1", label: "EP Specialist 1 Supervisor (Name / Office / Mobile / Email)", type: "textarea" },
          { id: "spec2", label: "EP Specialist 2 (Name / Position / Office / Mobile / Email)", type: "textarea" },
          { id: "spec3", label: "EP Specialist 3 (Name / Position / Office / Mobile / Email)", type: "textarea" },
          { id: "case_file", label: "Case File Number", type: "text" },
          { id: "trip_date_hist", label: "Historical Trip Date", type: "text" },
          { id: "ep_specialist_hist", label: "Historical EP Specialist", type: "text" },
          { id: "hist_notes", label: "Historical Trip Notes", type: "textarea" }
        ]
      },
      {
        name: "Trip Activities",
        fields: [
          { id: "itinerary_attached", label: "Itinerary Attached", type: "yesno" },
          { id: "purpose", label: "Purpose of Trip", type: "text" },
          { id: "party_members", label: "Other Members of Party (Name / Title / Affiliation)", type: "textarea" },
          { id: "special_activities", label: "Special Activities (Location / Dates)", type: "textarea" },
          { id: "special_gear", label: "Special Gear or Clothing Required for Principal", type: "text" }
        ]
      },
      {
        name: "Air Travel",
        fields: [
          { id: "commercial_airports", label: "Commercial Airports", type: "text" },
          { id: "airline", label: "Airline", type: "text" },
          { id: "air_phone", label: "Airline Phone", type: "text" },
          { id: "air_res", label: "Reservation Number", type: "text" },
          { id: "seat_type", label: "Seat Number / Type", type: "text" },
          { id: "map_terminal", label: "Map of Airport Terminal", type: "yesno" },
          { id: "map_lounge", label: "Map of Lounge Area", type: "yesno" },
          { id: "bag_claim", label: "Baggage Claim Area", type: "text" },
          { id: "pickup_area", label: "Pick-Up / Drop-Off Area", type: "text" },
          { id: "parking", label: "Parking Garage / Area", type: "text" },
          { id: "private_airport", label: "Private Airport", type: "text" },
          { id: "ac_tail", label: "Aircraft Tail Number", type: "text" },
          { id: "ac_callsign", label: "Aircraft Call Sign", type: "text" },
          { id: "chief_pilot", label: "Chief Pilot Name", type: "text" },
          { id: "copilot", label: "Co-Pilot Name", type: "text" },
          { id: "ramp_steps", label: "Need Ramp Steps", type: "yesno" },
          { id: "hanger", label: "Hanger Available", type: "yesno" }
        ]
      },
      {
        name: "Ground Transportation",
        fields: [
          { id: "gt_vendor", label: "Vendor", type: "text" },
          { id: "gt_address", label: "Address", type: "text" },
          { id: "gt_phone", label: "Phone", type: "text" },
          { id: "gt_email", label: "E-mail", type: "text" },
          { id: "route_maps", label: "Obtained Route Maps", type: "yesno" },
          { id: "gt_num_veh", label: "Number of Vehicles", type: "text" },
          { id: "prin_veh", label: "Principal Vehicle (Make / Model / Year / Tag / Seat / Driver / Phone)", type: "textarea" },
          { id: "driver_photo", label: "Photo of Driver", type: "yesno" },
          { id: "driver_bg", label: "Background Complete", type: "yesno" }
        ]
      },
      {
        name: "Helicopter / Support Vehicle",
        fields: [
          { id: "heli_tail", label: "Helicopter Tail Number", type: "text" },
          { id: "heli_callsign", label: "Helicopter Call Sign", type: "text" },
          { id: "heli_chief", label: "Chief Pilot Name", type: "text" },
          { id: "heli_copilot", label: "Co-Pilot Name", type: "text" },
          { id: "sup_make", label: "Support Vehicle Make", type: "text" },
          { id: "sup_model", label: "Support Vehicle Model", type: "text" },
          { id: "sup_year", label: "Year", type: "text" },
          { id: "sup_tag", label: "Tag Number", type: "text" },
          { id: "sup_driver", label: "Driver Name", type: "text" },
          { id: "sup_phone", label: "Driver Phone", type: "text" }
        ]
      },
      {
        name: "International / Medical / Conditions",
        fields: [
          { id: "customs", label: "Customs", type: "yesno" },
          { id: "visa_valid", label: "Immigration Visa Valid", type: "yesno" },
          { id: "vaccinations", label: "Vaccinations Complete", type: "yesno" },
          { id: "interpreters", label: "Language Interpreters Required", type: "yesno" },
          { id: "embassy_phone", label: "US Embassy/Consulate Phone", type: "text" },
          { id: "embassy_contact", label: "Embassy Contact Person", type: "text" },
          { id: "embassy_address", label: "Embassy Address", type: "text" },
          { id: "routes_established", label: "Routes Established", type: "yesno" },
          { id: "nearby_hosp", label: "Nearby Hospital Name", type: "text" },
          { id: "nearby_hosp_addr", label: "Hospital Address", type: "text" },
          { id: "ems_service", label: "EMS Service", type: "text" },
          { id: "ems_phone", label: "EMS Phone", type: "text" },
          { id: "medevac_name", label: "Med Evac Company Name", type: "text" },
          { id: "medevac_phone", label: "Med Evac Phone", type: "text" },
          { id: "medevac_hotline", label: "24 Hour Hotline", type: "text" },
          { id: "crime", label: "Crime Concerns", type: "yesno" },
          { id: "political", label: "Political Turmoil", type: "yesno" },
          { id: "social", label: "Social Turmoil", type: "yesno" },
          { id: "strikes", label: "Strikes", type: "yesno" },
          { id: "riots", label: "Riots", type: "yesno" },
          { id: "holidays", label: "Holidays During Trip", type: "text" },
          { id: "weather", label: "Projected Weather", type: "text" }
        ]
      },
      {
        name: "Lodging & Local Security",
        fields: [
          { id: "hotel_name", label: "Principal Hotel Name", type: "text" },
          { id: "hotel_address", label: "Hotel Address", type: "text" },
          { id: "hotel_phone", label: "Hotel Phone", type: "text" },
          { id: "hotel_res_name", label: "Reservation Name", type: "text" },
          { id: "room_type", label: "Room Type", type: "text" },
          { id: "conf_number", label: "Confirmation Number", type: "text" },
          { id: "gm_name", label: "General Manager Name", type: "text" },
          { id: "gm_phone", label: "GM Phone", type: "text" },
          { id: "sec_dir", label: "Security Director Name", type: "text" },
          { id: "sec_dir_phone", label: "Security Director Phone", type: "text" },
          { id: "concierge", label: "Concierge Phone", type: "text" },
          { id: "housekeeping", label: "Housekeeping Sup. Name / Phone", type: "text" },
          { id: "ep_same_hotel", label: "EP Staff Lodging Same as Principal", type: "yesno" },
          { id: "ep_hotel", label: "If No — EP Hotel Name / Address / Phone / Res", type: "textarea" },
          { id: "le_agency", label: "Local LE Agency Name", type: "text" },
          { id: "le_contact", label: "LE Contact Person", type: "text" },
          { id: "le_phone", label: "LE Phone", type: "text" },
          { id: "le_address", label: "LE Address", type: "text" },
          { id: "le_response", label: "Likely Response Time", type: "text" },
          { id: "priv_sec_org", label: "Private Security Organization", type: "text" },
          { id: "priv_sec_contact", label: "Private Security Contact", type: "text" },
          { id: "priv_sec_phone", label: "Private Security Phone", type: "text" },
          { id: "priv_sec_address", label: "Private Security Address", type: "text" },
          { id: "priv_sec_caps", label: "Capabilities if Needed", type: "text" }
        ]
      }
    ]
  }
};

