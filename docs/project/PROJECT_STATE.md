# Project state

Updated: 2026-10-05. Phase: narrow evidence-based causal counterfactual transfer delivered and independently verified on product main.
Package version: 0.1.0. No release or tag was created in this run.
Verified product main: 46f9d715f9ffda8c14e4b5e75a0d50f6919a4335 (PR #22), re-read after squash merge.
Product final head: d4719851a2e109d334fc0f8a4385163b0e556b01.
Successful final-head PR CI: 37272875381.
Successful product-main push CI: 37273085153.

## Goal contract
GOAL: test one causal prediction beyond transcription of already observed fields, without introducing arbitrary prose grading or a broad new lab family.
WHY NOW: evidence-linked reasoning forced source/fact/mechanism linkage, but the visible finite grammar could still be completed by transcribing known observations.
USER VALUE: after diagnosing the running-process/wrong-listener case, the learner must keep the process fact fixed, change only the hypothetical socket observation to the client target, and predict the endpoint/repair consequence.
SCOPE: listener-case counterfactual answer; explicit original process/socket evidence IDs and facts; deterministic predicted symptom, repair need and causal relation; progression/completion gate; persistence/hydration invariants; both differential orders in production Chromium.
NON-GOALS: arbitrary prose/LLM grading, broad curriculum expansion, a fifth incident, real Linux/network execution, accounts, server-trusted grading, certification, anti-cheat or hidden client secrets.
ACCEPTANCE: wrong source, original fact, predicted symptom, repair need or causal relation fails; editing revokes the transfer pass; listener-first cannot advance before the gate; process-first cannot finish before the final listener gate; stale v5 schema checkpoints and impossible carried-transfer states fail closed.
SECURITY: all learner commands remain exact-matched SIMULATED transitions. Evidence, reasoning, transfer state, order and completion remain client-forgeable and non-authoritative.
ROLLBACK: revert PR #22. Schema-v5 checkpoints are intentionally incompatible with schema v6; Linux fixture version remains 5 because incident definitions and command outputs did not change.

## Product truth
Implemented: four SIMULATED incidents across file permissions and TCP-service state; identical learner-facing health case framing; randomized persisted differential order/step; immutable before-repair evidence; source-linked structured explanation; and one listener-case counterfactual that changes the hypothetical socket observation from the observed 9090 listener to 8080 while holding the running-process observation fixed.
Counterfactual rubric: original process source/fact must be the listener-case identity snapshot + `present`; original socket source/fact must be the listener-case resource snapshot + `9090`; predicted endpoint token is `200`; listener repair need is `none`; causal relation is `listener-target-match`. This is a finite deterministic rubric, not arbitrary prose understanding.
Progression: when listener appears first, the second health case is blocked until the counterfactual passes. When listener appears second, overall differential completion is blocked until it passes. Editing listener reasoning or transfer revokes dependent completion. Resetting listener clears its transfer draft; resetting the later process case in listener-first order preserves the already-passed listener transfer.
Persistence: PRACTICE_SCHEMA_VERSION = 6; LINUX_FIXTURE_VERSION = 5. v5-schema checkpoints are discarded. Canonical transfer shape/match and sequence-carry invariants are validated on hydration and nested transfer state is copied.
Partial: one fixed counterfactual is still visible, finite, retryable and memorizable. It tests a specific conditional prediction but does not establish general causal transfer. A deliberately forged internally consistent client checkpoint can still restore local completion.
Known risks: tiny fixture corpus; exact-match grammar; simplified TCP model; healthy parent traversal/ACL/SELinux assumptions; Chromium-only browser coverage; independent Web Crypto assignment can repeat order; CI-only Playwright 1.63.0 remains outside package-lock.json and the normal app audit.
Next primary frontier: test generalization with one second narrow changed-evidence perturbation that is not the same listener-token pattern, preferably across the permission/identity relation, and define rejection cases before implementation. Do not broaden curriculum or claim mastery from two finite tasks.
Secondary frontier: move Playwright runtime into a reproducible lock/audit workflow. Deliberate counterbalancing remains conditional on a real repeat-attempt requirement.

## Verification evidence
The previous documentation main push at 587363b37d36da04965cdabb0642b7e85c27a52e was re-verified: CI 37270822577 completed successfully and production Chromium logged three tests with one worker, `3 passed (34.0s)`.
PR #22 final head d4719851a2e109d334fc0f8a4385163b0e556b01 passed CI 37272875381. The exact pull-request run executed npm ci, TypeScript typecheck, 33/33 Node tests, npm audit --audit-level=high, production build, exact-pinned @playwright/test 1.63.0 installation and production Chromium regression. Browser logs show `next start --hostname 127.0.0.1 --port 3100`, three tests using one worker and `3 passed (39.7s)`.
PR #22 squash-merged as 46f9d715f9ffda8c14e4b5e75a0d50f6919a4335. Main was re-read and confirmed to expose PRACTICE_SCHEMA_VERSION 6, LINUX_FIXTURE_VERSION 5 and package version 0.1.0.
The independent push workflow for that exact product merge, CI 37273085153, also completed successfully. It logged 33/33 Node tests, the pinned Playwright runtime, production `next start --hostname 127.0.0.1 --port 3100`, three Chromium tests using one worker and `3 passed (40.9s)`.
