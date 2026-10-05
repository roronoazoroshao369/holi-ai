# Holi DevOps Lab

> Learn DevOps from fundamentals to production by diagnosing and repairing systems — not by memorizing commands.

This repository is being repurposed from the earlier Holi-AI film-planning experiment into a **DevOps learning platform**.

## Current slice — Linux learning and transfer

The Linux exercise now includes HTTP/file/identity evidence, a pre-repair hypothesis, minimal repair, HTTP verification and access-class explanation. A second group-scoped fixture rejects copying the public-page repair. This is ephemeral, untrusted browser practice; reload resets it.

Production browser regression: start the built app with npm start, then run node tests/learning-flow.browser.cjs with Playwright installed externally. Optional environment variables: PLAYWRIGHT_MODULE, CHROMIUM_PATH, BASE_URL and SCREENSHOT_PATH. This suite is currently manual; CI runs the pure behavioral tests, typecheck, dependency audit and production build.

The current implementation contains:

- Next.js + TypeScript application shell
- DevOps curriculum skeleton from Linux → CI → Docker → Kubernetes → IaC/Cloud → Observability/SRE
- Responsive learning-oriented landing page
- Interactive deterministic Linux incident simulator
- Architecture plan for moving from simulation to isolated real execution labs
- Explicit security constraints for learner-controlled workloads

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

Run `npm run typecheck`, `npm test`, `npm audit --audit-level=high` and `npm run build`. CI runs the same checks.

Read [project state](docs/project/PROJECT_STATE.md) and [roadmap](docs/project/ROADMAP.md) before continuing implementation. Simulator practice is ephemeral and is not a mastery assessment; refresh resets it.

## Product direction

The learning loop is:

```
MODEL → OBSERVE → HYPOTHESIZE → ACT → VERIFY → EXPLAIN
```

A learner should not pass because they watched content. A learner passes when they can diagnose and repair a changed scenario and explain why the fix works.

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
4. User progress persistence/auth
5. Ephemeral Linux sandbox service
6. Docker lab runtime
7. Kubernetes lab runtime
8. IaC/cloud, observability, SRE, security and capstone tracks

## Legacy documents

The existing `docs/plan/` files belong to the previous AI-film concept. They are retained temporarily on this feature branch for history and safe rollback; they are **not** the specification for the new product and should be archived or removed once the repurpose PR is accepted.

