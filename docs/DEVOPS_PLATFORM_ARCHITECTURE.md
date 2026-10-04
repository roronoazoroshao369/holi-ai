# Holi DevOps Learning Platform — Architecture v0.1

## Product thesis

Holi should not be a video-course library with a terminal skin. The core learning loop is:

**MODEL → OBSERVE → HYPOTHESIZE → ACT → VERIFY → EXPLAIN**

A learner passes a skill only when they can diagnose a changed scenario, not when they finish a video or memorize a command.

## Feasibility

### Straightforward
- Structured A–Z curriculum
- Interactive lessons, quizzes and progress tracking
- Deterministic browser simulation
- Scenario engine, hints, scoring and mastery gates
- Accounts, cohorts, instructor/admin surfaces

### Hard but feasible
- Real shell / Docker / Kubernetes labs in browser
- Per-user isolated environments
- Fast reset/snapshot
- Cost controls and capacity scheduling
- Safe networking and abuse prevention

### Do not fake
A browser terminal is not automatically a "real lab". The v0.1 UI intentionally labels the first implementation a simulator. Real execution enters only after an isolation threat model and resource budget exist.

## Delivery slices

### Slice 0 — product shell (current PR)
- Next.js application
- A–Z curriculum skeleton
- Landing/learning experience
- Deterministic Linux incident simulator
- Architecture baseline

### Slice 1 — learning engine
- Course/module/lesson/scenario domain model
- Lesson reader + checkpoints
- Scenario state machine
- Evidence-based grading
- Progress/mastery persistence
- Authentication

### Slice 2 — real Linux labs
- Ephemeral sandbox service
- One environment per lab attempt
- CPU/memory/PID/disk/time quotas
- No privileged containers
- Read-only base image + disposable overlay
- Restricted egress
- Command/event audit log
- Hard TTL + cleanup controller

### Slice 3 — Docker/Kubernetes labs
- Docker concepts first via controlled daemon or purpose-built simulator
- Kubernetes via namespaced disposable clusters / virtual clusters where economics justify it
- Broken-state fixtures and idempotent reset
- Automated verification scripts

### Slice 4 — production DevOps
- Terraform/IaC
- CI/CD
- Cloud/IAM
- Observability
- SRE/incident response
- Security/supply-chain
- Capstones that combine multiple systems

## Recommended architecture

```
Web (Next.js)
  |
  +-- Learning API
  |     +-- curriculum
  |     +-- mastery/progress
  |     +-- scenario orchestration
  |
  +-- Lab Gateway
        +-- session auth
        +-- terminal websocket
        +-- quota/TTL
        +-- verifier
              |
              +-- Sandbox Runtime
                    +-- Linux container labs
                    +-- Docker labs
                    +-- Kubernetes labs
```

Data plane and control plane should be separated. The web process must never directly run arbitrary learner commands on the application host.

## Security non-negotiables for real labs

1. Never run learner workloads privileged.
2. Never mount host Docker socket into learner environments.
3. Enforce CPU, memory, PID, storage, duration and network limits.
4. Default-deny access to control-plane/internal networks.
5. Treat every lab command as hostile input.
6. Destroy lab state after TTL; persist only pedagogical events/results.
7. Maintain known-good reset images and verification checks.
8. Instrument spend per session before scaling traffic.

## Pedagogy

Every module should contain:
- Mental model
- Minimal command/tool vocabulary
- Guided example
- Broken-system lab
- Explanation checkpoint ("why did this fix work?")
- Transfer lab with changed symptoms/context
- Mastery gate

Completion percentage is secondary. Mastery and ability to transfer are primary.
