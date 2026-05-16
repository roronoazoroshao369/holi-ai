# Holi-AI — v5: Feature-length, Hollywood-grade, all-AI

> Tiếp nối v3 (film-first, 30–60 s) và v4 (multi-provider). Tài liệu này **chỉ** trả lời câu hỏi:
> *"Một người + AI có thể dựng được một bộ phim điện ảnh hoàn chỉnh, sống động như Hollywood, hoàn toàn bằng AI hay không — và nếu có thì kiến trúc nào dẫn tới đó?"*
>
> Đây là một bản **research + roadmap**, không phải spec để code. Mục tiêu của nó là **đặt mục tiêu trần** (Bắc Cực) và **vẽ con đường leo** từ M1 (60 s) lên feature 90 phút mà không phải đập lại kiến trúc giữa đường.
>
> **Không thay thế v3/v4.** Bổ sung lên trên. Mọi nền móng (capability registry, router, workflow runtime, Q1–Q7) **giữ nguyên** — chỉ thêm tầng hierarchy mới và departments mới ở trên.

---

## 0. Tóm tắt một trang

| Câu hỏi | Trả lời ngắn |
|---|---|
| **Một bộ phim 90 phút full-AI khả thi 2026 chưa?** | **Stylized / animation** (anime, Pixar-look, 2D, cartoon, stop-motion-look): khả thi với gating + hierarchy đúng. **Photoreal live-action (như Dune, Oppenheimer):** chưa — vẫn lộ uncanny ở close-up dài và full body action. Mục tiêu thực tế 2026 = **stylized feature 60–90 min**. |
| **Một người làm được không?** | Có, nếu xem mình là **showrunner + creative director**, không phải technician. AI làm 95 % công, người làm 5 % nhưng là 5 % quyết định: chốt tone, chốt cast, chốt cut, chốt mix. |
| **Bao lâu một bộ?** | Stylized 20 min: ~2–4 tuần wall-clock. Stylized 90 min: ~3–6 tháng. Photoreal feature: chưa nên thử cho đến cuối 2026. |
| **Bao nhiêu tiền một bộ?** | Stylized 20 min: **$200–500**. Stylized 90 min: **$2 000 – 6 000**. Photoreal feature: **chưa estimate được** (rất nhiều retake). |
| **Khác gì v3?** | v3 = một workflow `film.generate` chạy phẳng cho phim 60 s. v5 = **hierarchy 5 tầng** (Film → Act → Sequence → Scene → Shot) và **department system** (10+ vai trò chuyên môn) chồng lên trên v3, vẫn dùng đúng workflow runtime của Q7. |
| **Cần lock thêm quyết định nào?** | 7 câu mới (Q8–Q14) ở §11 — về lane (animation vs photoreal), độ dài đích, casting (clone hay synthetic), composing pipeline, distribution, language, và budget cap. |
| **Đề xuất con đường?** | **Episodic ladder + hierarchical workflow + character/world bible front-loaded + stylized lane đầu tiên.** Chi tiết §6. Phase plan F0 → F5 ở §9. |

---

## 1. Core facts mình đang nắm chắc (state of the art ~May 2026)

### 1.1 Video generation

| Tool | Điểm mạnh | Giới hạn cho feature-length |
|---|---|---|
| **OpenAI Sora 2** | Chất lượng cao, native audio sync, prompt adherence tốt | Clip cap ~20 s; ít control camera precise; chưa ref-image stable cho character |
| **Runway Gen-4 + Gen-4 References** | **Multi-image refs** giữ character/location consistent — vũ khí chính 2026 | Clip ~10 s; cần stitch nhiều clip lại; lip-sync chưa native |
| **Google Veo 3** | Native audio + lip-sync ổn cho dialogue ngắn | Clip ~8–10 s; cảnh phức tạp vẫn drift; rate-limit thấp |
| **Kling 2.5 Reference** | Clip tới 3 phút có ref — duy nhất ở mức này | Style hơi "Trung" / kém control; subtle hands/face artifacts |
| **fal Wan 2.2 / HunyuanVideo / Stable Video Diffusion** | Open-source, Apache 2.0, có thể fine-tune | Quality thấp hơn closed-source 1 thế hệ |
| **Luma Dream Machine / Pika 2.0** | Nhanh, B-roll cheap | Consistency yếu hơn Runway/Sora |

→ **Không một tool nào tự nó làm xong phim.** Mọi pipeline thực dụng đều **stitch clip ngắn (5–20 s) lại** + áp **reference layer** (Runway Gen-4 Refs hoặc tương đương) làm xương sống nhất quán.

### 1.2 Voice & lip-sync

| Tool | Vai trò |
|---|---|
| **ElevenLabs v3 / Multilingual v2** | Voice clone từ 1–3 phút sample, emotion control, multi-lang (VN/EN/JP/CN). Bộ não giọng nhân vật. |
| **fal viF5-TTS (EraX)** | TTS tiếng Việt native, rẻ, không cần clone |
| **OpenAI TTS / gpt-4o-audio** | Backup, generic voice |
| **Hedra Labs** | Talking head lip-sync từ portrait + audio, full body subtle motion. Best cho close-up dialogue. |
| **LipDub / Sieve.lipsync / Wav2Lip** | Lip-sync overlay lên video đã có, đỡ phải gen lại video |
| **D-ID / HeyGen / Synthesia** | Avatar có sẵn (kém control hơn) — chủ yếu cho corporate-explainer |

→ **Dialogue heavy** scene (2 nhân vật ngồi nói chuyện) là **vùng khó nhất**. Hai chiến lược:
> (a) Hedra/LipDub overlay lên Runway clip,
> (b) Veo 3 native audio gen.
> (a) control hơn, (b) tự nhiên hơn nhưng đắt và dễ drift.

### 1.3 Music, foley, sound design

| Tool | Vai trò |
|---|---|
| **Suno v4 / Udio** | Full song có lyrics, dùng cho opening theme + end credit |
| **fal ACE-Step** (open) | Instrumental score, leitmotif, rẻ |
| **fal MusicGen** | Cue-based score, lo-fi |
| **ElevenLabs Sound Effects** | Foley + ambient, prompt từ text |
| **Stable Audio Open** | SFX, ambient loop |
| **AudioGen / Riffusion** | SFX experimental |

→ **Score 60–90 phút** không phải vấn đề tiền (vài $) nhưng **leitmotif coherence** (motif lặp lại cho nhân vật) cần workflow riêng: gen motif → variants cho từng emotional beat.

