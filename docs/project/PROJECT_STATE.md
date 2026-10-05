# Project state

Updated: 2026-10-05. Phase: unfamiliar diagnosis now spans two causal families; next frontier is same-symptom differential diagnosis.
Package version: 0.1.0 (no release tag).
Verified product main: 1b72ff2c332e4110fdaeb544626237ac569a7bb0.

Product PR #13 added the new diagnosis family. Final head: 0d41a539ea982677ec3ba67690cec2a5c7a4ceb1; CI 37256198242 succeeded; squash merge: 7fbf4de0e8eb7b6e9d9800c81cfb5f45cafce45f.
Follow-up product PR #14 removed learner-facing answer leakage and fixed a browser-test hydration race. Final head: 1d24a271c6552f72d559d223c60fc98fe06b2349; final CI 37256690555 succeeded; squash merge: 1b72ff2c332e4110fdaeb544626237ac569a7bb0. Resulting main was re-read and confirmed.

## Goal contract
GOAL: improve transfer beyond two permission fixtures with one unfamiliar SIMULATED incident whose causal mechanism differs meaningfully, while reducing hypothesis prompting.
WHY NOW: two known permission fixtures allowed memorized chmod sequences and fixture identity to substitute for diagnosis.
USER VALUE: the learner must now separate observations from conclusions and distinguish file access from process/socket/network evidence before repair.
SCOPE: add a deterministic TCP-listener/port-mismatch incident; split observation state from incident state; use incident-family dispatch; replace the hypothesis select with a typed causal class; version persistence for the changed state/fixture semantics; expand Node and production-browser coverage; remove answer-leaking learner copy.
NON-GOALS: broad curriculum expansion, real Linux/network execution, free-form semantic grading, accounts, cross-device sync, trusted certification or a cross-browser matrix.
ACCEPTANCE: wrong or blind hypotheses cannot complete the unfamiliar incident; incident families cannot mutate each other; stale v1 checkpoints fail closed; learner-facing prompts do not reveal hidden listener evidence; full CI including production Chromium passes on final PR heads.
SECURITY: all commands remain exact-matched SIMULATED transitions. No eval, shell, subprocess, Docker, credentials, host mounts, Docker socket, privileged runtime or external/internal network execution was added.
LEARNING: this broadens transfer evidence but does not prove general mastery. Three deterministic fixtures remain learnable by repetition.
ROLLBACK: revert PR #14 then PR #13. Existing v1 checkpoints were intentionally invalidated when schema/fixture versions moved to 2; no server-side learner data exists.

## Product truth
Works: executable product shell; two SIMULATED file-access incidents plus one SIMULATED listener/port incident; observation → typed hypothesis → minimal repair → endpoint verification → mechanism explanation gates; incident-family isolation; versioned local checkpoint; safe refresh/reset/restart/corrupt/stale/unavailable-storage behavior; mandatory production Chromium regression in CI.
Persistence truth: PRACTICE_SCHEMA_VERSION = 2 and LINUX_FIXTURE_VERSION = 2. Old v1 checkpoints are discarded rather than silently interpreted under changed semantics.
Partial: only three fixed fixtures across two causal families; explanation remains multiple-choice; typed hypotheses are still three known keywords; local checkpoint is same-browser/device only; terminal transcript is intentionally not persisted; browser CI covers Chromium only.
Broken: no known in-scope product failure after final-head CI and product-main re-read.
Known risks: client progress is forgeable; scenario order/identity and exact command sequences can still be memorized; the listener incident is a state-machine model rather than a real network stack; parent-directory traversal, ACL/SELinux and other server configuration remain assumed healthy in permission fixtures; curriculum breadth is mostly planned; the CI-only Playwright runtime is exact-pinned but outside package-lock.json and the normal app dependency audit.
Current highest-value frontier: same-symptom differential diagnosis. Add a second incident that initially looks like the current connection-refused case but has a competing root cause, such as process absent versus process alive on the wrong listener port, with neutral learner-facing identity and evidence that discriminates the causes.
Next candidate after that: reduce mechanism-explanation prompting and broaden unfamiliar cases; revisit trusted mastery/accounts only when server identity or cross-device state is justified; real Linux labs remain blocked on an isolated execution design and escape/resource verification.
External blockers: none established.

## Verification evidence
PR #13 final head 0d41a539ea982677ec3ba67690cec2a5c7a4ceb1 passed GitHub CI 37256198242: npm ci, full typecheck, 17/17 Node behavioral tests, npm audit --audit-level=high, production build, exact-pinned @playwright/test 1.63.0 install, Chromium/runtime install and production browser regression. Browser log confirmed `next start --hostname 127.0.0.1 --port 3100`, two discovered tests using one worker, and `2 passed (10.3s)`. PR #13 squash-merged as 7fbf4de0e8eb7b6e9d9800c81cfb5f45cafce45f.

Post-merge red-team found learner-facing answer leakage in the unfamiliar incident title. PR #14 removed that cue and added a regression test. Its first head 76ddc6b4714d69fb9e12300bae4775b4a1d41d42 ran CI 37256411604: npm ci/typecheck/18 Node tests/audit/build/browser-runtime install all succeeded, but the production browser step failed with 1 passed / 1 failed because the test injected localStorage before the app's initial hydration/autosave had settled. Artifact evidence showed a valid guided checkpoint overwrote the injected listener checkpoint. This was a test race, not accepted as a product pass.

PR #14 final head 1d24a271c6552f72d559d223c60fc98fe06b2349 waited for the initial persistence save before injecting the browser checkpoint. GitHub CI 37256690555 succeeded: 18/18 Node tests, audit/build/runtime install, then production `next start` on 127.0.0.1:3100 and two Chromium tests using one worker, `2 passed (15.6s)`. PR #14 squash-merged as 1b72ff2c332e4110fdaeb544626237ac569a7bb0. Main was re-read and confirmed to contain neutral learner copy, schema/fixture version 2 and the deterministic browser setup.

No separate successful post-merge main-push CI is claimed unless live GitHub evidence establishes one. Inspect live GitHub before trusting these SHAs.
