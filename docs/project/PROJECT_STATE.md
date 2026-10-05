# Project state

Updated: 2026-10-05. Phase: v0.1 foundation stabilization, v0.2 learning engine next. Package version: 0.1.0.
Branch / PR: feat/devops-learning-platform / #4. At inspection, main dd417fbd97e61f00cca60cbc40a4608000726953 contained film-planning docs only; PR head 5bdf5c2a5f9dc13d6ea1a7fd90560849b53ce78b introduced the platform. This is an inspection baseline, not proof subsequent commits passed.

## Goal contract
GOAL: make the existing bootstrap reproducibly verifiable and eliminate false simulator health before admitting it to main.
WHY NOW: CI fails in setup-node because cache requires a missing lockfile. Audit flags vulnerable runtime dependencies. Fixed responses incorrectly return healthy before repair.
USER VALUE: a runnable honest foundation for later learning features.
SCOPE: lockfile, patched dependencies, audit/typecheck/test/build CI, stateful simulated incident, durable project handoff.
NON-GOALS: trusted mastery, persistence, authentication, real shell, broad curriculum implementation.
ACCEPTANCE: npm ci succeeds; audit has no high/critical findings; typecheck/tests/build pass; HTTP is 403 before repair and 200 only after; pre-repair evidence required for practice completion; reset clears state; unsupported commands inert; production UI labels SIMULATED; CI confirms final PR head.
TEST PLAN: pure transition tests, fresh install, audit/typecheck/build, production browser flow and GitHub CI. Report only executed checks.
SECURITY: no host execution; patched/overridden dependencies audited. Client practice remains untrusted.
LEARNING: evidence ordering improved; explanations and transfer still missing.
ROLLBACK: revert this focused commit; do not rewrite main. No migrations/data loss.

## Product truth
Works: bootstrap landing/curriculum shell and one narrow browser simulator.
Partial: Linux diagnostic practice; curriculum content is a skeleton.
Broken at baseline: missing lockfile blocked CI; terminal gave unconditional 200.
Risks: see RISKS.md. No persistence or real sandbox; refresh resets progress.
Highest-value frontier: full Linux lesson with explanation and transfer assessment, then durable progress.
Next candidates: learning-domain model and lesson flow; durable progress; CI browser regression suite.
External blockers: none established at inspection.
Verification: local clean install, typecheck, 4 behavioral tests, zero-findings dependency audit, production build and production Chromium critical flow passed (see RUN_LOG). GitHub CI and merge pending for this commit; inspect live PR before claiming the bootstrap complete. Last verified local source is the commit containing this entry; its SHA cannot be embedded in itself.

