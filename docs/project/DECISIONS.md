# Decisions

2026-10-05: Continue existing PR #4 rather than duplicate the unmerged platform. Main remains authoritative; old film docs retained as history.
Use npm lockfile + npm ci; typecheck, behavioral tests, dependency audit and production build in CI.
Patch Next 15.5 within its current minor and React 19.1 within its current minor. Override PostCSS 8.5.28 and sharp 0.35.5 because registry audit still identifies vulnerable transitives in Next's dependency constraints; revalidate after framework updates, prefer upstream fixes when available.
Replace fixed terminal responses with a pure state machine. Require pre-repair evidence and post-repair HTTP verification for practice completion. This is pedagogical guidance, not tamper-proof mastery; client state is untrusted.
Keep real execution disabled and defer persistence/auth until learning assessment exists.

