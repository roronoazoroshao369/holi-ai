# Lab security boundary

Current environment: SIMULATED, in-browser pure transitions. No eval, shell, subprocess, Docker, credentials or external networking. Unsupported input is inert text. Input length and visible transcript are bounded. Attempts are component-local.
Do not promote to CONTROLLED_EXECUTION / REAL_SANDBOX without documented identity, cross-user access controls, CPU/memory/PID/storage budgets, TTL cleanup, deny-by-default internal/metadata network access and restricted egress, no privileged workloads, host socket/mounts or control-plane credentials, audit and deterministic fixture/verifier tests.
Security veto applies even for demos. Browser-local state is not authoritative grading.
Browser localStorage checkpoint is attacker-controlled input. Version/shape/invariant validation protects refresh behavior from stale or corrupt data, not from a learner deliberately forging state. It must never authorize real execution, secrets, privileges or certification. Storage failures fall back to ephemeral practice rather than assuming completion.
