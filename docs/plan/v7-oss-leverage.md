# Holi-AI — v7: Open-source leverage map

> Trả lời câu hỏi: *"các resource open hiện nay có cái nào mình có thể kế thừa được không?"*
>
> Tài liệu này phân loại **3 cách kế thừa OSS** (run-as-API / self-host / inherit-as-code), map từng layer của Holi-AI tới các project OSS hàng đầu 2025–2026, đánh dấu license gotchas, đặt **Q15** (open) về chiến lược truy cập OSS, và đưa ra thứ tự tích hợp đề xuất.
>
> Không thay thế v3/v4/v5. Bổ sung lên trên. Vẫn tôn trọng Q1–Q14 đã lock.

---

## 0. Tóm tắt một trang

| Câu hỏi | Trả lời ngắn |
|---|---|
| **Có project nào "giống" Holi-AI đã tồn tại?** | Gần nhất: [`sanyo4ever/ai-shorts-factory`](https://github.com/sanyo4ever/ai-shorts-factory) (AGPL-3) — workflow-first, planning, continuity, QC cho short. Trước đó: [`SDSmirnov/AI-Story-To-Movie`](https://github.com/SDSmirnov/AI-Story-To-Movie) — Story.txt → Movie.mp4 qua Gemini/Imagen/Veo (PoC, không maintain). Không project nào full feature-length Hollywood-grade — đó là **gap Holi-AI lấp**. |
| **Có model OSS nào "good enough" thay API?** | Có. Video: **Wan 2.2** (Apache 2.0), HunyuanVideo (Tencent CLA), CogVideoX (Apache 2.0). TTS clone: **F5-TTS** (MIT) ngang ElevenLabs cho cloning, Kokoro (Apache, lightweight). Lip-sync: **LatentSync** (Apache, ByteDance). Music: **ACE-Step** (Apache, đã lock trong Q12). Image: **Flux Schnell** (Apache). Vision: **Qwen 2.5-VL** (Apache). |
| **Cách dùng OSS thực tế nhất cho 1 người + BYOK?** | **API-first qua aggregators** (Replicate / fal / Together). Tốn $0.02–$5/output, không cần GPU riêng, lên ngay. Self-host (Runpod / Modal) khi đã có throughput steady > $200/tháng cho 1 model. Local GPU chỉ cho prototype. |
| **Có code Holi-AI nên fork / inherit không?** | Có 4: (a) **ComfyUI** node-graph paradigm — đáng study (không fork), informs our workflow runtime. (b) **ai-shorts-factory** — replay manifest pattern, character continuity store đáng đọc. (c) **AI-Story-To-Movie** — Style-Master → Auto-Casting → Render pipeline architecture đáng đọc. (d) **MoviePy/OpenTimelineIO** — đã có Remotion + FFmpeg, study chỉ khi Remotion fail at scale. |
| **Có quyết định gì cần lock?** | **Q15** (open): API-first vs self-host vs hybrid? Default đề xuất ở §2. |
| **License gotcha nguy hiểm nhất?** | HunyuanVideo (CLA: cần đọc kỹ commercial terms), Fish Speech (CC-BY-NC-SA: không commercial), XTTS-v2 (MPL-2.0: copyleft yếu, OK với caveat), AGPL projects (như ai-shorts-factory: nếu kế thừa code phải open-source toàn bộ Holi-AI). Apache 2.0 / MIT là green. |

---

## 1. Stance — 3 cách kế thừa OSS

Không phải mọi "open" là cùng một thứ. Holi-AI có 3 levers riêng biệt:

### 1.1 Run-as-API qua aggregator

**Tức là**: dùng OSS model qua Replicate / fal / Together / RunPod-serverless / Fireworks endpoint. Trả tiền per-output hoặc per-second. Không touch GPU.

**Ví dụ**:
- `Wan 2.2` qua `fal-ai/wan-2.2-t2v` ($0.04/giây video output)
- `HunyuanVideo` qua `replicate.com/tencent/hunyuan-video` (~$0.50/clip 5s)
- `F5-TTS` qua `replicate.com/swivid/f5-tts` (~$0.001/second TTS)
- `MusicGen` / `ACE-Step` qua `fal-ai/ace-step` (~$0.05/track)
- `Flux Schnell` qua `replicate.com/black-forest-labs/flux-schnell` ($3/1000 image)
- `Llama 3.3 70B` qua `together.ai` ($0.50/1M tokens)

**Pros**:
- 0 ops overhead. Pay-per-use đúng Holi-AI multi-provider BYOK model.
- Adapter code dùng đúng patterns mà Runway/fal đã có (`provider_jobs` table, webhook callback).
- License clean — Replicate đã đảm đương deployment, model cards rõ ràng.
- Routing per-account / fallback / budget cap (Q4) hoạt động giống nhau với OSS-via-API và proprietary-via-API.

**Cons**:
- Markup 2–10× so với self-host khi steady-state throughput cao.
- Aggregator có thể deprecate model / change pricing đột ngột.
- Latency cao hơn self-host (cold start mỗi model).

**Recommended cho**: M1 / v0.1 → v0.5. Mọi capability đều bắt đầu ở đây.

### 1.2 Self-host model trên GPU thuê

**Tức là**: chạy model trên Runpod Pods / Modal / Lambda / Vast.ai. Holi-AI gửi prompt → HTTP endpoint Holi-AI tự operate.

**Ví dụ**:
- ComfyUI server có Wan 2.2 + LoRA fine-tune cho character + Style Bible LUT, chạy 24/7 trên Runpod A100 ~$2.17/hr.
- `Modal` deploy F5-TTS với cold-start 8 s, serve all dialogue cho 1 project.
- Self-host LatentSync trên RTX 4090 personal box, route lip-sync calls về đây qua tunnel.

**Pros**:
- Tiết kiệm khi steady-state — VD render 1000 shots/tháng qua Replicate ~$1000, qua Runpod tự host ~$300.
- Có thể fine-tune (LoRA / DreamBooth) per project — đặc biệt cho character + style consistency.
- Latency thấp hơn aggregator nếu giữ runner warm.
- Không bị aggregator deprecate model.

**Cons**:
- Ops overhead: setup Dockerfile, Kubernetes / Modal config, monitoring, log rotation, health check.
- Cold start nếu không giữ warm = 30s–2min mỗi model.
- VRAM management cho 1 GPU phải swap models.
- License đọc kỹ hơn (CLA / Custom License không có aggregator gating).

**Recommended cho**: v0.8 trở lên, sau khi đã biết shape của workload + budget steady-state đã có.

### 1.3 Inherit-as-code (study / fork architecture, không call model)

**Tức là**: đọc / fork repo OSS để học pattern, sau đó viết lại trong Holi-AI codebase. **Không** call binary của họ.

**Ví dụ**:
- Đọc ComfyUI node-graph executor để inform Q7 custom workflow runtime.
- Fork structure của `ai-shorts-factory` replay manifest cho `workflow_runs`.
- Học `AI-Story-To-Movie` Style-Master → Auto-Casting pipeline → map vào v5 §4 department system.
- Study Fabric prompt library cho writer / director agent prompts.

**Pros**:
- License chỉ matter cho code mình *fork*, không phải code mình *học từ*. Đọc AGPL repo và viết lại bằng MIT là OK.
- Lấy được pattern mà không vướng dependency.

**Cons**:
- Tốn time đọc.
- Có risk reinvent imperfectly.

**Recommended cho**: mọi phase — đầu tư 1 ngày đọc 1 repo có thể tiết kiệm 1 tuần build.

---

## 2. Q15 (OPEN) — OSS access strategy

| # | Question | **Default proposal** | If overridden, what changes |
|---|---|---|---|
| **Q15** | OSS access strategy primary | **API-first qua aggregator** (Replicate primary, fal secondary cho video / music, Together cho LLM open weights). Self-host chỉ khi (a) steady-state spend > $300/tháng cho 1 model VÀ (b) Q14 budget allows ops time, hoặc (c) aggregator không có model mình cần. | Nếu chọn self-host primary: add `packages/providers/adapters/runpod-modal/` adapters, add infra/devops phase trước F2. Nếu chọn fully self-host: Q1 single-user assumption vẫn giữ nhưng total cost mô hình thay đổi (CapEx GPU thay vì OpEx aggregator). |

**Lý do default API-first**:
- Khớp Q2 BYOK — user mua Replicate/fal API key giống Anthropic/OpenAI key.
- Khớp Q1 single-user — không cần DevOps team.
- Khớp v6 v0.1 deliverable 6–8 tuần — không có thời gian build self-host.
- Risk reversibility cao — adapter abstract ở capability layer, swap aggregator-vs-self-host transparent.

**Tradeoff acknowledged**: ở v1.0 (1200 shots), spend per feature có thể $1500 qua aggregator vs $500 self-host. Q14 = no cap chấp nhận tradeoff này, prioritize speed-to-v1.0 hơn cost-optimization.

---

## 3. Layer-by-layer OSS map

Mỗi layer: top OSS option, license, run-as-API endpoint (nếu có), recommended Holi-AI phase to introduce.

### 3.1 LLM (open weights)

Holi-AI capability: `llm.chat`, `llm.tools` (Showrunner agent, Writer, Director, Continuity prompts).

| Model | Params | License | Aggregator endpoint | Use case in Holi-AI |
|---|---|---|---|---|
| **Llama 3.3 70B Instruct** | 70B | Llama 3.3 Community (commercial OK) | `together.ai/meta-llama/Llama-3.3-70B-Instruct-Turbo` $0.88/M tokens | Fallback cho Director / Writer khi Claude rate-limit |
| **Qwen 2.5 72B Instruct** | 72B | Tongyi Qianwen (commercial OK with caveat) | `together.ai/Qwen/Qwen2.5-72B-Instruct-Turbo` $1.20/M | Multilingual incl. Vietnamese — chính cho VN script work |
| **DeepSeek V3 / R1** | 671B MoE / 70B | MIT-style | `fireworks.ai/deepseek-ai/deepseek-v3` $0.27/M input | Reasoning-heavy planning agent |
| **Mistral Large 2** | 123B | MRL (research) / Apache (small ones) | `together.ai/mistralai/Mixtral-8x22B` | Cheap fallback |
| **Phi-4** | 14B | MIT | `together.ai/microsoft/Phi-4-multimodal` | Local prototype / quick prompts |

**Recommended phase to introduce**: v0.1 (P2 — fallback chain).

### 3.2 Image generation

Holi-AI capability: `image.t2i`, `image.edit` (Painter agent, Costume / Portrait sheets).

| Model | License | Strength | Aggregator endpoint | Lane fit |
|---|---|---|---|---|
| **Flux.1 Schnell** | Apache 2.0 | Fast text-to-image, decent quality | `replicate.com/black-forest-labs/flux-schnell` $3/1000 | Stylized + photoreal — universal |
| **Flux.1 Dev** | Open Weights w/ non-commercial flag | Higher quality | `replicate.com/black-forest-labs/flux-dev` $0.025/output | Hero portraits (license caveat: tier-up to Pro for commercial) |
| **Flux Kontext** | Open Weights | I2I edit chuyên về consistency | `replicate.com/black-forest-labs/flux-kontext-pro` $0.04/output | Photoreal lane keyframe |
| **Stable Diffusion 3.5 Large** | SAI Community License | Open weights, commercial OK if < $1M revenue | `replicate.com/stability-ai/sd-3.5-large` | Stylized — anime LoRA ecosystem |
| **SDXL + AnimateDiff** | OpenRAIL-M | Older but huge LoRA ecosystem cho anime / stylized | self-host hoặc `replicate` various | Stylized — anime LoRA fine-tunes |
| **AuraFlow** | Apache 2.0 | Permissive alt to Flux | `replicate.com/fal-ai/aura-flow` | Backup option |

**Recommended phase to introduce**: v0.1 (Painter agent uses Flux Schnell mặc định cho stylized).

### 3.3 Video generation (T2V / I2V)

Holi-AI capability: `video.t2v`, `video.i2v` (Cinematographer agent — heaviest cost driver).

| Model | License | Strength | Limit | Endpoint |
|---|---|---|---|---|
| **Wan 2.2** (Alibaba) | Apache 2.0 | MoE architecture, T2V + I2V + character animation + audio-driven, 720p 24fps. Top OSS Feb 2026. VBench 84.7+. | 5s/clip max, 8–40GB VRAM | `fal-ai/wan-2.2-t2v` ~$0.05/sec output |
| **HunyuanVideo** (Tencent) | CLA (Custom — đọc kỹ commercial) | 13B params, 5s 720p, top-tier motion | 24GB+ VRAM, slow | `replicate.com/tencent/hunyuan-video` ~$0.50/clip |
| **CogVideoX 1.5-5B** (Zhipu) | Apache 2.0 | Precise text-following, coherent narrative, ICLR 2025 paper | 6s @ 1440×960, 5GB VRAM lite | `replicate.com/cogvideo/cogvideox-5b` |
| **Mochi 1** (Genmo) | Apache 2.0 | Smooth motion, AsymmDiT arch | 5.4s @ 848×480, 24GB | `replicate.com/genmoai/mochi-1` |
| **LTX-Video 0.9.5** (Lightricks) | Apache 2.0 | Fast, real-time on RTX 4090, 768×512 in 90s | 8GB+ VRAM, lower max-res | `replicate.com/lightricks/ltx-video` |
| **Open-Sora 2.0** | Apache 2.0 | Community Sora replica | Lower quality than top tier | self-host preferred |
| **AnimateDiff** | OpenRAIL | Motion module for SD/SDXL — best cho stylized lane animation | Single-frame anchor → animation | self-host ComfyUI |

**Recommended phase to introduce**:
- v0.1: 1 of {Wan 2.2 hoặc Mochi 1 hoặc LTX-Video} qua aggregator — đủ cho 60s demo.
- v0.5: 2 trong số trên cho fallback (Q5 cross-provider).
- v0.8+: self-host Wan 2.2 cho character LoRA fine-tune.

**Hero shot options**: Veo 3 / Sora 2 (proprietary API). HunyuanVideo gần nhất OSS nhưng CLA license caveat.

**Lane mapping**:
- `lane=stylized` → Wan 2.2 + AnimateDiff + SDXL anime LoRA
- `lane=photoreal` → HunyuanVideo (CLA caveat) hoặc Veo 3 / Runway Gen-4 proprietary
- `lane=mixed` → router resolves per scene

### 3.4 TTS / voice clone

Holi-AI capability: `audio.tts`. Q11 lock = 100 % synthetic — **không** dùng voice-clone-from-real-person path.

| Model | Params | License | Strength | Endpoint |
|---|---|---|---|---|
| **F5-TTS** (SWivid) | ~500M | MIT | Top OSS voice clone (5–15s ref) → near-ElevenLabs quality. Flow matching DiT. | `replicate.com/swivid/f5-tts` ~$0.001/sec |
| **Kokoro 82M** (hexgrad) | 82M | Apache 2.0 | Top of TTS Arena Jan 2026. 26 voices, 9 langs incl. JP/ZH (no Vietnamese yet). 300MB. | `replicate.com/hexgrad/kokoro` |
| **XTTS v2** (Coqui) | 467M | MPL-2.0 | 17 languages incl. Vietnamese; voice clone via 6s ref. Older but battle-tested. | `replicate.com/coqui/xtts-v2` |
| **Qwen3-TTS** (Alibaba) | — | Apache 2.0 | Multilingual, commercial-friendly, late 2025. | self-host via HF |
| **Fish Speech S2 Pro** | — | CC-BY-NC-SA | Top OSS quality but **non-commercial** — can't use in Holi-AI per default | — (license blocker) |
| **CosyVoice 3.0** (Alibaba) | — | Apache 2.0 | Multilingual heavy lifting | self-host |
| **MeloTTS** (MyShell) | — | MIT | Vietnamese + many SEA langs explicitly supported | self-host (cheap) |
| **Bark** (Suno) | — | MIT | TTS + non-speech sounds (laugh, gasp, ambience) | `replicate.com/suno-ai/bark` |
| **OpenVoice v2** (MyShell) | — | MIT | Voice clone + emotion control | `replicate.com/myshell-ai/openvoice` |

**Recommended phase to introduce**:
- v0.1: Kokoro (cheap, library voices for prototypes) qua API.
- v0.5: F5-TTS thay primary (when dialogue volume scales).
- v0.5: MeloTTS hoặc Qwen3-TTS cho Vietnamese-specific work — XTTS v2 fallback.

**Vietnamese-specific gotcha**: Kokoro v1.0 chưa support Vietnamese. F5-TTS support Vietnamese via fine-tune. XTTS v2 native VN. MeloTTS native VN — đây là combination phải test thực tế.

### 3.5 Lip-sync

Holi-AI capability: `audio.lipsync` (Sound + Dialogue agent — Q11 100 % synthetic nên không có "real person lipsync ban đầu", nhưng cần khớp TTS với gen-char-portrait talking head).

| Model | License | Strength | Endpoint |
|---|---|---|---|
| **LatentSync 1.6** (ByteDance) | Apache 2.0 | Diffusion-based, 512×512, top OSS quality Apr 2026. SyncNet 94%. | `replicate.com/bytedance/latentsync` ~$0.10/clip |
| **MuseTalk** (TencentArc) | MIT | Real-time, good quality | `replicate.com/tencent/musetalk` |
| **Wav2Lip** (Hyderabad) | MIT | Classic, fast, sync-accurate but blurry mouth | `replicate.com/devxpy/cog-wav2lip` $0.0001/sec |
| **Diff2Lip** | MIT | Diffusion-based, higher quality | self-host preferred |
| **SadTalker** | Apache 2.0 | Full talking-head (not just mouth) | `replicate.com/cjwbw/sadtalker` |
| **Hedra Character-3** (commercial) | proprietary | Best-in-class character animation | API only — not OSS |

**Recommended phase to introduce**: v0.5 (F2 — Sound Bible). Primary: LatentSync. Fallback: MuseTalk.

### 3.6 Music generation

Holi-AI capability: `music.t2m`, `music.continue` (Composer agent — Q12 already locked AI-only with Suno + ACE-Step).

| Model | License | Strength | Endpoint |
|---|---|---|---|
| **ACE-Step v1.5** | Apache 2.0 | **Đã lock per Q12.** 4 min in 20s on A100. Multilingual incl Vietnamese. State-of-art OSS music. 9.5K stars. | `fal-ai/ace-step` ~$0.05/track; `replicate.com/ace-step/ace-step` |
| **Suno v4** | proprietary | Đã lock per Q12 cho hero tracks | API only |
| **MusicGen** (Meta) | CC-BY-NC (research) | Text-to-music — **non-commercial license** (blocker cho Holi-AI commercial use) | only for non-com prototype |
| **Stable Audio Open** | SAI Community | Sound effects + short music, commercial OK <$1M rev | `replicate.com/stability-ai/stable-audio-open` |
| **AudioGen** (Meta) | CC-BY-NC | Sound effects from text — non-commercial | only for non-com |
| **DiffRhythm** | Apache 2.0 | Open music model 2025 | self-host |

**Recommended phase to introduce**: v0.5 (F3 — Score agent với leitmotif workflow). ACE-Step primary per Q12, Suno fallback cho hero cues, Stable Audio Open cho foley + ambient.

**License gotcha**: MusicGen + AudioGen của Meta là CC-BY-NC — **không dùng được** cho Holi-AI (vì user có thể distribute commercially). Đây là lý do Q12 đã chọn ACE-Step + Suno.

### 3.7 Vision (continuity check)

Holi-AI capability: `vision.continuity` (Script supervisor agent — added per v5 §7.6).

| Model | License | Strength | Endpoint |
|---|---|---|---|
| **Qwen 2.5-VL 72B** | Apache 2.0 | Top OSS vision-LLM, multilingual | `together.ai/Qwen/Qwen2-VL-72B-Instruct` |
| **InternVL 2.5 38B / 78B** | MIT | Strong OCR + scene understanding | `together.ai/OpenGVLab/InternVL2_5-78B` |
| **LLaVA-OneVision 72B** | Apache 2.0 | Older but solid | self-host or HF inference |
| **Claude Sonnet 4 / Opus 4 (vision)** | proprietary | Top-tier continuity reasoning | Anthropic API |
| **Gemini 2.5 Pro (vision)** | proprietary | Best for long-context + many-frame batch | Google API |

**Recommended phase to introduce**: v0.5 (F2 — first vision.continuity capability). Primary: Claude Sonnet 4 vision (proprietary, but accuracy). OSS fallback: Qwen 2.5-VL.

### 3.8 STT / transcription

Holi-AI capability: `audio.stt` (subtitle generation + dialogue verification).

| Model | License | Strength | Endpoint |
|---|---|---|---|
| **Whisper Large v3 / Turbo** (OpenAI open weights) | MIT | 99 languages, top accuracy. Vietnamese explicit. | `replicate.com/openai/whisper` ~$0.001/min |
| **Faster-Whisper** (CTranslate2) | MIT | 4× faster Whisper, self-host friendly | self-host |
| **Distil-Whisper** | MIT | Smaller, English-only | self-host |
| **NVIDIA Canary** | CC-BY | Multilingual EN/DE/ES/FR | self-host |

**Recommended phase to introduce**: v0.5 (F3 — subtitle generation). Whisper Large v3 qua API.

### 3.9 Editing / composition

Holi-AI **đã chọn** Remotion + FFmpeg cho compose. Nhưng có alternatives nếu cần:

| Tool | License | Use case |
|---|---|---|
| **FFmpeg** | LGPL/GPL | Đã dùng. Encode, mux, filter graph |
| **Remotion** | Custom (free for non-commercial, paid for commercial team > 3) | Đã chọn for compose UI |
| **MoviePy** | MIT | Python-native fallback nếu Remotion node-side overhead quá cao |
| **OpenTimelineIO** (Pixar) | Apache 2.0 | EDL/XML interchange — useful for DCP-lite export |
| **vidgear** | Apache 2.0 | Streaming utilities |
| **PyAV** | BSD-3 | Python FFmpeg bindings |
| **mlt-framework** | LGPL | Backend của Kdenlive — fallback nếu cần full NLE-engine |

**Recommended**: stick Remotion + FFmpeg per v3. Add OpenTimelineIO ở F5 cho DCP-lite XML.

### 3.10 3D / scene reconstruction (defer)

Per v5 §12, hybrid 2D-3D pipeline = out-of-scope cho v5. Liệt kê here để future-proof:

| Tool | License | Use case |
|---|---|---|
| **Blender** + Geometry Nodes | GPL | Full 3D scene reuse |
| **Hunyuan3D 2.0** | CLA | Image-to-3D, character mesh |
| **TripoSR** | MIT | Single-image to 3D |
| **Stable Video 3D** | SAI Community | Camera-rotation video |
| **Gaussian Splatting** (nerfstudio) | Apache 2.0 | NeRF-style scene reconstruction |
| **Three.js / React Three Fiber** | MIT | Web 3D preview (Bible explorer) |

**Recommended**: defer cho v6 product (= post-v1.0). Don't introduce now.

### 3.11 Orchestration / workflow / UI inheritance

Holi-AI **đã lock** custom workflow runtime (Q7). Don't fork these; *study* them.

| Tool | License | What to learn |
|---|---|---|
| **ComfyUI** | GPL-3.0 | Node-graph paradigm, custom node API, queue semantics. Inform workflow runtime design. **Don't** fork (GPL contamination risk). |
| **sanyo4ever/ai-shorts-factory** | AGPL-3.0 | Replay manifest, character continuity store, FastAPI+Temporal pattern. Study only — AGPL = poison cho commercial Holi-AI. |
| **SDSmirnov/AI-Story-To-Movie** | WTFPL | Style Master → Auto-Casting → Render pipeline. PoC quality but illustrative architecture. |
| **ShortGPT** (RayVentura) | MIT | Earlier shorts framework, Ollama-first. Can reference patterns. |
| **MoneyPrinter** (Fujiwara) | MIT | YouTube Shorts automation. Less relevant for feature-length. |
| **Fabric** (Daniel Miessler) | MIT | Prompt pattern library — useful for writer/director agent prompts. Can copy patterns directly. |
| **CrewAI / AutoGen** | MIT | Multi-agent pattern reference. We don't use them (Q7) but architectures are informative. |
| **OpenWebUI** | MIT | Settings UI patterns for BYOK |

**Recommended study order**: 1) ComfyUI (workflow paradigm) 2) ai-shorts-factory (closest project) 3) Fabric (prompts) 4) AI-Story-To-Movie (pipeline shape).