### 1.4 Image / keyframe / consistency

| Tool | Vai trò |
|---|---|
| **Flux.1 Kontext** (BFL) | **Bộ não consistency 2D.** Edit-by-prompt giữ identity. Char Bible / Location Bible foundation. |
| **Flux Schnell** | Concept art nhanh, cheap variations |
| **Midjourney v7** | Mood board, style references — chưa có API stable |
| **Stable Diffusion 3.5 / Flux Dev** | Fine-tune local LoRA cho character cụ thể |
| **OpenAI gpt-image-1** | Edit có ref, slot fallback |
| **Google Imagen 3** | Photoreal, lifestyle |

→ **Flux Kontext = Char Bible** (sinh portrait, costume rotation, expression sheet) → feed làm `refImages` cho Runway Gen-4 trong mọi shot có nhân vật đó. **Đây là xương sống consistency** của toàn bộ phim.

### 1.5 3D / world / asset (tuỳ chọn cho lane hybrid)

| Tool | Vai trò |
|---|---|
| **Tripo3D / Meshy / Rodin** | Text/image → 3D mesh + textures |
| **CSM AI** | 3D asset cho game-engine pipeline |
| **Gaussian Splatting / Splat AI / Luma Genie** | Scene reconstruction từ video |
| **Wonder3D / TripoSR** | Single-image → 3D |
| **Genie 2 / World Labs** | Playable / navigable world models — vẫn experimental |

→ **Không bắt buộc 2026.** Chỉ relevant nếu chọn lane **hybrid pipeline**: gen 3D set một lần, render virtual camera nhiều góc, kết hợp với character AI 2D. Tăng độ chính xác camera nhưng tăng complexity 10×.

### 1.6 Performance / animation / motion

| Tool | Vai trò |
|---|---|
| **Move.ai / Plask** | Motion capture từ video phone, xuất BVH/FBX |
| **Wonder Dynamics** | Replace actor in video với CG character |
| **Mootion / DeepMotion** | Text-to-motion |
| **Cascadeur** | AI-assisted keyframe animation |

→ Cho **stylized lane**, không cần — Runway/Sora đã sinh motion từ keyframe. Cho **photoreal lane**, đây là cách giải bài "diễn xuất body" mà text-to-video chưa làm tốt.

### 1.7 Story / script / development

| Tool | Vai trò |
|---|---|
| **Claude Opus 4 / Sonnet 4** | Best creative writing dài, character voice consistent, structure feedback |
| **GPT-5** | Plot architecture, alternative voice |
| **Gemini 2.5 Pro** (1M context) | Đọc cả script feature làm continuity check |
| **Pinokio / Final Draft AI** | Industry format export |

→ **Script feature 90 phút ≈ 90–120 pages**. Mỗi pass review/critique 1 model có 1M context token là đủ. **Không phải vấn đề kỹ thuật.** Vấn đề là **quality story** — cần nhiều iteration với human-in-the-loop.

### 1.8 Editing / post / delivery

| Tool | Vai trò |
|---|---|
| **Remotion** (đã chọn v3) | React-based programmatic timeline; **giữ nguyên** |
| **DaVinci Resolve + Neural Engine** | Color grade, audio mix (manual hoặc CLI) |
| **Auphonic API** | Loudness normalisation, podcast-grade mix |
| **iZotope RX (offline)** | Dialogue cleanup |
| **FFmpeg + libplacebo** | HDR encode |
| **Captions.app / Submagic** | Auto-subtitle + style |

→ **Editing AI tự động** vẫn yếu cho phim dài. Plan: **agent suggests cut points**, human reviews trong Remotion preview, FFmpeg/Resolve finalize.

### 1.9 Cái KHÔNG có (gaps 2026)

- **Long-take coherent video** (>30 s liên tục, same character, same room) — chưa stable.
- **Hands ở action** — vẫn glitch.
- **Crowd scene** với extras nhận diện được — chưa.
- **Inter-character eye-contact + body language** sustained — kém.
- **Multi-character dialogue full body** (3+ nhân vật trong khung) — kém.
- **Stunt / fight choreography** > 5 giây — kém.
- **Weather/water/fire physical accuracy** — better but still tells.
- **Lip-sync ngôn ngữ tiếng Việt** native trong model video — chưa, phải overlay.

→ Phim viết kịch bản phải **né** những gap này: cắt nhanh ở close-up, dùng angle B-roll, voice-over hơn dialogue trực tiếp khi action, montage thay vì sustained shot.

---

## 2. Missing context — những gì mình chưa biết, sẽ ảnh hưởng lớn

Trước khi recommend, đây là 7 câu mình sẽ hỏi user (lock ở §11):

| # | Câu hỏi | Tại sao quan trọng |
|---|---|---|
| Q8 | Lane: **stylized animation** (anime/Pixar/2D/3D-cartoon) **vs photoreal live-action**? | Đổi toàn bộ stack image+video, đổi cost 5–10×, đổi gap-list nào "né được". |
| Q9 | Độ dài đích: **short (30–60 s) → episodic (10–30 min) → feature (60–90 min)**? | Phase plan, ngân sách, người cần bỏ ra. |
| Q10 | Genre / tone: **drama dialogue-heavy** vs **action** vs **fantasy/sci-fi VFX** vs **slice-of-life** vs **documentary** vs **anthology**? | Genre quyết định gap nào quan trọng, dialogue % vs B-roll %, score budget. |
| Q11 | Casting: **synthetic personas mới hoàn toàn** vs **clone từ ảnh/giọng có sẵn** (cẩn trọng pháp lý)? | Bibles workflow khác nhau; rủi ro pháp lý khác nhau. |
| Q12 | Composing: **AI hoàn toàn (Suno/ACE-Step)** vs **AI + library license** vs **AI + composer thật**? | Score quality, rủi ro takedown, cost. |
| Q13 | Distribution target: **YouTube** / **festival submission** (DCP) / **streaming** / **theatrical** / **OTT global**? | Spec output (4K HDR Atmos vs 1080p stereo), QC bar, dub multi-lang. |
| Q14 | Budget cap cho 1 feature: **<$1k** / **$1–5k** / **$5–20k** / **không giới hạn**? | Quyết định model tier (Sora/Veo vs Runway vs open-source). |

→ **Default tạm** cho phần còn lại của tài liệu nếu user không trả lời:
> Q8 = stylized animation (anime-leaning),
> Q9 = ladder ngắn → episodic → feature,
> Q10 = drama character-driven (dialogue moderate, action ít, fantasy ít),
> Q11 = synthetic personas,
> Q12 = AI hoàn toàn (Suno + ACE-Step),
> Q13 = YouTube → festival,
> Q14 = $5k cap cho feature pilot.

