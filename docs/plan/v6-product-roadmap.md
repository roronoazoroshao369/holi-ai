# Holi-AI — v6: Product roadmap + "đang đi đúng hướng?" health framework

> Tiếp nối v3 (60 s short), v4 (multi-provider), v5 (Hollywood-grade feature-length). Tài liệu này trả lời **hai câu hỏi vận hành**:
>
> 1. **Sản phẩm cuối cùng làm được gì?** — end-product capability matrix tại v1.0 + user journey end-to-end của showrunner.
> 2. **Làm sao biết project đang đi đúng hướng?** — versioned roadmap v0.1 → v1.0 với *exit gates* concrete, plus health signals (green / yellow / red) đo được ở mỗi phase.
>
> Không có quyết định mới phải lock ở đây. Đây là **bản đồ** — ghép P0–P4 (M1) và F0–F5 (M5) thành một dòng version người dùng có thể tracking.

---

## 0. Tóm tắt một trang

| Câu hỏi | Trả lời ngắn |
|---|---|
| **Holi-AI v1.0 sẽ làm được gì?** | Một người ngồi trước laptop, viết logline → 3–6 tháng sau có MP4 4K của một bộ phim 60–90 phút, stylized animation (default) hoặc photoreal (per-shot opt-in qua `lane = 'mixed'`), với dialogue, foley, music score, color grade, master DCP-lite. Cost projection ~$1–2k (không cap). |
| **v1.0 sẽ KHÔNG làm được gì?** | Live-action photoreal full-feature (chờ tooling), real-time / interactive, multi-user / team collab, Atmos / 5.1 / IMAX, voice clone người thật (Q11 lock), auto-dub đa ngôn ngữ (chỉ subtitle multi-lang). |
| **Đang đi đúng hướng nghĩa là gì?** | Mỗi phase ship một deliverable *thật* (xem được, nghe được, share được), exit gates *binary* (đạt = qua / không đạt = ở lại phase), và 4 health signals ổn định: consistency drift score, render reliability, cost-vs-projection error, showrunner UX flow. |
| **Tracking version nào ngay bây giờ?** | **v0.0** — vẫn ở giai đoạn plan. Code chưa start. v0.1 sẽ là deliverable đầu tiên sau khi P0 + P1 + P2 + P3 + P4 (v4) xong. |
| **v0.1 sẽ ship khi nào?** | Khi P0–P4 của v4 done. Wall-clock estimate: 6–8 tuần solo. v0.1 = "1 brief → 1 phim 60 s end-to-end, qua workflow runtime của Q7, BYOK". |
| **v1.0 sẽ ship khi nào?** | Sau v0.1, leo qua F0 → F5 (v5 §9). Wall-clock estimate: 4–9 tháng tiếp theo solo. Total từ bây giờ tới v1.0: ~6–11 tháng — nếu tooling 2026 không tụt và không đập kiến trúc. |
| **Khi nào dừng?** | Q9 đã lock = open-ended ladder. Có thể dừng ở v0.5 (15 min episode) hoặc v0.8 (30 min pilot) nếu đã đủ "good enough" cho mục tiêu sáng tạo. v1.0 = aspirational ceiling, không phải hard contract. |

---

## 1. North star — end-product capability matrix

### 1.1 User persona

**Showrunner solo** (single-user, Q1 đã lock):
- Là **người ra quyết định sáng tạo**, không phải technician.
- Không viết code. Không cấu hình GPU. Không touch FFmpeg CLI.
- Ngồi trước Holi-AI Studio (Next.js web app), bibles + dailies + cut + deliver là 4 surface chính họ dùng.
- BYOK (Q2): user dán key vào `/settings/providers` rồi quên.
- Có thể là người không-biết-code (designer, biên kịch, hobbyist) — UI phải đủ để vận hành toàn bộ pipeline.

### 1.2 Capabilities matrix tại v1.0 (= M5 / F5)

