# Learning model

The current practice sequence has three fixed SIMULATED incidents across two causal families.

1. Guided file access: nginx worker `www-data` receives HTTP 403 for a root-owned file mode 600. Learner collects HTTP symptom, file mode and worker identity, records a `permission` hypothesis, applies the minimal public-page read repair and verifies HTTP. The mechanism explanation is other-read.
2. Permission transfer: `report-worker` is a supplementary member of group `web`. Copying the memorized 644 repair makes HTTP healthy but fails least-access assessment; 640 is required because the report is group-private. The mechanism explanation is group-read.
3. Unfamiliar OS/network incident: the health client cannot connect to 127.0.0.1:8080. Learner must collect client symptom, process state and socket-listener evidence before typing a causal class. The hidden fixture has a process listening on a different port; a `process` hypothesis cannot complete the incident even if the learner later applies the superficially correct repair. A `network` hypothesis plus exact verification is required.

LabState now distinguishes observations from inferred conclusions. The hypothesis is typed rather than selected from a dropdown, but only the known classes `permission`, `process` and `network` are accepted. Explanations remain deterministic multiple-choice. This reduces prompting; it does not measure arbitrary free-form reasoning.

Learner-facing scenario title/summary must reveal the symptom and evidence categories, not hidden fixture facts. The listener port and process observation are exposed only when the learner runs the corresponding simulated evidence commands. A regression test protects against reintroducing answer-leaking copy.

Permission mechanism notes distinguish UID/GID access classes and keep explicit assumptions that parent-directory traversal, ACL/SELinux and other configuration are healthy. The listener fixture is likewise simplified: it is not a real kernel/network model and omits firewall, namespaces, service-manager and bind-address complexity.

Persistence uses schema version 2 / Linux fixture version 2. Reset clears observations, hypothesis and repair state for the current fixture. A valid checkpoint resumes across refresh; full restart returns to guided practice. Corrupt, stale, v1 or impossible checkpoints start clean; unavailable storage remains ephemeral. Local completion is client-editable convenience only and is never trusted mastery/certification.

Current transfer limitation: three known scenarios can still be memorized, and scenario 3 can eventually become synonymous with the `network` keyword. The next learning slice should create same-symptom competing causes—preferably process absent versus wrong listener port—so discriminating evidence, not fixture identity, determines the hypothesis.
