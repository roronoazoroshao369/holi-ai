# Project state

Updated: 2026-10-05. Phase: evidence-linked structured explanation delivered; next frontier is narrow causal transfer beyond finite-form transcription.
Package version: 0.1.0 (no release tag).
Verified product main: 426076a7edb000f344f93f5fba2b4e5de9cc02e5 (PR #20), re-read after merge.
Product final head: 259e64fc0479bb7da107bd0081a733b01a7742ee; successful PR CI: 37270303740.
Inspected baseline: 946e5eeb0bbc9361bbc965766914728a58405dd4 (PR #19).
Previous product: PR #18, head fbb738ef05182a8290bffa3fd009bd09c27ae407, CI 37265647222, squash merge 87295ad59f696b232febe62bf1ae6d76546c84f7.

## Goal contract
GOAL: require explicit observation sources, factual claims and a supported mechanism instead of accepting a lone multiple-choice explanation label.
WHY NOW: sequence leakage was removed, but the prior mechanism dropdown still allowed answer-by-prompt.
USER VALUE: learners must read their collected before-repair output and connect identity/resource observations to a causal mechanism and minimally sufficient repair target.
SCOPE: immutable scenario-scoped before-repair snapshots; three source-linked factual claims; exactly two distinct identity/resource sources supporting a typed mechanism; typed minimal target; deterministic rubric; persisted drafts and completion invariants; reset/restart isolation; both differential orders in production Chromium CI.
NON-GOALS: arbitrary prose evaluation, broad curriculum expansion, real Linux/network execution, accounts, server-trusted grading, certification or anti-cheat.
ACCEPTANCE: correct final mechanism with wrong source/fact/support/target fails; late observations cannot become before-repair evidence; wrong hypotheses cannot complete; refresh restores valid drafts/snapshots; impossible explained tuples and v4 checkpoints are discarded; both differential orders remain verified by browser tests.
SECURITY: all learner commands remain exact-matched pure SIMULATED transitions. Client evidence/assignment/progress is forgeable and never authoritative.
ROLLBACK: revert the implementation PR. v4 checkpoints are intentionally incompatible with v5; no server learner data exists.

## Product truth
Implemented: four SIMULATED incidents across file permissions and TCP-service state; identical learner-facing health case framing; explicit randomized differential order/step; before-repair hypothesis lock enforced in simulator; immutable captured command/output snapshots; source-linked factual claims and two-source causal mechanism; minimal target check; persisted structured drafts; versioned checkpoint invariants; full restart/current-case reset semantics; blocked-storage fallback; mandatory production Chromium CI retained.
Persistence: PRACTICE_SCHEMA_VERSION = 5 (new snapshot/reasoning shape), LINUX_FIXTURE_VERSION = 5 (changed explanation/completion semantics). v4 and older checkpoints are discarded, not migrated.
Partial: the structured grammar and causal-keyword vocabulary remain finite and visible. This is assisted structured practice, not free-form reasoning assessment. Learners can memorize or retry. Client state remains same-browser/device and inspectable/forgeable. Independent Web Crypto assignment can repeat order and is not statistical counterbalancing. Transcript is not persisted, but bounded structured evidence is persisted.
Known risks: exact-match commands; tiny fixture corpus; simulated network stack; healthy parent traversal/ACL/SELinux assumptions; Chromium-only browser coverage; CI-only Playwright 1.63.0 outside package-lock.json and the normal app audit.
Next primary frontier: improve the diagnostic/learning value of structured reasoning through targeted counterfactual or changed-evidence transfer tasks; distinguish causal understanding from filling a known finite form before broad curriculum expansion. Define the narrow rubric first, without arbitrary prose grading.
Secondary frontier: Playwright dependency hygiene; deliberate counterbalancing only if justified by repeat-attempt requirements.

## Verification evidence
Local verification executed: npm ci; full TypeScript typecheck; 29/29 Node behavioral tests; npm audit --audit-level=high (0 vulnerabilities); production Next.js build. Production browser regression passed locally: three tests, one worker, `3 passed (32.0s)`, Playwright-managed `next start` on port 3100. Local CDN browser download failed with invalid/truncated archives; QA used packaged @sparticuz/chromium 153.0.0 through a scratch-only launch configuration without its single-process flag. The repo/CI browser configuration was not changed. Desktop/mobile reasoning-panel screenshots were inspected; mobile overflow, keyboard focus, both differential orders, wrong source/fact/mechanism/support, draft refresh/reset and corrupt explanation recovery were exercised.
PR #20 final head 259e64fc0479bb7da107bd0081a733b01a7742ee passed CI 37270303740. Job 111635682249 executed npm ci, full TypeScript check, 29/29 Node tests, npm audit --audit-level=high (0 vulnerabilities), production build, exact-pinned Playwright 1.63.0 and Chromium/runtime installation, and production browser regression. Log explicitly confirmed `next start --hostname 127.0.0.1 --port 3100`, three tests using one worker and `3 passed (38.0s)`. Standard PR CI checked the merge ref 879b295d062924581ce91720bba1202ee134968b associated with that final head and unchanged base.
PR #20 squash-merged as 426076a7edb000f344f93f5fba2b4e5de9cc02e5. Main was re-read; its tree cb21ac49c8b17124e9bffe7e9aedb60ad69190d0 exactly matches the implementation tree. Simulator, persistence and package manifest were also fetched at that merge and matched the delivered contents.
A separate main-push CI 37270486284 was observed running at the documentation checkpoint; no successful result is claimed here without later live evidence. No release/tag was created; package remains 0.1.0.
