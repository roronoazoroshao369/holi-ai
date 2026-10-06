# Project state

## Active goal contract — 2026-10-06 (implementation ready, remote gates pending)

LIVE baseline e1ca8cefbc69327d87d21d10a9eff5f5e4b1c7ef, docs PR #33 merged, main CI 37404961378 successful; no open PR/issues. This section supersedes the historical delivered-goal frontier below until closeout.
GOAL: one bounded SIMULATED integration graph incident with meaningful linear-history transfer.
WHY NOW / USER VALUE: green PR-head builds do not demonstrate that an approved base was integrated; existing corpus has no parents/ancestry mechanism.
SCOPE: six neutral pre-repair sources, immutable source-linked factual rationale plus class, minimal immutable checkout selection, rebuild, separate consumed-commit and ordered-parent verification, post-repair explanation, changed rebase/fast-forward transfer, versioned persistence and regression gates.
NON-GOALS: real Git/Actions execution, generic Git interpreter, new infrastructure, accounts, trusted assessment.
ACCEPTANCE: incomplete evidence/rationale cannot lock; lock offers no correctness oracle; wrong class/source/fact/relation stays unverified after correct operational recovery; required base and PR head are ordered direct parents in the first contract; linear transfer instead requires base ancestry and the reviewed change series, with original head absent from ancestry; all edit/rebuild/reverify/reset/refresh paths revoke affected confirmation; invalid/forged derived flags reject; independent old flows remain tested.
TEST PLAN: full typecheck, all Node tests, audit, production build, all locked Playwright Chromium tests including wrong reasoning/commit, linear transfer, persistence, stale/corrupt state, denied storage, mobile/focus/runtime errors; full exact final-head GitHub CI before each product/docs merge.
SECURITY IMPACT: pure finite client transitions only; no learner shell/network/host execution; local completion remains forgeable and untrusted.
LEARNING IMPACT: distinguish snapshot identity, ordered merge parents and ancestry; change the integration contract for transfer instead of substituting literals.
LOCAL EVIDENCE: npm ci, full typecheck, 68/68 Node tests, audit 0 vulnerabilities, production build passed. Local Playwright Chromium download returned invalid ZIP; no local browser pass claimed. Remote exact-final-head gate and product/docs merge are pending. CI now explicitly checks out and asserts the PR head SHA; it no longer relies on an implicit integration ref.
ROLLBACK: revert the product PR; old schema rejects new checkpoint. Linux schema7/fixture5 unchanged. Git/CI shape/corpus move independently to schema4/fixture4; older shared Git/CI progress discarded explicitly.

Updated: 2026-10-06. Phase: v0.3 SIMULATED mastery-flow foundation. Package remains 0.1.0; no release/tag created.
Verified product main: 833b4906840d4c7e3e49b8bbcb0645d47823de3f, re-read after PR #32 squash merge; tree matched the verified product tree.
Product PR #32 exact final head: 928fa71948ff99f5da85eb5be7678a56aacee79d.
Full exact-final-head CI: 37404253657 / job 112078149690 — SUCCESS.
Gate: npm ci; full TypeScript typecheck; 56/56 Node tests; npm audit --audit-level=high with 0 vulnerabilities; production build; Chromium from repository-locked Playwright 1.63.0; 8/8 production Chromium tests (1.3m) against next start --hostname 127.0.0.1 --port 3100.
Documentation closeout follows in a separate PR and must pass full exact-final-head CI before merge. This file cannot identify its own final merge SHA; always re-read LIVE main/docs/open PRs/current CI.

## Delivered goal — Git rationale before repair

GOAL: close label-only pre-repair guessing in the existing Git revision incident.
USER VALUE: a correct repair and matching consumed commit cannot retroactively turn a wrong factual diagnosis into verified learning.
SCOPE: five captured source ID/fact pairs and a relation drafted before repair, locked immutably with causal class; canonical rationale independently gates verification; persistence, aliasing, wrong-source/fact/relation and production browser regressions.
NON-GOALS: additional incidents, generic grading/Git/YAML engines, actual Git/Actions execution, accounts, Kubernetes/Docker/real sandbox, trusted assessment or certification.
ACCEPTANCE: satisfied on exact final head above. Missing evidence or incomplete rationale cannot lock/repair; lock checks completeness without correctness feedback; wrong class OR source/fact/relation blocks learning even with correct repair and matching checkout/metadata SHA; post-repair explanation cannot rescue the locked rationale. Existing annotated-tag transfer and all Linux/artifact regressions remain.
ROLLBACK: revert PR #32; prior Git/CI schema-2 implementation rejects schema-3 checkpoint. Linux needs no migration.

