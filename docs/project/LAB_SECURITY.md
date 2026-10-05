# Lab security boundary

Current environment: SIMULATED, in-browser pure transitions. No eval, shell, subprocess, Docker, credentials or external networking. Commands that look like `curl`, `ps`, `ss`, `chmod`, `configure` or `start` are exact-matched strings interpreted by the local state machine; they do not execute host commands or open sockets. Unsupported input is inert text. Input length and visible transcript are bounded. Attempts are component-local.

The TCP-service incidents and listener counterfactual do not weaken this boundary. Their process table, listening socket, HTTP result and hypothetical changed-evidence prediction are deterministic fixture/rubric data, not observations from the user's device, GitHub runner host or any network namespace. The counterfactual does not open a socket or execute a second experiment.

Differential order selection happens at the browser/UI boundary with Web Crypto and is then persisted as client state. The simulator itself remains deterministic once `differentialOrder` and `differentialStep` are supplied. This assignment is not a secrecy boundary: a learner with developer tools can inspect or edit localStorage. Do not rely on obfuscation or hidden client fields for grading, authorization or anti-cheat.

Browser localStorage checkpoint is attacker-controlled input. Practice schema version 6 / Linux fixture version 5 plus structural/semantic invariants protect refresh behavior from stale, corrupt or contradictory state, not from a learner deliberately forging state. Schema-v5 and older incompatible checkpoints are discarded. Client state—including completion, order, step, evidence snapshots, structured reasoning and causal-transfer answers—must never authorize real execution, secrets, privileges or certification. A deliberately forged but internally consistent schema-v6 checkpoint can still restore local completion. Storage failures fall back to ephemeral practice rather than assuming completion.

Do not promote to CONTROLLED_EXECUTION / REAL_SANDBOX without documented identity, cross-user access controls, CPU/memory/PID/storage budgets, TTL cleanup, deny-by-default internal/metadata network access and restricted egress, no privileged workloads, host sockets/mounts or control-plane credentials, audit and deterministic fixture/verifier tests. Security veto applies even for demos.

The mandatory production Chromium suite verifies browser behavior, both explicit differential orderings, counterfactual progression/revocation and storage failure paths, but it does not convert client state into trusted evidence. Playwright itself is CI tooling only and does not change the learner execution boundary.

