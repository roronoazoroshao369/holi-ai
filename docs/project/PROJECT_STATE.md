# Project state

Updated: 2026-10-05. Phase: fixed sequence-position leakage is removed from the same-symptom differential pair; next frontier is evidence-linked structured reasoning.
Package version: 0.1.0 (no release tag).
Verified product main: 87295ad59f696b232febe62bf1ae6d76546c84f7.

Product PR #18 delivered explicit hidden differential ordering. Final head: fbb738ef05182a8290bffa3fd009bd09c27ae407; GitHub CI 37265647222 succeeded; squash merge: 87295ad59f696b232febe62bf1ae6d76546c84f7. Resulting main was re-read and confirmed.

## Goal contract
GOAL: remove the deterministic mapping first health case -> network and second health case -> process without introducing nondeterministic simulator transitions or flaky browser CI.
WHY NOW: neutral learner-facing copy was no longer enough because repeat learners could memorize sequence position.
USER VALUE: either competing cause can appear first, so process/socket evidence rather than position must drive the causal hypothesis.
SCOPE: persist explicit differential order plus step; select a fresh order only at the browser/UI boundary; keep simulator transitions deterministic once assignment is supplied; preserve assignment on current-case reset; reassign on full restart; reject stale or contradictory checkpoints; exercise both orderings in browser CI.
NON-GOALS: broad curriculum expansion, arbitrary prose grading, real Linux/network execution, server-trusted mastery, account creation or cross-browser compatibility claims.
ACCEPTANCE: both orders are representable and deterministic; UI transition logic derives the active case from order+step rather than hard-coded cause order; refresh preserves the current cause; reset preserves assignment; full restart selects a fresh assignment; v3 checkpoints and order/step/scenario contradictions fail closed; production Chromium CI explicitly exercises both orderings.
SECURITY: assignment remains client-controlled practice state. No shell, eval, subprocess, Docker, privileged runtime, host mounts/sockets, credentials or real external/internal network execution was added.
LEARNING: sequence position is no longer a deterministic answer key, but the assignment is not a secret against browser developer tools and Web Crypto selection may repeat the same order on later restarts. This is randomized assignment, not statistical counterbalancing.
ROLLBACK: revert PR #18. Schema/fixture v3 checkpoints were intentionally invalidated; no server-side learner state exists.

## Product truth
Works: executable Next.js product shell; two SIMULATED file-access incidents; two SIMULATED TCP-service incidents with identical learner-facing connection-refused framing; observation -> typed hypothesis -> repair -> verification -> explanation gates; explicit differential order plus step in LabState; Web Crypto order selection at the UI boundary; pure deterministic simulator behavior once assignment is supplied; reset preserves assignment; full restart selects a fresh assignment; versioned local checkpoint; safe refresh/reset/restart/corrupt/stale/unavailable-storage behavior; mandatory production Chromium regression in CI.
Persistence truth: PRACTICE_SCHEMA_VERSION = 4 and LINUX_FIXTURE_VERSION = 4. Old v3 checkpoints are discarded rather than reinterpreted under the new persisted order/step semantics.
Partial: four incidents across two causal families remain narrow; mechanism explanation remains multiple-choice; typed hypothesis still accepts only three known causal classes; local checkpoint and hidden assignment are same-browser/device client state and inspectable/forgeable; Web Crypto selection can repeat an ordering; transcript is intentionally not persisted; browser CI covers Chromium only.
Broken: no known in-scope product failure after PR #18 final-head CI and product-main re-read.
Known risks: client progress/order is forgeable; exact commands and three causal keywords remain learnable; the TCP service is a state-machine abstraction rather than a real kernel/network stack; permission fixtures assume healthy parent traversal/ACL/SELinux; curriculum breadth remains mostly planned; CI-only Playwright remains outside package-lock.json and the normal app dependency audit.
Current highest-value frontier: reduce mechanism-explanation prompting with evidence-linked structured reasoning. Prefer explicit references to collected observations plus a causal claim over another obvious multiple-choice answer. Do not pretend arbitrary prose can be objectively graded without a defensible evaluator.
Next candidate after that: revisit whether repeated attempts need deliberate counterbalancing rather than independent random assignment, and revisit Playwright dependency hygiene as E2E scope grows.
External blockers: none established.

## Verification evidence
PR #18 final head fbb738ef05182a8290bffa3fd009bd09c27ae407 passed GitHub CI 37265647222: npm ci, full TypeScript typecheck, 21/21 Node behavioral tests, npm audit --audit-level=high, production build, exact-pinned @playwright/test 1.63.0 install, Chromium/runtime dependency install and production browser regression all succeeded.
Browser log confirmed `next start --hostname 127.0.0.1 --port 3100`, three discovered tests using one worker and `3 passed (22.2s)`. The production suite exercised the original listener-first path, an explicit reversed process-first path, wrong-hypothesis rejection, repair-help hiding, persisted assignment/reset behavior, impossible assignment discard, stale v3 recovery, unavailable Storage API, mobile overflow, keyboard focus and runtime-error checks.
PR #18 squash-merged as 87295ad59f696b232febe62bf1ae6d76546c84f7. Main was re-read and confirmed to contain schema/fixture version 4, explicit order/step state and package version 0.1.0.
No separate successful post-merge main-push CI is claimed unless live GitHub evidence establishes one.