| Layer | v1.0 phải làm được | Đo bằng |
|---|---|---|
| **Story** | Brief tự nhiên (1–3 câu) → logline → 3-act outline → script chia scene → shot list | Khoảng 70 % shot generated từ AI, 30 % human-curated; user approve từng cấp |
| **Bibles** | Story / Character / World / Style / Voice / Costume Bible, có ref portrait + voice fingerprint per character | Mỗi char xuất hiện > 5 shot phải có Bible; vision-LLM confirm > 90 % shot dùng đúng ref |
| **Casting** | 100 % synthetic personas (Q11): portraits 3-quarter / front / expression sheet; voice library voices (không clone người thật) | Mỗi nhân vật named có ≥ 3 ref portrait + 1 voice locked |
| **Cinematography** | Cinematographer agent chọn shot-type theo Story Bible, render keyframe → I2V; lane = stylized default, photoreal opt-in qua `lane = 'mixed'` (Q8) | Vision-LLM continuity check < 0.05 drift score frame-to-frame của cùng char |
| **Animation/VFX** | Image-to-video qua provider của lane đang chọn; consistency check qua reference adapter; LUT propagation toàn film | Render success rate ≥ 95 % không phải manual restart; LUT drift = 0 |
| **Sound** | TTS dialogue (synthetic voices), foley auto-generate từ scene description, ambient bed | Foley layer cover ≥ 80 % scene action; dialogue MOS ≥ 4.0 |
| **Music** | AI-only (Q12) Suno + ACE-Step với leitmotif per major char | Mỗi nhân vật named có ≥ 1 theme; theme tái xuất ≥ 3 lần trong feature |
| **Edit / Color / Master** | Remotion compose → FFmpeg encode → 4K YouTube master + DCP-lite festival master (Q13) | Output đúng spec: 3840×2160 P3 cho YouTube, J2K + WAV stereo cho DCP-lite |
| **Continuity** | Vision-LLM script supervisor agent so các shot kề nhau và shot cùng char, report drift | Continuity inbox catch ≥ 80 % manual-spotted drift trong test set 50 shot |
| **Approval / review** | Dailies queue với hotkey J/K/L, approve/reject/regen per shot | User reach inbox-zero per "shooting day"; < 6 vòng review/approval cho 1 feature |
| **Distribution** | Master export: YouTube 4K MP4 + DCP-lite (J2K image sequence + WAV stereo + XML) | Hai master pass automated QC check |
| **Workflow / ops** | Pause / resume / retry / fallback all transparent tới showrunner; multi-account multi-provider routing | Workflow runs survive provider outage; user không thấy 5xx |

### 1.3 Anti-features (v1.0 sẽ KHÔNG có)

| Không có | Lý do |
|---|---|
| Multi-user / team / collab | Q1 = single-user lock. Project trên 1 máy 1 người. |
| Live-action photoreal full-feature | Q8 = both lanes available nhưng tooling 2026 chưa đạt. Photoreal chỉ per-shot opt-in. |
| Real-time playback / interactive film | World-models (Genie 2) ngoài scope. |
| Atmos / 5.1 / IMAX master | Q13 = YouTube + DCP-lite only. |
| Voice clone người thật | Q11 = 100 % synthetic. |
| Auto multi-lang dub | Subtitle multi-lang OK; dub đợi M6. |
| Hybrid 2D-3D pipeline | v5 §12 — defer cho v6 product. |
| Theatrical-grade colour grade auto | Cần human pass trong DaVinci ở F5. |
| Marketplace / plugin store cho department agents | M5 single-user, không ecosystem. |
| Account migration / multi-org | Q1 lock. |

---

## 2. End-to-end user journey ở v1.0

Đây là **walkthrough** showrunner làm 1 bộ feature 90 min từ trắng tới MP4. Mục đích: bạn (và mình) xem journey này, hỏi "đây có phải sản phẩm bạn muốn?" — đó là cách validate v1.0 spec.

### 2.1 Walkthrough — 90 min drama character-driven (Q10 default)

