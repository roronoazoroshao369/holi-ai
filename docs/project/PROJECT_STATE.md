# Project state

Updated: 2026-10-05. Phase: same-symptom differential diagnosis is delivered; next frontier is reducing sequence-position memorization.
Package version: 0.1.0 (no release tag).
Verified product main: f6e5f66e87c0f52b90f87f808cb527e80a944a6a.

Product PR #16 delivered the same-symptom differential slice. Final head: 1c3a50be94e64401cf75113a360e68196545f0b7; GitHub CI 37258994642 succeeded; squash merge: f6e5f66e87c0f52b90f87f808cb527e80a944a6a. Resulting main was re-read and confirmed.

## Goal contract
GOAL: make competing root causes share the same learner-facing connection-refused symptom so evidence, not the scenario label, determines the causal hypothesis.
WHY NOW: the prior unfamiliar listener fixture could eventually become synonymous with the `network` keyword.
USER VALUE: the learner must inspect process state and socket state to distinguish a process-down incident from a running process listening on the wrong port.
SCOPE: add a second neutral health incident; model TCP service state as process presence plus listening port; keep the two differential cases identical in title, summary, README, symptom command and evidence commands; hide repair syntax until a hypothesis is locked; version persistence for changed state and sequence semantics; expand behavioral/browser coverage.
NON-GOALS: broad curriculum expansion, random free-form grading, real Linux/network execution, accounts, cross-device sync, trusted certification or cross-browser compatibility claims.
ACCEPTANCE: the two cases begin with the same connection-refused output; process/socket observations discriminate them; wrong causal classes cannot complete even after the correct repair command; pre-hypothesis help cannot reveal configure-versus-start; stale/cross-case checkpoints fail closed; production Chromium CI passes on the exact final PR head.
SECURITY: commands remain exact-matched SIMULATED transitions. No eval, shell, subprocess, Docker, privileged runtime, host mount/socket, credential or real external/internal network execution was added.
LEARNING: this is stronger differential practice, not proof of general mastery. Fixed order and known causal keywords remain learnable by repetition.
ROLLBACK: revert PR #16. Schema/fixture v2 checkpoints were intentionally invalidated; no server-side learner state exists.

## Product truth
Works: executable product shell; two SIMULATED file-access incidents; two SIMULATED TCP-service incidents with the same learner-facing connection symptom but competing process-versus-listener causes; observation → typed hypothesis → repair → endpoint verification → mechanism explanation gates; family/case isolation; repair help withheld until hypothesis; versioned local checkpoint; safe refresh/reset/restart/corrupt/stale/unavailable-storage behavior; mandatory production Chromium regression in CI.
Persistence truth: PRACTICE_SCHEMA_VERSION = 3 and LINUX_FIXTURE_VERSION = 3. Old v2 checkpoints are discarded rather than reinterpreted under the new TCP-service state and assessment sequence.
Partial: four fixed incidents across two causal families; the differential pair still runs in a fixed order; mechanism explanation remains multiple-choice; typed hypothesis still accepts three known keywords; local checkpoint is same-browser/device only; transcript is intentionally not persisted; browser CI covers Chromium only.
Broken: no known in-scope product failure after final-head CI and product-main re-read.
Known risks: client progress is forgeable; repeated learners can memorize case order, exact commands and causal keywords; the TCP service is a state-machine model rather than a real kernel/network stack; permission fixtures assume healthy parent traversal/ACL/SELinux; curriculum breadth remains mostly planned; CI-only Playwright remains outside package-lock.json and the normal app dependency audit.
Current highest-value frontier: remove sequence-position leakage in the same-symptom differential pair without sacrificing deterministic testing or persistence safety. Prefer an opaque/counterbalanced per-attempt case order that is persisted explicitly and tested in either ordering, rather than unseeded randomness.
Next candidate after that: reduce mechanism-explanation prompting with evidence-linked structured reasoning without pretending arbitrary prose can be graded reliably.
External blockers: none established.

## Verification evidence
PR #16 final head 1c3a50be94e64401cf75113a360e68196545f0b7 passed GitHub CI 37258994642: npm ci, full TypeScript typecheck, 20/20 Node behavioral tests, npm audit --audit-level=high, production build, exact-pinned @playwright/test 1.63.0 install, Chromium/runtime install and production browser regression all succeeded.
Browser log confirmed `next start --hostname 127.0.0.1 --port 3100`, two discovered tests using one worker and `2 passed (18.4s)`. The production flow exercised both same-symptom differential causes, wrong-hypothesis rejection, hidden pre-hypothesis repair syntax, persistence restore/reset/restart, corrupt/stale storage, unavailable Storage API, mobile overflow, keyboard focus and runtime-error checks.
PR #16 squash-merged as f6e5f66e87c0f52b90f87f808cb527e80a944a6a. Main was re-read and confirmed to contain both differential cases, schema/fixture version 3 and package version 0.1.0.
No separate successful post-merge main-push CI is claimed unless live GitHub evidence establishes one. Inspect live GitHub before trusting these SHAs.
