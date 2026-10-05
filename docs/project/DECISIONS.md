# Decisions

2026-10-05: persist Linux practice locally before adding accounts. Use a versioned localStorage checkpoint with schema and fixture versions, strict state invariants and derived completion flags. Restore only structurally valid checkpoints for the current fixture; discard corrupt/stale/impossible data. Storage failure degrades to ephemeral practice with an explicit retry path. Persist state, not terminal transcript. Client progress remains forgeable and must never become trusted mastery or certification. Reset retries the current fixture; a separate full restart returns to guided practice.

2026-10-05: complete a narrow Linux learning slice before adding persistence or real execution. Transfer changes the identity/group relation, not merely the filename. Keep all state ephemeral and explicitly untrusted; use deterministic access-class questions without claiming to assess arbitrary prose. World-readable guided repair applies to a public page only; private group-scoped transfer requires 640. Browser test is reproducible via tests/learning-flow.browser.cjs with an external Playwright runtime; default CI still covers pure tests/typecheck/audit/build.

2026-10-05: Continue existing PR #4 rather than duplicate the unmerged platform. Main remains authoritative; old film docs retained as history.
Use npm lockfile + npm ci; typecheck, behavioral tests, dependency audit and production build in CI.
Patch Next 15.5 within its current minor and React 19.1 within its current minor. Override PostCSS 8.5.28 and sharp 0.35.5 because registry audit still identifies vulnerable transitives in Next's dependency constraints; revalidate after framework updates, prefer upstream fixes when available.
Replace fixed terminal responses with a pure state machine. Require pre-repair evidence and post-repair HTTP verification for practice completion. This is pedagogical guidance, not tamper-proof mastery; client state is untrusted.
Keep real execution disabled and defer persistence/auth until learning assessment exists.