| # | User clicks / types | What Holi-AI does behind the scenes | Approximate wall-clock human time | Approximate AI compute |
|---|---|---|---|---|
| 1 | "New Project" → paste 200-word logline → pick genre `drama` → pick lane default `stylized` | Bootstrap project, create empty bibles, prefill Style Bible from genre preset | 5 min | — |
| 2 | "Generate Story Bible" → review act outline, edit beats → approve | Writer agent (Claude Opus 4) drafts logline → 3-act → 12 sequences → 40–60 scenes | 2–4 hr (review-heavy) | 30 min |
| 3 | "Build Character Bibles" — for each named character | Casting agent + Painter agent generate portraits + voice sample per char (100 % synthetic per Q11) | 1–2 hr per char × 5–10 chars | 1 hr |
| 4 | "Build World Bible" — locations / props / vibe | World agent generates location plates + prop library; user picks favorites | 2–3 hr | 1 hr |
| 5 | "Lock Style Bible" — moodboard, LUT, lens, aspect ratio | Style agent proposes pastel palette / motion grammar / font kit; user picks | 1–2 hr | 30 min |
| 6 | "Generate script" — full screenplay scene-by-scene | Writer agent fleshes outline → screenplay (~120 page); user reads + edits | 1–2 day (read-through + edits) | 2 hr |
| 7 | "Storyboard" — per scene, generate keyframes | Cinematographer agent picks shot types + composes keyframes via Flux | 1 hr / 10 scene (approve) | 4 hr / 10 scene |
| 8 | "Render shots" — start production queue | Workflow runtime dispatches I2V per shot (Runway Gen-4 / Wan / Veo 3 hero); per-lane routing per Q8 | — (background) | 1–2 hr / minute finished video |
| 9 | "Review dailies" — daily inbox, approve / reject / regen with hotkey J/K/L | Vision-LLM continuity agent flags drift; user accept/reject/queue regen | 30 min / 5 min finished film | 0–4 hr regen turnaround |
| 10 | "Record dialogue" → AI generates TTS pass for all dialogue lines | TTS agent uses Voice Bible (ElevenLabs library voices); script supervisor catches mis-reads | 1 hr / 30 min finished | 1 hr |
| 11 | "Foley + ambient" → AI generates per scene | Sound designer agent (ElevenLabs SFX + foley library) | 30 min / 30 min finished | 1 hr |
| 12 | "Score" → composer agent generates leitmotif themes + cues | Composer agent (Suno + ACE-Step per Q12), leitmotif per char, cue list per scene | 2 hr / feature | 30 min |
| 13 | "Cut" → Editor agent assembles rough cut in Remotion timeline | Pacing agent times reactions; user adjusts cuts in cut UI | 1 day / feature | 2 hr |
| 14 | "Color grade" → Colorist agent applies LUT + per-scene tweaks | LUT propagation across all shots; vision-LLM check coherence | 4 hr / feature | 1 hr |
| 15 | "Mix" → AudioMix agent balances dialogue / music / foley | Auphonic-grade auto mix; user nudges levels | 4 hr / feature | 30 min |
| 16 | "Master" → Delivery agent exports YouTube 4K + DCP-lite | Encoder agent runs FFmpeg presets; QC agent checks loudness, color, sync | 1 hr / feature | 4 hr |
| **Total** | | | **~90 hr human** ≈ 2 tuần full-time hoặc 2 tháng part-time | **~3 hr AI / min** ≈ 270 hr GPU parallel |

Wall-clock = 3–6 tháng (do *parallel review batches*, không phải tuần tự).

### 2.2 4 surface user thực sự dùng

UI có nhiều route nhưng showrunner sống ở 4 chỗ:

1. **`/studio/[proj]/bible/...`** — pre-production. Build Story / Char / World / Style / Voice / Costume bible. Heavy approval-gate.
2. **`/studio/[proj]/dailies`** — production loop. Inbox shot mới render → J/K/L approve/reject/regen. Lặp đi lặp lại nhiều tuần liên tục.
3. **`/studio/[proj]/cut`** — post. Remotion preview, cut list editor.
4. **`/studio/[proj]/deliver`** — final. Master + QC report + export.

Mọi thứ khác (`/script`, `/board`, `/timeline`, `/continuity`, `/mix`) là *tabs phụ* — showrunner mở khi cần debug / điều chỉnh.

### 2.3 Cost / time breakdown từ §10 v5 (tham chiếu)

90 min stylized feature:
- **Cost projection** ~$1 000–2 000 (Q14 = no cap; đây là projection, không phải budget).
- **Wall-clock human** ~90 hr work.
- **Wall-clock total** 3–6 tháng (do review-batches + render queues + tooling latency).

---

## 3. Versioned roadmap v0.1 → v1.0

Đây là **bản đồ thật** để bạn tracking. Mỗi version có *deliverable concrete* (xem được, share được) và *exit gate* binary.

### 3.1 v0.0 — "Planning closed" (current)

