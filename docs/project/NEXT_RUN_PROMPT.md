# NEXT_RUN_PROMPT

Resume autonomous operation of the REAL repository:
`roronoazoroshao369/holi-ai` through @GitHub. Default branch: `main`. Communicate in VIETNAMESE.

IMPORTANT: this handoff can become stale immediately. Inspect LIVE GitHub first. The repository is authoritative.

## Verified product + UI + deployment checkpoint

Latest verified product main:
`ae043c1312f592392826aab7eb5b5514ef6da96a`

Latest product PR:
#43 — Overhaul Holi UI/UX visual system

Final clean PR head:
`3f3b9c6c109c5520c6dc0e82fa7e3f9e7a08d3f0`

Exact-head CI:
run `37489630664` — SUCCESS.

Post-merge main CI:
run `37490280081` — SUCCESS.

Visual QA evidence:
- visual-QA head `f1648744e25e44f697dc20c35a87429aa1a10a66`;
- full functional/browser CI succeeded;
- desktop 1440px and mobile 390px full-page captures were reviewed;
- no horizontal overflow at the mobile regression target;
- temporary screenshot/static-preview publishing permissions were removed before merge.

Current Cloudflare production:
- Worker: `holi-devops-web`
- production deployment id: `5c47a1e596bf441995c7dbb48a88445c`
- verified public URL: `https://holi.shao.dpdns.org/`
- Cloudflare Browser Rendering confirmed the redesigned hero/runtime console, `PUBLIC WEB SHELL`, `SIMULATED`, and fully rendered app.

## Current product truth

Phase remains v0.3 SIMULATED learning/mastery-flow foundation; package 0.1.0; no release/tag.

The production UI now uses the Holi dark technical/editorial design system:
- sans-serif display hierarchy; monospace reserved for runtime/evidence surfaces;
- responsive hero/runtime console;
- explicit product-truth labels;
- richer curriculum cards and learning-loop framing;
- cohesive Linux lab, evidence/reasoning, Git foundations, Git/CI and method surfaces;
- visible keyboard focus and reduced-motion handling;
- responsive down to the 390px regression target.

Do not regress to the earlier flat mono-only visual treatment.

Trust boundary remains unchanged:
- learner exercises are deterministic browser simulations;
- learner input does not execute host shell, Git, YAML, Docker or arbitrary network operations;
- localStorage remains untrusted practice state;
- no D1/Container/Sandbox-backed learner execution is claimed.

Known visual-maintainability debt:
- globals.css retains earlier compatibility/cascade rules before the new design-system layer. This is not a visual blocker but should be consolidated in a future bounded refactor if touching the CSS architecture.

## ONE highest-value product frontier

A **teaching-only Git evidence-reading bridge** between the current Git foundations lesson and the existing graph diagnostic assessment.

Candidate bounded goal:
- introduce one third synthetic teaching fixture, disjoint from both foundations and assessment fixtures;
- present raw ref snapshot, checkout/build metadata and a small commit graph;
- guide a near-zero learner to derive consumed commit identity, ordered direct parents and ancestry reachability;
- explanatory feedback is allowed because this is teaching, not assessment;
- no persistence and no diagnostic/verified/explained/transfer credit;
- do not reveal active incident answers or relation token;
- preserve immutable pre-repair reasoning and all downstream revocation in the real graph practice;
- end with the existing graph diagnostic lab handoff.

Reassess this recommendation from LIVE repository evidence before implementation.

## Deployment follow-up debt

Cloudflare Pages project `holi-devops` still has Git integration error `8000011`. The verified public serving path is the Worker custom domain. Do not broaden repository write permissions or introduce long-lived deploy secrets merely to repair convenience automation.

## Read first

- docs/project/PROJECT_STATE.md
- docs/project/NEXT_RUN_PROMPT.md
- docs/project/ROADMAP.md
- docs/project/BACKLOG.md
- docs/project/ARCHITECTURE.md
- docs/project/DECISIONS.md
- docs/project/RISKS.md
- docs/project/PRODUCT.md
- docs/project/LEARNING_MODEL.md
- docs/project/LAB_SECURITY.md
- docs/project/RUN_LOG.md
- docs/project/GIT_GRAPH_CONTRACT.md
- docs/project/GIT_REVISION_CONTRACT.md
- relevant app/components/lib
- all tests, package manifests and .github/workflows/ci.yml

## Operating loop

Inspect LIVE → reconcile concurrent/stale state → discovery/review → choose exactly ONE bounded primary goal → implement → test/security/UX/learning/red-team → documentation → PR → full exact FINAL-head CI → merge with `expected_head_sha` → confirm LIVE main and push CI → separate documentation closeout with full exact-head CI → new handoff → STOP.

Do not:
- execute learner input on host;
- force-push main;
- merge failing or incomplete checks;
- weaken assertions, retries or timeouts to hide failures;
- let teaching/readiness state grant assessment credit;
- mutate immutable pre-repair reasoning after lock;
- bypass downstream revocation;
- claim real sandbox execution merely because the simulator is publicly deployed;
- regress the production visual hierarchy without explicit visual evidence;
- begin a second primary product goal in the same run.
