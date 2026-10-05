# Risks

- Current labs are SIMULATED exact-match state machines, not Linux or a real network stack. They teach diagnostic structure but cannot establish production-system competence.
- Four incidents exist across two causal families. The two counterfactuals are assessment steps on existing permission/listener incidents, not independent incidents or a broad corpus.
- Both changed-evidence tasks are fixed, visible and retryable. Using two different causal relations makes single-token memorization less convincing, but their expected grammar can still be learned; passing is evidence of completing these exercises, not proof of general causal transfer.
- Structured explanation and counterfactual answers use finite typed grammar. Source/fact linkage makes blind label selection harder but remains assisted practice, not arbitrary free-form reasoning or trusted assessment.
- Differential order is selected with browser Web Crypto at the UI boundary. Either cause may appear first, but independent random selection can repeat the same ordering; this is not statistical counterbalancing.
- Differential order, evidence, reasoning, both counterfactual states, step and completion are persisted in localStorage and are forgeable through developer tools. A deliberately forged but internally consistent schema-v7 checkpoint can restore local completion. Never use it for certification, authorization, privileges or real execution.
- Practice schema version 7 intentionally discards schema-v6 and older checkpoints. Linux fixture version remains 5 because incident definitions/command outputs did not change. Future shape and fixture-semantic changes must review these versions independently.
- Production hydration, both transfer gates, both differential orderings and failure/recovery behavior are exercised by three mandatory Chromium tests, but this is one browser engine and a narrow current flow rather than broad compatibility evidence.
- @playwright/test, playwright and playwright-core are exact-locked at 1.63.0 and are installed by npm ci before the normal high-severity npm audit. Chromium/FFmpeg binaries are still downloaded from Playwright's CDN at CI time; the locked package selects their revision, but npm audit does not audit those binary artifacts or CDN availability.
- Permission fixtures assume healthy parent-directory traversal, ACL/SELinux and other configuration. The permission counterfactual simplifies effective-ID/group access and does not model ACLs, capabilities, namespaces or credential refresh behavior.
- TCP fixtures and the listener counterfactual omit namespaces, firewall policy, bind-address complexity, service-manager/restart semantics and real kernel/socket behavior.
- Strict UID/group and finite token formatting can fail separately from conceptual understanding; feedback remains generic.
- Curriculum is a skeleton; most advertised domain labs are planned rather than delivered.
- Dependency audit reflects registry findings at verification time, not proof of permanent absence of vulnerabilities.
- Real sandbox architecture remains design-only. No runtime, isolation verification or cost controls are implemented.
- Concurrent runs must re-read PR/head/main before updating; never force-push main.
