# Holi-AI — Locked architectural decisions

These answers turn the open questions in `v4-providers.md §2` and `v5-hollywood.md §11` into **scaffold inputs**. They are written here once and referenced from every PR description that follows.

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

## Locked (Q8 – Q14) — drive M5 / feature ladder

Locked from user's confirmation. These do **not** block M1 / P0 scaffold but they **do** drive F0 onwards.

| # | Question | **Decision** | Implication |
|---|---|---|---|
| **Q8** | Lane (stylized animation vs photoreal live-action) | **Both lanes are first-class in the workflow.** `style.bible.lane ∈ {'stylized' \| 'photoreal' \| 'mixed'}`; per-project (and per-scene when `mixed`) choice. Default lane at project create = `stylized` (because tooling is more reliable in 2026). | Routing policy gains `lane_to_models` map; `cinematographer` + `painter` adapters resolve preferred model by lane. UI shows lane indicator and allows per-scene override. M1 stays stylized — photoreal lane gets exercised in F1+ once a hero-shot opts in. |
| **Q9** | Target finished length at M5 | **Open-ended ladder.** No hard target length. Climb F0 → F1 → F2 → …; stop where the deliverable is "good enough" or where tooling caps out. F5 nominal = 60–90 min but is **not** a contract. | F-phase milestones described as capability gates, not length gates. Exit criteria in §9.1 stay; "and ≤ ngân sách $X" budget check is removed (see Q14). |
| **Q10** | Genre for the first pilot | **Drama character-driven, dialogue moderate, fantasy nhẹ** | Shot-list grammar leans long dialogue scenes + tableau; avoid the action / crowd / sustained-physical gap-list. |
| **Q11** | Casting strategy | **100 % synthetic personas** (no real-person voice or likeness clone) | Voice clone workflow is *not* wired in by default. Likeness-license / consent module is **out of scope** for v5. Char Bible never stores a real-person reference photo or voice sample. |
| **Q12** | Music & score | **AI-only (Suno + ACE-Step), leitmotif workflow** | Composer agent uses leitmotif theme per major character / location; no licensing module needed. |
| **Q13** | Distribution target at M5 | **YouTube 4K + festival DCP-lite** (no theatrical Atmos / IMAX) | Master spec stays in §8.1 `/deliver` route; Atmos / 5.1 are explicit out-of-scope. |
| **Q14** | Per-feature hard budget cap | **No project-level cap.** Quality > cost for the pilot. Q4's per-account hard-stop at 100 % budget **still applies** as the safety net. | `routing_policies.cost_cap_usd` defaults to `null` (unbounded). UI cost rail still computes and displays cumulative spend, but does **not** block. User explicitly accepts the risk of feature spend > $5k. |

## Knock-on consequences from Q8–Q14

7. **Style Bible carries a `lane` field.** Schema in `v5-hollywood.md §7.5` adds `lane: 'stylized' | 'photoreal' | 'mixed'` at the top of every Style Bible (`mixed` means the scene level overrides the project lane). Adapter resolution reads it before model selection.
8. **Per-lane model map.** `routing_policies` gains `lane_to_models` jsonb: e.g. `{ stylized: { 'video.i2v': ['runway:gen4-refs-anime','wan:v2'], 'image.edit': ['flux:schnell-anime'] }, photoreal: { 'video.i2v': ['veo:3','sora:2','runway:gen4'], 'image.edit': ['flux:kontext-photoreal','openai:gpt-image-1'] } }`. Showrunner can override per capability.
9. **Photoreal lane is not deferred to 2027.** Q8 explicitly opens both lanes now. We do **not**, however, build photoreal-only adapters in P0 — they are introduced in F1+ on demand. The workflow does not have to wait.
10. **No voice-clone provider in P0.** Because of Q11, the `audio.tts` capability adapters in P0 only ship synthetic voices (ElevenLabs v3 library voices, not Voice Clone). Voice Clone workflow is **removed from F2 deliverable** and pushed to backlog under "if Q11 ever flips".
11. **No project-level budget cap enforcement.** `routing_policies.cost_cap_usd` default = `null`. The per-account hard-stop from Q4 is the only enforced backstop. UI cost rail (`v5-hollywood.md §8.2`) is informational only — it never blocks a render.
12. **F-phase exit criteria drop the budget clause.** §9.1 "F5: ≤ ngân sách $5k" line is removed. Exit criteria become quality / capability gates only.

## What is *out* of scope because of these decisions (extended)

*(Existing v3+v4 out-of-scope items above still hold.)*

- Voice clone of real persons (Q11). No likeness-license module.
- AI + human composer collab pipeline (Q12). Pure AI music only.
- Theatrical Atmos / 5.1 master (Q13).
- Hard project-level cost cap UI (Q14). User accepts "spend until satisfied" risk.

## Open (Q15) — does NOT block P0 scaffold

Documented in `v7-oss-leverage.md §2`. Decision can wait until the first adapter that has both a paid-API and an OSS-via-aggregator candidate (`image.t2i` is the earliest, in P0).

| # | Question | **Default proposal** | If overridden, what changes |
|---|---|---|---|
| **Q15** | OSS access strategy primary | **API-first qua aggregator** (Replicate primary, fal secondary for video / music, Together for LLM open weights). Self-host (Runpod / Modal) only when (a) steady-state spend > $300/month for a single model AND (b) Q14 budget allows ops time, or (c) aggregator does not host the model we need. | Self-host primary → add `packages/providers/adapters/runpod-modal/`, add infra/devops sub-phase before F2, and write per-model Docker images. Fully self-host → CapEx GPU rather than OpEx aggregator; ops time becomes a recurring cost in v6 §4.3 cost-error budget. |

Reason the default is API-first: it lines up with Q1 (single-user, no DevOps) + Q2 (BYOK — user buys a Replicate/fal key the same way they buy an Anthropic key) + v6 v0.1 wall-clock target (6–8 weeks, no time to operate self-hosted GPUs). Adapter abstraction in `v4-providers.md §4` is capability-based, so swapping aggregator ↔ self-host for any single model is reversible without touching agents.

## How to change a decision later

Open a PR that:
1. Updates the relevant row in this table.
2. Adds a "knock-on consequences" entry describing the migration.
3. Bumps the affected sections in `v4-providers.md` and / or `v5-hollywood.md`.

Every PR that touches the provider / routing / workflow / bible / film-unit / lane layer should link back to this file.
