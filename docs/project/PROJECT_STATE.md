# Project state

Updated: 2026-10-05. Phase: v0.3 simulated mastery-flow foundation now includes the first complete Git & CI learning vertical slice alongside the existing Linux practice.
Package version: 0.1.0. No release or tag was created in this run.
Verified main: 0dd9c4c4956ee92531dd1e8c5af56dd2f4a2fe6b (PR #28), re-read after squash merge.
Product PR final head: 03915755c2cdf4ec9744def78eff187f125935ea.
Successful exact final-head PR CI: 37318719562 (job 111791991295).
Verification on that exact head: npm ci; full TypeScript typecheck; 43/43 Node tests; npm audit --audit-level=high with 0 vulnerabilities; production build; locked Playwright Chromium install; 5/5 production Chromium tests in 41.1s.
Linux practice schema remains 7 / Linux fixture 5. Git & CI uses a separate client-local schema 1 / fixture 1, so the Linux persistence contract was not migrated for unrelated semantics.

## Current goal contract — Git & CI artifact handoff

GOAL: require evidence-backed diagnosis of a failed CI producer/consumer artifact handoff, minimally sufficient repair, explicit green rerun verification, source-linked explanation and a materially changed path-transfer variant.
USER VALUE: the learner must reason from workflow, producer and consumer evidence instead of replaying a config token; a correct config guess after the wrong diagnosis can make the simulated pipeline green but cannot earn verified completion.
SCOPE: one deterministic SIMULATED CI incident, separate fail-closed localStorage checkpoint, source-linked artifact-name reasoning, changed artifact-extraction path transfer, production Chromium regression.
NON-GOALS: real GitHub Actions execution, arbitrary YAML execution, server-trusted mastery, accounts, real sandbox, Docker/Kubernetes infrastructure or host command execution.
ACCEPTANCE: initial copy is root-cause neutral; all three pre-repair sources precede hypothesis lock; only the minimal mapping repair can turn the simulated run green; verified completion additionally requires the correct pre-repair artifact-contract diagnosis; explanation binds canonical source IDs/facts; changed transfer requires applying path semantics; corrupt/stale/impossible checkpoints fail closed.
SECURITY: all transitions remain browser-local exact-matched simulation. localStorage is untrusted practice state and cannot authorize certification or execution.
ROLLBACK: revert PR #28. Linux schema/fixture versions are intentionally unchanged because the new Git/CI state machine and persistence key are isolated.

## Historical delivered goal contract — permission transfer
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


## Git & CI product truth after PR #28

The fifth primary SIMULATED incident introduces a third mechanism family: CI artifact producer/consumer contract failure. Initial learner-facing copy reports only a failed downstream delivery. The learner must inspect workflow structure, producer upload metadata and consumer failure output before a causal hypothesis can be locked.

The canonical incident produces artifact name `web-dist` while the consumer resolves `site-dist`. The minimally sufficient simulated repair maps the build job output to the current producer metadata. The pipeline may become green after that repair even when the learner locked the wrong causal class, but `verified` stays false unless pre-repair evidence was complete and the locked hypothesis was `artifact-contract`.

After a verified rerun, explanation requires the workflow, producer and consumer source IDs plus their canonical facts and the `producer-consumer-artifact-contract` relation. The changed transfer no longer reuses artifact-name tokens: it keeps artifact name aligned and asks the learner to reason about extraction preserving the nested `reports/coverage.json` relative path.

Git/CI persistence is isolated under `holi.devops.git-ci-practice` with schema 1 / fixture 1. Restore rejects malformed answer shapes, stale versions, forged derived flags and impossible run/completion combinations. A deliberately forged but internally consistent client checkpoint is still not trusted mastery.

Red-team history: pre-PR review removed a `legacy_meta` clue from workflow evidence because it leaked the likely root cause too early. CI run 37318368318 later exposed a cross-lab browser-test collision: the new storage-fallback sentence duplicated a Linux selector. The fix changed Git/CI copy rather than weakening the Linux regression. Exact final head 03915755c2cdf4ec9744def78eff187f125935ea then passed CI 37318719562.

## Highest-value frontier after Git & CI slice

Broaden the Git half of the module with an unfamiliar commit/ref causality incident rather than adding another artifact-name/path token quiz. A strong next slice would require inspecting branch/ref/commit evidence to explain why a pipeline or deployment consumed the wrong revision, then repair and verify the ref relation. Keep it SIMULATED until the separately designed execution gateway satisfies the real-sandbox security contract.
