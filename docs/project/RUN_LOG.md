# Run log

2026-10-05 inspection: main dd417fbd97e61f00cca60cbc40a4608000726953 is legacy documentation. PR #4 remains open, head 5bdf5c2a5f9dc13d6ea1a7fd90560849b53ce78b. CI run 37219449610 failed at setup-node: missing dependency lockfile; install/build were skipped.
Selected foundation stabilization. Local source downloaded at that head. Added reproducible dependency install, security audit, typecheck, behavioral tests; repaired false simulator health with immutable per-attempt state and diagnostic ordering. New docs provide shared project control rather than replacing historical film docs.
Local verification passed: clean npm ci; TypeScript; 4/4 behavioral tests; npm audit reports 0 vulnerabilities; production build. Production Chromium/Playwright flow passed: initial 403, blind repair incomplete, reset, evidence→repair→HTTP verify, refresh resets, 390px mobile has no horizontal overflow, visible keyboard focus, no page errors. Mobile screenshot inspected. Browser installer CDN failed; packaged Chromium binary used for local verification. Browser E2E not yet in CI. GitHub CI/merge still pending for the commit containing this entry.