## Product truth

Six primary SIMULATED incidents: four Linux (two permission, two same-symptom TCP), two Git/CI (artifact handoff and release acceptance). Permission/group, listener/socket, extraction-path and annotated-tag transfers are assessment steps. No new scenario was added in this goal.

Artifact incident remains web-dist producer versus site-dist consumer, with source-linked explanation and nested extraction transfer. Its pre-repair lock remains a causal class; source-linked factual explanation follows repair. Revision rationale strengthening does not claim that every subsystem now has that stronger pre-repair contract.

Git revision incident remains refs/heads/release -> synthetic a4… while intended build-start snapshot is b7…. Checkout and release metadata originally both record a4…. Pinning approved immutable b7… is minimal. Explicit verification checks BOTH checkout and metadata SHA, correct class/repair and canonical locked rationale. Pipeline pass alone is insufficient.

Changed tag transfer remains refs/tags/v2.4 -> c8… tag OBJECT -> d9… COMMIT while main advances to e2…. Request requires immutable COMMIT identity d9…, not original incident SHA, tag object or moving branch. This does not deny that real Git can checkout tag names.

## Persistence / revocation

Linux schema 7 / fixture 5 unchanged.
Git/CI schema 3 / fixture 3, key holi.devops.git-ci-practice. Schema 3 adds persisted rationale draft/locked snapshot; fixture 3 changes assessment/completion rubric while incident outputs and tag corpus remain unchanged. Version-2 and older checkpoints intentionally discard, including artifact progress under the shared Git/CI checkpoint. Independent Linux state is unaffected.

One rationale field is editable while hypothesis is empty and becomes a cloned immutable snapshot at lock. Core and UI block editing after lock until reset. Complete wrong rationale may restore as not-verified learning; missing locked rationale, malformed shape or contradictory derived flags fail closed. Post-repair explanation is separate. Repair/rebuild/reverify preserve rationale while clearing affected downstream confirmation. Revision-only reset clears revision including rationale and preserves artifact; whole Git/CI reset clears both and remounts local class/repair drafts. Denied Storage getter/methods remain ephemeral fallback.

## Red-team / verification

Council review confirmed LIVE weakness and approved one field with class as phase marker, avoiding duplicate draft/snapshot state. No blocker found. Advisory grammar ambiguity was fixed: PIPELINE_STATUS and ACCEPTANCE_RESULT identify the observation fields. Clone tests prevent input/draft alias mutation. Every pre-repair source ID/fact and relation is challenged independently, including correct class/relation plus wrong facts and a correct operational repair. Forged verified after wrong rationale is rejected on refresh; later explanation cannot rescue it.

Production Chromium tests cover neutral initial copy, missing sources/incomplete rationale, wrong diagnosis and wrong repair, wrong rationale source/fact, draft and locked refresh, wrong-rationale refresh, derived-flag injection, reset scopes, changed tag transfer/revocation, denied Storage getter/methods, mobile 390px overflow, visible focus and absent console/page errors. Selectors for rationale and explanation are distinct. Semantic persisted-state polling precedes reload/injection; zero retries and timeouts unchanged. Old Linux/artifact tests were not modified or weakened.

Local npm ci, typecheck, 56 Node tests, audit 0 vulnerabilities and production build passed; final UI grammar change was typechecked/tested and independently built in final-head CI. Local Chromium CDN returned invalid ZIP repeatedly, so no local browser success is claimed. Full remote CI gates passed on final head; no failing remote run occurred in this delivery.

## Remaining risks / ONE next frontier

All labs and answers remain finite, visible, retryable, synthetic fixtures. Typed exact grammar is not arbitrary prose assessment; copying complete rationale can still earn local progress. Fully consistent forged client checkpoints may display completion. No client state is authoritative or grants certification/execution.

Current Git evidence does not model parent/ancestry/integration graphs, real Git history, fetch depth, race semantics, signatures or general Actions competence. Artifact pre-repair rationale is still class-only. Chromium-only browser coverage, small corpus, random Linux order may repeat, CDN browser/FFmpeg binary provenance outside npm audit and design-only real sandbox remain risks.

ONE next frontier: a bounded SIMULATED Git merge-graph / PR-head versus integration-commit causality slice. Require parent/ancestry evidence and intended integration revision with immutable pre-repair rationale and a meaningful changed graph transfer, chosen after LIVE discovery/council review. Do not merely substitute SHA/ref literals. See NEXT_RUN_PROMPT.md.
