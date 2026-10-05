# Risks

- Current labs are SIMULATED exact-match state machines, not Linux or a real network stack. They teach diagnostic structure but cannot establish production-system competence.
- Four deterministic incidents exist across two causal families. The two health cases share the same learner-facing prompt and symptom, but their order is fixed, so repeated learners can still map sequence position to `network` versus `process`.
- Mechanism explanation remains multiple-choice. The typed hypothesis is less prompted than a select, but it still accepts only three known causal classes and is not free-form reasoning assessment.
- Versioned localStorage improves continuity only. It is client-editable, same-browser/device state and must never be trusted for certification, authorization or execution privileges.
- Schema version 3 / fixture version 3 intentionally discard v2 checkpoints. Future state, ordering or semantic changes must explicitly review versioning rather than reinterpret old client state.
- Production persistence/hydration and both differential cases are covered by two mandatory Chromium tests, but this is one browser engine and a narrow current flow rather than broad compatibility evidence.
- The CI-only @playwright/test runtime is pinned to 1.63.0 but installed outside package-lock.json after the normal app npm audit; registry/CDN availability and test-runtime supply-chain health remain explicit CI dependencies.
- Parent directory permissions, ACL/SELinux and other configuration are assumed healthy in file-access fixtures, so they do not model the full Linux access path.
- The TCP-service fixtures omit namespaces, firewall policy, bind-address complexity, service-manager behavior and real kernel/socket interactions.
- Curriculum is a skeleton; most advertised domain labs are planned rather than delivered.
- Dependency overrides require compatibility monitoring; audit reflects registry findings at verification time, not proof of absence of vulnerabilities.
- Real sandbox architecture remains design-only. No runtime, isolation verification or cost controls are implemented.
- Concurrent runs must re-read PR/head/main before updating; never force-push main.