---

## 4. Code we can directly inherit (without poison-license)

Permissive (MIT / Apache / BSD) — safe to fork:

| Source | What | Where in Holi-AI |
|---|---|---|
| **Fabric prompts** | Director / writer / continuity prompt templates | `packages/agents/prompts/` |
| **ShortGPT EditingFramework** (MIT) | Subtitle render + transition templates | `packages/edit/templates/` |
| **diffusers** (HF) | Schedulers / VAE loaders if self-host video models | `packages/providers/adapters/local/` |
| **Whisper.cpp** (MIT) | Fast STT local fallback | `packages/providers/adapters/local-stt.ts` |
| **PyAV** (BSD-3) | FFmpeg Python bindings if we add Python worker | future worker |
| **OpenTimelineIO** (Apache 2.0) | EDL parsing for DCP export | `packages/deliver/dcp/` |
| **AutoGen multi-agent examples** | Reference pattern only (we still custom workflow Q7) | docs/examples/ |

Poison-license — **don't** fork:

| Source | License | Why poison |
|---|---|---|
| **ai-shorts-factory** | AGPL-3.0 | Network use copyleft — would force open-source Holi-AI |
| **ComfyUI** | GPL-3.0 | Stronger copyleft |
| **MusicGen / AudioGen** | CC-BY-NC | Non-commercial blocks distribution |
| **Fish Speech S2** | CC-BY-NC-SA | Non-commercial blocks distribution |
| **Wonder Studio / Hedra** | proprietary | API-only access; no code |

