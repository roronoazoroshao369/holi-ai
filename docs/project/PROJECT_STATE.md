# Active goal contract — complete graph evidence binding

GOAL: complete observed-SHA input support through explanation and changed-history transfer, with reversible draft binding.
WHY NOW / USER VALUE: LIVE main c8fc4f81fecbb244c174701723d7beaed315c2d5 (#48) introduced rationale/explanation fact binding; repair identity and transfer still require manual full-length SHA transcription.
SCOPE: evidence-local SHA binding for explanation repair, transfer history/request facts and selected commit; clear/undo draft binding; 44px controls.
NON-GOALS: no canonical answers, no new lab, no simulator/validator/schema change, no real learner execution.
ACCEPTANCE: a learner can complete all graph SHA fields via observed tokens; wrong ordering and later-descendant selection still fail; locked rationale cannot be edited; draft reload and downstream revocation remain valid; mobile overflow and focus checks pass.
TEST PLAN: existing full Node and production browser suite plus end-to-end binder transfer regression, wrong-token/revocation/reload/keyboard/mobile assertions; exact PR-head CI before merge.
SECURITY / LEARNING: source-local candidate extraction only; no correctness feedback before commitment; inference, source linkage and ordered claims remain learner decisions; localStorage remains untrusted.
ROLLBACK: revert this product PR; persisted shape remains Git/CI schema4/fixture4 and Linux7/5.
STATUS: implementation complete; local typecheck, 75/75 Node tests and production build passed. Local Playwright Chromium download returned invalid/truncated archive; full browser verification remains mandatory on exact-head GitHub CI. No merge claimed yet.

---

# Project state

Updated 2026-10-07. Current phase: v0.3 SIMULATED learning/mastery-flow foundation with a verified public Cloudflare deployment shell and redesigned production UI/UX system. Package remains 0.1.0; no release/tag created.

## Latest verified learning delivery — Git evidence-reading bridge

Current verified LIVE product main: `a1907602d5fc8fdbc3e8489179fdd0d15d7e52bf` from PR #45 — **Teach Git evidence synthesis before graph assessment**.

Verification evidence:
- PR #45 exact final head `d9ad0b1471704a786e85113a8ea8a5ee91b4a5a4` passed full CI run `37553518542` — SUCCESS;
- production Chromium regression: **12/12 passed** on the exact PR head;
- PR #45 squash-merged as `a1907602d5fc8fdbc3e8489179fdd0d15d7e52bf`;
- post-merge main CI run `37553882776` — SUCCESS;
- deployment packaging PR #46 was intentionally **closed without merge** after full CI + static artifact publication; its temporary write permission never entered `main`;
- verified artifact marker `.holi-source-sha` = `a1907602d5fc8fdbc3e8489179fdd0d15d7e52bf`;
- Cloudflare Worker `holi-devops-web` production deployment id `ad055836b8894c368568c44d6153c0d6`;
- production HTML now references build id `HstoA1D70-SXSg4-1SOL5` and page chunk `page-36a147e4a3373130.js`, with the prior page chunk absent.

Delivered learning slice:
- third synthetic Git teaching fixture, disjoint from both foundations and graph assessment fixtures;
- three raw evidence sources: ref snapshot, checkout/build metadata and compact commit graph;
- learner derives consumed commit identity, ordered direct parents and ancestry reachability before entering the scored graph incident;
- wrong predicates keep the assessment handoff locked and receive explanatory teaching feedback;
- correct predicates reveal the existing graph diagnostic CTA;
- bridge state is React-local only and leaves the Git/CI persisted checkpoint unchanged;
- no schema/fixture bump, no assessment/mastery credit and no real Git/Actions/shell/network execution;
- 390px overflow and visible keyboard focus remain covered by production browser regression.

The bridge closes the immediate apprenticeship gap between knowing graph vocabulary and synthesizing predicates from raw evidence. It remains finite, visible and retryable teaching, not trusted mastery.

## UI/UX production checkpoint

Current verified LIVE product main: `ae043c1312f592392826aab7eb5b5514ef6da96a` from PR #43 — **Overhaul Holi UI/UX visual system**.

Verification evidence:
- final clean PR head `3f3b9c6c109c5520c6dc0e82fa7e3f9e7a08d3f0` passed exact-head CI run `37489630664` — SUCCESS;
- visual-QA head `f1648744e25e44f697dc20c35a87429aa1a10a66` passed full CI plus automated 1440px desktop and 390px mobile full-page captures;
- PR #43 squash-merged as `ae043c1312f592392826aab7eb5b5514ef6da96a`;
- post-merge main push CI run `37490280081` — SUCCESS;
- Cloudflare Worker `holi-devops-web` production deployment id `5c47a1e596bf441995c7dbb48a88445c`;
- Cloudflare Browser Rendering successfully loaded `https://holi.shao.dpdns.org/` and confirmed the redesigned runtime console, `PUBLIC WEB SHELL` product-truth label, `SIMULATED` boundary and new hero.

Delivered visual/UX system:
- stronger product hierarchy and navigation framing;
- split hero with evidence-driven runtime console and explicit product-truth signals;
- redesigned curriculum cards, learning-loop rail and lab surfaces;
- sticky instructional rail for the practical lab on desktop;
- cohesive treatments across Linux lab, evidence/reasoning panels, Git foundations, Git/CI practice, principles and footer;
- responsive behavior down to the 390px regression target, visible focus states and reduced-motion handling;
- readability refinement for microcopy, terminal text and form controls;
- no simulator, persistence, assessment or learner-execution semantics changed.

The UI is intentionally technical/editorial rather than decorative illustration-heavy. Future product work should extend this design system instead of reintroducing the earlier flat mono-only presentation. CSS currently carries compatibility/cascade layers from the pre-overhaul styles; consolidation is maintainability debt, not a visual or functional blocker.

## Cloudflare deployment checkpoint

Current verified LIVE product main: `ae811270acd2d63b80b84aa5ad67d21957888534` from PR #41 — **Deploy current simulator safely to Cloudflare Pages**.

Deployment evidence:
- PR #41 final head `51e72464deaac735ab9e22b4b173dbbab6e26d8e` passed exact-head CI run `37472746232` — SUCCESS;
- PR #41 squash-merged as `ae811270acd2d63b80b84aa5ad67d21957888534`;
- post-merge main push CI run `37473753263` — SUCCESS;
- Cloudflare Worker `holi-devops-web` deployment id `e534ef800b36468591f90f248a960e55`;
- custom Worker domain `https://holi.shao.dpdns.org/` is enabled and DNS is proxied through Cloudflare;
- Cloudflare Browser Rendering successfully loaded the live URL and returned the fully rendered **Holi DevOps Lab** HTML, including the navigation, curriculum, Linux lab and Git foundations content.

Deployment architecture remains intentionally narrow: the current browser-only simulator is statically exported for Cloudflare when `CF_PAGES=1`. This does **not** convert learner exercises into real shell/Git/network execution, does not add trusted mastery persistence, and does not authorize D1/Containers/Sandbox claims. The Pages project `holi-devops` exists, but its Git integration returned Cloudflare error `8000011`; the verified live route is currently backed by the separately deployed Worker shell.

## Latest verified product state

LIVE product main before this documentation closeout: `d3674796e3633ee4aa70e8c0d4949fdd5c4a6c3c`.

Primary product PR #36 — **Teach Git graph foundations before diagnostic practice**:
- base: `7f71b5d40d1f95261c2bfbc31ddf8fc2199c677e`
- exact final head: `14a89672a1c945b864db9dc52553207c09d992c1`
- merge commit: `1714bf111882decdcd21b5efb8a6ada53b2e7abe`
- exact-head CI: run `37410436717`, job `112097436461` — SUCCESS.

Same-goal corrective PR #37 — **Clean up Git foundations focus CSS**:
- base: `1714bf111882decdcd21b5efb8a6ada53b2e7abe`
- exact final head: `c6fb8ea6d813a11d60b9cc299e3694220e3bdfd3`
- merge/main commit: `d3674796e3633ee4aa70e8c0d4949fdd5c4a6c3c`
- exact-head CI: run `37410861260`, job `112098762706` — SUCCESS.
- post-merge main push CI: run `37411185039`, job `112099751819` — SUCCESS.

Final same-goal gate on PR #37 ran explicit checkout/SHA verification, `npm ci`, full typecheck, **72/72 Node tests**, high-severity npm audit with **0 vulnerabilities**, production build, repository-locked Playwright 1.63.0 Chromium installation and **12/12 serial production Chromium tests**. The merged main tree matches the tested corrective head tree `48eb4573522d21e7bb14a145318a7ce8e369fa1b`.

## Delivered goal contract

**GOAL:** one mechanism-first Git foundations lesson for a near-zero learner, followed by a deliberate handoff into the existing graph diagnostic practice.

**WHY NOW / USER VALUE:** before this delivery the page jumped from a curriculum skeleton and terse mental-model copy into SHA-heavy independent assessment forms. That made clerical transcription and unfamiliar Git vocabulary compete with causal reasoning.

**DELIVERED:**
- navigable Snapshot → Ref → Direct parent → Ancestry lesson;
- a teaching graph fixture deliberately disjoint from the graph assessment fixture;
- local four-question readiness self-check;
- explicit **TEACHING ONLY / no assessment credit** boundary;
- readiness/navigation state remains component-local and does not write the Git/CI checkpoint;
- explicit anchor/CTA into the existing graph diagnostic lab;
- responsive/mobile layout and visible keyboard focus;
- browser regression proving lesson activity does not mutate Git/CI assessment state and does not expose active incident SHAs/relation tokens.

**NON-GOALS PRESERVED:** no new incident, no schema/fixture bump, no real Git/YAML/shell/network execution, no weakening of immutable pre-repair reasoning, verification, downstream revocation or transfer semantics.

PR #37 only fixed a malformed literal `\\n` in the new focus CSS discovered during post-merge re-read. It changed no learning, persistence, security or test semantics and was held to the same full exact-head gate.

## Product truth / partial implementation

Seven primary SIMULATED incidents remain: four Linux permission/TCP incidents and three Git/CI artifact, revision and graph incidents. The new Git foundations lesson is **instructional scaffolding, not an eighth incident and not assessment evidence**. Permission/group, listener/socket, extraction-path, annotated-tag and linear-history transfers remain bounded assessment steps.

Git/CI persistence remains schema 4 / fixture 4 under `holi.devops.git-ci-practice`; Linux remains schema 7 / fixture 5. The foundations lesson adds no persisted field and no migration. localStorage remains forgeable and non-authoritative.

The graph assessment still requires immutable pre-repair source-linked rationale before repair, separate consumed-commit and ordered-parent verification, and changed linear-history transfer. The foundations lesson neither grants prerequisite credit nor modifies those invariants.

## Security / trust boundary

Current learner environment remains pure finite in-browser SIMULATED transitions. Learner input never executes host shell, Git, YAML, subprocess, Docker, network calls or credentials. The foundations lesson uses static teaching data and React-local state only. Browser/CI execution is maintainer verification tooling, not learner execution.

A consistent developer-tools forgery can still manufacture local completion in persisted labs. Nothing in the lesson or readiness check changes that trust boundary or authorizes certification, privileges or real execution.

## Current risks

- Passing current labs still demonstrates completion of a small deterministic corpus, not general Git/DevOps competence.
- Full-length SHA and finite grammar transcription can measure clerical accuracy separately from conceptual understanding.
- The new evidence bridge now teaches the diagnostic move from raw evidence to consumed-commit, ordered-parent and ancestry predicates, but the fixture is still finite, visible and retryable; this is scaffolding rather than general Git competence.
- Chromium-only browser coverage and Playwright-managed browser binary provenance remain explicit limits.
- Real sandbox isolation/identity/quotas/TTL/network/cost controls remain design-only.

## ONE next frontier / candidate goal

Highest-value frontier: **reduce clerical SHA/token transcription in Git graph assessment without weakening causal evidence requirements**.

Recommended bounded goal: redesign the graph rationale/verification input mechanics so learners bind claims to captured evidence and derive predicates from observed values instead of manually retyping long synthetic SHAs. Preserve immutable pre-repair commitment, source linkage, wrong-reasoning failure, ordered-parent/ancestry semantics, downstream revocation and all current security boundaries. The objective is to measure reasoning rather than copy accuracy, not to expose the answer or convert assessment into multiple-choice guessing.

Why now: the evidence-synthesis bridge removes the conceptual jump; the remaining nearby usability risk is that full-length SHA and finite grammar transcription can fail independently of conceptual understanding. Reassess against LIVE repository evidence before implementation.

External blockers: none for the completed SIMULATED goal. Real execution remains gated on a separately verified isolation architecture.

