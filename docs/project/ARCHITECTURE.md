# Architecture

Next.js App Router / React / TypeScript. app/page.tsx renders curriculum and the client terminal. lib/linux-simulator.ts is a pure per-attempt SIMULATED state machine; no subprocess or external networking occurs.

The simulator now models scenario definitions plus two incident families. `file-access` incidents carry file mode state; `tcp-listener` incidents carry a simulated listener port. `LabState` separates raw `observations` (symptom, resource and identity/process) from the learner's causal hypothesis and from repair/verification/explanation provenance. Exact command matching dispatches to family-specific transitions. Unsupported input is inert.

React owns the active attempt. lib/practice-persistence.ts stores a browser localStorage checkpoint with schema version 2 and Linux fixture version 2. Both versions increased when the LabState shape and fixture semantics expanded. Restore validates scenario-family compatibility, observations, hypothesis/repair invariants, target state and derived completion flags. Corrupt, stale, v1 or semantically impossible checkpoints are discarded. If storage is unavailable the lab falls back to ephemeral state. Terminal transcript is intentionally not persisted. This client checkpoint is untrusted practice data, not authoritative mastery.

Production-browser verification is configured in playwright.config.cjs. CI builds first, installs exact-pinned @playwright/test 1.63.0 plus Chromium under runner temporary storage, then Playwright starts the built app with `next start` on dedicated loopback port 3100, waits for readiness, runs two serial Chromium tests with one worker and owns server cleanup. `reuseExistingServer` is false. Failure diagnostics retain trace/screenshot output for artifact upload.

Browser test 1 covers guided file-access diagnosis, permission transfer, unfamiliar listener diagnosis, wrong causal hypothesis rejection, minimal repair, explanation and completed-state refresh. Browser test 2 covers hydration from a valid checkpoint, current-fixture reset, full restart, corrupt/stale checkpoint rejection, unavailable Storage API, mobile overflow, keyboard focus and console/page errors. Its injected checkpoint is written only after initial browser persistence settles, avoiding a false race with first-load autosave.

Future real-execution boundary remains: browser → learning API → authenticated lab gateway → disposable isolated runtime → verifier. The web host never executes learner commands.
No durable or server-trusted mastery is claimed. See ../DEVOPS_PLATFORM_ARCHITECTURE.md for the longer baseline. docs/plan is historical film planning, not active architecture.
