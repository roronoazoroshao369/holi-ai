# Project state

Updated: 2026-10-05. Phase: v0.2 Linux learning vertical slice implemented; remote CI and merge pending.
Package version: 0.1.0 (no release tag).
Baseline main: 7f66238ffb3818adf2b63d8ab2cb5f2f6bdbdfa0; latest prior merged PR #6.
Branch: feat/linux-learning-transfer. Current PR: pending creation.
Last verified main CI: 37250572331 success on baseline above.

## Goal contract
GOAL: deliver one Linux lesson → evidence → hypothesis → minimal repair → HTTP verification → explanation → changed scenario.
WHY NOW: v0.1 only checks a fixed permission-command sequence; it does not test transfer.
USER VALUE: reason about UID/GID and permissions instead of memorizing chmod 644.
SCOPE: two clearly SIMULATED fixtures, deterministic assessment, accessible browser controls, behavioral and production browser tests.
NON-GOALS: persistent progress, trusted certification, accounts, arbitrary shell execution, real sandbox or broad curriculum.
ACCEPTANCE: three pre-repair observations and a supported hypothesis are required; repair alone cannot pass; HTTP verification and correct access-class explanation unlock transfer; transfer changes file group and worker supplementary groups; 644 restores transfer HTTP but fails least-access criterion, 640 passes; reset clears evidence/explanation; refresh starts guided fixture; unsupported input is inert; keyboard/mobile flow works; local and PR build/tests/audit succeed before merge.
TEST PLAN: missing evidence, wrong hypothesis, blind repair, mode changes after verification, wrong explanation, overbroad access, fixture isolation/reset, production browser guided/transfer/reset/refresh/mobile/focus, GitHub CI.
SECURITY: pure browser state machine, exact command allowlist, no subprocess/network execution. DevTools can forge state; completion is untrusted local practice.
LEARNING: mechanism notes plus access-class reasoning; multiple-choice explanation is limited evidence and can be guessed. Two fixed fixtures are a narrow transfer exercise, not proof of general production competence.
ROLLBACK: revert focused PR. No migrations or persisted data.

## Product truth
Works: executable shell, curriculum skeleton, guided Linux incident and changed group-access incident with gated explanation.
Partial: only one skill and two fixtures; no free-form explanation grading or broad assessment.
Broken: no known in-scope failure after local verification; remote gates pending.
Known risks: no durable progress; reload resets; client assessment untrusted; parent directories, ACL/SELinux and other server configuration are assumed healthy. Guided world-read applies only to this public page fixture.
Current highest-value frontier: versioned local practice progress with safe refresh/reset/retry semantics and explicit trust boundary; retain no certification claims.
Next candidate goals: browser regression CI; persistent practice attempts; broader Linux diagnosis with less prompted transfer.
External blockers: none established. Direct git mirror checkout lacks credentials; authenticated GitHub API supports source and changes.

## Verification evidence
Local npm ci succeeded. Typecheck, 8 behavioral tests, npm audit (0 vulnerabilities), production build passed.
Production Chromium/Playwright flow passed: blind repair denied, guided observation/hypothesis/repair/verify/explanation, wrong explanation denied, transfer 644 denied and 640 accepted, reset, refresh, 390px width, visible input focus, no page errors. Mobile screenshot inspected; button wrapping corrected before final rerun.
Remote CI and merge: pending; do not interpret local success as merge confirmation.
