# Holi-AI — v3: FILM-FIRST plan

**Mục tiêu mới:** dồn toàn lực vào pipeline **phim ngắn**. Các modality khác (thơ độc lập, tranh độc lập, nhạc độc lập) → defer. Sản phẩm M1 là 1 video.

---

## 1. Vấn đề khó nhất khi làm phim AI = CONSISTENCY

Pipeline gen-video không khó. Khó nhất là **giữ nhân vật / địa điểm / phong cách nhất quán** qua các shot. Toàn bộ M1 phải xoay quanh giải quyết bài toán này.

### Vũ khí 2025 cho consistency

| Tech | Tác dụng | Giá / nguồn |
|---|---|---|
| **Runway Gen-4 References** (April 2025) | Upload tới 3 ảnh ref (character/location/object) → giữ nhất quán qua nhiều shot. **State-of-the-art** cho film-AI hiện tại. | Runway API: `gen4_turbo` 5 credits/s ≈ $0.05/s |
| **Flux.1 Kontext** (BFL, June 2025) | Image edit + storyboard: cùng nhân vật, đổi pose/cảnh, giữ identity qua nhiều turn. Best cho **sinh keyframe**. | fal.ai per-image, ~$0.025–0.05 |
| **Wan 2.2 / HunyuanVideo i2v** | Image-to-video open source, license Apache. Backup khi cần dài hoặc budget. | fal.ai per-second, rẻ hơn Runway |
| **Kling 2.5 reference mode** | Tới 3 phút, có ref. Cheap B-roll. | fal.ai |
| **Veo 3 / Sora 2** | Top quality + native audio. Đốt tiền cho hero shot. | Runway gateway `veo3` 40 credits/s = $0.40/s |

**Chiến thuật:** Flux Kontext sinh keyframe consistent → Runway Gen-4 Refs (5s/clip) image-to-video → stitch FFmpeg + voice + music.

---

## 2. Pipeline phim ngắn end-to-end

```
USER brief: "1 phim ngắn 60s về cô bé bán diêm phiên bản Hà Nội mùa đông"
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────┐
│ 🎬 DIRECTOR (Claude Sonnet 4 + extended thinking)         │
│  1. Logline + tone                                         │
│  2. Beat sheet (3 act / kishōtenketsu)                    │
│  3. Character Bible (tên, ngoại hình, costume, voice ID)  │
│  4. Location Bible (mood board prompt cho mỗi setting)    │
│  5. Shot list: [shot_id, scene, duration, camera, action, │
│      char_refs[], loc_ref, dialogue?, vo?, sfx?, music?]  │
│  6. 🛑 APPROVAL GATE → user duyệt trước khi đốt tiền       │
└───────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
       ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
       │ ✍️ WRITER     │   │ 🎨 PAINTER   │  │ 🎙️ VOICE      │
       │ Script + VO  │   │ (parallel)   │  │ (parallel)   │
       │ + dialogue   │   │ Char portrait│  │ (chờ script) │
       │ VN/EN        │   │ Location mood│  │              │
       │ (Claude)     │   │ Keyframe/shot│  │              │
       │              │   │ Flux Kontext │  │              │
       │              │   │ → asset/refs │  │              │
       └──────┬───────┘   └──────┬───────┘  └──────┬───────┘
              │                  │                 │
              └──────────┬───────┘                 │
                         ▼                         │
              ┌──────────────────────┐             │
              │ 🛑 APPROVAL keyframes│             │
              │ → user duyệt/regen   │             │
              └──────────┬───────────┘             │
                         ▼                         │
              ┌──────────────────────┐             │
              │ 🎥 CINEMATOGRAPHER   │             │
              │ Image-to-video each  │             │
              │ shot, dùng char_refs:│             │
              │ - Runway Gen-4 Turbo │             │
              │   (default: w/refs)  │             │
              │ - fal Wan 2.2 backup │             │
              │ - Veo 3 cho hero shot│             │
              │ (parallel queue)     │             │
              └──────────┬───────────┘             │
                         │                         │
                         │                         ▼
                         │              ┌──────────────────┐
                         │              │ Voice gen        │
                         │              │ - fal viF5-TTS   │
                         │              │   (VN giọng Việt)│
                         │              │ - 11Labs ML v2   │
                         │              │   (EN/fallback)  │
                         │              └──────────┬───────┘
                         │                         │
                         │   ┌──────────────────┐  │
                         │   │ 🎵 COMPOSER      │  │
                         │   │ ACE-Step / 11Lab │  │
                         │   │ Music một bản    │  │
                         │   │ theo mood + thời │  │
                         │   │ lượng            │  │
                         │   └──────────┬───────┘  │
                         │              │          │
                         └──────────────┴──────────┘
                                        │
                                        ▼
                         ┌──────────────────────────┐
                         │ 🎞️ EDITOR                 │
                         │ - Remotion timeline      │
                         │ - FFmpeg compose         │
                         │ - Subtitle (Whisper      │
                         │   align + VN typesetting)│
                         │ - Music duck under VO    │
                         │ - Color/transition       │
                         │ → film.mp4               │
                         └──────────────────────────┘
                                        │
                                        ▼
                              📽️ Final delivery
```

