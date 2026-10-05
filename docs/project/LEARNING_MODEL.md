# Learning model

The current practice sequence has four fixed SIMULATED incidents across two causal families.

1. Guided file access: nginx worker `www-data` receives HTTP 403 for a root-owned file mode 600. Learner collects HTTP symptom, file mode and worker identity, records a `permission` hypothesis, applies the minimal public-page read repair and verifies HTTP. The mechanism explanation is other-read.
2. Permission transfer: `report-worker` is a supplementary member of group `web`. Copying the memorized 644 repair makes HTTP healthy but fails least-access assessment; 640 is required because the report is group-private. The mechanism explanation is group-read.
3. Health differential case: client gets connection refused at 127.0.0.1:8080. Learner-facing title, summary, README and diagnostic commands do not disclose the hidden cause. Evidence shows the process exists but LISTENs on 9090, so a `network` hypothesis is required before reconfiguring the listener.
4. Competing health differential case: the learner sees the same title, summary, README, commands and initial connection-refused output. Evidence instead shows no api-server process and no owned LISTEN socket, so a `process` hypothesis is required before starting the service on 8080.

LabState distinguishes observations from inferred conclusions. TCP service state separately models process presence and listening port. The hypothesis is typed rather than selected from a dropdown, but only the known classes `permission`, `process` and `network` are accepted. Repair syntax stays hidden until the hypothesis is locked. Explanations remain deterministic multiple-choice. This reduces prompting but does not measure arbitrary free-form reasoning.

A wrong causal hypothesis cannot earn verified completion even if the learner subsequently runs the correct repair and makes the endpoint healthy. The learner must reset, collect/retain the required pre-repair observations, lock the correct causal class, repair, verify and explain. Commands for one incident cannot mutate another incident's state.

Permission mechanism notes keep explicit assumptions that parent-directory traversal, ACL/SELinux and other configuration are healthy. The TCP-service fixtures are simplified state machines, not a real kernel/network model; they omit firewall, namespaces, service-manager semantics, bind-address complexity and real socket behavior.

Persistence uses schema version 3 / Linux fixture version 3. v2 checkpoints are discarded because both TCP state shape and assessment sequence changed. Validator rejects cross-case tuples such as process-absent state under the wrong-listener scenario. Reset clears observations/hypothesis/repair state for the current fixture; full restart returns to guided practice. Local completion is client-editable convenience only and is never trusted mastery/certification.

Current transfer limitation: the two differential cases share learner-facing identity, but they still appear in a fixed sequence. A repeated learner can eventually map sequence position to `network` then `process` without using the evidence. The next learning slice should remove that position signal with an explicit persisted/counterbalanced case-order assignment that remains deterministic under test. After that, reduce the remaining multiple-choice explanation prompt.
