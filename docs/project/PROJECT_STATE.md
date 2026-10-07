# Project state

Updated 2026-10-06. Current phase: v0.3 SIMULATED learning/mastery-flow foundation with a verified public Cloudflare deployment shell and redesigned production UI/UX system. Package remains 0.1.0; no release/tag created.

## Current primary goal — Git evidence-reading bridge

Status: implementation branch `feature/git-evidence-reading-bridge`; not yet merged or verified at this checkpoint.

**GOAL:** add one teaching-only bridge between Git foundations and the existing graph diagnostic assessment so a near-zero learner must synthesize raw evidence into three predicates: consumed commit identity, ordered direct parents and ancestry reachability.

**WHY NOW / USER VALUE:** foundations currently teach snapshot/ref/parent/ancestry concepts, but the next interaction jumps directly into the scored graph incident. The missing learning step is evidence synthesis rather than another incident.

**SCOPE:** a third synthetic fixture disjoint from foundations and assessment; raw ref snapshot, checkout/build metadata and commit graph; component-local answers; explanatory feedback; CTA into the existing graph assessment only after all three predicates are correct.

**NON-GOALS:** no new persisted assessment field, no schema/fixture version bump for Git/CI practice, no scoring/mastery credit, no active incident answer leakage, no real Git/Actions/shell/network execution and no change to graph assessment invariants.

**ACCEPTANCE CRITERIA:**
- bridge fixture IDs are disjoint from both existing teaching and assessment fixtures;
- learner sees raw evidence before answering;
- each predicate fails independently and the combined bridge fails closed;
- wrong bridge answers do not open the assessment handoff;
- correct bridge answers open the existing graph diagnostic CTA;
- completing the bridge leaves the Git/CI persisted checkpoint byte-for-byte semantically unchanged;
- 390px viewport has no horizontal overflow and keyboard focus remains visible;
- full repository exact-head CI passes before merge.

**SECURITY / LEARNING IMPACT:** presentation and local teaching state only. Security boundary remains pure client-side SIMULATED transitions. Learning impact is a deliberate evidence → predicate synthesis step with feedback, explicitly outside assessment credit.

**ROLLBACK:** revert the product PR; no storage migration is required because the bridge writes no persistent state.

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
- The foundations lesson teaches four graph concepts, but it does **not yet teach the diagnostic move from raw evidence to predicates** such as “what revision was consumed?”, “what are the ordered direct parents?” and “is base reachable by ancestry?”.
- Chromium-only browser coverage and Playwright-managed browser binary provenance remain explicit limits.
- Real sandbox isolation/identity/quotas/TTL/network/cost controls remain design-only.

## ONE next frontier / candidate goal

Highest-value frontier: **a non-credit Git evidence-reading bridge between the foundations lesson and the existing graph assessment**.

Recommended bounded goal: use a third teaching-only fixture, disjoint from both current lesson and assessment fixtures, to guide a near-zero learner from raw synthetic evidence (ref snapshot, checkout/build metadata and a small commit graph) to three predicates: consumed commit identity, ordered direct parents and ancestry reachability. Give explanatory feedback in the teaching exercise, but do not persist readiness, grant assessment credit, expose active incident answers or alter graph assessment state. End with the existing diagnostic lab handoff.

Why this is preferable to another incident: the conceptual definitions are now present; the remaining jump is **evidence synthesis**, while the current assessment still carries substantial finite-SHA/grammar burden. Reassess this recommendation against LIVE repository evidence before implementation.

External blockers: none for the completed SIMULATED goal. Real execution remains gated on a separately verified isolation architecture.
