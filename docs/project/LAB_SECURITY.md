# Lab security boundary

Current environment: SIMULATED, in-browser pure transitions. No eval, shell, subprocess, Docker, credentials or external networking. Commands that look like `curl`, `ps`, `ss`, `chmod`, `configure` or `start` are exact-matched strings interpreted by the local state machine; they do not execute host commands or open sockets. Unsupported input is inert text. Input length and visible transcript are bounded. Attempts are component-local.

The permission and listener counterfactuals do not weaken this boundary. Identity/group membership, file metadata/mode, process table, listening socket, HTTP result and hypothetical changed-evidence predictions are deterministic fixture/rubric data, not observations from the user's device, GitHub runner host or any network namespace. Neither counterfactual changes host identity, chmods a real file, opens a socket or executes a second experiment.

Differential order selection happens at the browser/UI boundary with Web Crypto and is then persisted as client state. The simulator itself remains deterministic once `differentialOrder` and `differentialStep` are supplied. This assignment is not a secrecy boundary: a learner with developer tools can inspect or edit localStorage. Do not rely on obfuscation or hidden client fields for grading, authorization or anti-cheat.

Browser localStorage checkpoint is attacker-controlled input. Practice schema version 7 / Linux fixture version 5 plus structural/semantic invariants protect refresh behavior from stale, corrupt or contradictory state, not from a learner deliberately forging state. Schema-v6 and older incompatible checkpoints are discarded. Client state—including completion, order, step, evidence snapshots, structured reasoning and both causal-transfer answers—must never authorize real execution, secrets, privileges or certification. A deliberately forged but internally consistent schema-v7 checkpoint can still restore local completion. Storage failures fall back to ephemeral practice rather than assuming completion.

Do not promote to CONTROLLED_EXECUTION / REAL_SANDBOX without documented identity, cross-user access controls, CPU/memory/PID/storage budgets, TTL cleanup, deny-by-default internal/metadata network access and restricted egress, no privileged workloads, host sockets/mounts or control-plane credentials, audit and deterministic fixture/verifier tests. Security veto applies even for demos.

The mandatory production Chromium suite verifies browser behavior, both explicit differential orderings, both transfer progression/revocation paths and storage failure paths, but it does not convert client state into trusted evidence. Playwright itself is CI tooling only and does not change the learner execution boundary.



## Git & CI simulator boundary

The Git/CI incident does not execute YAML, git commands, shell commands, GitHub Actions jobs or network calls from learner input. Buttons and form fields select exact client-side state transitions only. The displayed workflow/job logs are fixture data, not observations from GitHub, the learner's machine or the CI runner executing repository tests.

Git/CI persistence uses a separate localStorage key with schema 3 / fixture 3. Its validator rejects malformed reasoning shapes, stale versions, inconsistent evidence, impossible run status and forged derived completion flags. This protects local state invariants only. A learner with developer tools can still manufacture an internally consistent checkpoint, so Git/CI completion remains non-authoritative and must never grant execution, secrets, privileges or certification.

The Playwright production tests do execute the repository's built web application inside GitHub CI, but that is maintainer verification tooling. It is not learner-controlled execution and does not change the product boundary from SIMULATED to CONTROLLED_EXECUTION.


Git revision extends the same SIMULATED boundary. Ref snapshots, commit SHAs, checkout/build metadata, release intent and tag objects are synthetic fixtures; no git command, YAML or learner text reaches host execution. Exact-match selected transitions do not fetch repositories, resolve real objects, spawn subprocesses or receive credentials. Strict revision checkpoint tuples/answer validation reject contradictions, not fully consistent forgery. Independent Linux checkpoint remains 7/5. Denied Storage getter/methods use ephemeral state and never imply durable completion.


Pre-repair Git rationale is client-local typed data, not arbitrary executable prose. Strict shape/length, completeness at lock, canonical source/fact/relation verification and derived-flag validation reject inconsistent checkpoints. They do not establish authenticity or a client security boundary. Schema-v2 and older checkpoints discard; Linux 7/5 remains independent.
