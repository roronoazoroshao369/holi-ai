# Project state

Updated 2026-10-07. Current phase: v0.3 SIMULATED learning/mastery-flow foundation. Package 0.1.0; no release/tag. No real Linux/Git/Actions learner execution or trusted assessment storage.

## Latest verified product checkpoint

- Product main: `15638e8a3c247c745dd6c93f1d9e32ac741b7847`, including PR #54 — Diagnose parent-directory search permission under HTTP 403 and corrective PR #56 — Align homepage truth with path-search delivery.
- #54 exact final head: `ab1cfd6ec581dd8e25bd7a996f947d180fdeed44`; exact-head CI `37566108797` — SUCCESS.
- #56 exact final head: `fe87b4c79cdb6b0db970049fb9ce782e364549ef`; exact-head CI `37567600706` — SUCCESS.
- Full verified gate at current product source was repeated by temporary packaging PR #57 final head `b2ab3fa6f75bf05a6bc00a6f775df6f7f5324724`: CI `37570652716` — SUCCESS, including checkout-SHA verification, 77/77 Node tests, typecheck, audit, production build, locked Chromium and 14/14 production browser tests.
- PR #57 was CLOSED WITHOUT MERGE and its temporary branch was reset to product main, so `contents: write` did not enter `main`.
- The GitHub connector used here does not surface push-triggered workflow runs for the merged main commit; do not fabricate a separate post-merge-main run id. Current product source was independently re-gated through #57.

## Delivered goal contract

GOAL: teach and assess the distinction between file read permission and parent-directory search permission under one bounded SIMULATED HTTP 403 incident.

DELIVERED:
- new `path-search` Linux incident with HTTP symptom, effective identity and namei-style path-component evidence;
- immutable pre-repair permission hypothesis requirement;
- explicit rejection of repeating file `chmod 644` when the file is already readable;
- least-privilege repair on the blocking parent directory;
- HTTP recovery verification;
- source-linked explanation;
- changed-parent transfer that still requires directory-search reasoning;
- progression gate requiring path-search transfer before health differential practice;
- Linux persistence migration to schema 8 / fixture 6 with fail-closed stale-state handling;
- homepage product truth corrected to 08 simulated incidents / 03 transfer gates.

NON-GOALS PRESERVED: no learner host execution, no real Linux/network stack, no server-trusted mastery, no Git/CI persistence change, no weakening of retries/timeouts/security boundaries.

## What works

Eight primary SIMULATED incidents now exist across Linux and Git/CI. Linux practice includes file-permission, parent-directory path-search and two same-symptom TCP diagnostic causes; Git/CI includes artifact handoff, revision acceptance and graph integration, plus teaching-only Git foundations/evidence-synthesis scaffolds.

Linux path-search explicitly separates file readability from directory traversal. A changed-parent transfer prevents solving by blindly repeating the prior file chmod. Existing permission/group and listener/socket causal transfers remain required.

Git graph evidence binding remains intact: observed SHA candidates reduce clerical copying while source/order/relation/ancestry decisions remain learner commitments.

Same-browser persistence, reset/retry, stale/corrupt/unavailable storage, mobile overflow, keyboard focus and runtime-error boundaries remain under mandatory Chromium regression. Client-side checkpoints remain forgeable and non-authoritative.

## Production deployment

Cloudflare Worker: `holi-devops-web`.

Verified source: `15638e8a3c247c745dd6c93f1d9e32ac741b7847`.

Temporary packaging PR #57:
- first attempt `37570196066` failed safely in Worker packaging because temporary regex literals were over-escaped; publish step was skipped and no deployment occurred;
- corrected final head `b2ab3fa6f75bf05a6bc00a6f775df6f7f5324724`;
- packaging CI `37570652716` — SUCCESS;
- artifact build id: `EWt-Gw5Dki0USIYdA8GQK`;
- page chunk: `page-9d6a40fdeb1e4354.js`.

Production deployment: `0c112f93-451c-4970-abc4-6ba7ab2a4fc5`.
Production version: `fbddfc81-da85-47c9-bfb8-662291566d2f`, 100% traffic.
Public URL: https://holi.shao.dpdns.org/

Cloudflare Browser Rendering returned HTTP 200 and confirmed the 08/03 product-truth counters, parent-directory-search copy, expected build/page markers, and absence of the prior `page-36a147e4a3373130.js` chunk.

## Known risks

- Curriculum remains a skeleton rather than a coherent A–Z DevOps course.
- Exercise corpus and typed reasoning grammar remain finite, visible and retryable.
- localStorage is forgeable and cannot represent trusted certification/mastery.
- Linux permission modeling still omits ACL, SELinux, capabilities, namespaces and credential-refresh behavior.
- TCP modeling omits firewall policy, namespaces, bind-address complexity and service-manager behavior.
- Chromium-only browser coverage remains a compatibility limit.
- Real sandbox identity, isolation, quotas, TTL, cleanup, restricted egress, cost controls and escape verification remain design-only.
- CI emits Node action-runtime deprecation warnings for checkout/setup-node v4; this is not a failed gate.
- Cloudflare Pages Git integration error 8000011 remains historical deployment-automation debt; verified serving continues through the Worker custom domain.

## ONE next frontier

Highest-value nearby gap: Linux explanation/transfer inputs still rely on finite exact text tokens, so clerical formatting can fail separately from causal understanding.

Candidate primary goal: one bounded Linux evidence-binding UX hardening slice for the permission/path-search reasoning flow. Let learners bind factual claims to already captured identity/path evidence rather than retype fragile strings, while preserving immutable pre-repair commitment, explicit source linkage, causal relation choice, wrong-reasoning failure after successful repair, downstream revocation, schema/fixture fail-closed rules and the SIMULATED trust boundary. Do not convert the assessment into answer-revealing multiple choice.

Reassess LIVE repository evidence before implementation.
