# Project state

Updated: 2026-10-05. Phase: second cross-relation causal-transfer gate implemented and code-head verified in PR #24; final documentation-head CI is required before merge.
Package version: 0.1.0. No release or tag was created in this run.
Main before PR #24: abab7f7b52e86b93706530fe0b2c22e9d98f944d (PR #23, verified causal-counterfactual documentation checkpoint).
Product code head verified before documentation reconciliation: 23c28de23891b07f4bd6f80249e11f95edc7f872.
Successful code-head PR CI: 37288562083.

## Goal contract
GOAL: test whether the changed-evidence prediction pattern transfers to a materially different permission/identity relation instead of adding another listener-token variant.
WHY NOW: the first listener counterfactual tests socket-target reasoning, but a learner could memorize its fixed 9090 -> 8080 tokens without demonstrating the same reasoning structure across a different causal mechanism.
USER VALUE: after solving the private report case with minimal mode 640, the learner must hold the file relation fixed, hypothetically remove report-worker from group web, and predict the resulting access failure and required intervention.
SCOPE: one permission/group-identity counterfactual; explicit original identity/resource sources and facts; fixed post-repair mode 640; hypothetical identity without web membership; deterministic HTTP/repair/causal prediction; progression/completion gate; persistence/hydration invariants; production-browser coverage.
NON-GOALS: arbitrary prose or LLM grading, a fifth incident, broad curriculum expansion, real Linux execution, accounts, server-trusted mastery, certification, anti-cheat or hidden client secrets.
ACCEPTANCE: wrong source, original fact, fixed mode, hypothetical identity, predicted HTTP, repair need or causal relation fails; editing/re-explaining/resetting the transfer case revokes its gate; differential diagnosis cannot start or continue without a valid carried permission gate; the existing listener gate remains independently required; stale schema-v6 checkpoints and impossible carry states fail closed.
TEST PLAN: full TypeScript check, Node behavioral/persistence suite, high-severity npm audit, production build, and mandatory production Chromium tests covering correct/wrong permission predictions, edit revocation, both differential orders and storage recovery.
SECURITY IMPACT: none to the execution boundary. All commands and both counterfactuals remain exact-match in-browser SIMULATED transitions. localStorage evidence, order, reasoning and completion remain forgeable and non-authoritative.
LEARNING IMPACT: adds a second changed-evidence relation: group membership -> effective group-read access, distinct from listener port -> endpoint reachability.
ROLLBACK: revert PR #24. Practice schema-v6 checkpoints are intentionally incompatible with schema v7; Linux fixture version remains 5 because incident definitions, initial states and command outputs did not change.

## Product truth
Implemented in PR #24: the transfer permission case now requires a second deterministic counterfactual after correct evidence-linked explanation. Original identity must be source `transfer:before:identity` with fact `1001:report-worker,web`; original resource must be `transfer:before:resource` with fact `600:root:web`; post-repair mode stays `640`; hypothetical identity becomes `1001:report-worker`; expected HTTP is `403`; access repair remains `required`; causal relation is `group-membership-required`.
Progression: differential diagnosis is hidden until this permission gate passes. Its passed state carries into later differential cases and is rechecked for both first-to-second differential progression and final completion. Editing the transfer reasoning or permission prediction revokes the pass. Resetting the transfer case clears it; resetting a later differential case preserves a valid carried permission gate. The listener counterfactual is still separately required when its case is reached.
Persistence candidate: PRACTICE_SCHEMA_VERSION = 7; LINUX_FIXTURE_VERSION = 5. Schema-v6 and older checkpoints are discarded. Restore requires canonical permission-transfer shape/match for every differential checkpoint as well as the existing listener-transfer invariants.
Red-team finding fixed before final code verification: the first implementation gated entry into differential diagnosis but did not re-check the carried permission gate on step 0 -> step 1. Commit 23c28de23891b07f4bd6f80249e11f95edc7f872 closes that progression hole.
Partial: there are still only four incidents and two visible deterministic counterfactuals. They reduce one-token memorization but remain retryable finite grammar and do not prove general causal transfer. A deliberately forged internally consistent client checkpoint can still restore local completion.
Known risks: tiny fixture corpus; strict token grammar; simplified permission and TCP models; Chromium-only browser coverage; Web Crypto order may repeat; and CI-only Playwright 1.63.0 remains outside package-lock.json and the normal app audit.

## Verification evidence
PR #24 code head 23c28de23891b07f4bd6f80249e11f95edc7f872 passed CI 37288562083. The job executed npm ci, full TypeScript typecheck, 36/36 Node tests, npm audit --audit-level=high with 0 vulnerabilities, production build, exact-pinned @playwright/test 1.63.0 plus Chromium/runtime installation, then production browser regression.
Browser logs confirm `next start --hostname 127.0.0.1 --port 3100`, three tests with one worker and `3 passed (42.7s)`. Coverage includes the permission counterfactual wrong-source/wrong-prediction paths, edit revocation, both differential orderings, schema-v7 persistence/resilience, unavailable Storage API, mobile overflow, keyboard focus and runtime-error checks.
This documentation reconciliation changes the PR head, so CI 37288562083 is evidence for the product code head, not permission to merge the new final head. Merge PR #24 only after the exact documentation-inclusive head passes the same mandatory CI.

## Highest-value frontier after delivery
Move the exact-pinned Playwright runtime into the repository's reproducible lockfile/audit workflow. The E2E suite now protects a larger assessment state machine, while its test runtime is still installed outside package-lock.json after the normal audit. Fix this supply-chain/reproducibility debt before materially widening browser coverage or adding another finite counterfactual.
Secondary learning frontier: after dependency hygiene, prefer a genuinely unfamiliar transfer/curriculum slice over a third fixed token perturbation unless evidence shows another narrow counterfactual closes a specific learning defect.
