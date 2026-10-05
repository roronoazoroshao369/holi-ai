# Architecture

Next.js App Router / React / TypeScript. app/page.tsx renders curriculum and the client terminal. lib/linux-simulator.ts is a pure per-attempt state machine; no subprocess or network execution. React owns the active attempt. lib/practice-persistence.ts stores a versioned checkpoint in browser localStorage with schema version 1 and Linux fixture version 1. Restore validates LabState invariants plus derived completion flags; corrupt, stale or impossible checkpoints are discarded. If storage is unavailable the lab falls back to ephemeral state. Terminal transcript is intentionally not persisted. This client checkpoint is untrusted practice data, not authoritative mastery.

Future execution boundary: browser → learning API → authenticated lab gateway → disposable isolated runtime → verifier. The web host never executes learner commands.
Current learning state includes fixture ID, HTTP/file/identity observations, pre-repair hypothesis, repair provenance, HTTP verification and access-class explanation. Guided and transfer fixtures use distinct paths and identity/group relations. React unlocks transfer only after verified guided explanation. No durable or server-trusted mastery is claimed.
See ../DEVOPS_PLATFORM_ARCHITECTURE.md for the longer baseline. docs/plan is historical film planning, not active architecture.