---

## 5. License gotcha map

Quy tắc: anything that's not Apache/MIT/BSD requires reading the license carefully **before** committing to it.

| License | Holi-AI position |
|---|---|
| **Apache 2.0 / MIT / BSD-3 / WTFPL** | Green. Fork, ship, redistribute. Required: include attribution. |
| **MPL-2.0** (Mozilla) | Yellow. Copyleft per-file. OK to use as dependency, but if we modify a file we must ship the modification. **XTTS v2 is MPL-2.0**. |
| **LGPL** | Yellow. Dynamic linking OK. Static linking requires source. FFmpeg is LGPL by default — fine for dynamic exec. |
| **GPL-3.0** | Red for proprietary distribution. Forking GPL code requires entire app GPL. Don't fork ComfyUI. |
| **AGPL-3.0** | Red. GPL + network use trigger. Forking AGPL forces open-source Holi-AI even SaaS. Don't fork ai-shorts-factory code. |
| **Stability AI Community License** | Yellow. Commercial OK if annual revenue < $1M. Holi-AI single-user revenue assumption = $0. Fine for now. |
| **Llama Community License** | Yellow. Commercial OK <700M monthly active users. Fine. |
| **HunyuanVideo CLA / Tencent Custom** | Yellow. Read terms; some have "no AI training output redistribution" — must check before commercial use. |
| **CC-BY-NC / CC-BY-NC-SA** | Red. Non-commercial only. Blocks Holi-AI if user wants to distribute their film commercially. |
| **OpenRAIL-M / OpenRAIL-S** | Yellow. Responsible-AI use clauses. Forbids harmful content. Generally fine. |

