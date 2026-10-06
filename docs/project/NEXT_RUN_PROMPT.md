# NEXT_RUN_PROMPT

Resume autonomous operation of the REAL repository:
`roronoazoroshao369/holi-ai` through @GitHub. Default branch: `main`. Communicate in VIETNAMESE.

IMPORTANT: this handoff can become stale immediately. Inspect LIVE GitHub first. The repository is authoritative.

## Verified product + deployment checkpoint

Latest verified product main:
`ae811270acd2d63b80b84aa5ad67d21957888534`

Deployment PR:
#41 — Deploy current simulator safely to Cloudflare Pages

Final PR head:
`51e72464deaac735ab9e22b4b173dbbab6e26d8e`

Final exact-head CI:
run `37472746232` — SUCCESS.

Merged main:
`ae811270acd2d63b80b84aa5ad67d21957888534`

Post-merge main CI:
run `37473753263` — SUCCESS.

Cloudflare deployment:
- Worker: `holi-devops-web`
- deployment id: `e534ef800b36468591f90f248a960e55`
- verified public URL: `https://holi.shao.dpdns.org/`
- Worker custom-domain state: enabled
- proxied DNS record exists for `holi.shao.dpdns.org`
- Cloudflare Browser Rendering successfully loaded the fully rendered Holi DevOps Lab page from the live URL.

Cloudflare Pages project `holi-devops` also exists, but its Git installation currently returns Cloudflare error `8000011`. Do not confuse that integration issue with the verified live Worker deployment.

## Current product truth

Phase remains v0.3 SIMULATED learning/mastery-flow foundation; package 0.1.0; no release/tag.

Deployment did not change the learner trust boundary:
- current exercises remain deterministic browser simulations;
- learner commands do not execute host shell, Git, YAML, Docker or network operations;
- localStorage remains untrusted practice state, not server-authoritative mastery;
- no D1, Container or Sandbox-backed learner execution is claimed.

The Next.js config now enables static export only when `CF_PAGES=1`, preserving the normal repository CI/local production build path.

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

Do not make deployment integration work the next product goal unless it blocks delivery, but keep these facts explicit:
- Pages Git integration is unhealthy with error `8000011`;
- current verified public serving path is the Worker custom domain;
- any future continuous deployment automation must preserve exact-head CI and must not introduce broad repository write permissions or long-lived deployment secrets unnecessarily.

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
- begin a second primary product goal in the same run.