---

## 3. Reasoning step-by-step — vì sao phim 90 phút khó gấp 90×+ so với short 60 s

Không phải tỷ lệ tuyến tính. Một số trục scale tệ hơn:

### 3.1 Coverage (shots/phút)
- Short 60 s ≈ 10 shot.
- Feature 90 min ≈ **1 000 – 2 000 shot** (industry avg 1 200, modern fast-cut tới 3 000).
- → **100–300× số shot**, nhưng số ledger row, số job poll, số idempotency key đều bùng theo. **Workflow runtime của v4 phải xử lý 1 000+ step trong một run.**

### 3.2 Consistency surface area
- Char Bible cho 1 phim 60 s: 1–2 nhân vật chính, 5–10 keyframe ref.
- Feature 90 phút: **8–15 nhân vật named** + 30–60 extra phụ + 10–20 location + 50+ prop bibles.
- Consistency check phải chạy **cross-scene, cross-act**, không chỉ trong một scene.
- → Cần **Bible-as-vector-DB**, không phải Bible-as-prompt-template.

### 3.3 Story complexity
- Short: 1 beat (kishōtenketsu hoặc 3-act compressed).
- Feature: **3 act, 8 sequences, 40+ scenes, 2–4 plot lines giao nhau, character arc cho ≥3 nhân vật chính**.
- → Director agent một mình không đủ. Cần **Showrunner (story bible) → Screenwriter (script pass) → Script-Editor (continuity)** tách rời, mỗi agent trách nhiệm khác nhau.

### 3.4 Continuity (props/costume/hair/makeup)
- Industry có "script supervisor" full-time chỉ ghi continuity log.
- AI hiện chưa tự catch "ly cà phê đầy trong shot A, vơi trong shot B kế tiếp". Cần **Continuity agent** chạy vision LLM (Claude Sonnet 4 vision / Gemini 2.5 Pro vision) so từng pair shot adjacent.

### 3.5 Performance (diễn xuất)
- Short clip 5 s: AI vẽ được "buồn", "vui", "ngạc nhiên" ở mức typecast.
- Feature: character arc đòi hỏi **micro-expression theo subtext** ("bên ngoài cười, trong lòng đau"). 2026 vẫn yếu.
- → Workaround: voice-over carries emotion, body composition + lighting + score do heavy lifting.

### 3.6 Audio mix
- Short 60 s: VO + 1 music cue + auto-duck.
- Feature 90 min: dialog tracks + 20+ music cues với crossfade + 100+ foley + ambient layer + 5.1 surround.
- → Cần **Sound designer agent** (cue list) + **Re-recording mixer** workflow (loudness, balance) chạy ngoài Remotion.

### 3.7 Continuity của lighting + color
- Mỗi clip Runway xuất ra có color cast khác nhau. Auto-grade từng clip → drift.
- → Cần **Colorist agent**: extract LUT từ keyframe master → áp lên mọi clip trước khi compose.

### 3.8 QC bar
- Short: 1 lần user review.
- Feature: cần **dailies review** (mỗi scene reject/regen) + **rough cut** + **fine cut** + **picture lock** + **sound lock** + **delivery QC**.
- → 6 vòng approval gate vs 3 vòng. Workflow runtime của v4 đã làm pause/resume → vẫn ổn, chỉ là **nhiều hơn**.

### 3.9 Cost / time risk
- Mỗi retake ở v3 = ~$0.50 (1 shot).
- Mỗi retake ở feature = $0.50 nhưng có 1 500 shot, lỡ phải retake cả act 3 = $X × 500 shot = đốt budget nhanh.
- → **Cost-cap per scene** quan trọng hơn cost-cap per shot. Cần **scene-level budget** trong policy (mở rộng v4 §5.7).

### 3.10 Mental load của showrunner
- Short: 1 person có thể giữ trong đầu toàn bộ.
- Feature: 90 min = quá nhiều — sẽ quên ai mặc gì ở scene 12.
- → UI phải **show studio bible always-on**, search được, lookup theo character/location/prop.

---

## 4. Hollywood department system → AI agent mapping

Bộ phim Hollywood có ~25 head-of-department. Mình map sang **10 agent groups** (consolidate vai trò "agent có cùng I/O" lại):

| # | Hollywood role(s) | Holi-AI agent | Capability mix | Output artifact |
|---|---|---|---|---|
| 1 | **Showrunner / EP / Director** | `director.master` | `llm.chat` (Claude Opus 4 + extended thinking) | story bible, tone bible, master shot list, dailies notes |
| 2 | **Screenwriter / Story Editor / Script Supervisor** | `writer.script` + `writer.continuity` | `llm.chat` (Claude/Gemini long-context) | script.fdx-equivalent JSON, continuity log |
| 3 | **Casting director + Actors + Voice cast** | `casting.persona` | `image.edit` (Flux Kontext) + `audio.tts` (ElevenLabs voice clone) | Character Bible: portrait sheet, expression sheet, voice fingerprint |
| 4 | **Production Designer + Art Director + Set decorator + Locations** | `world.designer` | `image.gen` (Flux/Midjourney) + `image.edit` (Flux Kontext) | Location Bible, set refs, prop refs, mood boards |
| 5 | **Costume + Hair & Makeup** | `wardrobe` | `image.edit` (Flux Kontext char variations) | Costume Bible per character |
| 6 | **DP / Cinematographer + Camera op + Gaffer** | `cinematographer` | `video.i2v` (Runway Gen-4 Refs / Sora / Veo 3) | Per-shot MP4 (5–10 s) |
| 7 | **Stunt + Choreographer + Animation supervisor** | `motion.choreo` | `video.t2v` (Sora) + Wan motion + (optional Move.ai for hybrid) | Action beat clips |
| 8 | **VFX supervisor + Compositor + Matte painter** | `vfx.compositor` | `image.edit` mask + `video.i2v` overlay + Remotion comp | VFX-enhanced clips |
| 9 | **Sound designer + Foley + Re-recording mixer + Composer + Music supervisor** | `sound.designer` + `composer` | `audio.tts` + ElevenLabs SFX + `audio.music` (Suno/ACE-Step) | Dialogue tracks, foley bed, ambient bed, score stems |
| 10 | **Editor + Colorist + Post supervisor + Distribution QC** | `editor` + `colorist` + `qc` | Remotion + FFmpeg + vision-LLM continuity check | rough cut, fine cut, master deliverable, QC report |