### Đặc điểm

- **Character / Location Bible** là first-class object trong Studio Memory. Mọi shot generation đều inject 1–3 ref images từ Bible vào Runway Gen-4 References → consistency.
- **Approval gates** ở 3 chỗ: shot list (rẻ, sửa lúc này), keyframes (vừa đốt 1 ít), trước cinematographer (đốt nhiều). User có quyền regen/sửa từng item.
- **Parallel hoá**: Painter sinh location moods // Voice sinh VO // Composer sinh music — đồng thời sau khi script lock.
- **Budget guardrail**: Director ước tính chi phí mỗi gate, hỏi user "còn ngân sách $X, phim cần ≥Y shot, OK không?" trước khi gen.

---

## 3. Stack & provider mix (final cho M1 film-first)

> **Lưu ý:** lựa chọn "Agent framework: Mastra" trong v3 đã được **override ở v4** bằng quyết định Q7 — bỏ framework, tự viết workflow runtime. Xem `decisions.md` và `v4-providers.md §5.6`.

| Layer | Lựa chọn | Lý do |
|---|---|---|
| **App framework** | **Next.js 15 App Router** | UI nhanh, deploy Vercel |
| ~~**Agent framework**~~ | ~~**Mastra**~~ → custom workflow runtime (v4) | Q7 chốt: control nhiều hơn, ít magic |
| **DB / memory** | **Supabase Postgres + pgvector** | Free tier dư cho 1-user; project state, shot list, asset metadata |
| **Asset storage** | **Cloudflare R2** (free 10GB egress) | Cheap cho video file |
| **Render compose** | **Remotion** (React-based video) + **FFmpeg** | Programmatic video, đẹp, control timeline qua code |
| **LLM (planning + writing)** | **Claude Sonnet 4** primary, **Gemini 2.5 Pro** cho script dài | Best creative + long context VN |
| **Image (Char Bible + keyframe)** | **fal.ai → Flux Kontext** + **fal.ai → Flux Schnell** | Char consistency + cheap variations |
| **Image-to-video (default)** | **Runway Gen-4 Turbo** (gen4 References) | Best consistency 2025 |
| **Image-to-video (budget)** | **fal.ai Wan 2.2** | Apache 2.0, rẻ hơn cho B-roll |
| **Video hero shot (optional)** | **Veo 3** qua Runway gateway | Khi cần wow shot có audio sync |
| **TTS Vietnamese** | **fal.ai viF5-TTS** (EraX) hoặc **Replicate** | Giọng Việt native 800k samples |
| **TTS English / fallback** | **ElevenLabs Multilingual v2** | Voice clone + emotion |
| **Music** | **fal.ai ACE-Step** (full song) + **fal MusicGen** (instrumental) | Apache 2.0, $0.05/song |
| **Subtitle** | **OpenAI Whisper** (API) + tự code VN typeset | Sync với VO |
| **Observability** | **Langfuse** (cloud free tier hoặc self-host) | Trace agent + cost |

### Cost ước tính 1 phim 60s, ~10 shot