**Decision rule**: when in doubt, prefer Apache 2.0 / MIT alternatives. Document license per provider in `providers` table.

---

## 6. Vietnamese-specific OSS

User audience expected = VN. Specific resources:

| Resource | What | License |
|---|---|---|
| **VinAI PhoGPT** | Vietnamese-tuned LLM 7.5B | Apache 2.0 |
| **VinAI PhoBERT** | VN encoder | MIT |
| **VinAI ViT5** | VN seq2seq | MIT |
| **VietAI gpt-neo-1.3B-vietnamese** | VN gen model | Apache 2.0 |
| **viT5 / mT5 Vietnamese fine-tunes** | Translation, summarization | MIT |
| **MeloTTS** | VN-native TTS (best OSS for VN dialogue) | MIT |
| **XTTS v2** | VN voice clone | MPL-2.0 |
| **Whisper Large v3** | VN STT (top tier) | MIT |
| **CocCoc / underthesea / pyvi** | VN NLP tokenization (Writer agent) | Apache 2.0 / MIT |
| **Vbpl, VLSP datasets** | Training data | Various (research) |

**Recommended**: Whisper Large v3 for subtitles, MeloTTS primary VN TTS, F5-TTS fine-tuned for VN as quality upgrade at F2.

---

## 7. Cost map — aggregator vs self-host