| Field | Value |
|---|---|
| What | Plan docs đã PR + merge: v3, v4, v5, decisions Q1–Q14 |
| Exit gate | Q1–Q14 locked, README + plan/ folder complete, không còn open architectural decision blocking P0 |
| Status | ✅ **Đã đạt** sau khi PR #2 merged |
| What's left | Q15 (OSS access strategy) — open ở v7 §2, nhưng không block P0 |

### 3.2 v0.1 — "First short film end-to-end" (= M1 / P4 done)

| Field | Value |
|---|---|
| What | Brief → 60 s short film MP4. End-to-end via custom workflow runtime (Q7), provider registry, multi-account routing, BYOK. |
| Deliverable | 1 file `holi-ai-v0.1-demo.mp4` (60 s, ≤1080p, stylized) + repo running locally + Settings UI hoạt động |
| Phases included | P0 (monorepo + migrations + provider package) + P1 (Settings UI providers) + P2 (workflow runner + fallback) + P3 (usage dashboard + per-step override) + P4 (polish: health monitor, key rotation) |
| Exit gate | (1) brief → MP4 hoàn toàn từ UI không touch console. (2) Cost ledger ghi đủ chi tiết per-shot. (3) ≥ 1 provider fail-over thành công không cần restart workflow. (4) Total spend cho demo ≤ $10. |
| Wall-clock estimate | 6–8 tuần solo |
| Maps to v4 §8 | P0..P4 |
| Maps to v5 | — (v5 chưa active) |
| Health risk cao nhất | Workflow runtime bugs ở async-job pause/resume |

### 3.3 v0.2 — "Bible infrastructure + Teaser via hierarchy" (= F0 + F1)

| Field | Value |
|---|---|
| What | Hierarchical tables (Acts → Scenes → Shots) + Bible CRUD UI + 1 teaser 60–90 s render qua v5 hierarchy (parity với v3 quality) |
| Deliverable | 1 file `holi-ai-v0.2-teaser.mp4` (60–90 s) + Char Bible 1 nhân vật + Style Bible + pick-take UI hoạt động |
| Phases | F0 (backbone tables + Bible UI + new step kinds `subworkflow`/`iterator`) + F1 (teaser through hierarchy, re-use v3 capability) |
| Exit gate | (1) Char Bible ref portrait reused successfully trên ≥ 5 shot. (2) Teaser quality blind-test = v3 baseline ≥ 90 % similarity rating. (3) Workflow `subworkflow` step kind work với 2 levels nesting. |
| Wall-clock | 2–3 tuần sau v0.1 |
| Health risk cao nhất | Hierarchy migration phá v0.1 demo (cần backward compat) |

### 3.4 v0.5 — "Short + continuity check + episode" (= F2 + F3)

| Field | Value |
|---|---|
| What | 5 min short (~60 shot, ~5 scene) + 15 min episode (~150 shot, 3-act compressed) + continuity vision-LLM agent + sound design + music score with leitmotif |
| Deliverable | 1 file `holi-ai-v0.5-episode.mp4` (15 min, 3-act, scored, mixed) + continuity notes inbox + Voice/World/Sound/Music bibles |
| Phases | F2 (short 5 min + `vision.continuity` capability) + F3 (episode 15 min + sound design + score agent) |
| Exit gate | (1) Continuity agent catch ≥ 80 % drift trên 30-shot staged drift test. (2) Score has ≥ 5 cue per 15 min, leitmotif tái xuất ≥ 3 lần. (3) Visual char drift < 0.05 score trên test. (4) User reach inbox-zero trong < 2 hr per "shooting day". |
| Wall-clock | 6–9 tuần sau v0.2 |
| Health risk cao nhất | Continuity agent false-positive rate quá cao → user ignore inbox |

### 3.5 v0.8 — "Pilot episode 30 min + trailer-first" (= F4)

| Field | Value |
|---|---|
| What | 30 min "pilot episode" — first deliverable feel-like-a-feature. Trailer-first workflow: generate trailer 2 min trước, lock style, mở rộng 30 min. Dailies queue dedicated colorist agent. LUT propagation. Costume Bible per char. |
| Deliverable | 1 file `holi-ai-v0.8-pilot.mp4` (30 min) + trailer `holi-ai-v0.8-trailer.mp4` (2 min) + Costume Bibles |
| Phases | F4 |
| Exit gate | (1) Trailer-first workflow: generated trailer 2 min then 30 min feature, ≤ 8 hr human review total cho 30 min. (2) LUT identical (vision-LLM check pass) trên toàn 30 min. (3) Costume continuity ≥ 95 % shots per char. (4) Pilot score watchability ≥ 7/10 (vision-LLM critic + user blind rating). |
| Wall-clock | 6–8 tuần sau v0.5 |
| Health risk cao nhất | Trailer-first chỉ work cho stylized; nếu user opt photoreal hero shot trong pilot → adapter routing edge cases |

