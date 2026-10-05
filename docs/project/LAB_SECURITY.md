# Lab security boundary

Current environment: SIMULATED, in-browser pure transitions. No eval, shell, subprocess, Docker, credentials or external networking. Commands that look like `curl`, `ps`, `ss`, `chmod`, `configure` or `start` are exact-matched strings interpreted by the local state machine; they do not execute host commands or open sockets. Unsupported input is inert text. Input length and visible transcript are bounded. Attempts are component-local.

The TCP-service incidents do not weaken this boundary. Their process table, listening socket and HTTP result are deterministic fixture output, not observations from the user's device, GitHub runner host or any network namespace.

Differential order selection happens at the browser/UI boundary with Web Crypto and is then persisted as client state. The simulator itself remains deterministic once `differentialOrder` and `differentialStep` are supplied. This assignment is not a secrecy boundary: a learner with developer tools can inspect or edit localStorage. Do not rely on obfuscation or hidden client fields for grading, authorization or anti-cheat.

Browser localStorage checkpoint is attacker-controlled input. Schema/fixture version 4 plus structural/semantic invariants protect refresh behavior from stale, corrupt or contradictory state, not from a learner deliberately forging state. v3 checkpoints are discarded. Client state—including completion, order and step—must never authorize real execution, secrets, privileges or certification. Storage failures fall back to ephemeral practice rather than assuming completion.

Do not promote to CONTROLLED_EXECUTION / REAL_SANDBOX without documented identity, cross-user access controls, CPU/memory/PID/storage budgets, TTL cleanup, deny-by-default internal/metadata network access and restricted egress, no privileged workloads, host sockets/mounts or control-plane credentials, audit and deterministic fixture/verifier tests. Security veto applies even for demos.

The mandatory production Chromium suite verifies browser behavior, both explicit differential orderings and storage failure paths, but it does not convert client state into trusted evidence. Playwright itself is CI tooling only and does not change the learner execution boundary.
