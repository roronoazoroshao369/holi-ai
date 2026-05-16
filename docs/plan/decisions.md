# Holi-AI — Locked architectural decisions

These answers turn the open questions in `v4-providers.md §2` (and `v5-hollywood.md §11`) into **scaffold inputs**. They are written here once and referenced from every PR description that follows.

## Locked (Q1 – Q7) — drive M1 / P0 scaffold

| # | Question | **Decision** | Implication |
|---|---|---|---|
| **Q1** | Single-user or multi-tenant? | **Single-user, no auth in M1** | No Supabase Auth. No RLS. Schema still keeps a nullable `user_id` column for future-proofing, but it is never set in M1. |
| **Q2** | BYOK only, or Holi-managed keys? | **BYOK-only** | Every secret in the DB belongs to the user. No proxy / passthrough billing. No "trial credit" feature. |
| **Q3** | How to encrypt secrets at rest? | **AES-256-GCM in the app, master key in `MASTER_ENCRYPTION_KEY` env var** | `packages/providers/crypto.ts` does encrypt/decrypt. Supabase Vault is *not* used in M1 (left as a future swap behind the same interface). |
| **Q4** | What happens when an account hits its budget? | **Soft-warn at 80 %, hard-stop at 100 %** | UI shows a yellow badge from 80 % on; router refuses to dispatch via that account once `budget_used_usd >= budget_limit_usd`. Hard-stop fails over to the next account in the chain. |
| **Q5** | Fallback ordering on error / rate limit / budget exhaustion | **Same provider → other accounts first, then a different provider** | Router's candidate sort: `(provider == preferred_provider DESC, priority ASC, last_used_at ASC)`. Cross-provider fallback only kicks in after every healthy account of the primary provider has been exhausted. |
| **Q6** | Multi-account load strategy | **Every strategy is a toggle on `/settings/routing`** — `priority` (default), `round_robin`, `cheapest`, `sticky`, plus per-capability overrides | `routing_policies.strategy` enum supports all four. UI exposes a global toggle and per-capability override. |
| **Q7** | Agent framework | **No framework. Custom workflow runtime: typed step functions + DB state machine** | Replaces v3's choice of Mastra. See `v4-providers.md §5.6`. Adds two tables (`workflow_runs`, `workflow_step_runs`) and a `packages/workflows` package. |

## Knock-on consequences (collected in one place)

1. **No Mastra in dependencies.** No `@mastra/*` packages. We use the Vercel AI SDK directly for LLM calls and wrap it in our own adapters under `packages/providers/adapters/`.
2. **The workflow runtime is small but real code.** ~400–600 LOC for: workflow definitions, step registry, runner loop, retry policy, approval-gate pause/resume, idempotency keys, parallel branches. This lives in `packages/workflows/` and is exercised by every agent.
3. **Approval gates are first-class in the state machine.** A step with `kind: 'approval'` parks the `workflow_run` in state `paused` with `paused_reason = 'awaiting_approval'`. The UI looks for these and renders a Review screen. Resume = a row insert plus a runner notify.
4. **Async media jobs (Runway, fal) are also first-class.** A step with `kind: 'async-job'` submits the job, persists `provider_jobs.external_id`, parks the run with `paused_reason = 'awaiting_job'`. Webhook (or poller) flips the job row to succeeded → runner picks up → continues the workflow.
5. **Settings page is not optional for M1.** Because everything is BYOK and there is no env-only fallback path past P0, `/settings/providers` must ship by end of W2.
6. **Cost ledger ships in P0**, not P3. We need it earlier than the v3 plan suggested so the budget check in Q4 has data to work with.

## What is *out* of scope because of these decisions

- Supabase Auth, RLS, team invites, multi-tenant billing.
- "Holi-AI managed key" feature (we never proxy our own credit).
- Mastra agents, LangGraph workflows, Inngest / Trigger.dev queues.
- Any non-AES encryption backend in M1.
- A "soft only" budget mode and a "hard-stop only" mode — we always do both thresholds.

## Open (Q8 – Q14) — drive M5 / feature ladder, NOT YET LOCKED

These come from `v5-hollywood.md §11`. They do **not** block M1 / P0 scaffold (M1 sits inside whatever lane / genre / cast we eventually pick), but they **do** block F1 onwards. Defaults below are proposals — user must confirm or override before F0 ends.

| # | Question | **Default proposal** | If overridden, what changes |
|---|---|---|---|
| **Q8** | Lane (stylized animation vs photoreal live-action) | **Stylized animation (anime-leaning)** — tận dụng AI strength 2026, né uncanny valley | Adapter defaults in `cinematographer` and `painter` swap; `style.bible.lane` toggle; no workflow change |
| **Q9** | Target finished length at M5 | **Feature 60–90 min via ladder F0 → F5** | Adjust F-phase milestones; budget cap recalculation |
| **Q10** | Genre M1 | **Drama character-driven, dialogue moderate, fantasy nhẹ** | Different shot-list grammar; different gap-list to avoid (e.g. action genre needs Wonder-Dynamics-style hybrid) |
| **Q11** | Casting strategy | **100 % synthetic personas** (no real-person clone) | Voice clone workflow + likeness-license gating only needed if changed |
| **Q12** | Music & score | **AI-only (Suno + ACE-Step), leitmotif workflow** | Adds licensing module if AI + library or AI + human composer is chosen |
| **Q13** | Distribution target at M5 | **YouTube 4K + festival DCP-lite** (no theatrical Atmos) | Master spec branches (5.1 / Atmos / DCP / HDR) |
| **Q14** | Hard budget cap per feature pilot | **$5 000** (inclusive of retakes) | Recalibrate per-scene budget caps in `routing_policies.cost_cap_usd` |

> When any of Q8–Q14 are locked, move the row up into the "Locked" table, add a knock-on entry below, and bump the relevant section in `v5-hollywood.md`.

## How to change a decision later

Open a PR that:
1. Updates the relevant row in this table.
2. Adds a "knock-on consequences" entry describing the migration.
3. Bumps the affected sections in `v4-providers.md` and / or `v5-hollywood.md`.

Every PR that touches the provider / routing / workflow / bible / film-unit layer should link back to this file.