### 3.6 v1.0 — "First feature 60–90 min" (= F5)

| Field | Value |
|---|---|
| What | Feature 60–90 min. ~1 200 shot. Full department system active. VFX compositor agent. Mix workflow Auphonic-grade. Master deliver YouTube 4K + DCP-lite. |
| Deliverable | 1 file `holi-ai-v1.0-feature.mp4` (60–90 min, 4K) + DCP-lite folder (J2K + WAV + XML) + full QC report |
| Phases | F5 |
| Exit gate | (1) Pass automated QC: loudness LUFS within spec, color P3 OK, A/V sync zero drift, subtitle SDH + closed-caption OK. (2) Vision-LLM watchability ≥ 8/10. (3) ≤ 6 vòng review/approval total. (4) Render queue completion ≥ 95 % không cần manual restart. (5) Spend trong khoảng projection ±50 % (no cap per Q14, nhưng nếu lệch >100 % cần xem lại routing). |
| Wall-clock | 3–6 tháng sau v0.8 |
| Health risk cao nhất | Provider deprecation mid-render (giảm bằng multi-account + cross-provider fallback per Q5) + render time explosion với 1200 shots |

### 3.7 Bảng tổng (cheat-sheet)

| Version | Deliverable | Wall-clock from now | Cost (projection) |
|---|---|---|---|
| v0.0 | Plans merged | ✅ now | $0 |
| v0.1 | 60 s short MP4 + workflow runtime | 6–8 tuần | ~$10 demo |
| v0.2 | 60–90 s teaser qua hierarchy + bibles | +2–3 tuần | ~$15 |
| v0.5 | 15 min episode + continuity + score | +6–9 tuần | ~$200 |
| v0.8 | 30 min pilot + trailer-first | +6–8 tuần | ~$400 |
| v1.0 | 60–90 min feature + DCP-lite | +3–6 tháng | ~$1–2k |

Total from now → v1.0: **6–11 tháng wall-clock solo**. Có thể stop ở v0.5 hoặc v0.8 nếu đã đủ "good enough" cho intent (per Q9 = open-ended).

---

## 4. Health framework — "đang đi đúng hướng?" signals

Mỗi phase mình muốn bạn nhìn được 4 chỉ số. Nếu cả 4 đều green thì project on-track; nếu 1+ chuyển yellow trong 2 phase liên tiếp thì cần pause để fix; nếu 1+ red thì stop & reassess.

### 4.1 Signal 1 — Consistency drift

**Đo gì**: vision-LLM (Claude Sonnet 4 vision / Gemini 2.5 Pro) so 2 frame liền kề của cùng char, output drift score 0–1.

**Targets**:
- v0.2: < 0.10 trên 10-shot test (single char, single scene)
- v0.5: < 0.05 trên 30-shot test (single char, multi-scene)
- v0.8: < 0.05 trên 100-shot test + costume continuity ≥ 95 %
- v1.0: < 0.05 trên 500-shot test, prop drift < 5 % per scene

**Green** = đạt target. **Yellow** = miss bằng 20–50 %. **Red** = miss > 50 % hoặc agent false-positive > 30 %.

### 4.2 Signal 2 — Render reliability

**Đo gì**: % render workflows reach `succeeded` state without manual restart.

**Targets**:
- v0.1: ≥ 90 % cho 60 s short (≈ 15 shot)
- v0.5: ≥ 92 % cho 15 min episode (≈ 150 shot)
- v0.8: ≥ 95 % cho 30 min pilot (≈ 400 shot)
- v1.0: ≥ 95 % cho 90 min feature (≈ 1 200 shot) — equivalent ≤ 60 shot manual restart per feature

**Green** = đạt. **Yellow** = miss 5–10 %. **Red** = miss > 10 % hoặc có cluster failure cùng nguyên nhân (provider outage không fallback được).

### 4.3 Signal 3 — Cost-vs-projection error