→ **Quan trọng**: trong v4 mỗi agent là một **step function**, có thể **gọi nhiều capability**, được **router quyết định provider/account**. Không có agent nào hardcode tới vendor. Q7 architecture (custom workflow runtime) vẫn áp.

### 4.1 "AI có thể làm đạo diễn?" — chính xác là làm cái gì
"Đạo diễn" không phải một việc đơn lẻ. Tách ra để xem AI làm được phần nào:

| Director sub-task | AI làm được? | Note |
|---|:---:|---|
| Story breakdown (theme → beat sheet) | ✓ | Claude Opus 4 OK với revision |
| Shot list từ scene | ✓ | Long-context LLM thừa sức |
| Composition / blocking (where actors stand, where camera) | ⚠️ | Có thể đề xuất, không tự chấp pick best take |
| Casting (chọn diễn viên) | ✓ | Vì casting = chọn ref image + voice |
| **Performance direction** ("diễn lại với less anger") | ⚠️ | Bằng cách regen với prompt khác — không phải coaching realtime |
| Pacing / rhythm (cảm nhận khi nào cắt) | ⚠️ | Pattern match được, "taste" thì còn yếu |
| **Final cut decision** | ✗ | Đây là vai trò human-creative-director không thay thế được năm 2026 |

→ Holi-AI's director agent **không thay thế đạo diễn người**. Nó **giảm 95% công việc preparation** (shot list, script breakdown, dailies notes, version compare) để human-creative-director (= user) chỉ phải đưa **5% quyết định cốt lõi**.

---

## 5. Tám cách giải bài "làm phim feature bằng AI", đánh giá thẳng

Mỗi cách là một **macro-strategy** — chiến lược sản xuất, không phải lựa chọn tool.

### Cách 1 — *One-shot brute force*
Submit script 90-page → AI tự gen toàn bộ phim → render → giao.

- **Pros**: gần như 0 effort.
- **Cons**: chất lượng không kiểm soát, đốt $$ vào output unusable, không lock được consistency.
- **Reversibility**: thấp (đốt xong tiền rồi).
- **Verdict**: **không**. Bao giờ cũng tệ trừ khi model jump 2 thế hệ.

### Cách 2 — *Scene-by-scene linear*
Áp v3 pipeline cho từng scene tuần tự. Approval gate cho từng scene. 60 scene → 60 lần lặp pipeline 60 s.

- **Pros**: tận dụng v3 1:1, đơn giản.
- **Cons**: 60 lần × 3 approval gate = 180 lần review → fatigue. Bibles không chia sẻ giữa scene → drift. Pacing toàn phim không ai chịu trách nhiệm.
- **Verdict**: ổn cho **20 min episodic** đầu tiên (de-risk), không scale cho 90 min.

### Cách 3 — *Hierarchical 5-tier* ✨
Film → Acts → Sequences → Scenes → Shots. Mỗi tầng có agent + approval gate riêng. Bibles cascade xuống. Render bottom-up.

- **Pros**: match cấu trúc industry. Manage complexity. Bible inherit. Có thể parallel ở tầng sequence/scene/shot. Pacing được chốt ở tầng Sequence + Act.
- **Cons**: orchestration phức tạp hơn. Cần extend workflow runtime để có **sub-workflow** (workflow gọi workflow).
- **Reversibility**: trung bình — xương sống không phải đập lại nếu chỉ thay tool.
- **Verdict**: **nên là backbone**.

### Cách 4 — *Trailer-first / proof-of-style*
Gen trailer 2–3 min trước để lock visual identity (LUT, character look, voice, music theme). Rồi mới mở rộng ra feature.

- **Pros**: de-risk style nhanh. Fail fast on tone. Có sản phẩm marketable.
- **Cons**: trailer thành công ≠ feature thành công (trailer hit cao điểm; feature có valley).
- **Verdict**: **add-on hữu ích** trên hierarchical, không thay thế.

### Cách 5 — *Episodic ladder*
Phim đầu tiên = 3 min teaser. Phim 2 = 10 min short. Phim 3 = 30 min episode. Phim 4 = 60 min special. Phim 5 = 90 min feature.

- **Pros**: progressive de-risk. Có deliverable mỗi tháng. Học từ project cũ cho project mới. Bibles được tái sử dụng nếu cùng vũ trụ.
- **Cons**: 6 tháng đến 1 năm để chạm feature.
- **Verdict**: **kế hoạch tổng** (F0 → F5 ở §9 chính là cụ thể hoá cách này).

### Cách 6 — *Character/world-bible front-loaded*
Tuần 1 = build hết Char Bible + Location Bible + Prop Bible + Voice Fingerprint + Music Theme. Tuần 2 trở đi = chỉ produce.

- **Pros**: lock consistency. Mọi shot có ref ngon. Style không trượt.
- **Cons**: feel tedious trước khi thấy progress. Có thể over-design các thứ không xài.
- **Verdict**: **bắt buộc** cho feature, optional cho short.

### Cách 7 — *Lane selection (stylized vs photoreal)*
Photoreal feature = uncanny valley + lip-sync khó + body action khó. Stylized (anime / 2D / 3D-cartoon / claymation-look) = AI mạnh, người dễ tha thứ cho stylization.

- **Pros stylized**: tận dụng strength của diffusion models, ít gap-list.
- **Pros photoreal**: target audience rộng hơn, "Hollywood" hơn.
- **Cons photoreal 2026**: vẫn lộ AI ở close-up dài. Tay/eyeline drift. Skin texture flicker.
- **Verdict**: **stylized lane đầu tiên**. Khi 2027 chạm photoreal stable → swap lane (mỗi adapter là một tầng provider, workflow logic không đổi).

### Cách 8 — *Hybrid 2D agent + 3D world*
Build 3D set bằng AI 3D (Tripo3D / Splat) một lần. Render camera angle bất kỳ qua Three.js / Unity. Composite character AI 2D lên trên. Tự control camera precisely (không phụ thuộc Runway camera prompts).

- **Pros**: camera control tuyệt đối. Set consistent 100%. Re-render góc khác miễn phí.
- **Cons**: pipeline phức tạp 10×. Cần Unity/Three.js expertise. Hybrid 2D-3D composite có seam visible.
- **Reversibility**: thấp (đầu tư pipeline lớn).
- **Verdict**: **tham vọng v6+**, **không phải mục tiêu 2026**.

### Bảng so sánh

