# Project state

Updated 2026-10-06. Current phase: v0.3 SIMULATED learning/mastery-flow foundation. Package remains 0.1.0; no release/tag created.

Current verified product main: `d3674796e3633ee4aa70e8c0d4949fdd5c4a6c3c`.
Product delivery PR #36 — **Teach Git graph foundations before diagnostic practice** — squash-merged as `1714bf111882decdcd21b5efb8a6ada53b2e7abe`.
Same-goal cleanup PR #37 — **Clean up Git foundations focus CSS** — squash-merged as `d3674796e3633ee4aa70e8c0d4949fdd5c4a6c3c`.

This documentation closeout is intentionally separate. This file cannot name its own future documentation merge SHA. Re-read LIVE main, PRs and CI before relying on it.

## Verification evidence

PR #36 final product head: `14a89672a1c945b864db9dc52553207c09d992c1`.
Full exact-head CI: run `37410436717`, job `112097436461` — SUCCESS. The workflow explicitly checked out and asserted that exact SHA, then completed npm ci, full typecheck, 72/72 Node tests, npm audit --audit-level=high with 0 vulnerabilities, production build, locked Playwright 1.63.0 Chromium installation and 12/12 serial production Chromium tests in 2.3m against `next start --hostname 127.0.0.1 --port 3100`.

The first PR #36 head `b20b79b29855d4b92f4085664a1ede40ec69855c` had run `37410123085` fail one of 12 browser tests at the new focus-indicator assertion; 11 passed. The finding was fixed in product CSS. Assertions, retries and timeouts were not weakened.

Post-merge source re-read caught a literal `\\n` between the two focus CSS rules. The browser behavior still worked, but source quality was not acceptable. PR #37 corrected only that malformed source line. Its exact final head `c6fb8ea6d813a11d60b9cc299e3694220e3bdfd3` passed run `37410861260`, job `112098762706`: exact SHA assertion, npm ci, typecheck, 72/72 Node tests, audit 0, build, locked Chromium and 12/12 production tests in 2.1m.

Final product-main push CI run `37411185039`, job `112099751819` also passed on exact `d3674796e3633ee4aa70e8c0d4949fdd5c4a6c3c`: 72/72 Node tests, audit 0 vulnerabilities, production build and 12/12 production Chromium tests in 2.0m. No open PR remained at product checkpoint.

## Delivered primary goal

GOAL: give a near-zero Git learner a mechanism-first mental model before the existing graph diagnostic assessment.

Delivered:
- one navigable four-step lesson: snapshot identity → moving ref → direct parent → ancestry;
- a teaching graph fixture deliberately disjoint from the assessment fixture;
- a four-question local readiness self-check;
- an explicit handoff into the existing Git graph diagnostic lab;
- browser proof that completing lesson navigation/readiness does not mutate the persisted Git/CI assessment state;
- responsive 390px behavior, visible keyboard/programmatic focus and absence of page/console errors.

The lesson is **teaching only**. It creates no assessment credit, no verified/explained/transfer flag and no new persistence schema. It is not an eighth incident and does not prove Git mastery.

## Assessment and security invariants

Seven primary SIMULATED incidents remain: four Linux permission/TCP incidents and three Git/CI artifact/revision/graph incidents. Permission/group, listener/socket, extraction-path, annotated-tag and linear-history transfers remain bounded assessment steps.

Git graph/revision pre-repair rationale remains immutable after class lock. Correct operational recovery cannot rescue a wrong locked source/fact/relation/class. Rebuild/reverify/edit/reset still revoke downstream confirmations as before. No assertions, retries or timeouts were weakened.

No learner input is executed as Git, YAML, shell, subprocess, network request or host command. The new lesson uses React-local navigation/select state only. No CONTROLLED_EXECUTION or REAL_SANDBOX exists.

## Persistence

Linux remains schema 7 / fixture 5. Git/CI remains schema 4 / fixture 4 under `holi.devops.git-ci-practice`. No version bump was justified because the lesson does not participate in persisted assessment semantics. Git/CI v3 and older still intentionally discard; Linux continuity remains independent. localStorage completion remains forgeable and non-authoritative.

## Product truth and remaining limits

The homepage now contains one delivered Git foundations lesson plus the existing SIMULATED labs. The broader curriculum cards remain a proposed syllabus; there is still no coherent zero-to-production course, trusted mastery model or real execution environment.

The lesson improves conceptual preparation but its self-check is finite, visible, retryable and non-credit. The downstream graph assessment still imposes substantial full-SHA and finite-grammar transcription, so clerical accuracy can obscure conceptual reasoning. Fixed synthetic graphs omit real fetch depth, races, reflogs, conflicts, signatures, arbitrary object resolution and real patch equivalence. Chromium remains the only required browser engine. Client progress remains forgeable.

## ONE next frontier / candidate goal

Highest-value candidate: reduce clerical full-SHA transcription inside the **existing** Git graph diagnostic flow without adding another incident.

Recommended bounded goal: after evidence has been inspected, replace dominant raw SHA transcription with neutral source-bound commit/node/edge selection where possible, while preserving source/fact independence, immutable pre-repair rationale, no early correctness oracle, exact verification/revocation semantics and the existing assessment answer boundary. The design must be red-teamed for answer leakage: structured selection must not turn the incident into an obvious multiple-choice answer key.

Reassess this recommendation from LIVE evidence before implementation. Do not start a second incident merely to increase corpus size.