90 min feature workload (v1.0):
- ~1 200 shots × 6s I2V each
- ~10 800 seconds of finished video
- ~3 000 keyframes
- ~30 min dialogue (~5 400 spoken words)
- ~30 music cues
- ~150 foley clips
- ~30 vision.continuity batches

| Layer | Aggregator (Replicate/fal) | Self-host (Runpod A100 24/7) |
|---|---|---|
| Video gen (Wan 2.2 1200 shots × 6s) | $540 (fal $0.05/sec output × 10 800 sec) | $200 (~92 hr A100 @ $2.17/hr) |
| Image (3 000 keyframes Flux Schnell) | $9 ($3/1000) | $30 (~14 hr A100) |
| TTS (5 400 words F5-TTS) | $32 (~$0.001/sec) | $20 (~9 hr) |
| Lip-sync (1 200 talking shots LatentSync) | $120 ($0.10/clip) | $80 (~37 hr) |
| Music (30 cues ACE-Step) | $1.50 ($0.05/track) | $5 |
| Vision.continuity (30 batches Claude Sonnet) | $30 | n/a (proprietary) |
| LLM (Director + Writer Claude Opus) | $50 | n/a |
| **Estimated total** | **~$782** | **~$385** + ops time |

→ Self-host saves ~$400 per feature. But:
- Ops time = 20–40 hr setup + 5 hr/month maintenance per service
- Latency adds 1–3 days wall-clock per feature (cold start, queue mgmt, retries)
- Recovery time on bug = ours

