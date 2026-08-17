# DETAIL — EP Operations (v0.2)

Guided executive protection operations built from your actual SOP.

## What’s new in v0.2

- **Roles** match your call signs: SL, Advance, Limo, C2
- **8 Mission Phases** exactly as written (WARNO → Endex)
- **Role-specific checklists** pulled from your responsibilities
- **T-timeline** reference built in
- **Significant Event** quick button for Advance
- Phase progress bar
- Encrypted local storage (same as before)

## Roles

| Call Sign | Full Name |
|-----------|-----------|
| SL | Shift Lead / OIC |
| Advance | Advance Agent / Scout |
| Limo | Protective Driver |
| C2 | HQ / TOC Support |

## How to run

1. Unzip
2. Open `index.html` or serve the folder (`npx serve .`)
3. Set PIN → choose your role → create a mission
4. Work through the phases

Each role only sees the checklist items that belong to them for the current phase.

## Still single-device

Communication and live location sharing are not built yet.  
Primary remains Signal per your PACE plan. This app handles the structured checklist + log side.

## Next possible steps

- Daily Detail / Pre-Shift workflow
- Shared mission state across devices
- Better export / AAR package
- Photo capture on checklist items
