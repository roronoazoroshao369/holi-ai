# Project state

Updated: 2026-10-05. Phase: production browser regression is now a mandatory CI quality gate; next frontier is broader unfamiliar Linux/OS/network diagnosis.
Package version: 0.1.0 (no release tag).
Verified product main: 9e122bd1bbaccab7243703e3e6a6ab758a16fc87.
Product PR #11 merged as 9e122bd1bbaccab7243703e3e6a6ab758a16fc87. Final PR head: 6ea9138a0c1264426f67b7c3877b52e2d322871a; CI 37253872837 succeeded. Resulting main, CI workflow, Playwright config and browser test were re-read and confirmed.

## Goal contract
GOAL: make the production-browser learning regression reproducible and mandatory in CI before broadening curriculum.
WHY NOW: v0.3 persistence added real refresh/hydration behavior, but CI only proved install/typecheck/pure tests/audit/build and could not catch browser-only regressions.
USER VALUE: every PR/main change now has an automated production Chromium check for the current guided/transfer learning flow and persistence failure paths.
SCOPE: Playwright Test harness; deterministic production `next start` lifecycle; dedicated port; one Chromium worker; exact-pinned CI Playwright runtime; guided/transfer path; refresh restore; current-fixture reset; full restart; corrupt and stale checkpoint rejection; unavailable Storage API; responsive overflow; keyboard focus; console/page runtime errors.
NON-GOALS: cross-browser matrix, accounts, cross-device sync, trusted mastery/certification, real Linux execution, sandbox gateway, curriculum expansion.
ACCEPTANCE: normal CI gates pass first; CI then starts the built production app deterministically, waits for readiness, runs the browser suite, fails on browser/runtime regressions and cleans up the server; final PR head must pass before merge.
SECURITY: labs remain SIMULATED. Browser tests do not add command execution, credentials, privileged containers, host mounts, Docker socket or trusted client grading. localStorage remains attacker-controlled.
LEARNING: the browser gate verifies product behavior, not learner competence. Two fixed permission fixtures and multiple-choice explanation remain narrow signals.
ROLLBACK: revert PR #11. No migrations, account data or server-side learner state were added.

## Product truth
Works: executable product shell; guided and transfer SIMULATED Linux permission practice; evidence/hypothesis/minimal-repair/verification/explanation gates; versioned local checkpoint with safe refresh/reset/restart/corrupt/stale/unavailable-storage behavior; mandatory production Chromium regression in CI.
Partial: only one skill and two fixed fixtures; local checkpoint is same-browser/device only; terminal transcript is intentionally not persisted; no authoritative mastery model; browser CI currently covers Chromium only.
Broken: no known in-scope failure after final-head CI and product-main re-read.
Known risks: client progress is forgeable; fixed fixtures can be memorized; parent-directory traversal, ACL/SELinux and other server configuration remain assumed healthy; curriculum breadth is still mostly planned; the CI-only Playwright runtime is exact-pinned but installed outside the app lockfile and after the normal app dependency audit.
Current highest-value frontier: broaden Linux/OS/network diagnosis with unfamiliar fixtures and less prompted reasoning while preserving the browser gate.
Next candidate goals: introduce broader diagnosis/transfer cases; then revisit trusted mastery/accounts only when server identity or cross-device state is justified; real Linux labs remain blocked on an isolated execution design and escape/resource verification.
External blockers: none established.

## Verification evidence
Local checks actually executed for PR #11: `node --check playwright.config.cjs` and `node --check tests/learning-flow.browser.cjs` passed on the drafted contents. No local full install/build or local production-browser pass is claimed for this run.
GitHub CI 37253872837 succeeded on final PR head 6ea9138a0c1264426f67b7c3877b52e2d322871a: npm ci, full typecheck, 14 Node behavioral tests, npm audit --audit-level=high, production build, exact-pinned @playwright/test 1.63.0 install, Chromium/runtime dependency install and production browser regression all passed.
Browser-job log confirmed `next start --hostname 127.0.0.1 --port 3100`, one discovered test and `1 passed (7.3s)`. The test exercised guided/transfer behavior, persistence restore/reset/restart, corrupt/stale storage, blocked Storage API, 390px overflow, keyboard focus and console/page errors.
GitHub confirmed PR #11 squash merge as 9e122bd1bbaccab7243703e3e6a6ab758a16fc87. Main was re-read and the expected workflow/config/browser-test files were confirmed.
Inspect live GitHub before trusting these SHAs.
