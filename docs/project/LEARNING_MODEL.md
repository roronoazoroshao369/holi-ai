# Learning model

The current practice sequence has four SIMULATED incidents across two causal families plus two bounded changed-evidence assessment steps.

1. Guided file access: nginx worker `www-data` receives HTTP 403 for a root-owned file mode 600. Learner collects HTTP symptom, file mode and worker identity, records a `permission` hypothesis, applies the minimal public-page read repair and verifies HTTP. The mechanism explanation is `other-read`.
2. Permission transfer: `report-worker` is a supplementary member of group `web`. Copying the memorized 644 repair makes HTTP healthy but fails least-access assessment; 640 is required because the report is group-private. The mechanism explanation is `group-read`.
3-4. Same-symptom health differential pair: client gets connection refused at 127.0.0.1:8080. Learner-facing title, summary, README and diagnostic commands do not disclose the hidden cause. One case shows a running api-server on 9090 and requires a `network` hypothesis before reconfiguring the listener. The competing case shows no api-server process/listener and requires a `process` hypothesis before starting the service on 8080.

The two health causes do not occupy fixed positions. A practice assignment stores `listener-first` or `process-first` plus differential step 0/1. Either cause can appear first. Current-case reset keeps the assignment; full restart selects a fresh one at the browser boundary. Simulator behavior remains deterministic after assignment. Independent Web Crypto selection can repeat an order, so this is randomized exposure rather than guaranteed alternation or statistical counterbalancing.

LabState distinguishes observations from inferred conclusions. TCP service state separately models process presence and listening port. The hypothesis is typed but only known causal classes `permission`, `process` and `network` are accepted. Repair syntax stays hidden until the hypothesis is locked. Explanation requires three source-linked factual claims, exactly two identity/resource sources supporting a typed mechanism and a minimal target. Wrong source/fact/support/target cannot be rescued by a correct mechanism label.

## Changed-evidence transfer A: permission identity

After the private report is repaired to mode 640 and explained as group-read, original identity/file sources remain fixed evidence. The hypothetical keeps file owner/group `root:web` and mode `640` but removes `report-worker` from supplementary group `web`. The learner must predict HTTP `403`, that an access change is still `required`, and causal relation `group-membership-required`. This gate is required before entering differential diagnosis and remains required throughout later progression.

## Changed-evidence transfer B: listener target

After a correct explanation of the wrong-listener case, original evidence remains process present and socket listening on 9090. The hypothetical changes only the socket observation to 127.0.0.1:8080. The learner must predict HTTP `200`, no remaining listener repair (`none`) and causal relation `listener-target-match`. Listener-first cannot advance to the second health case before the gate; process-first cannot complete the practice until it passes.

For both gates, editing the related explanation or transfer draft revokes dependent completion. Resetting the source case clears its own transfer state; later cases may preserve already-passed canonical gates. A wrong causal hypothesis cannot earn verified completion even if the learner later runs the correct repair and makes the endpoint healthy. Blind repair cannot retrospectively create before-repair evidence.

Persistence uses practice schema version 7 / Linux fixture version 5. Schema-v6 and older checkpoints are discarded because permission-transfer/progression state changed; fixture version remains 5 because incident definitions and command output did not. Validator rejects order/step/scenario contradictions, cross-case TCP tuples, invalid evidence/reasoning, forged transfer answers and impossible carry. Every differential checkpoint must contain a canonical passed permission gate; final completion also requires the listener gate.

Learning limits remain substantial. Two fixed perturbations across different relations are stronger than one memorized listener token, but both can still be memorized and retried; strict tokens can fail separately from conceptual understanding; the corpus is tiny; localStorage is forgeable; and the simplified models omit many production mechanisms. Passing current gates is assisted local practice, never authoritative mastery/certification.

The next primary engineering frontier is browser-test dependency reproducibility. After that, learning work should prefer a genuinely unfamiliar transfer/curriculum slice over a third fixed counterfactual unless a concrete learning defect justifies it.