For v1.0 first feature, aggregator wins on time-to-feature. For v1.x repeat features, self-host pays back fast.

→ Default Q15 = API-first ở v1.0. Revisit at v2.0.

---

## 8. Recommended integration order

Khi P0 done và start writing adapters (v0.1 → v0.5):

| Order | Capability | Provider primary | Provider fallback | OSS-via-aggregator opt |
|---|---|---|---|---|
| 1 | `llm.chat` | Anthropic Claude | OpenAI GPT-4 | Together Llama 3.3, Together Qwen 2.5 |
| 2 | `llm.tools` | Anthropic Claude | Anthropic Sonnet | Together Llama 3.3 |
| 3 | `image.t2i` | fal Flux Pro | Replicate Flux Dev | Replicate Flux Schnell |
| 4 | `image.edit` | Replicate Flux Kontext | OpenAI gpt-image-1 | (no good OSS alt) |
| 5 | `video.i2v` (stylized) | fal Wan 2.2 | Replicate CogVideoX | Replicate Mochi |
| 6 | `video.i2v` (photoreal) | Runway Gen-4 | fal Veo 3 | Replicate HunyuanVideo (CLA caveat) |
| 7 | `audio.tts` | ElevenLabs v3 (synthetic) | Replicate F5-TTS | Replicate Kokoro / MeloTTS |
| 8 | `audio.lipsync` | Replicate LatentSync | Replicate MuseTalk | Replicate Wav2Lip |
| 9 | `audio.stt` | OpenAI Whisper API | Replicate Whisper v3 | self-host whisper.cpp |
| 10 | `audio.sfx` | ElevenLabs SFX | Stable Audio Open via Replicate | self-host |
| 11 | `music.t2m` | Suno API | Replicate ACE-Step | self-host ACE-Step |
| 12 | `vision.continuity` | Anthropic Sonnet 4 vision | Gemini 2.5 Pro vision | Together Qwen 2.5-VL |

