# Ordered backlog

1. Add same-symptom differential diagnosis inside the current Linux/OS/network slice: at least two incidents should begin with comparable connection failure while process/socket evidence points to different causes. Keep learner-facing scenario identity neutral and test that the wrong causal class cannot pass.
2. Reduce remaining answer-by-prompt risk. Mechanism explanation is still multiple-choice and typed hypothesis accepts three known causal keywords; add evidence-linked reasoning without pretending arbitrary prose can be graded reliably.
3. Revisit browser-test dependency hygiene as the E2E suite grows: the CI runtime is exact-pinned but currently outside package-lock.json and the normal app dependency audit.
4. Define an authoritative mastery model only when server identity/storage is justified. Never promote localStorage completion into certification.
5. Broaden delivered curriculum before presenting Docker/Kubernetes/CI/IaC/observability cards as implemented labs.
6. Design and verify an isolated execution gateway before real Linux labs: identity, quotas, TTL, cleanup, network deny-by-default, restricted egress and escape tests. No host execution shortcuts.

Any future scenario-identity or fixture-semantic change must explicitly review LINUX_FIXTURE_VERSION. State-shape changes must separately review PRACTICE_SCHEMA_VERSION; never silently restore semantically stale checkpoints.
