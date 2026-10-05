# Project state

Updated: 2026-10-05. Phase: v0.3 versioned local practice persistence verified and merged; browser integration CI next.
Package version: 0.1.0 (no release tag).
Verified main: d748e05f9579be6f5b89922b70557f820f88f124.
Product PR #9 merged as d748e05f9579be6f5b89922b70557f820f88f124. Final PR head: 60f0708d7d0fb631d30827c4b00fcc8fc0c45f97; CI 37252591065 succeeded. Resulting main and persistence files re-read and confirmed. Documentation checkpoint branch: docs/v03-persistence-handoff.

## Goal contract
GOAL: persist and resume the SIMULATED Linux practice safely across refresh without turning client state into trusted mastery.
WHY NOW: v0.2 taught evidence → hypothesis → minimal repair → verify → explain → transfer, but refresh discarded the attempt.
USER VALUE: resume local practice on the same browser, reset/retry predictably and recover safely from stale/corrupt storage.
SCOPE: versioned localStorage checkpoint, schema/fixture validation, LabState invariants, derived completion consistency, corrupt/version-mismatch recovery, unavailable-storage fallback/retry, current-fixture reset and full restart.
NON-GOALS: accounts, cross-device sync, authoritative mastery/certification, terminal transcript persistence, browser E2E as a CI gate, arbitrary shell execution or real sandbox.
ACCEPTANCE: valid current-version state resumes; impossible/corrupt/stale state cannot manufacture completion; unavailable storage remains usable but explicitly ephemeral; reset persists a clean retry of the current fixture; full restart returns to guided; local completion remains visibly untrusted; install/typecheck/tests/audit/build pass on final PR head.
TEST PLAN: persistence round-trip for partial/completed guided+transfer states; contradictory completion flags; corrupt JSON; schema/fixture mismatch; impossible verified/explained state; blocked storage; existing simulator bypass tests; browser regression script updated for restore/reset/restart/corrupt/unavailable storage.
SECURITY: localStorage is attacker-controlled. Validation protects state-machine integrity against stale/corrupt data, not deliberate DevTools forgery. No persisted value authorizes execution, secrets, privileges or certification.
LEARNING: persistence is continuity of practice, not stronger evidence of competence. Two fixtures and multiple-choice explanation remain narrow signals.
ROLLBACK: revert PR #9. No migrations, accounts or server data.

## Product truth
Works: executable product shell; guided and transfer Linux permission practice; evidence/hypothesis/repair/verification/explanation gates; versioned local checkpoint that resumes valid state after refresh; safe clean fallback for corrupt/stale storage; explicit ephemeral mode when storage is unavailable; reset/current retry and full restart.
Partial: only one skill and two fixed fixtures; local checkpoint is same-browser/device only; terminal transcript is intentionally not persisted; no authoritative mastery model.
Broken: no known in-scope failure after final PR CI and main re-read.
Known risks: client progress is forgeable; browser persistence/hydration regression script is still manual and was not executed in this run; parent-directory traversal, ACL/SELinux and other server configuration remain assumed healthy in fixtures; curriculum breadth is still mostly planned.
Current highest-value frontier: make the production browser regression a real CI gate, especially refresh/hydration, corrupt-storage and unavailable-storage behavior.
Next candidate goals: broaden Linux/OS/network diagnosis with less-prompted unfamiliar fixtures; then revisit trusted mastery/accounts only when server-side identity or cross-device state is justified.
External blockers: none established. Direct local dependency install timed out in this run, but GitHub CI completed the full install/typecheck/test/audit/build gate.

## Verification evidence
Local checks actually executed this run: 14/14 Node behavioral tests passed; strict TypeScript check passed for linux-simulator + practice-persistence; browser regression script passed node --check. Local dependency install timed out, so no local claim is made for full app install/build or production browser execution.
GitHub CI 37252591065 succeeded on final PR head 60f0708d7d0fb631d30827c4b00fcc8fc0c45f97: npm ci, full app typecheck, 14 tests, npm audit --audit-level=high and production build all passed.
GitHub confirmed PR #9 squash merge as d748e05f9579be6f5b89922b70557f820f88f124. Main was re-read and lib/practice-persistence.ts plus LabTerminal changes were confirmed. Browser script now covers persistence flows but remains manually runnable; it was syntax-checked, not executed against a production server in this run.
Inspect live GitHub before trusting these SHAs.
