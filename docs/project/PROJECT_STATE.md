# Project state

Updated: 2026-10-05. Phase: second cross-relation causal-transfer gate delivered and verified on main.
Package version: 0.1.0. No release or tag was created in this run.
Verified main: 7ae7950af5f24efdc94306a7b4b6b9091f513d53 (PR #24), re-read after squash merge.
Product PR final head: f1c7d444e1d1309c95be77fa795ebfa1a9f11977.
Successful exact final-head PR CI: 37289499028 (job 111696299172).
No separate successful main-push workflow is claimed; none was visible when main was re-read.

## Goal contract
GOAL: test whether the changed-evidence prediction pattern transfers to a materially different permission/identity relation instead of adding another listener-token variant.
WHY NOW: the first listener counterfactual tests socket-target reasoning, but its fixed 9090 -> 8080 tokens could be memorized without demonstrating the same reasoning structure across another causal mechanism.
USER VALUE: after solving the private report case with minimal mode 640, the learner must hold file owner/group and mode fixed, hypothetically remove report-worker from group web, and predict the resulting access failure and required intervention.
SCOPE: permission/group-identity counterfactual; explicit original identity/resource sources and facts; fixed post-repair mode 640; hypothetical identity without web membership; deterministic HTTP/repair/causal prediction; progression/completion gate; persistence invariants; production-browser regression.
NON-GOALS: arbitrary prose/LLM grading, a fifth incident, broad curriculum expansion, real Linux execution, accounts, server-trusted mastery, certification, anti-cheat or hidden client secrets.
ACCEPTANCE: wrong source/fact/fixed mode/hypothetical identity/prediction/repair need/causal relation fails; editing/reset/re-explain revokes the gate; differential diagnosis cannot start or continue without a valid carried permission gate; existing listener transfer remains independently required; stale schema-v6 and impossible carry states fail closed.
SECURITY: execution boundary remains SIMULATED. All learner commands and hypothetical predictions are exact-matched client transitions; localStorage state remains forgeable and non-authoritative.
ROLLBACK: revert PR #24. Schema-v6 checkpoints are intentionally incompatible with schema v7. Linux fixture version remains 5 because incident definitions and command outputs did not change.

## Product truth
Four SIMULATED incidents remain: two file-access scenarios and two same-symptom TCP-service scenarios. Structured before-repair evidence, locked hypotheses, minimal repair, verification and source-linked explanation still gate progress.
Permission transfer gate: original identity source/fact is `transfer:before:identity` / `1001:report-worker,web`; original resource is `transfer:before:resource` / `600:root:web`; post-repair mode is held at `640`; hypothetical identity becomes `1001:report-worker`; expected HTTP is `403`; repair need is `required`; causal relation is `group-membership-required`.
Listener transfer gate remains: process presence is held fixed while listener evidence changes from 9090 to target 8080; expected endpoint prediction is `200`, listener repair need `none`, relation `listener-target-match`.
Progression requires permission transfer before entering and continuing through differential diagnosis. Final completion also requires listener transfer. Editing dependent reasoning/transfer revokes pass. Reset semantics preserve only already-valid prior gates in later cases.
Persistence: PRACTICE_SCHEMA_VERSION = 7; LINUX_FIXTURE_VERSION = 5. Main was re-read after merge and these values were confirmed. Schema-v6 and older incompatible checkpoints fail closed.
Red-team result: an initial implementation only gated differential entry; review found the step-0 -> step-1 transition also needed to re-check carried permission transfer. Commit 23c28de23891b07f4bd6f80249e11f95edc7f872 fixed this before final-head CI.

## Verification evidence
PR #24 exact final head f1c7d444e1d1309c95be77fa795ebfa1a9f11977 passed CI 37289499028. The job executed npm ci, full TypeScript typecheck, 36/36 Node tests, npm audit --audit-level=high with 0 vulnerabilities, production build, exact-pinned @playwright/test 1.63.0 plus Chromium/runtime installation, and production browser regression.
Final-head browser logs show `next start --hostname 127.0.0.1 --port 3100`, three tests with one worker and `3 passed (41.8s)`. Browser coverage includes wrong/correct permission counterfactual attempts, edit revocation, both differential orderings, schema-v7 persistence/resilience, unavailable Storage API, mobile overflow, keyboard focus and runtime-error checks.
PR #24 squash-merged as 7ae7950af5f24efdc94306a7b4b6b9091f513d53. Main was re-read and confirmed to contain schema v7, fixture v5 and the permission-transfer state/rubric.

## Known risks
Two deterministic counterfactuals across different causal relations reduce single-token memorization but remain visible, finite and retryable. They do not prove general causal transfer or mastery.
localStorage completion/evidence remains forgeable. Permission/TCP models are simplified. The fixture corpus is tiny. Browser coverage is Chromium-only. Web Crypto assignment can repeat an order.
Mandatory Playwright 1.63.0 is still installed in CI outside package-lock.json and after the normal app audit, leaving a reproducibility/supply-chain gap.

## Highest-value frontier
Move exact-pinned Playwright into the repository's reproducible lockfile and normal dependency-audit workflow without weakening production browser coverage. This risk now has higher leverage than adding a third fixed counterfactual.
After dependency hygiene, prefer a genuinely unfamiliar learning-transfer/curriculum slice over another token variant unless a specific learning defect justifies one.
