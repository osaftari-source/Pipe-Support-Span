# Pipe Support Span — Trial v0.1.1

## Purpose
A mobile-first PWA for preliminary site-survey screening of steel pipe support spacing and estimated vertical distributed load at the recommended span.

## Current scope
- English user interface.
- PIM-2 verified seed database for selected pipe classes.
- Manual steel input mode.
- Carbon/alloy steel and stainless steel dimensional weight calculation.
- Recommended preliminary maximum span.
- Live calculation: results update automatically when input values change; no calculate button is required.
- Intermediate and end support estimated vertical reaction.
- Empty, operating, and optional water-filled/hydrotest load cases.
- Installable PWA and offline cache after first load.

## Not included in this trial version
- PIM-1 database.
- FRP or HDPE span calculation.
- Actual/existing spacing assessment.
- Heavy valve or concentrated load input.
- Support structural member design/capacity.
- Thermal, guide, stop, anchor, spring, dynamic, occasional or nozzle-load checks.

## Calculation interpretation
The displayed support reaction is estimated vertical distributed pipe weight at the recommended preliminary spacing:

- Intermediate support: R = w × Lref
- End support: R = w × Lref / 2

where w includes pipe, selected fluid and optional insulation/cladding distributed weight.

## References embedded in the basis
- PIM-2 Piping Materials Classification, IK-4006-5022.
- MSS SP-58 Table 4 preliminary maximum horizontal steel pipe hanger/support spacing.
- ASME B36.10M / B36.19M dimensional data for pipe mass calculation.

## GitHub Pages upload
Upload the complete contents of this folder to a GitHub Pages repository:
- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `css/`
- `js/`
- `icons/`

After updating a hosted version, testers may need to reload the page; when an older cached PWA remains visible, close/reopen the installed app or clear the site cache.

## Trial caution
This tool is for preliminary support planning during site survey only. Verify pipe class against the original PMC/PMS and complete final engineering checks before using any result for design or construction.