**Đo gì**: `|actual_spend - projected_spend| / projected_spend`. Q14 = no cap, nhưng nếu projection lệch nhiều thì routing có vấn đề.

**Targets** (error budget):
- v0.1: < 30 % (small project, easy to estimate)
- v0.5: < 40 %
- v0.8: < 50 %
- v1.0: < 50 % (or trigger routing review)

**Green** = đạt. **Yellow** = error 50–100 %. **Red** = > 100 % (= spend gấp 2× projection mà không có lý do rõ ràng).

### 4.4 Signal 4 — Showrunner UX flow

**Đo gì**: thời gian từ "shot mới render xong" → "user approve/reject xong" trung bình per shot trong dailies queue.

**Targets**:
- v0.1: N/A (no dailies queue yet)
- v0.2: < 3 min per shot (10 shots → 30 min review session)
- v0.5: < 2 min per shot (150 shots → 5 hr review session, spread across days)
- v0.8: < 1.5 min per shot
- v1.0: < 1.5 min per shot (1200 shots → 30 hr cumulative review, ~1 hr/day for 1 tháng)

**Green** = đạt. **Yellow** = miss 30–50 %. **Red** = user bỏ inbox > 3 ngày (sign of UX collapse).

### 4.5 Health table cheat-sheet

| Signal | v0.1 | v0.2 | v0.5 | v0.8 | v1.0 |
|---|---|---|---|---|---|
| Drift | N/A | <0.10 | <0.05 | <0.05+ costume | <0.05+ prop |
| Reliability | ≥90 % | ≥90 % | ≥92 % | ≥95 % | ≥95 % |
| Cost error | <30 % | <30 % | <40 % | <50 % | <50 % |
| Review/shot | N/A | <3 min | <2 min | <1.5 min | <1.5 min |

Plus ở v0.1 thêm signal `auth/secret/key UX` — tỷ lệ user thành công add 1 BYOK provider lần đầu < 5 min không hỏi.

---

## 5. Red flags → stop & reassess

Đây là *tín hiệu rõ ràng* để dừng, không cố push:

| Red flag | Phase nó xuất hiện | Action |
|---|---|---|
| **Schema rework mid-phase** (workflow_runs / film_units / bibles cần ALTER + backfill complex) | F0–F2 | Dừng phase đang chạy, write migration plan, accept 1–2 tuần slip rồi mới resume |
| **Provider lock-in failure** (1 provider tử vong → tất cả workflow đứng > 4 hr) | bất kỳ | Audit `provider_accounts` table — phải có ≥ 2 provider khác đang up cho mỗi capability quan trọng. Nếu không, mở Q15 thật, lock OSS self-host fallback ngay |
| **Workflow runtime needs framework swap** | bất kỳ sau v0.1 | Đây là red-red: Q7 đã lock no-framework. Nếu cần Mastra/Inngest/Temporal lại thì viết PR-decision-revisit, không silent rewrite |
| **Continuity agent false-positive > 30 %** | F2 + | User mất niềm tin vision-LLM, ignore inbox. Tune threshold hoặc swap model trước khi tăng shot count |
| **Cost > 3× projection without identifiable cause** | bất kỳ | Audit ledger, có thể đang loop fail-retry không gated. Hot fix: thêm idempotency key + retry cap |
| **Render time > 5× projection** | F3 + | Provider rate-limit hoặc queue depth bị nghẹt. Cần round-robin (Q6 strategy toggle) thật sự work |
| **Showrunner drop daily review > 5 ngày** | F2 + | UX collapse. Pause render queue, fix Dailies UX (batch approvals, smart filter), không pump thêm shot |
| **Lane mismatch errors** (workflow gen photoreal shot vì `lane = 'mixed'` mis-routes) | F1 + | Audit `style.bible.lane` + `lane_to_models` resolution. Có thể cần unit test rõ ràng. |
| **Vietnam-specific characters / pronunciation broken** | F0 + | Voice / TTS provider không hỗ trợ tốt tiếng Việt. Cần evaluate F5-TTS / Kokoro multi-lang / VinAI alternatives — xem v7 §3.4 |

---

## 6. What "good" looks like — concrete vibes per milestone

Mục đích: bạn xem cái này, hỏi "đây có phải project tôi muốn?". Nếu không khớp, ta điều chỉnh roadmap.

