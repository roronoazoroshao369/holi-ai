# Lab security boundary

Current environment: SIMULATED, in-browser pure transitions. No eval, shell, subprocess, Docker, credentials or external networking. Commands that look like `curl`, `ps`, `ss`, `chmod` or `configure` are exact-matched strings interpreted by the local state machine; they do not execute host commands or open sockets. Unsupported input is inert text. Input length and visible transcript are bounded. Attempts are component-local.

The new tcp-listener incident does not weaken this boundary. Its process table, listening socket and HTTP result are deterministic fixture output, not observations from the user's device, GitHub runner host or any network namespace.

Do not promote to CONTROLLED_EXECUTION / REAL_SANDBOX without documented identity, cross-user access controls, CPU/memory/PID/storage budgets, TTL cleanup, deny-by-default internal/metadata network access and restricted egress, no privileged workloads, host socket/mounts or control-plane credentials, audit and deterministic fixture/verifier tests. Security veto applies even for demos.

Browser localStorage checkpoint is attacker-controlled input. Schema/fixture version 2 plus shape/semantic invariants protect refresh behavior from stale or corrupt data, not from a learner deliberately forging state. Client state must never authorize real execution, secrets, privileges or certification. Storage failures fall back to ephemeral practice rather than assuming completion.

The mandatory production Chromium suite verifies browser behavior and storage failure paths, but it does not convert client state into trusted evidence. Playwright itself is CI tooling only and does not change the learner execution boundary.