→ Mỗi capability có **2 cột paid + 1 OSS-via-aggregator**. Đảm bảo Q5 fallback work cross-provider AND OSS fallback ready.

---

## 9. What v7 does NOT cover

- **Implementation cost of each adapter** — that's coding work in P0.
- **Self-host infra blueprint** (Docker, Kubernetes, monitoring) — defer until Q15 chọn self-host.
- **Per-provider rate-limit calibration** — measure khi running, not predict.
- **Fine-tune workflows** (LoRA, DreamBooth, F5-TTS Vietnamese fine-tune) — separate doc khi reach F2/F3.

---

## 10. Câu hỏi mở (research, không blocking)

1. Runpod-serverless vs fal-serverless cho cold-start latency cho Holi-AI workload pattern (bursty, infrequent) — benchmark khi đến v0.5.
2. Có project nào fork ComfyUI custom-node làm full-film orchestrator chưa? (Có thể inherit some nodes architecture without fork.)
3. ACE-Step v1.5 XL (4B DiT) so với Suno v4 — quality gap đo qua MOS test khi đến F3.
4. LatentSync 1.6 trên 30 min dialogue → throughput thực tế per RTX 4090? Quyết định self-host khi tới F2.
5. Veo 3 vs HunyuanVideo CLA — đọc kỹ Tencent commercial terms trước F1 photoreal opt-in.
6. F5-TTS Vietnamese fine-tune effort — có public checkpoint chưa? Nếu chưa, time để fine-tune lấy bao lâu / cost data bao nhiêu.

