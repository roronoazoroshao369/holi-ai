# Holi-AI — v4: Multi-Provider / Multi-Account architecture

> Tiếp nối v3 (film-first). Tài liệu này **chỉ** tập trung vào câu hỏi:
> *"Làm thế nào để Holi-AI quản lý nhiều nhà cung cấp AI khác nhau, nhiều tài khoản cho mỗi nhà cung cấp, định tuyến / fallback / theo dõi chi phí thông minh?"*
>
> Repo `roronoazoroshao369/holi-ai` đang rỗng → đặt nền móng đúng từ ngày đầu.

> **Decisions locked.** 7 câu hỏi (§2) đã được trả lời. Xem [`decisions.md`](decisions.md). Những thay đổi quan trọng nhất so với bản nháp đầu tiên:
> - **Single-user, không auth M1** (Q1)
> - **BYOK-only** (Q2)
> - **AES-256-GCM tầng app** (Q3)
> - **Soft-warn 80 % + hard-stop 100 %** (Q4)
> - **Fallback same-provider trước, cross-provider sau** (Q5)
> - **Mọi chiến lược định tuyến đều bật/tắt được ở `/settings/routing`** (Q6)
> - **Bỏ Mastra. Tự viết workflow runtime** (Q7)

---

## 1. Core facts (những gì đã biết chắc)

1. **Repo trống** — greenfield, được tự do chọn cấu trúc.
2. **Domain = pipeline phim AI** (đã chốt v3). Stack sau khi áp Q7:
   - Frontend/API: **Next.js 15 App Router**
   - ~~Agent framework Mastra~~ → **Custom workflow runtime** (typed step functions + DB state machine)
   - DB: **Supabase Postgres + pgvector**
   - Storage: **Cloudflare R2**
   - Render: **Remotion + FFmpeg**
3. **Số provider phải hỗ trợ** ngay từ M1:
   - LLM: Anthropic, Google Gemini, OpenAI *(tuỳ chọn: OpenRouter, AWS Bedrock, Azure OpenAI)*
   - Image: fal.ai (Flux Kontext / Schnell), OpenAI gpt-image-1, Google Imagen
   - Video i2v/t2v: Runway (Gen-4 Turbo, Veo qua gateway), fal.ai (Wan 2.2, Kling 2.5, HunyuanVideo)
   - TTS: fal.ai (viF5-TTS), ElevenLabs, OpenAI TTS
   - Music: fal.ai (ACE-Step, MusicGen), Suno
   - STT: OpenAI Whisper, fal Whisper
4. **Yêu cầu của user**:
   - Quản lý **nhiều provider** trong UI.
   - Mỗi provider có thể có **nhiều account** (nhiều API key — cá nhân / công ty / free-trial / dự phòng).
   - Có thể chuyển / định tuyến giữa account-provider.
5. **Đặc thù vận hành**:
   - Provider media (Runway, fal) là **async job** (submit → poll/webhook). Không phải request/response đồng bộ kiểu LLM.
   - Một số provider yêu cầu thêm metadata (org_id, region, project_id, AWS creds…), không chỉ một `api_key`.
   - Cost tính bằng đơn vị khác nhau: token, giây video, ảnh, ký tự, lần gọi.
