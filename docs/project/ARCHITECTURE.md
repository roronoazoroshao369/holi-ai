# Architecture

Next.js App Router / React / TypeScript. app/page.tsx renders curriculum and the client terminal. lib/linux-simulator.ts is a pure per-attempt state machine; no subprocess or network execution. React owns ephemeral attempt state. Refresh resets the fixture; no persistence or identity yet.

Future execution boundary: browser → learning API → authenticated lab gateway → disposable isolated runtime → verifier. The web host never executes learner commands.
See ../DEVOPS_PLATFORM_ARCHITECTURE.md for the longer baseline. docs/plan is historical film planning, not active architecture.