---

## 11. Tóm tắt — answer to "có resource nào kế thừa được không?"

**Có, rất nhiều.** Cụ thể:

- **Direct inherit**: Fabric prompts, OpenTimelineIO (Apache 2.0). Safe to copy & ship.
- **Run-as-API qua aggregator**: hầu hết mọi capability có 1 OSS option đủ tốt cho v0.1 — Flux Schnell (image), Wan 2.2 (video), F5-TTS (voice), LatentSync (lipsync), ACE-Step (music — đã lock), Whisper (STT), Qwen 2.5-VL (vision).
- **Study but don't fork**: ComfyUI (GPL — too poison), ai-shorts-factory (AGPL — too poison), AI-Story-To-Movie (WTFPL OK but PoC quality), Fabric (MIT — go ahead).
- **OSS as cost-saver via self-host**: defer tới v0.8+ khi steady-state workload đủ lớn.

**Default cho Q15 (open)**: API-first qua aggregator cho mọi capability ở v0.1 → v0.5. Self-host từng model một khi spend > $300/tháng cho 1 capability ở v0.8+. Revisit lock at start of F2.

→ Holi-AI **không cần reinvent**. Hầu hết model heavy-lifting đã có OSS. Cái chúng ta thực sự build là **layer điều phối** (Q7 workflow runtime + Q8 lane-aware routing + v5 department system + v6 dailies UX) — đây là gap mà chưa OSS project nào lấp đầy đủ.