| Tiêu chí | 1 One-shot | 2 Linear | **3 Hierarchical** | **4 Trailer-first** | **5 Episodic** | **6 Bible-first** | **7 Stylized lane** | 8 Hybrid 3D |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Khả thi 2026 | ✗ | ✓ (≤20 min) | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠️ |
| Cần code mới so v3/v4 | 0 | 0 | trung bình | nhỏ | nhỏ | trung bình | 0 | rất lớn |
| Risk story drift | rất cao | cao | thấp | thấp | thấp | thấp | thấp | thấp |
| Risk consistency drift | rất cao | trung bình | thấp | thấp | thấp | rất thấp | thấp | rất thấp |
| Approval fatigue | 0 | rất cao | thấp | thấp | thấp | thấp | thấp | thấp |
| Cost per feature | đốt | trung bình | trung bình | trung bình | trung bình | trung bình | thấp | cao |
| Time to deliverable | ∞ (fail) | 6+ tháng | 3–6 tháng | 1 tháng (trailer) | progressive | +1 tuần upfront | -50% | 12+ tháng |

→ Đối thủ thực sự chỉ là **(3) Hierarchical** as backbone, với **(4) (5) (6) (7) overlay**. (1) (2) loại; (8) defer.

---

## 6. Recommendation

> **Backbone**: Cách 3 (Hierarchical 5-tier).
> **Overlay**: Cách 6 (Bible-first) + Cách 7 (Stylized lane) + Cách 5 (Episodic ladder) + Cách 4 (Trailer-first cho mỗi feature mở rộng).

### 6.1 Tại sao chốt như vậy
1. **Hierarchical** match industry mental model → user (showrunner) làm việc tự nhiên.
2. **Bible-first** giải bài consistency surface area (§3.2) trực diện. Investment lớn nhất ở Tier 1 (Pre-production), sau đó từng scene rẻ.
3. **Stylized lane** tận dụng đúng strength của 2026 tech, né uncanny valley. Sẵn sàng swap sang photoreal khi adapter level (không phải workflow level) bắt kịp.
4. **Episodic ladder** đảm bảo có deliverable shippable mỗi 2–4 tuần. Học từ project trước cho project sau. Tránh "build cả năm rồi tệ".
5. **Trailer-first** cho mỗi feature: khi quyết làm 90 min, gen trailer 2 min trước, lock style + cast + tone. Trailer 2 min = 1/45 budget nhưng quyết định 80 % quality.

### 6.2 Confidence
- **Cao** cho **stylized lane**, **hierarchical backbone**, **bible-first**.
- **Trung bình** cho **feature 90 min trong 2026** (phụ thuộc model upgrades).
- **Thấp** cho **photoreal feature 2026** (chưa). Plan sẵn lane swap khi 2027.

### 6.3 Unknowns còn lại
- Runway Gen-5 / Sora 3 ra khi nào và có cải thiện consistency cross-scene không.
- Veo 3 → Veo 4 có lift được dialogue scene 30s không (giảm phụ thuộc Hedra/LipDub).
- Cost model Suno/Udio (changes rapidly).
- License pháp lý cho voice clone (Q11 Q12 lock sẽ giải).

---

## 7. Architecture extensions trên v4

Không thay đổi v4. Bổ sung thêm tầng và bảng.

### 7.1 Hierarchical entity model

```
Project (1 phim)
└── Story Bible (đúng 1)
└── Character Bible (n nhân vật)
└── World Bible (n location + n prop)
└── Style Bible (LUT, tone, music theme, font kit, motion grammar)
└── Voice Bible (n voice fingerprint)
└── Acts (3 typically)
    └── Sequences (8 typically)
        └── Scenes (~40 typically)
            └── Shots (~1 200 typically)
                └── Renders (clip mp4)
                └── Approvals (rough/fine)
```

### 7.2 New DB tables (mở rộng v4 §5.2)

```sql
-- 7) Bibles: blueprint cho consistency, là first-class
create table bibles (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null,
  kind          text not null,        -- 'story'|'character'|'world'|'style'|'voice'
  name          text not null,        -- e.g. "Mai" cho character bible
  data          jsonb not null,       -- structured fields (xem §7.5)
  embedding     vector(1536),         -- pgvector: similarity lookup khi tìm refs
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (project_id, kind, name)
);
create index on bibles using hnsw (embedding vector_cosine_ops);

-- 8) Bible assets (image/audio refs gắn với bible)
create table bible_assets (
  id            uuid primary key default gen_random_uuid(),
  bible_id      uuid not null references bibles(id) on delete cascade,
  role          text not null,        -- 'portrait'|'expression'|'costume'|'voice_sample'|'location_master'
  asset_url     text not null,        -- R2 url
  meta          jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- 9) Hierarchical units: acts → sequences → scenes → shots → renders
create table film_units (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null,
  parent_id     uuid references film_units(id) on delete cascade,
  kind          text not null,        -- 'act'|'sequence'|'scene'|'shot'
  position      int not null,         -- ordering within parent
  title         text,
  beat          text,                 -- story beat (1 dòng)
  meta          jsonb default '{}'::jsonb,
                                      -- scene: {location_bible_id, time_of_day, weather, mood}
                                      -- shot:  {camera, action, duration_sec, ref_bibles[], dialogue?, vo?}
  status        text default 'draft', -- 'draft'|'locked'|'approved'|'rendering'|'rendered'|'final'
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index on film_units (project_id, parent_id, position);
create index on film_units (project_id, kind, status);

-- 10) Renders: mỗi shot có thể có nhiều render (retake)
create table renders (
  id            uuid primary key default gen_random_uuid(),
  shot_id       uuid not null references film_units(id) on delete cascade,
  attempt       int not null default 1,
  provider_job_id uuid references provider_jobs(id),
  asset_url     text,
  thumb_url     text,
  duration_sec  numeric,
  cost_usd      numeric(12,4),
  metrics       jsonb default '{}'::jsonb,  -- {character_drift_score, color_drift, lip_sync_score}
  status        text default 'pending',
  is_selected   boolean default false,      -- showrunner picks best take
  created_at    timestamptz default now()
);

-- 11) Department workspace: tới đâu trong pre-production
create table department_runs (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null,
  department      text not null,         -- 'showrunner'|'screenwriter'|'casting'|...
  workflow_run_id uuid references workflow_runs(id),
  status          text default 'pending',
  notes           text,
  created_at      timestamptz default now()
);

-- 12) Continuity log (script supervisor agent)
create table continuity_notes (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null,
  scene_id      uuid references film_units(id),
  shot_id       uuid references film_units(id),
  kind          text not null,         -- 'prop'|'costume'|'hair'|'lighting'|'eyeline'|'screen_direction'
  severity      text not null,         -- 'info'|'warning'|'error'
  message       text not null,
  evidence      jsonb,                 -- {shot_a_url, shot_b_url, frame_a, frame_b}
  resolved      boolean default false,
  created_at    timestamptz default now()
);
```

