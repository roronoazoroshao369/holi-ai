# Holi DevOps Lab

> Learn DevOps from fundamentals to production by diagnosing and repairing systems — not by memorizing commands.

This repository is being repurposed from the earlier Holi-AI film-planning experiment into a **DevOps learning platform**.

## Current slices — Linux and Git/CI simulated practice

Four SIMULATED incidents cover file-access and same-symptom TCP-service diagnosis. Learners collect before-repair command/output snapshots, lock a causal hypothesis, repair minimally, verify the endpoint and submit source-linked facts plus a two-source mechanism. Two bounded changed-evidence gates now test different causal relations: the private-report case holds `root:web` at mode `640` while hypothetically removing the worker from group `web`; the wrong-listener case holds process presence fixed while hypothetically moving the listener to the client target. These are finite deterministic rubrics, not free-form prose grading or trusted mastery.

Versioned localStorage (practice schema 7 / Linux fixture 5) restores valid snapshots, drafts, both counterfactual states and randomized differential assignments after refresh. Schema-v6 and older incompatible checkpoints or internally inconsistent states are discarded. Client state is inspectable and forgeable; current-case reset preserves assignment, full restart chooses a fresh assignment, and storage failure falls back to ephemeral practice.

Production Chromium regression is mandatory in CI. `@playwright/test` is exact-pinned at 1.63.0 in the repository dependency graph and package lock, so `npm ci` and the normal high-severity npm audit cover the mandatory Node-side browser test runtime. CI installs the Chromium revision selected by that locked Playwright version and runs the local binary after `npm run build`; Playwright owns production startup/readiness/cleanup on loopback port 3100. CI explicitly checks out the exact PR head and asserts its identity before installing/testing. The suite explicitly exercises both differential orderings.

The current implementation contains:

- Next.js + TypeScript application shell
- DevOps curriculum skeleton from Linux → CI → Docker → Kubernetes → IaC/Cloud → Observability/SRE
- Responsive learning-oriented landing page
- Interactive deterministic Linux incident simulator
- SIMULATED Git/CI artifact handoff, Git revision acceptance and integration graph diagnosis with changed path/tag/linear-history transfers
- Architecture plan for moving from simulation to isolated real execution labs
- Explicit security constraints for learner-controlled workloads

Git/CI adds artifact producer/consumer diagnosis and a mechanically green release with unmet acceptance. Revision practice requires checkout/ref/build/intent evidence, immutable source-linked diagnosis/rationale before repair, minimal revision repair, explicit consumed-SHA verification, linked explanation and annotated-tag commit transfer. Git/CI checkpoint uses schema 4 / fixture 4 and discards v3 and older; Linux remains 7/5. Eleven production Chromium tests cover Linux, artifact, revision and graph learning/persistence/storage failure. Integration graph practice requires ordered approved-base/PR-head parents; its changed linear-history transfer instead requires base ancestry and the reviewed fixture change series. Everything remains SIMULATED and client-local, never certification.

## Run locally

```bash
npm ci
npm run dev
```

Then open http://localhost:3000.

For a production compile:

```bash
npm run build
```

## Verification

Run `npm run typecheck`, `npm test`, `npm audit --audit-level=high` and `npm run build`. CI runs the same checks, installs Chromium through the locked local Playwright runtime, then executes `./node_modules/.bin/playwright test --config=playwright.config.cjs`.

Read [project state](docs/project/PROJECT_STATE.md) and [roadmap](docs/project/ROADMAP.md) before continuing implementation. Simulator progress is local and untrusted; compatible checkpoints survive refresh.

## Product direction

The learning loop is:

```
MODEL → OBSERVE → HYPOTHESIZE → ACT → VERIFY → EXPLAIN → PREDICT
```

A learner should not pass because they watched content. The current local practice gate requires diagnosis, minimal repair, verification, linked explanation and two narrow causal predictions using different relations. Both fixed perturbations remain visible and memorizable, so passing them does not establish general competence or authoritative mastery.

## Lab strategy

### v0.1 — deterministic simulator

The browser terminal in the first slice is intentionally a simulator. It is useful for teaching diagnostic order and command semantics cheaply and safely.

### Next — real isolated labs

Real Linux/Docker/Kubernetes commands require a separate sandbox control plane. The web application must never execute arbitrary learner commands directly on its host.

Non-negotiable controls include CPU/memory/PID/storage/time quotas, restricted networking, disposable state, no privileged workloads, no host Docker socket, audit events and hard TTL cleanup.

See [docs/DEVOPS_PLATFORM_ARCHITECTURE.md](docs/DEVOPS_PLATFORM_ARCHITECTURE.md).

## Near-term build order

1. Learning domain model: course/module/lesson/scenario/mastery
2. Lesson + checkpoint UI
3. Scenario engine and evidence-based grading
4. Local practice continuity (delivered); server persistence/auth only if justified
5. Ephemeral Linux sandbox service
6. Docker lab runtime
7. Kubernetes lab runtime
8. IaC/cloud, observability, SRE, security and capstone tracks

## Legacy documents

The existing `docs/plan/` files belong to the previous AI-film concept. They are retained as historical documents; they are **not** the specification for the current product.





