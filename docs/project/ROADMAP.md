# Release ladder

- v0.1: delivered product shell; reproducible install, CI build/security checks, honest simulator and tested state transitions.
- v0.2: delivered lesson → evidence → repair → verify → explanation → changed permission scenario flow.
- v0.3: delivered versioned local practice persistence with refresh/reset/retry semantics and explicit untrusted-state boundary. Accounts remain deferred until cross-device/server-trusted state is justified.
- Quality gate: delivered mandatory production Chromium E2E in CI, including persistence hydration, reset/restart, corrupt/stale storage, unavailable Storage API, responsive overflow, keyboard focus and runtime-error checks.
- Breadth gate A: delivered one unfamiliar SIMULATED OS/network incident whose causal mechanism differs from file permissions. Observations are separate from inferred hypotheses; learner-facing cues are neutral; persistence schema/fixture versions are 2.
- Breadth gate B: next, add same-symptom competing root causes so a scenario cannot be solved by mapping fixture identity to one causal class. Prefer a narrow process-down versus wrong-listener-port differential before broad curriculum expansion.
- v0.4: real Linux labs only after isolation, quotas, TTL, cleanup, network policy and escape tests pass.
- v0.5–v0.7: Docker, Kubernetes, CI/CD and IaC vertical slices with verifiers and cost budgets.
- v0.8–v0.9: observability/SRE and unfamiliar cross-domain incidents.
- v1.0: coherent zero-to-production curriculum with demonstrated transfer, accessibility and operational readiness.

No version is complete solely because its code exists. Consult PROJECT_STATE for actual verification/merge status.