### 7.3 Workflow runtime extensions (mở rộng v4 §5.6)

Thêm 2 step kinds mới:

| Step kind | Mục đích | Pause? | Resume? |
|---|---|---|---|
| `subworkflow` | Step gọi workflow con. Cho phép Film → Act → Scene → Shot nest. | parent paused đến khi child done | child success → tick parent |
| `iterator` | Step nhận list, fan out N items theo strategy (parallel-bounded / sequential / batched). | paused đến khi mọi child done | each child done → tick |

```ts
// packages/workflows/types.ts (mở rộng)
export type StepKind = 'sync' | 'async-job' | 'approval' | 'parallel' | 'subworkflow' | 'iterator';

export interface IteratorStep<I, O> extends Step<I[], O[]> {
  kind: 'iterator';
  concurrency: number;                  // max parallel
  strategy: 'parallel-bounded' | 'sequential' | 'batched';
  itemWorkflow: Workflow<I, O>;
}

export interface SubworkflowStep<I, O> extends Step<I, O> {
  kind: 'subworkflow';
  child: Workflow<I, O>;
}
```

Workflow definitions (mới):

```
packages/workflows/definitions/
├── film.generate.ts           # top-level (existed in v4, now wraps act-level)
├── act.generate.ts            # NEW: 1 act = sequences + lock
├── sequence.generate.ts       # NEW
├── scene.generate.ts          # NEW: scene → shots → renders
├── shot.render.ts             # NEW: 1 shot → renders → pick best take
├── bibles/
│   ├── character.bible.ts     # NEW: build Char Bible
│   ├── world.bible.ts         # NEW
│   ├── style.bible.ts         # NEW
│   └── voice.bible.ts         # NEW
├── pre-production/
│   ├── script.write.ts        # NEW: screenwriter agent
│   ├── script.revise.ts       # NEW: editor agent
│   ├── shot.list.ts           # NEW: break script → shot list
│   └── trailer.generate.ts    # NEW: 2-min trailer-first
└── post/
    ├── continuity.check.ts    # NEW: cross-shot vision check
    ├── color.grade.ts         # NEW
    ├── sound.design.ts        # NEW
    ├── score.compose.ts       # NEW
    └── final.master.ts        # NEW: DCP/streaming/web master
```

### 7.4 Router policy extensions (mở rộng v4 §5.4)

Thêm hint mới:

```ts
hints: {
  // ... existing
  filmUnitKind?: 'act' | 'sequence' | 'scene' | 'shot';
  qualityTier?: 'preview' | 'fine' | 'hero';   // preview = cheap Wan, hero = Veo 3
  bibleIds?: string[];                          // pass thẳng để provider gắn refs
};
```

`routing_policies` thêm `quality_tier_map` jsonb (tier → preferred_models) để **showrunner chốt 1 lần** "trailer dùng Veo 3, B-roll dùng Wan, dialogue dùng Runway".

### 7.5 Bible schema (data jsonb)

#### Character Bible
```json
{
  "name": "Mai",
  "age": 17,
  "build": "petite, 1m58, slim",
  "wardrobe_signature": "áo dài trắng, khăn len đỏ",
  "hair": "tóc đen dài ngang vai",
  "voice_fingerprint_id": "11labs:voice_abc123",
  "personality_traits": ["nhút nhát","kiên cường","mơ mộng"],
  "speech_pattern": "miền Bắc, giọng nhẹ",
  "leitmotif_music_id": "score:mai_theme_v3",
  "references": {
    "portraits": ["asset:portrait_3q","asset:portrait_smile","asset:portrait_cold"],
    "expressions": {"happy":"asset:exp_happy","sad":"asset:exp_sad"},
    "costumes": ["asset:aodai","asset:winter_coat"]
  },
  "arc": "từ một cô bé nhút nhát thành người dám tự bán diêm sưởi cả phố"
}
```

#### Style Bible
```json
{
  "look_name": "Hà Nội đêm mùa đông pastel",
  "aspect_ratio": "2.39:1",
  "frame_rate": 24,
  "lut_id": "asset:lut_hanoi_winter",
  "color_palette": ["#1a2436","#f3d8b0","#c75a3c","#eaeae3"],
  "motion_grammar": "long pans, dolly-in trên close-up, no shaky-cam",
  "lens": "anamorphic-look, shallow DoF",
  "font_kit_id": "kit:subtitle_serif",
  "music_theme_id": "score:hanoi_strings_theme"
}
```

#### Story Bible
```json
{
  "logline": "Cô bé 17 tuổi bán diêm trong đêm Giao thừa Hà Nội...",
  "tone": ["melancholy","tender","glimmer-of-hope"],
  "themes": ["sự ấm áp giữa cái lạnh","tưởng tượng cứu rỗi","tình người vô danh"],
  "structure": "3-act + epilogue",
  "acts": [
    {"id":"act1","title":"Đêm bắt đầu","beat":"Mai ra phố"},
    {"id":"act2","title":"Que diêm","beat":"Mỗi que diêm là một ảo ảnh"},
    {"id":"act3","title":"Lửa thật","beat":"Người lạ đến"}
  ]
}
```

### 7.6 Continuity check (new capability)

Capability mới: `vision.continuity` — vision LLM (Claude Sonnet 4 vision / Gemini 2.5 Pro) so 2 frame liền kề và report drift.

Thêm vào `Capability` union ở v4 §5.1.

---

## 8. UI/UX extensions

### 8.1 New routes (chồng lên v4 §6)

| Route | Vai trò |
|---|---|
| `/studio/[projectId]/bible/[kind]/[name]` | Edit bible (Char/World/Style/Voice). Portrait sheet, expression sheet, voice samples. |
| `/studio/[projectId]/script` | Script editor (3-pane: scene list, scene script, AI-suggestions). |
| `/studio/[projectId]/board` | Storyboard view (scene cards với keyframe preview). |
| `/studio/[projectId]/timeline` | Hierarchy navigator: Acts → Sequences → Scenes → Shots → Renders. |
| `/studio/[projectId]/dailies` | Review queue: mỗi render mới approve/reject/regen, hotkey J/K/L. |
| `/studio/[projectId]/cut` | Remotion preview embed + cut-list editor. |
| `/studio/[projectId]/continuity` | Continuity notes inbox (script supervisor agent output). |
| `/studio/[projectId]/mix` | Audio mix UI: clip stems, music cues, dialog tracks. |
| `/studio/[projectId]/deliver` | Master + QC report + export 4K/HDR/Atmos/web variants. |

