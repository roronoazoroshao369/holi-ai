# NEXT_RUN_PROMPT

Tiếp tục vận hành tự chủ repo THẬT roronoazoroshao369/holi-ai qua @GitHub, nhánh main. Báo cáo tiến độ, quyết định, bằng chứng, PR/CI/merge và bàn giao bằng TIẾNG VIỆT. Đọc LIVE repo trước; repo là nguồn sự thật và checkpoint này có thể đã cũ.

Checkpoint sản phẩm: PR #30, head cuối dc03b3c0a8a0ea1e2a728106c72d5395000fe00e; CI 37325201149 / job 111814058034 SUCCESS. Thực chạy npm ci, full typecheck, 53/53 Node tests, audit 0 vulnerabilities, production build, Chromium từ Playwright 1.63.0 khóa trong repo, 7/7 production browser tests (52.1s), next start --hostname 127.0.0.1 --port 3100. Product squash merge 1b614eb51984b8737efa545eb92c951adafa2640 đã được đọc lại. Tài liệu closeout có PR riêng phải qua full exact-head CI; file này không tự khẳng định SHA merge cuối của chính PR tài liệu. Đọc lại main, PR mở và CI hiện tại.

Hiện có sáu primary incidents SIMULATED: bốn Linux (permission và TCP) cùng hai Git/CI (artifact handoff và release acceptance). Hai Linux counterfactuals và artifact-path/annotated-tag transfer là các assessment bước tiếp theo. Không gọi là Linux host, Git repo hay Actions runner thật; không chứng nhận, CONTROLLED_EXECUTION hay REAL_SANDBOX. localStorage forgeable, không authoritative. Không mở rộng sang accounts, Kubernetes, Docker hay sandbox thật trong lượt này.

Persistence: Linux schema 7 / fixture 5 không đổi. Git/CI schema 2 / fixture 2, key holi.devops.git-ci-practice, nested revisionPractice. V1 được discard có chủ đích. Giữ hai hợp đồng độc lập; nếu đổi semantics phải quyết định schema và fixture riêng.

MỘT FRONTIER ĐỀ XUẤT: khóa lập luận Git revision có source/fact cụ thể TRƯỚC repair, thay vì chỉ khóa nhãn causal class từ dropdown. Giữ incident và annotated-tag transfer hiện tại; không thêm scenario/token quiz chỉ để tăng số gate.

Lý do: learner hiện có thể đoán đúng class rồi viết source-linked explanation sau khi thấy repair outcome. Discovery/learning review phải kiểm tra liệu frontier còn đúng từ LIVE code; chọn thay đổi nhỏ nhất giải quyết weakness này. Không tạo grading engine hay workflow interpreter tổng quát.

Acceptance:
- Initial title/summary/button/source name trung tính, không leak đáp án.
- Evidence được thu trước lock/repair; rationale trước sửa gắn với source ID và fact độc lập, cộng causal relation trong grammar hữu hạn.
- Locked class/rationale bất biến đến reset; fact/source sai không được bù bởi relation đúng.
- Repair đúng sau diagnosis/rationale sai có thể làm actual SHA khớp nhưng không verified learning.
- Verify checkout SHA VÀ release metadata SHA đối chiếu intended commit, không chỉ màu pipeline.
- Explanation sau repair không được sửa lại bad pre-repair rationale theo hồi tố.
- Giữ transfer thay đổi representation: annotated tag OBJECT → target COMMIT, trong khi main đã tiến lên; không copy SHA incident đầu.
- Edit/rebuild/reverify/reset/refresh thu hồi các completion phụ thuộc đúng phạm vi.
- Restore fail closed với stale/corrupt/impossible/forged-derived flags; getter hoặc Storage methods bị chặn phải fallback ephemeral.
- Giữ toàn bộ regression Linux/artifact/revision; không giảm assertion, thêm retry hay tăng timeout để che race. Poll semantic persisted state trước reload/injection.
- Không tuyên bố chấm reasoning văn bản tự do nếu vẫn dùng typed finite grammar.

Đọc ít nhất docs/project/PROJECT_STATE.md, ROADMAP.md, BACKLOG.md, ARCHITECTURE.md, DECISIONS.md, RISKS.md, LEARNING_MODEL.md, LAB_SECURITY.md, RUN_LOG.md, GIT_REVISION_CONTRACT.md; lib/ci-simulator.ts, git-revision-simulator.ts, ci-practice-persistence.ts, linux-simulator.ts, practice-persistence.ts, curriculum.ts; components/CiLab.tsx, GitRevisionLab.tsx, LabTerminal.tsx; app/page.tsx, globals.css; mọi tests; playwright.config.cjs; .github/workflows/ci.yml; package.json/package-lock.json. Kiểm tra recent commits, PR mở và job logs.

Không learner input nào được execute git/YAML/shell/subprocess; không Docker socket, privileged container, host filesystem mount, cloud/control-plane credentials. Không dùng hidden client state làm security boundary. Giữ pure transitions nhỏ; không ép Git vào Linux simulator.

Loop trong lượt: inspect LIVE → reconcile docs → discovery → council review → một primary goal → acceptance → implement → typecheck/unit/build → security/learning/UX red-team → production browser → fix → exact FINAL-head CI → merge → đọc lại main → documentation closeout → full exact docs-head CI → merge → đọc lại final main/docs/PR mở → xuất NEXT_RUN_PROMPT mới → DỪNG.

Red-team bắt buộc: leakage, repair quá sớm, hypothesis/rationale mutable, right-label/wrong-facts bypass, green-only completion, checkpoint forge/refresh/reset, transfer chỉ đổi token, host execution, selector collision, mobile overflow, focus và console/page errors. Sửa finding trước gate cuối.

Trước merge cần đúng FINAL HEAD qua npm ci, full typecheck, toàn bộ Node tests, npm audit --audit-level=high, production build, Chromium từ Playwright runtime khóa trong repo và mọi production browser tests. Đọc failing logs trực tiếp, không đoán nguyên nhân từ status. Merge có expected_head_sha; không merge head đã đổi sau CI.

Sau product merge: đọc lại main; cập nhật durable controls bằng sự thật đã verify, ghi exact head/run/job/counts/merge/version decisions/red-team/remaining risks và MỘT frontier kế tiếp. PR tài liệu riêng phải qua full exact-final-head CI. Sau docs merge đọc lại main, docs và PR mở. Không dừng ở plan/implementation/open PR/non-final CI; không tự bắt đầu primary goal kế tiếp trong cùng lượt.
