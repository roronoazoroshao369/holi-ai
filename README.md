# Holi-AI

> AI film-generation studio — single brief in, short film out.

This repo is in **planning phase**. No application code yet — only the architecture and roadmap documents that shape the build.

## Current plan

| Doc | Purpose |
|---|---|
| [`docs/plan/v3-film-first.md`](docs/plan/v3-film-first.md) | Product north star — film-first M1 scope (60 s short), pipeline, cost model, week-by-week roadmap |
| [`docs/plan/v4-providers.md`](docs/plan/v4-providers.md) | Architecture for managing many AI providers and many accounts per provider — capability registry, router, custom workflow runtime |
| [`docs/plan/v5-hollywood.md`](docs/plan/v5-hollywood.md) | Long-horizon vision — one person + AI building a complete, Hollywood-grade feature film. Hierarchical 5-tier (Film → Act → Sequence → Scene → Shot), department system, bibles, episodic ladder F0 → F5 |
| [`docs/plan/decisions.md`](docs/plan/decisions.md) | Locked answers (Q1–Q7) and open questions (Q8–Q14) that drive the scaffold |

## What this thing does (one paragraph)

User writes a 2-line brief ("60-second short film about the Little Match Girl, set in winter Hanoi"). A chain of automated steps — Director → Writer → Painter (Character Bible + keyframes) → Cinematographer (image-to-video with reference consistency) → Voice + Composer → Editor — turns it into a finished MP4 with VO, subtitles, and music. Three approval gates let the human steer before money is spent on the expensive video generation step.

## Why "multi-provider, multi-account" matters

The pipeline spans LLM, image, video, TTS, music, and STT — no single vendor covers all of it well. The user needs to plug in their own Anthropic / Google / OpenAI / fal.ai / Runway / ElevenLabs keys, often **more than one key per provider** (free-tier rotation, personal vs work card, fallback). The architecture in `v4-providers.md` makes provider accounts a first-class entity with priority, budget, status, and a router that picks the right account/model per capability.

## Stack (locked)

- **Next.js 15** (App Router) — UI + API
- **TypeScript** throughout — single language
- **Supabase Postgres + pgvector** — data, state, embeddings
- **Cloudflare R2** — asset storage
- **Remotion + FFmpeg** — programmatic video compose
- **Vercel AI SDK** — LLM calls (Anthropic, Google, OpenAI direct adapters)
- **Custom adapters** — fal.ai, Runway, ElevenLabs (async-job providers)
- **Custom workflow runtime** — typed step functions + DB state machine (no Mastra / LangGraph / Inngest in M1)
- **AES-256-GCM** — secret encryption, master key in env

## Status

### M1 — Short film (v3 + v4 scope)

| Phase | What | Status |
|---|---|---|
| Plan | v3 film-first + v4 multi-provider | merged (PR #1) |
| P0 | Monorepo scaffold, migrations, provider package skeleton | next |
| P1 | UI for provider accounts | after P0 |
| P2 | Async job runner + fallback chain | after P1 |
| P3 | Usage dashboard + per-step override | after P2 |
| P4 | Polish (health monitor, key rotation) | last |

See `docs/plan/v3-film-first.md` §4 and `docs/plan/v4-providers.md` §8 for the detailed week-by-week plan.

### M5 — Hollywood-grade feature (v5 scope)

| Phase | What | Deliverable | Status |
|---|---|---|---|
| F0 | Hierarchical tables + Bible CRUD + pick-take UI | demo MP4 5 s w/ ref bible | after P0–P2 |
| F1 | Teaser 60–90 s through v5 hierarchy | parity with v3 quality | — |
| F2 | Short 5 min + continuity check capability | 5 scene / ~60 shot | — |
| F3 | Episode 15 min + sound design + score | 3-act compressed | — |
| F4 | Short feature 30 min + trailer-first workflow | "pilot episode" | — |
| F5 | Feature 60–90 min | full feature, $1–2k | — |

See `docs/plan/v5-hollywood.md` §9 for the F-ladder details and §11 for the seven new decisions still to lock.

## Contributing

Solo project for now — single user, BYOK, no auth. See `docs/plan/decisions.md` for why.