### 8.2 Cross-cutting UI elements

- **Always-on Bible Drawer**: nhân vật / location / prop được "@-mention" trong mọi prompt UI, autocomplete từ bibles.
- **Hierarchical breadcrumb**: `Project › Act 2 › Sequence 4 › Scene 12 › Shot 7 › Take 3`.
- **Cost rail luôn hiện**: cumulative spend, projected to-completion, hard-stop threshold.
- **Diff view**: 2 take cạnh nhau, vision-LLM tự highlight khác biệt (hair, costume, lighting).

---

## 9. Phase ladder F0 → F5 (concrete deliverables)

Áp dụng Cách 5 (Episodic ladder) làm tổng. Mỗi phase = 1 deliverable shippable + 1 capability mới rút từ v5.

| Phase | Wall-clock | Deliverable | Mới mở capability | Bibles ship |
|---|---|---|---|---|
| **F0 — Backbone** | 1 tuần (sau P0/P1/P2 của v4) | Hierarchical tables migrated; Bible CRUD UI; pick-take UI | `subworkflow`, `iterator` step kinds | (none — UI only) |
| **F1 — Teaser 60–90 s** | 1–2 tuần | 1 phim ngắn end-to-end (= v3 deliverable) nhưng chạy qua v5 hierarchy. Tier=1 act → 1 scene → ~10 shot. | None new — re-use v3 | Char Bible (1), Style Bible |
| **F2 — Short 5 min** | 2–3 tuần | Một phim 5 phút, ~5 scene, ~60 shot. Bibles dùng nhiều shot. Approval batching. | Continuity check (`vision.continuity`) | + World Bible, Voice Bible |
| **F3 — Episode 15 min** | 4–6 tuần | Episode đầu tiên có 3-act structure compress trong 15 min. ~150 shot. Pacing agent | Sound design workflow, score agent với leitmotif | + Sound Bible, Music theme |
| **F4 — Short feature 30 min** | 6–8 tuần | "Pilot episode" 30 min. ~400 shot. Dailies queue + dedicated colorist agent | Color grade LUT propagation, Trailer-first workflow | + Costume Bible per char |
| **F5 — Feature 60–90 min** | 3–6 tháng | Phim feature đầu tiên. ~1 200 shot. Full department system active. Master deliver YouTube + DCP-light. | VFX compositor agent, mix workflow Auphonic-grade | Toàn bộ bibles + delivery presets |

### 9.1 Exit criteria cho mỗi phase
- **F0**: tạo project, build Char Bible 1 nhân vật, ship 1 demo MP4 5 s gắn ref bible.
- **F1**: brief → MP4 60 s khớp v3 cost/quality bar.
- **F2**: continuity agent catch ≥80 % manual-spotted prop/costume drift.
- **F3**: 15-min episode có score 5 cue + foley layer, **không** drift visible character.
- **F4**: trailer-first workflow tạo trailer 2 min trước, lock style, mở rộng 30 min feature.
- **F5**: 60–90 min phim hoàn chỉnh, ≤ 6 vòng review/approval, ≤ ngân sách $5k.

### 9.2 Khi nào swap photoreal lane
Mỗi cuối phase, đánh giá Sora/Veo/Runway versions hiện tại. Khi:
- Sustained 30-s shot same-character drift score < 0.05
- Lip-sync MOS ≥ 4.0 native trong model (không cần overlay)
- Hand artifact rate < 2 % in action scenes

→ Bật `style.bible.lane = 'photoreal'`, các adapter `cinematographer` swap default model. **Workflow logic không đổi.**

---

## 10. Cost & time model

### 10.1 Cost per minute (stylized lane, 2026 pricing)

| Item | Rate (mid-2026) | Per minute of finished film |
|---|---|---|
| Director + Writer LLM (Claude Opus 4 thinking) | $0.02/min planning | $0.10 |
| Continuity vision-LLM check | $0.05/scene | $0.40 |
| Character/World Bible build (one-time, amortize) | $50/project | $0.50 (assuming 100 min) |
| Keyframes (Flux Kontext, ~2/shot × 15 shot/min) | $0.04 × 30 | $1.20 |
| Image-to-video Runway Gen-4 Turbo (15 shot/min × 6 s) | $0.05 × 90 s | $4.50 |
| TTS dialogue + VO (ElevenLabs, ~150 words/min) | $0.30 | $0.30 |
| Music score (Suno/ACE-Step, amortize cue) | 5 cues × $0.10 / 15 min | $0.05 |
| Foley + SFX (ElevenLabs SFX, ~20/min) | $0.01 × 20 | $0.20 |
| Color grade pass (LLM + apply LUT, near-free) | $0.02/min | $0.02 |
| Edit & compose (Remotion + FFmpeg local) | $0 | $0 |
| **Subtotal** | | **~$7.27/min finished** |

### 10.2 Feature-length projections

| Length | Base cost | + 30 % retake budget | + bibles + trailer | Total |
|---|---|---|---|---|
| 5 min short (F2) | $36 | $47 | $97 | **~$100** |
| 15 min episode (F3) | $109 | $142 | $192 | **~$200** |
| 30 min short feature (F4) | $218 | $283 | $383 | **~$400** |
| 60 min feature (F5) | $436 | $567 | $667 | **~$700** |
| **90 min feature (F5+)** | $654 | $850 | $1 000 | **~$1 000–2 000** với hero-shot Veo 3 |

→ **Cheaper hơn mình ước tính ban đầu.** Lý do: scale ngược với consistency tooling — bibles amortize, dialogue % thấp hơn, MP4 compose miễn phí.

→ **Cost driver chính**: % shot dùng **Veo 3 hero** (đắt 8× Runway). Bốc tiền nhanh nếu mỗi scene đều "hero". Plan: 10 % shot = hero, 60 % = Runway, 30 % = Wan/Kling cheap B-roll.

### 10.3 Time per minute of finished film

