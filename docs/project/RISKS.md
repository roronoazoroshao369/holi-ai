# Risks

- Current labs are SIMULATED exact-match state machines, not Linux or a real network stack. They teach diagnostic structure but cannot establish production-system competence.
- Four incidents exist across two causal families. The two health cases share learner-facing prompt/symptom/diagnostic vocabulary and no longer have a fixed cause order, but the corpus is still tiny and deterministic once an assignment is chosen.
- Differential order is selected with browser Web Crypto at the UI boundary. Either cause may appear first, but independent random selection can repeat the same ordering across restarts; this is not statistical counterbalancing.
- Differential order and step are persisted in client localStorage. They are not exposed by normal learner-facing labels/buttons, but a learner using developer tools can inspect or forge them. Treat them as untrusted practice mechanics, never secret or authoritative assessment evidence.
- Structured explanation now requires explicit source/fact/mechanism/target links, but its finite visible grammar remains guessable, memorizable and retryable. It is assisted practice, not free-form reasoning or trusted assessment.
- Versioned localStorage improves continuity only. It is client-editable, same-browser/device state and must never be trusted for certification, authorization or execution privileges.
- Schema version 5 / fixture version 5 intentionally discard v4 and older checkpoints. Future state, ordering-policy or semantic changes must explicitly review versioning rather than reinterpret old client state.
- Production persistence/hydration, structured explanation and both explicit differential orderings are exercised by three mandatory Chromium tests, but this is one browser engine and a narrow current flow rather than broad compatibility evidence.
- The CI-only @playwright/test runtime is pinned to 1.63.0 but installed outside package-lock.json after the normal app npm audit; registry/CDN availability and test-runtime supply-chain health remain explicit CI dependencies.
- Parent directory permissions, ACL/SELinux and other configuration are assumed healthy in file-access fixtures, so they do not model the full Linux access path.
- The TCP-service fixtures omit namespaces, firewall policy, bind-address complexity, service-manager behavior and real kernel/socket interactions.
- Curriculum is a skeleton; most advertised domain labs are planned rather than delivered.
- Dependency overrides require compatibility monitoring; audit reflects registry findings at verification time, not proof of absence of vulnerabilities.
- Real sandbox architecture remains design-only. No runtime, isolation verification or cost controls are implemented.
- Concurrent runs must re-read PR/head/main before updating; never force-push main.


- Canonical source payload validation cannot authenticate learner activity: a deliberately forged but internally consistent v5 checkpoint can restore completion. Evidence IDs are source references, never secrets or privileges.
- Permission identity input uses a strict UID/group token grammar, so formatting failure can differ from conceptual failure. Feedback is generic and does not yet diagnose which causal misconception occurred. Counterfactual transfer is not implemented.
