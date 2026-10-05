# Learning model

The current practice sequence has four SIMULATED incidents across two causal families.

1. Guided file access: nginx worker `www-data` receives HTTP 403 for a root-owned file mode 600. Learner collects HTTP symptom, file mode and worker identity, records a `permission` hypothesis, applies the minimal public-page read repair and verifies HTTP. The mechanism explanation is other-read.
2. Permission transfer: `report-worker` is a supplementary member of group `web`. Copying the memorized 644 repair makes HTTP healthy but fails least-access assessment; 640 is required because the report is group-private. The mechanism explanation is group-read.
3-4. Same-symptom health differential pair: client gets connection refused at 127.0.0.1:8080. Learner-facing title, summary, README and diagnostic commands do not disclose the hidden cause. One case shows a running api-server on 9090 and requires a `network` hypothesis before reconfiguring the listener. The competing case shows no api-server process/listener and requires a `process` hypothesis before starting the service on 8080.

The two health causes no longer occupy fixed positions. A practice assignment stores `listener-first` or `process-first` plus differential step 0/1. Either cause can therefore appear first. Reset keeps the current hidden assignment; full restart selects a fresh one at the browser boundary. Simulator behavior remains deterministic after assignment. Because the selector is independent Web Crypto randomness, repeated restarts may still produce the same order; this is randomized exposure, not guaranteed alternation or statistical counterbalancing.

LabState distinguishes observations from inferred conclusions. TCP service state separately models process presence and listening port. The hypothesis is typed rather than selected from a dropdown, but only the known classes `permission`, `process` and `network` are accepted. Repair syntax stays hidden until the hypothesis is locked. Explanations remain deterministic multiple-choice. This reduces prompting but does not measure arbitrary free-form reasoning.

A wrong causal hypothesis cannot earn verified completion even if the learner subsequently runs the correct repair and makes the endpoint healthy. The learner must reset, collect/retain the required pre-repair observations, lock the correct causal class, repair, verify and explain. Commands for one incident cannot mutate another incident's state.

Permission mechanism notes keep explicit assumptions that parent-directory traversal, ACL/SELinux and other configuration are healthy. The TCP-service fixtures are simplified state machines, not a real kernel/network model; they omit firewall, namespaces, service-manager semantics, bind-address complexity and real socket behavior.

Persistence uses schema version 4 / Linux fixture version 4. v3 checkpoints are discarded because explicit order/step changed both state shape and assessment ordering semantics. Validator rejects order/step/scenario contradictions plus cross-case TCP tuples. Local completion and assignment are client-editable convenience only and are never trusted mastery/certification.

Current learning limitation: sequence position is no longer a deterministic answer key, but the mechanism question still presents a small multiple-choice set and the causal-class vocabulary remains known in advance. The next slice should require structured evidence linkage—for example selecting/attaching the specific process/socket observation that supports a causal claim—without pretending arbitrary prose can be objectively graded.