| Phase | Wall-clock human | Wall-clock AI (background) |
|---|---|---|
| Pre-production (bibles + script + shotlist) | 0.5 hr / min finished | 0.2 hr / min finished |
| Production (render shots) | 0.1 hr / min (review only) | 1–2 hr / min (queue) |
| Post (edit + grade + mix + master) | 0.3 hr / min | 0.5 hr / min |
| **Total per finished min** | **~1 hr human** | **~3 hr AI compute (parallel)** |

→ 90 min feature = **~90 hr human work** ≈ 2 tuần full-time, 2 tháng part-time.

---

## 11. New decisions to lock (Q8 — Q14)

Đề xuất default mạnh; cần user xác nhận hoặc chọn khác.

| # | Decision | Default (đề xuất) | Why |
|---|---|---|---|
| **Q8** | Lane | **Stylized animation (anime/2D-leaning)** | Tận dụng AI strength 2026, né uncanny |
| **Q9** | Độ dài đích M5 (mục tiêu cuối) | **Feature 60–90 min** (qua ladder F0→F5) | Vision của user |
| **Q10** | Genre M1 | **Drama character-driven, dialogue moderate, fantasy nhẹ** | Né action / crowd / sustained physical — gap-list của AI |
| **Q11** | Casting | **100 % synthetic personas** (không clone người thật) | Tránh rủi ro pháp lý voice/likeness; consistency dễ kiểm soát |
| **Q12** | Music + score | **AI-only (Suno/ACE-Step), leitmotif workflow** | Cost + control; pháp lý sạch hơn license |
| **Q13** | Distribution M5 target | **YouTube 4K + festival DCP-lite** (không theatrical Atmos full) | Realistic cho 1 người + AI 2026 |
| **Q14** | Budget cap cho 1 feature pilot | **$5 000 hard cap** (gồm retakes) | Phù hợp một cá nhân; đủ rộng cho F4+F5 |

→ **Nếu user agree mọi default**: mình lock cùng `decisions.md` cùng style với Q1–Q7. Nếu khác, sửa ô cụ thể.

---

## 12. What is *out* of scope cho v5

- **Photoreal feature**: defer cho 2027 swap (`style.bible.lane = 'photoreal'`).
- **Theatrical Atmos / IMAX deliverable**: defer.
- **Multi-language dub auto** (chỉ subtitle multi-lang trước; dub multi-voice là feature F5+ hoặc M6).
- **Real-time playback / interactive film**: Genie 2 / world-models = ngoài scope.
- **Hybrid 2D-3D pipeline** (Cách 8): defer cho v6.
- **Tự động hoá final colour-grade theatrical-grade**: vẫn cần human pass trong DaVinci.

---

## 13. How v5 sits on top of v3 + v4 (architecture invariants)

> Không có gì trong v3 hoặc v4 bị thay thế. Mọi thứ trong v5 **thêm vào**.

| v3/v4 invariant | v5 ảnh hưởng |
|---|---|
| Q1 single-user, no auth | Giữ. Studio bibles và projects vẫn không cần multi-user. |
| Q2 BYOK-only | Giữ. Càng nhiều provider, càng cần multi-account đã có. |
| Q3 AES-256-GCM | Giữ. Voice clone API key cũng dùng cùng pipeline. |
| Q4 Soft-warn 80% + hard-stop 100% | Giữ. Mở rộng **per-scene budget** (mới) cộng dồn vào account-level. |
| Q5 Same-provider-first fallback | Giữ. |
| Q6 `/settings/routing` toggleable | Giữ. Thêm tab **per-quality-tier** (preview/fine/hero). |
| Q7 Custom workflow runtime | Giữ. **Mở rộng** thêm `subworkflow` + `iterator` step kinds. |
| Capability registry | Giữ. **Thêm** `vision.continuity` capability. |
| Provider router | Giữ. **Thêm** `qualityTier` hint, `bibleIds` hint, `filmUnitKind` hint. |
| `workflow_runs`, `workflow_step_runs` | Giữ schema. **Thêm** 5 bảng mới ở §7.2 (bibles, bible_assets, film_units, renders, continuity_notes). |

→ **Một cá nhân chỉ phải làm 1 project tại 1 thời điểm. Toàn bộ multi-account / fallback / budget / approval / pause-resume / async-job đã có sẵn từ v4. v5 chỉ thêm tầng story-and-craft lên trên.**

---

## 14. Câu hỏi mở (research, không blocking)

Đặt vào backlog, không cản F0 starting:

1. Sora 2 có API public chính thức chưa, latency thực tế?
2. Runway Gen-4 References cap bao nhiêu refs với fine-tune adapter?
3. ElevenLabs v3 voice clone — quality MOS với 30 s sample vs 3 min sample?
4. Suno API có quyền thương mại dùng đầy đủ cho feature distribution không?
5. Stable Audio Open có đủ tốt cho ambient layer 90 min mà không lặp?
6. Vision-LLM continuity check — Claude Sonnet 4 vision vs Gemini 2.5 Pro vision, accuracy on prop drift?
7. Có công cụ open-source nào auto-export DCP từ MP4 4K 24fps cho festival không?
8. Lipdub / Hedra giá thực tế per-second cho dialogue 30 min trên 90 phút.
9. Khi nào hợp lý prototype **photoreal lane** với cùng workflow architecture?
10. Cost / quality trade-off đo lường được: dùng vision-LLM chấm "rough cut quality" để biết phim nào nên đi tiếp vs reject.

---

## 15. Tóm lại — câu trả lời cho ambition

> *"Một người + AI có thể dựng được phim Hollywood-grade hoàn chỉnh hoàn toàn bằng AI hay không?"*

**Năm 2026:**
- **Stylized 60–90 min, một người, ≤$2 000, 3–6 tháng** — **CÓ.**
- **Photoreal Hollywood-grade 90 min một người** — **CHƯA.** Nhưng kiến trúc v5 đã chuẩn bị sẵn để swap lane khi tooling chạm tới — không phải đập lại nhà.

**Con đường:**
1. Lock 7 quyết định mới (Q8–Q14).
2. F0: backbone hierarchical + bibles, build trên v4 đã chốt.
3. F1 → F5: episodic ladder, mỗi phase một deliverable thật.
4. Cuối F5: phim feature đầu tiên, ~$1–2k, stylized.
5. 2027+: swap photoreal lane khi model bắt kịp.

**Câu hỏi cho user** (để mình tiếp tục):
- Q8–Q14 default OK hay muốn override ô nào?
- Sau khi user chốt, mình bổ sung vào `decisions.md` rồi merge cả PR docs. Code thực bắt đầu ở phase P0 (v4) trước khi chạm F0 (v5).