### v0.1 — "Demo ngày 1"

Bạn show 1 friend cái laptop. Bấm "New Project", paste 1 brief 50 từ, đi pha cà phê. 30 phút sau quay lại, mở `/dashboard/projects/<id>/output.mp4`, chiếu lên TV. Friend thấy 1 phim ngắn 60 giây stylized, không cinematic-grade nhưng coherent, kể được 1 cảnh ngắn. Friend bảo "ok cute but rough". Bạn nhìn cost ledger: $8.40.

→ Project on track nếu vibe này attainable trong 6–8 tuần.

### v0.5 — "Demo cuối quý"

Bạn ngồi với friend khác. Lần này show 1 episode 15 phút. Stylized, 1 nhân vật chính tên Mai xuất hiện 50 % shot, không drift visible. Có 3 cue music với 1 theme tái xuất 3 lần. Friend bảo "wait, đây là Indie animation indie thật à? Anh làm 1 mình?". Bạn show ledger: $180.

→ Project on track nếu vibe này attainable trong ~4 tháng từ start.

### v1.0 — "Demo trailer launch"

Bạn upload 1 trailer 2 min lên YouTube unlisted, gửi link cho 10 friends. 7/10 reply "what the hell, anh làm 1 mình?". 3/10 hỏi "phim này chiếu rạp khi nào?". Bạn link Letterboxd vào blog post + share GitHub repo. Cost trên ledger: $1 700.

→ Project on track nếu attainable trong 6–11 tháng từ start.

---

## 7. How v6 connects to v3, v4, v5

| Doc | Vai trò trong picture |
|---|---|
| **v3** | Pipeline spec cho 60 s short. Defines what v0.1 ships. |
| **v4** | Multi-provider + workflow runtime + Q1–Q7 lock. Defines *how* v0.1 ships. P0–P4 phases. |
| **v5** | Long-horizon Hollywood-grade vision. Defines what v1.0 ships. F0–F5 phases. Q8–Q14 lock. |
| **v6 (this doc)** | Roadmap layer — version timeline v0.1 → v1.0, end-product capability matrix, health signals, red flags. **No new locked decisions.** |
| **v7** | OSS leverage map. Defines *what we can inherit* to make v0.1–v1.0 faster. New open question Q15. |
| **decisions.md** | Locked Q1–Q14 + Q15 open. |
| **README** | Entry table linking all of above + status tracker. |

→ Khi build, mình theo v4 §8 cho P0–P4, v5 §9 cho F0–F5. v6 là *bản đồ tracking* để biết đang ở đâu trên đường.

---

## 8. Câu hỏi mở (không blocking)

1. Có cần tracking dashboard real-time cho 4 health signals ở §4? Hoặc chỉ check manual mỗi cuối phase?
2. Đặt blind-test panel (bạn bè) sớm hay đợi v0.8 mới mời người ngoài xem? Sớm = signal mạnh hơn nhưng mất thời gian liên hệ.
3. v0.5 episode có nên public (YouTube unlisted) làm public commit signal? Hoặc giữ private cho tới v1.0?
4. Photoreal opt-in qua `lane = 'mixed'` — có nên kết hợp với automatic quality gate (auto-fall-back tới stylized nếu quality bar miss)? Defer tới F4.
5. Có nên dành budget thực để mua tooling commercial khi OSS không đủ (e.g. Veo 3 hero shot vs HunyuanVideo)? Q14 = no cap nên technically OK, nhưng UX cần show alternative cost.

---

## 9. Tóm lại — câu trả lời

> **"Sản phẩm cuối làm được gì?"**
> v1.0 = một người, vài tháng, ~$1–2k, MP4 60–90 min stylized (photoreal hero shots opt-in), dialogue + foley + score + master cho YouTube + DCP-lite festival.

> **"Đang đi đúng hướng không?"**
> Tracking 4 signals (drift / reliability / cost-error / review-flow) tại mỗi version v0.1 → v1.0. Green = on. Yellow = pause. Red (theo §5) = stop & reassess. Mỗi version có deliverable concrete để xem trực tiếp — không cần đo lường gián tiếp.

> **"Nếu muốn dừng giữa đường?"**
> Q9 đã lock open-ended. Stop ở v0.5 hoặc v0.8 hoàn toàn OK. v1.0 là aspirational ceiling, không phải commitment.