| Step | Đơn vị | Cost |
|---|---|---|
| Planning + script (Claude + Gemini) | ~30k token in/out | $0.20–0.40 |
| Character + Location Bible (10 ảnh Flux Kontext) | $0.04 × 10 | $0.40 |
| Keyframes shot list (10 shot × 1 keyframe) | $0.04 × 10 | $0.40 |
| Image-to-video (Runway Gen-4 Turbo, 10 × 6s) | $0.05/s × 60s | $3.00 |
| TTS VN VO (~150 từ ≈ 60s) | fal viF5-TTS, ~$0.01/s | $0.60 |
| Music (ACE-Step 60s) | $0.05 | $0.05 |
| Compose (FFmpeg local, free) | — | $0 |
| **Tổng / phim** | | **~$4.65–5** |

→ 10 phim/tháng = ~$50. Vừa cá nhân.

(Veo 3 hero shot 5s = $2 đắt riêng, bật tuỳ chọn.)

---

## 4. Roadmap M1 (rút gọn, film-first)

| Tuần | Mốc | Output cụ thể |
|---|---|---|
| **W1** | Scaffold + Director + Writer | Monorepo Next.js + Workflow runtime + Supabase. Brief → shot list + script (text-only). HITL approval gate. |
| **W2** | Painter (Char Bible + keyframes) | Mỗi shot có 1 keyframe Flux Kontext, char consistent qua refs. Asset gallery + reject/regen UI. |
| **W3** | Cinematographer | Image-to-video Runway Gen-4 Turbo cho từng keyframe → MP4 shot. Queue + retry + cost tracking. |
| **W4** | Voice + Composer + Editor | viF5-TTS VO + ACE-Step music + Remotion compose timeline → final.mp4. Subtitle VN. |
| **W5** *(buffer)* | Polish | Critic agent (vision LLM chấm character drift), retry loop, export ZIP, cost dashboard. |

→ **End of W5: brief 2 dòng → phim ngắn 30–60s render xong.**

---

## 5. Câu hỏi BLOCKING (cần 4 thứ tối thiểu để bắt đầu)

> Đã được trả lời ở v4. Xem `decisions.md` và §6 "Recommend cách user provide secrets" — chọn (c) scaffold trước, fill key sau.

### Bắt buộc:
1. **Anthropic API key** (`ANTHROPIC_API_KEY`) — Director + Writer + Critic. Đăng ký https://console.anthropic.com/, top-up $20 đủ test M1.
2. **fal.ai API key** (`FAL_KEY`) — Flux Kontext + Wan 2.2 + viF5-TTS + ACE-Step. Đăng ký https://fal.ai/, top-up $10–20.
3. **Runway API key** (`RUNWAYML_API_SECRET`) — Gen-4 Turbo character consistency. Đăng ký https://docs.dev.runwayml.com/, top-up $20.

### Tuỳ chọn (có sẽ tốt hơn):
4. **OpenAI** (`OPENAI_API_KEY`) — Whisper subtitle + fallback gpt-image-1.
5. **Google Gemini** (`GOOGLE_GENERATIVE_AI_API_KEY`) — script dài (1M context).
6. **ElevenLabs** (`ELEVENLABS_API_KEY`) — premium TTS fallback.
7. **Supabase** project (URL + anon + service role) — DB. Free tier OK.
8. **Cloudflare R2** account (access key + secret + bucket) — asset storage.

### Deploy:
9. Chạy **local máy bạn** trước (chỉ cần Node.js 20+, không cần deploy)? Hay đẩy luôn lên **Vercel** từ ngày 1?

---

## 6. Recommend cách user provide secrets

- Tốt nhất: **lưu permanent ở org-scope** cho future sessions (tôi sẽ nhắc qua secret request tool).
- Hoặc: dán tạm cho session này thôi.
- Hoặc: bạn cứ chuẩn bị `.env.example` sẵn, tôi scaffold code không cần secret, bạn tự fill khi pull về local.

Bạn confirm 3 secret bắt buộc (Anthropic + fal.ai + Runway) + chọn 1 trong 3 cách ở trên, tôi bắt đầu scaffold ngay.