6. **Bằng chứng kỹ thuật đã verify**:
   - Vercel AI SDK có `customProvider` + `createProviderRegistry` để gom nhiều provider/key — [docs](https://ai-sdk.dev/docs/ai-sdk-core/provider-management).
   - LiteLLM Proxy (Python) hỗ trợ virtual keys, budget, credential routing, fallback chain — [docs](https://docs.litellm.ai/docs/proxy/virtual_keys).

---

## 2. Câu hỏi đã trả lời

Xem [`decisions.md`](decisions.md). Để truy vết lịch sử, đây là bản gốc:

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Single-user hay multi-tenant? | Single-user, không auth M1 |
| Q2 | BYOK hay managed? | BYOK-only |
| Q3 | Mã hoá secret? | AES-256-GCM, master key trong env |
| Q4 | Khi vượt budget? | Soft-warn 80 % + hard-stop 100 % |
| Q5 | Fallback order? | Same provider khác account → khác provider |
| Q6 | Load balance? | Toggle tất cả chiến lược trong `/settings/routing` |
| Q7 | Agent framework? | Bỏ framework, custom workflow runtime |

---

## 3. Bài toán: 5 cách giải, đánh giá thẳng

### Cách A — *AI SDK only* (Vercel AI SDK + `createProviderRegistry`)
Mỗi provider LLM tạo instance riêng (một API key/instance), gom vào registry, gọi qua id `anthropic:claude-sonnet-4`. Media → tự code lẻ.

- **Pros**: TS-native, streaming + tools sẵn, ít code nhất cho LLM.
- **Cons**: Không có model cho media job dài (Runway, fal queue). Không có budget/ledger. Multi-account = phải instantiate nhiều `customProvider` thủ công ở build-time, **không quản lý ở runtime qua DB**.

### Cách B — *LiteLLM Proxy* (Python sidecar)
Chạy LiteLLM như service riêng. App TS gọi vào LiteLLM (giao diện OpenAI-compatible). LiteLLM lo: virtual key, budget, fallback, cost log, credential routing.

- **Pros**: Battle-tested. Virtual key + budget + retry + fallback đều có. Hỗ trợ 100+ provider.
- **Cons**: Một service Python phụ phải deploy/maintain. Media (image/video/audio) hỗ trợ không đều, đặc biệt async job. **Quá nặng cho M1 cá nhân.**

### Cách C — *Custom Provider Registry* (tự viết toàn bộ)
Tự định nghĩa `Provider` interface theo **capability** (`llm.chat`, `image.edit`, `video.i2v`, `audio.tts`…), mỗi vendor một adapter, router riêng, DB cho account/policy/ledger.

- **Pros**: Toàn quyền. Cover media chuẩn.
- **Cons**: Phải tự viết adapter LLM (mất công làm streaming, tool-call, prompt caching).

### Cách D — *Hybrid* ✅ (chọn)
- **LLM adapter**: bọc `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai` → tận dụng streaming/tools/prompt-cache.
- **Media adapter**: tự code (fal SDK, Runway SDK, ElevenLabs SDK) — vì AI SDK không cover async job đàng hoàng.
- **Router** chung, capability-typed, đọc account/policy từ Supabase, ghi `usage_ledger`.
- **Workflow runtime** gọi router qua step function — workflow không biết provider nào, chỉ biết "cho tôi `image.edit`".

→ Vừa được streaming/tools miễn phí, vừa toàn quyền media, vừa multi-account first-class. Code không nhiều hơn C đáng kể.

### Cách E — *OpenRouter + custom media*
Dùng OpenRouter làm cổng duy nhất cho LLM (một key, nhiều model), media tự code.

- **Pros**: Khỏi quản nhiều LLM key.
- **Cons**: Mất multi-account, mất tính năng provider-specific (Anthropic prompt cache, Gemini caching), bị markup giá, **không tận dụng được credit có sẵn ở Anthropic/Google**.

### Bảng so sánh

| Tiêu chí | A: AI SDK only | B: LiteLLM proxy | C: Custom registry | **D: Hybrid (chọn)** | E: OpenRouter+media |
|---|:-:|:-:|:-:|:-:|:-:|
| Multi-account per provider | ⚠️ build-time | ✓ virtual keys | ✓ runtime DB | ✓ runtime DB | ✗ |
| Multi-provider LLM | ✓ | ✓ | ✓ | ✓ | ⚠️ chỉ qua OR |
| Media (image/video/audio) | ✗ DIY anyway | ⚠️ kém | ✓ | ✓ | ✓ |
| Cost ledger | ✗ | ✓ | ✓ | ✓ | ⚠️ basic |
| Fallback chain | thủ công | ✓ | ✓ | ✓ | thủ công |
| Khối lượng code | nhỏ nhất | nhỏ (config) | **lớn nhất** | trung bình | trung bình |
| Phải deploy thêm service | không | **có** | không | không | không |
| Khoá per-vendor tính năng | thấp | thấp | thấp | thấp | **cao** |

---

## 4. Recommendation: Cách D (Hybrid)

### Lý do chốt
1. Pipeline phim **đa modal** → không có công cụ off-the-shelf nào (AI SDK / LiteLLM / OpenRouter) cover hết cả LLM lẫn async media job. Phải có abstraction riêng dù chọn cách nào.
2. AI SDK trưởng thành cho LLM → tận dụng. Đừng phát minh lại streaming + tool calling.
3. Multi-account, ledger, budget, policy là yêu cầu của user → first-class entity trong DB, không phải config file.
4. M1 cá nhân, không muốn dựng thêm service Python (LiteLLM). Khi thực sự cần (multi-team, audit nặng) → có thể chuyển sau dễ dàng vì interface đã chuẩn.
5. Q7 chốt không dùng framework → workflow runtime là **của mình**, gọi router cũng là **của mình**. Toàn TypeScript, ít lớp magic.

### Confidence
- **High** với core architecture (provider registry + capability adapter + router + ledger).
- **Medium** với chi tiết Runway/fal async job (cần test thực tế webhook vs polling).
- **Low** với cost estimate trước khi gọi (nhiều provider không công khai pricing chính xác per-request — phải đối chiếu `usage` thực tế từ response).

---

## 5. Thiết kế chi tiết

### 5.1 Capability (đơn vị abstraction lõi)

```ts
type Capability =
  | 'llm.chat'      | 'llm.embed'
  | 'image.gen'     | 'image.edit'
  | 'video.t2v'     | 'video.i2v'
  | 'audio.tts'     | 'audio.music'  | 'audio.stt';
```

> Workflow step **không gọi tên provider**. Step yêu cầu **capability** + optional hint. Router chọn provider+account+model.

### 5.2 Database schema (Supabase Postgres)

```sql
-- 1) Catalog tĩnh (seed JSON, có thể user override)
create table providers (
  slug          text primary key,         -- 'anthropic'|'openai'|'google'|'fal'|'runway'|'elevenlabs'|'openrouter'|...
  display_name  text not null,
  capabilities  text[] not null,          -- ['llm.chat','image.edit',...]
  auth_kind     text not null,            -- 'api_key'|'oauth'|'aws_creds'
  base_url      text,
  docs_url      text,
  status        text default 'active'
);

create table provider_models (
  id            uuid primary key default gen_random_uuid(),
  provider_slug text not null references providers(slug),
  model_id      text not null,            -- 'claude-sonnet-4', 'gen4_turbo', 'flux-kontext'
  capability    text not null,            -- 1 dòng / capability (1 model có thể có nhiều dòng)
  pricing       jsonb not null,           -- {kind:'token'|'second'|'image'|'char', input, output, unit, currency}
  context_window int,
  flags         jsonb default '{}'::jsonb,-- {streaming, tools, vision, audio, async_job, reference_images}
  status        text default 'active',
  unique (provider_slug, model_id, capability)
);

-- 2) Account của user (multi-account đây)
create table provider_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid,                  -- nullable M1 (single-user), bắt buộc khi multi-tenant
  provider_slug    text not null references providers(slug),
  label            text not null,         -- 'Personal Anthropic', 'Office Card', 'Free Trial #2'
  encrypted_secret bytea not null,        -- AES-256-GCM ciphertext
  secret_iv        bytea not null,        -- per-row IV
  secret_tag       bytea not null,        -- GCM auth tag
  secret_kind      text not null default 'api_key',
  extra            jsonb default '{}'::jsonb,  -- {org_id, region, project_id, base_url_override}
  status           text not null default 'active',  -- 'active'|'disabled'|'exhausted'|'revoked'
  priority         int  not null default 100,       -- lower = pick first
  budget_period    text,                            -- 'monthly'|'daily'|null
  budget_limit_usd numeric(12,4),
  budget_used_usd  numeric(12,4) default 0,
  budget_warned_at timestamptz,                     -- ghi lần đầu chạm 80%
  reset_at         timestamptz,
  tags             text[] default '{}',
  notes            text,
  last_used_at     timestamptz,
  created_at       timestamptz default now()
);

create index on provider_accounts (provider_slug, status, priority);

-- 3) Routing policy (per capability hoặc per project)
create table routing_policies (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid,
  scope              text not null,        -- 'global'|'project'|'workflow'|'capability'
  scope_ref          text,                 -- project_id / workflow name
  capability         text,                 -- nullable = áp cho mọi capability của scope
  strategy           text not null default 'priority',  -- 'priority'|'cheapest'|'fastest'|'sticky'|'round_robin'
  preferred_models   text[] default '{}',  -- ['anthropic/claude-sonnet-4','google/gemini-2.5-pro']
  fallback_chain     uuid[] default '{}',  -- account_ids theo thứ tự
  excluded_accounts  uuid[] default '{}',
  cost_cap_usd       numeric(12,4),        -- cap per call
  retries            int default 1,
  created_at         timestamptz default now()
);

-- 4) Ledger (mỗi call ghi 1 dòng)
create table usage_ledger (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid,
  project_id         uuid,
  workflow_run_id    uuid,
  step_run_id        uuid,
  account_id         uuid references provider_accounts(id),
  provider_slug      text not null,
  model_id           text not null,
  capability         text not null,
  units              jsonb not null,       -- {input_tokens, output_tokens, seconds, images, chars}
  cost_estimate_usd  numeric(12,6),
  cost_actual_usd    numeric(12,6),
  latency_ms         int,
  status             text not null,        -- 'success'|'error'|'timeout'|'cancelled'
  error_code         text,
  request_id         text,
  meta               jsonb default '{}'::jsonb,
  created_at         timestamptz default now()
);
create index on usage_ledger (account_id, created_at desc);
create index on usage_ledger (project_id, created_at desc);

-- 5) Job (async) cho media — Runway/fal trả task id, ta poll/webhook
create table provider_jobs (
  id                 uuid primary key default gen_random_uuid(),
  account_id         uuid references provider_accounts(id),
  provider_slug      text not null,
  capability         text not null,
  external_id        text not null,        -- task id của provider
  status             text not null,        -- 'queued'|'running'|'succeeded'|'failed'|'cancelled'
  input              jsonb not null,
  output             jsonb,
  ledger_id          uuid references usage_ledger(id),
  workflow_run_id    uuid,
  step_run_id        uuid,
  webhook_secret     text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (provider_slug, external_id)
);

-- 6) Workflow state machine (vì Q7 nói không dùng framework)
create table workflow_runs (
  id              uuid primary key default gen_random_uuid(),
  workflow_name   text not null,           -- 'film.generate'
  project_id      uuid,
  input           jsonb not null,
  state           jsonb not null default '{}'::jsonb,  -- accumulator dùng giữa các step
  status          text not null default 'pending',     -- pending|running|paused|succeeded|failed|cancelled
  current_step    text,
  paused_reason   text,                    -- 'awaiting_approval' | 'awaiting_job' | 'awaiting_resource'
  paused_payload  jsonb,                   -- chi tiết cần để resume (approval form, job id…)
  error           jsonb,
  retries         int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table workflow_step_runs (
  id              uuid primary key default gen_random_uuid(),
  workflow_run_id uuid not null references workflow_runs(id) on delete cascade,
  step_name       text not null,
  attempt         int  not null default 1,
  idempotency_key text not null,           -- hash(workflow_run_id, step_name, attempt, input_hash)
  status          text not null,           -- pending|running|succeeded|failed|skipped
  input           jsonb,
  output          jsonb,
  ledger_ids      uuid[] default '{}',
  error           jsonb,
  started_at      timestamptz,
  finished_at     timestamptz,
  unique (workflow_run_id, step_name, attempt)
);
create index on workflow_step_runs (workflow_run_id, started_at);
```

### 5.3 Provider interface (TS, capability-typed)

```ts
// packages/providers/types.ts
export type Capability =
  | 'llm.chat' | 'llm.embed'
  | 'image.gen' | 'image.edit'
  | 'video.t2v' | 'video.i2v'
  | 'audio.tts' | 'audio.music' | 'audio.stt';

export interface CapRequest {
  'llm.chat':     { messages: ChatMsg[]; tools?: ToolDef[]; stream?: boolean };
  'image.edit':   { prompt: string; refImages: string[]; width?: number; height?: number };
  'video.i2v':    { startImage: string; prompt?: string; refImages?: string[]; durationSec: number };
  // ...
}
export interface CapResponse { /* mirror */ }

export interface DecryptedAccount {
  id: string;
  providerSlug: string;
  secret: string;          // plaintext only in-process
  extra: Record<string, unknown>;
}

export interface Provider {
  slug: string;
  capabilities: Capability[];
  // Có thể return CapResponse hoặc JobHandle nếu async
  invoke<C extends Capability>(
    capability: C,
    request: CapRequest[C],
    account: DecryptedAccount,
    modelId: string,
  ): Promise<CapResponse[C] | JobHandle>;

  estimateCost?(capability: Capability, modelId: string, request: any): number;
  pollJob?(jobId: string, account: DecryptedAccount): Promise<JobHandle>;
  ping?(account: DecryptedAccount): Promise<{ ok: boolean; modelCount?: number }>;
}
```

### 5.4 Router (áp dụng Q5 + Q4)

```ts
// packages/providers/router.ts
class Router {
  async dispatch<C extends Capability>(input: {
    capability: C;
    request: CapRequest[C];
    hints?: { projectId?: string; workflowName?: string; stepName?: string;
              preferredModel?: string; preferredAccountId?: string;
              maxCostUsd?: number };
  }): Promise<CapResponse[C]> {
    const policy = await this.policyResolver.resolve(input.capability, input.hints);
    const candidates = await this.candidateResolver.resolve({
      capability: input.capability,
      policy,
      hints: input.hints,
    });
    // candidates đã sort theo Q5: same provider trước, rồi mới provider khác
    // mỗi nhóm sort theo strategy của policy (Q6)
    for (const cand of candidates) {
      try {
        const result = await this.invokeWithLedger(cand, input);
        return result;
      } catch (err) {
        if (!isRetriable(err)) throw err;
        await this.markCandidateDegraded(cand, err);
        continue;
      }
    }
    throw new NoProviderAvailableError(input.capability);
  }
}
```

**Candidate resolution (đã áp Q5 + Q6)**:
1. Lọc `provider_accounts` theo `provider_slug ∈ providers_for(capability)` & `status='active'`.
2. **Q4**: lọc account có `budget_used_usd >= budget_limit_usd` (hard-stop). Account ở 80–100 % vẫn vào nhưng đánh dấu `warning=true`.
3. Áp `excluded_accounts`, áp `preferredAccountId` nếu có (skip sort).
4. **Group by provider_slug**, ưu tiên primary provider (`policy.preferred_models[0].split('/')[0]`).
5. Trong từng group, sort theo `policy.strategy` (Q6):
   - `priority` → `priority asc, last_used_at asc`
   - `cheapest` → `estimateCost asc`
   - `round_robin` → `last_used_at asc` (LRU)
   - `sticky` → đã từng dùng cho `projectId` này thì giữ
6. **Q5**: flatten groups theo thứ tự `[primary_provider_group, other_provider_groups…]`.
7. Trả về list. Router chạy lần lượt cho đến khi success hoặc hết.

### 5.5 Crypto (áp dụng Q3)

```ts
// packages/providers/crypto.ts — AES-256-GCM
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY = Buffer.from(process.env.MASTER_ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(plaintext: string): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { ciphertext, iv, tag: cipher.getAuthTag() };
}

export function decrypt(ciphertext: Buffer, iv: Buffer, tag: Buffer): string {
  const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
```
- Master key trong `MASTER_ENCRYPTION_KEY` env var, hex 32 bytes.
- Rotation script: đọc cả master key cũ + mới, re-encrypt từng row.
- Future option: thay implementation bằng Supabase Vault (`pgsodium`), interface giữ nguyên.

### 5.6 Workflow runtime (Q7 — thay thế Mastra)

**Tiêu chí thiết kế**
- Workflow viết bằng TypeScript thuần, không decorator, không runtime ẩn.
- Mỗi step là một function thuần `(input, ctx) => output`, có chữ ký rõ.
- State persist 100 % vào DB → restart server không mất gì.
- Hỗ trợ 4 loại step: `sync`, `async-job`, `approval`, `parallel`.
- Idempotency mặc định, retry policy per-step.

**Code:**

```ts
// packages/workflows/types.ts
export type StepKind = 'sync' | 'async-job' | 'approval' | 'parallel';

export interface StepContext {
  workflowRunId: string;
  stepName: string;
  attempt: number;
  state: Record<string, unknown>;
  setState: (patch: Record<string, unknown>) => Promise<void>;
  router: Router;        // truy cập capability dispatcher
  pause: (reason: 'awaiting_approval' | 'awaiting_job' | 'awaiting_resource',
          payload: Record<string, unknown>) => never;
}

export interface Step<I, O> {
  name: string;
  kind: StepKind;
  retries?: number;
  timeoutMs?: number;
  execute: (input: I, ctx: StepContext) => Promise<O>;
}

export interface Workflow<TInput, TOutput, TState = Record<string, unknown>> {
  name: string;
  steps: ReadonlyArray<Step<any, any>>;
  initialState: (input: TInput) => TState;
  finalize: (state: TState) => TOutput;
}
```

```ts
// packages/workflows/runner.ts
export class WorkflowRunner {
  async start<I, O>(wf: Workflow<I, O>, input: I): Promise<string /* run id */> { /* insert workflow_runs row */ }

  async tick(runId: string): Promise<void> {
    // 1. SELECT FOR UPDATE SKIP LOCKED on workflow_runs
    // 2. find current step (cursor in state machine)
    // 3. dispatch by kind:
    //    - sync       → invoke execute, persist output, advance
    //    - approval   → call ctx.pause('awaiting_approval', form) and return
    //    - async-job  → call ctx.pause('awaiting_job', { provider_job_id })
    //    - parallel   → fan-out child rows, wait for all
    // 4. on failure: increment attempt, schedule retry / fail run
  }

  async resume(runId: string, action: ResumeAction): Promise<void> {
    // Approval form submitted, or job webhook arrived, or manual retry
    // → update workflow_runs.status = 'running' and re-tick
  }
}
```

**Pause / resume semantics**

| Step kind | Pause | Resume trigger |
|---|---|---|
| `sync` | không pause | — |
| `approval` | `status='paused'`, `paused_reason='awaiting_approval'`, `paused_payload={form, defaults}` | UI POST `/api/workflows/:id/approve` |
| `async-job` | `status='paused'`, `paused_reason='awaiting_job'`, `paused_payload={provider_job_id}` | Webhook `/api/webhooks/runway` (hoặc fal) flip `provider_jobs.status='succeeded'` → enqueue tick |
| `parallel` | parent `status='running'`, đợi children xong | mỗi child xong → trigger tick |

**Workflow film.generate (M1) ví dụ**

```ts
export const filmGenerate: Workflow<FilmBrief, FilmDeliverable> = {
  name: 'film.generate',
  initialState: (input) => ({ brief: input }),
  finalize: (s) => ({ mp4Url: s.finalMp4Url!, captions: s.captionsUrl! }),
  steps: [
    director,             // sync — capability: llm.chat
    approvalShotList,     // approval — user duyệt shot list
    parallel([writer, painter, voicePlan, composerPlan]),  // sync hoặc async-job
    approvalKeyframes,    // approval
    cinematographer,      // async-job (mỗi shot là async, có thể nest parallel)
    voice,                // async-job
    composer,             // async-job
    editor,               // sync (FFmpeg local)
  ] as const,
};
```

UI hiển thị step nào đang ở `approval` → render form, user confirm → resume.

### 5.7 Budget enforcement (áp dụng Q4)

- **Reset cycle**: cron daily kiểm `reset_at`. Khi `now >= reset_at` → reset `budget_used_usd = 0`, `budget_warned_at = null`, tính lại `reset_at = now + 1 period`.
- **Warning**: trong `invokeWithLedger`, sau khi cộng `cost_actual_usd`, nếu `budget_used_usd >= 0.8 * budget_limit_usd` & `budget_warned_at IS NULL` → set `budget_warned_at = now()` + emit notification (UI badge, optional email).
- **Hard-stop**: `candidateResolver` lọc account có `budget_used_usd >= budget_limit_usd`. Nếu mọi account fail vì budget → router throw `BudgetExhaustedError` (vs `NoProviderAvailable`).
- **Per-call cap**: `policy.cost_cap_usd` chặn ở estimate phase.

---

## 6. UI/UX cho việc quản lý nhiều provider + account

### 6.1 `/settings/providers`
- Mỗi provider hiển thị card: số account, tổng budget, tổng đã dùng, capabilities.
- Click → list account: label, key bị che (`sk-ant-***xyz`), status, priority drag, "Test connection", "Edit", "Disable", "Delete".
- Nút **Add account** → modal:
  - Provider (dropdown đã seed)
  - Label (free text, gợi ý: "Personal", "Work card", "Free trial 2")
  - Secret (input password, có nút show/hide)
  - Extra fields tuỳ provider (`org_id` cho OpenAI, `region` cho Bedrock, `project_id` cho Google Cloud, …)
  - Priority (number, default 100)
  - Budget cap (USD/month, optional)
  - Tags (multi-input)
  - Notes (textarea)
- "Test connection" gọi adapter `ping()` → trả về model list hoặc 401.

### 6.2 `/settings/routing` (mở rộng theo Q6)
- Tab **Global**: per-capability dropdown chọn strategy (`priority`/`cheapest`/`fastest`/`sticky`/`round_robin`).
- Tab **Per-workflow**: override cho `film.generate` etc.
- Tab **Per-project**: override cho từng phim đang làm.
- Drag-and-drop để sắp xếp `fallback_chain` (kéo account-A lên trên account-B).
- Per-capability checkbox: "Cho phép cross-provider fallback?" (mặc định ON).

### 6.3 `/usage`
- Stacked bar chart: chi phí theo ngày × provider.
- Filter: time range, provider, account, project, capability.
- Bảng chi tiết: từng ledger row, click → mở request/response.
- Nút export CSV.

### 6.4 `/studio/[projectId]`
- Mỗi shot/asset hiển thị "Generated by: Anthropic / Claude Sonnet 4 (Personal) — $0.12 — 4.2s".
- Cho phép **Override** provider cho re-generate: dropdown account.
- Mỗi workflow run hiện step graph, paused step nhấp nháy chờ approval.

---

## 7. Repo layout đề xuất (monorepo pnpm)

```
holi-ai/
├── apps/
│   └── web/                              # Next.js 15 App Router
│       └── app/
│           ├── (studio)/
│           │   └── projects/[id]/...
│           ├── settings/
│           │   ├── providers/page.tsx
│           │   ├── routing/page.tsx
│           │   └── accounts/page.tsx
│           ├── usage/page.tsx
│           └── api/
│               ├── providers/test/route.ts
│               ├── providers/accounts/route.ts
│               ├── workflows/[id]/approve/route.ts
│               ├── workflows/[id]/tick/route.ts
│               ├── webhooks/runway/route.ts
│               ├── webhooks/fal/route.ts
│               └── studio/...
├── packages/
│   ├── core/                             # types, errors, zod schemas, constants
│   ├── providers/
│   │   ├── registry.ts
│   │   ├── router.ts
│   │   ├── crypto.ts
│   │   ├── ledger.ts
│   │   ├── budget.ts
│   │   ├── policy.ts
│   │   ├── jobs.ts                       # async job poller / webhook receiver
│   │   └── adapters/
│   │       ├── anthropic.ts
│   │       ├── google.ts
│   │       ├── openai.ts
│   │       ├── openrouter.ts
│   │       ├── fal.ts
│   │       ├── runway.ts
│   │       ├── elevenlabs.ts
│   │       └── _seed-models.ts
│   ├── workflows/                        # CUSTOM WORKFLOW RUNTIME (Q7)
│   │   ├── types.ts
│   │   ├── runner.ts
│   │   ├── tick.ts
│   │   ├── parallel.ts
│   │   ├── approval.ts
│   │   ├── async-job.ts
│   │   └── definitions/
│   │       ├── film-generate.ts
│   │       ├── director.step.ts
│   │       ├── writer.step.ts
│   │       ├── painter.step.ts
│   │       ├── cinematographer.step.ts
│   │       ├── voice.step.ts
│   │       ├── composer.step.ts
│   │       └── editor.step.ts
│   ├── pipeline/                         # remotion + ffmpeg compose
│   ├── db/                               # supabase client + migrations + types
│   └── ui/                               # shared shadcn/ui components
├── infra/
│   └── supabase/
│       └── migrations/
│           ├── 001_init.sql
│           ├── 002_providers.sql
│           ├── 003_routing.sql
│           ├── 004_ledger.sql
│           ├── 005_jobs.sql
│           └── 006_workflows.sql
├── docs/
│   └── plan/
│       ├── v3-film-first.md
│       ├── v4-providers.md
│       └── decisions.md
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 8. Lộ trình triển khai (xen với roadmap film v3, đã update cho Q7)

| Phase | Tuần film v3 | Phạm vi | Output |
|---|---|---|---|
| **P0** | W1 (scaffold) | Migrations 001–006, `crypto`, `Provider` interface, `Router` (priority + same-provider fallback theo Q5), adapter Anthropic + fal + Runway, seed model catalog, **workflow runtime skeleton (sync + approval kind)** | Director step gọi Claude qua router, key đọc từ DB; workflow `film.generate` chạy được 2 step đầu (Director → Approval shot list) |
| **P1** | W2 (Painter) | UI `/settings/providers` add/list/test connection, mã hoá secret (AES-GCM), mask UI, ledger basic, **`async-job` + `parallel` kind trong workflow** | User nhập key qua UI, Painter step submit fal job, paused → webhook resume |
| **P2** | W3 (Cinematographer) | Webhook Runway/fal verify signature, retry/timeout, fallback chain (Q5), **`/settings/routing` toggle (Q6)**, per-call cost cap | "Account A 429 → tự nhảy sang Account B (same provider) → cuối cùng sang fal Wan 2.2" |
| **P3** | W4 (Voice/Composer/Editor) | `/usage` dashboard, per-shot provider override trong Studio, **budget reset cron + 80% warning + 100% hard-stop (Q4)** | Bạn nhìn được tiền tiêu mỗi ngày, ép provider cho từng shot, không lo vượt budget |
| **P4** | W5 (polish) | Health monitor (auto-disable trên streak 401/429), Vault adapter (giữ interface, sau), key rotation script, OpenRouter adapter, Bedrock adapter, workflow visualisation (step graph UI) | Resilient + bảo trì dễ |

---

## 9. ~~Quyết định mặc định~~

> ~~Default fallback section.~~ **Đã chốt trong [`decisions.md`](decisions.md).** Section này không còn áp dụng.

---

## 10. Không-làm-gì-cả (out of scope M1)

- Multi-tenant SaaS đầy đủ (Supabase Auth + RLS + invite team).
- Holi-AI managed keys (resell credit).
- Khoản chi phí real-time per-token streaming display (lấy từ `usage` ở message end là đủ).
- LiteLLM proxy. Khi nào tự host cần thật → vẫn có thể thêm là 1 adapter.
- OAuth provider (Google sign-in vào provider account). M1 chỉ API key.
- **Mastra / LangGraph / Inngest / Trigger.dev** — Q7 bỏ. Workflow runtime là code của mình.

---

## 11. Bước tiếp theo

1. PR này merge → repo có docs làm reference.
2. Mở **PR P0** theo §8: monorepo scaffold + migrations 001–006 + `packages/providers` skeleton + `packages/workflows` skeleton + adapter Anthropic / fal / Runway + seed model catalog.
3. Vẫn không cần secret để scaffold — adapter có placeholder fallback đọc env nếu DB rỗng (chỉ dùng để smoke test local).
4. Sau khi PR P0 merge → mở PR P1: UI `/settings/providers`.

User cấp 3 key (Anthropic + fal + Runway) bất kỳ lúc nào sau P1 để bắt đầu chạy thật.
