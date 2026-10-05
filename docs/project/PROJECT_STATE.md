# Project state

Updated: 2026-10-05. Phase: v0.3 simulated mastery flow with reproducible audited browser-test runtime; dependency-hygiene goal delivered and verified on main.
Package version: 0.1.0. No release or tag was created in this run.
Verified main: f6cbcc61c1285bbec6bb4ca779d2ea30b5f4ecd0 (PR #26), re-read after squash merge.
Product PR final head: 9c1dd7159b1d449a75a4316290dce10b81fd7184.
Successful exact final-head PR CI: 37315643839 (job 111781574376); duplicate exact-head run 37315695718 also completed successfully.
PR #26 preserved simulator semantics and changed dependency/CI ownership plus durable docs only.

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
@playwright/test, playwright and playwright-core are exact-locked at 1.63.0 and included in npm ci/audit. Chromium/FFmpeg are still Playwright-managed CDN downloads selected by the locked version; those binary artifacts are not npm-audited.

## Highest-value frontier
Select one genuinely unfamiliar learning-transfer or broader curriculum slice with observable competence evidence. Do not add a third fixed counterfactual merely to increase gate count; the current two are visible, finite and memorizable. Prefer a vertical slice that forces diagnosis/repair/verification/explanation on a new mechanism while retaining explicit SIMULATED labeling until a separate isolated execution gateway exists.

## Completed goal — Playwright dependency hygiene
GOAL: move the mandatory @playwright/test 1.63.0 runtime into package.json/package-lock.json and the normal npm ci/audit dependency graph while preserving production Chromium coverage.
WHY NOW: browser regression is a merge gate, but its runtime is currently installed after npm audit with --no-save and no lockfile, creating a concrete reproducibility and supply-chain blind spot.
USER VALUE: the mandatory browser gate becomes reproducible from the repository and audited with the rest of the application dependency graph.
SCOPE: exact-pin @playwright/test 1.63.0; lock its Playwright dependency chain; remove temporary CI runtime/NODE_PATH setup; install Chromium from the locked local CLI; keep the existing production browser suite mandatory.
NON-GOALS: change Playwright version, broaden browser engines, add curriculum, alter simulator semantics, introduce accounts or real execution.
ACCEPTANCE CRITERIA: SATISFIED on executable/config head caace34735d202c144934af7dd621206b34ab099. npm ci resolved the locked runtime; typecheck passed; 36/36 Node tests passed; high-severity npm audit found 0 vulnerabilities; production build passed; Chromium installation from the local locked Playwright CLI passed; 3/3 production Chromium tests passed; CI no longer runs npm install --no-save for Playwright or relies on RUNNER_TEMP/NODE_PATH.
TEST PLAN: executable/config head caace34735d202c144934af7dd621206b34ab099 passed CI 37314919851. Exact final PR head 9c1dd7159b1d449a75a4316290dce10b81fd7184 then repeated the full workflow successfully in CI 37315643839 (job 111781574376); duplicate exact-head run 37315695718 also succeeded. PR #26 squash-merged as f6cbcc61c1285bbec6bb4ca779d2ea30b5f4ecd0.
SECURITY IMPACT: reduces un-audited mandatory CI dependency surface; no learner execution boundary changes.
LEARNING IMPACT: none to learner semantics; preserves the browser regression that protects the current mastery-flow UI.
ROLLBACK STRATEGY: revert this branch/PR; the prior temporary Playwright installer can be restored without data migration.

## Post-goal project truth
The mandatory Node-side browser test runtime is now repository-owned: `@playwright/test` is exact-pinned at 1.63.0 and `package-lock.json` locks `@playwright/test -> playwright -> playwright-core` at the same version. CI uses only `./node_modules/.bin/playwright`; the previous temporary `npm install --no-save --package-lock=false`, RUNNER_TEMP runtime and NODE_PATH/GITHUB_PATH indirection are removed.

Residual supply-chain boundary: npm audit now covers the Playwright npm packages, but the Chromium/FFmpeg binaries are still downloaded from Playwright's CDN during CI. Their revision is selected by the locked Playwright package, but they are not independently represented as npm lockfile entries or audited by npm audit. Do not claim that browser binaries themselves are npm-audited.

Highest-value frontier after this goal: prefer a genuinely unfamiliar learning-transfer/curriculum slice with observable competence evidence over a third fixed token counterfactual. Keep all current labs explicitly SIMULATED until a separately isolated execution gateway exists.
