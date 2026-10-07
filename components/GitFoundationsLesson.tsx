"use client";

import { useState } from "react";
import {
  GIT_EVIDENCE_BRIDGE_FIXTURE,
  GIT_EVIDENCE_BRIDGE_SOURCES,
  GIT_FOUNDATIONS_FIXTURE,
  checkGitEvidenceBridge,
  checkGitFoundationsReadiness,
  emptyGitEvidenceBridgeAnswers,
  emptyGitFoundationsAnswers,
  type GitEvidenceBridgeAnswers,
  type GitFoundationsAnswers
} from "../lib/git-foundations";

type Step = "snapshot" | "ref" | "direct-parent" | "ancestry";

const steps: readonly { id: Step; label: string }[] = [
  { id: "snapshot", label: "1 · Snapshot" },
  { id: "ref", label: "2 · Ref" },
  { id: "direct-parent", label: "3 · Direct parent" },
  { id: "ancestry", label: "4 · Ancestry" }
];

const C = GIT_FOUNDATIONS_FIXTURE.commits;
const E = GIT_EVIDENCE_BRIDGE_FIXTURE.commits;

export function GitFoundationsLesson() {
  const [step, setStep] = useState<Step>("snapshot");
  const [answers, setAnswers] = useState<GitFoundationsAnswers>(() => emptyGitFoundationsAnswers());
  const [checked, setChecked] = useState(false);
  const [bridgeAnswers, setBridgeAnswers] = useState<GitEvidenceBridgeAnswers>(() => emptyGitEvidenceBridgeAnswers());
  const [bridgeChecked, setBridgeChecked] = useState(false);
  const readiness = checkGitFoundationsReadiness(answers);
  const bridgeResult = checkGitEvidenceBridge(bridgeAnswers);

  const setAnswer = <K extends keyof GitFoundationsAnswers>(key: K, value: GitFoundationsAnswers[K]) => {
    setAnswers(current => ({ ...current, [key]: value }));
    setChecked(false);
    setBridgeAnswers(emptyGitEvidenceBridgeAnswers());
    setBridgeChecked(false);
  };

  const setBridgeAnswer = <K extends keyof GitEvidenceBridgeAnswers>(
    key: K,
    value: GitEvidenceBridgeAnswers[K]
  ) => {
    setBridgeAnswers(current => ({ ...current, [key]: value }));
    setBridgeChecked(false);
  };

  return (
    <section id="git-foundations" className="gitFoundations" aria-label="Git foundations lesson">
      <div className="sectionHeading foundationHeading">
        <div>
          <span className="kicker">GIT FOUNDATIONS · LESSON 01</span>
          <h2>Đọc lịch sử Git như một graph, không như danh sách SHA.</h2>
        </div>
        <p>
          Bài này dùng fixture dạy học riêng, không dùng dữ kiện của incident assessment.
          Mục tiêu là xây mental model trước khi bạn chẩn đoán delivery graph.
        </p>
      </div>

      <div className="foundationBoundary">
        <strong>TEACHING ONLY · KHÔNG TÍNH ĐIỂM</strong>
        <span>
          Navigation và self-check chỉ tồn tại trong component này; không ghi Git/CI checkpoint,
          không cấp verified/explained/transfer credit.
        </span>
      </div>

      <nav className="foundationNav" aria-label="Git foundations lesson navigation">
        {steps.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={step === item.id}
            onClick={() => setStep(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="foundationLessonBody">
        {step === "snapshot" && (
          <article aria-label="Git snapshot concept">
            <span className="conceptNumber">01</span>
            <h3>Commit là một snapshot có identity bất biến</h3>
            <p>
              Hãy nghĩ commit như một nút graph mang identity của một snapshot. Sau khi commit đã tồn tại,
              việc branch di chuyển không biến commit cũ thành snapshot mới.
            </p>
            <pre>{`commit ${C.base}\n└─ snapshot: source tree tại thời điểm đó`}</pre>
            <div className="foundationContrast">
              <b>Sai lầm thường gặp</b>
              <span>“main là code.”</span>
              <b>Mô hình tốt hơn</b>
              <span>“main là tên đang trỏ tới một commit; commit mới là snapshot.”</span>
            </div>
          </article>
        )}

        {step === "ref" && (
          <article aria-label="Git ref concept">
            <span className="conceptNumber">02</span>
            <h3>Ref là tên có thể di chuyển</h3>
            <p>
              Một branch ref có thể đổi target khi lịch sử tiến lên. Vì vậy một workflow checkout theo tên branch
              có thể nhận snapshot khác ở hai thời điểm, còn một commit identity đã chọn thì không tự đổi.
            </p>
            <pre>{`trước: main → ${GIT_FOUNDATIONS_FIXTURE.refBefore}\nsau:   main → ${GIT_FOUNDATIONS_FIXTURE.refAfter}\n        ${GIT_FOUNDATIONS_FIXTURE.refBefore} vẫn là commit cũ`}</pre>
            <p className="foundationRule">Khi yêu cầu cần tái lập đúng snapshot, hãy phân biệt “tên ref” với “commit mà ref resolve tới”.</p>
          </article>
        )}

        {step === "direct-parent" && (
          <article aria-label="Git direct parent concept">
            <span className="conceptNumber">03</span>
            <h3>Direct parent = đúng một cạnh</h3>
            <p>
              Parent list nằm trực tiếp trên commit. Với merge commit trong fixture dạy học này,
              hai parent trực tiếp được ghi theo thứ tự; điều đó khác với việc một commit chỉ nằm đâu đó trong ancestry.
            </p>
            <pre>{`${C.merge}\n├─ parent[0] → ${C.base}\n└─ parent[1] → ${C.feature}`}</pre>
            <p className="foundationRule">Đừng biến “merge có hai parent” thành luật chung cho mọi delivery policy; contract cụ thể mới quyết định điều cần kiểm tra.</p>
          </article>
        )}

        {step === "ancestry" && (
          <article aria-label="Git ancestry concept">
            <span className="conceptNumber">04</span>
            <h3>Ancestor có thể cách nhiều cạnh</h3>
            <p>
              Từ commit mới, lần theo parent edges nhiều bước vẫn có thể chạm commit cũ. Khi đó commit cũ là ancestor
              dù không phải direct parent của tip.
            </p>
            <pre>{`${C.later}\n└─ ${C.merge}\n   ├─ ${C.base}\n   │  └─ ${C.root}\n   └─ ${C.feature}\n      └─ ${C.root}`}</pre>
            <p className="foundationRule">Câu hỏi “A có là parent của B?” và “A có là ancestor của B?” là hai predicate khác nhau.</p>
          </article>
        )}
      </div>

      <section className="foundationCheck" aria-label="Git foundations readiness self-check">
        <div>
          <span className="kicker">SELF-CHECK</span>
          <h3>Kiểm tra mental model trước lab</h3>
          <p>Không có assessment credit ở đây. Sai thì sửa và thử lại; mục tiêu là phát hiện nhầm lẫn khái niệm trước incident.</p>
        </div>

        <div className="foundationQuestions">
          <label>1. Thứ nào xác định một snapshot bất biến?
            <select
              aria-label="Git foundations snapshot answer"
              value={answers.snapshot}
              onChange={event => setAnswer("snapshot", event.target.value as GitFoundationsAnswers["snapshot"])}
            >
              <option value="">Chọn đáp án</option>
              <option value="branch">Tên branch</option>
              <option value="commit">Commit identity</option>
            </select>
          </label>

          <label>2. Điều gì đúng về branch ref?
            <select
              aria-label="Git foundations ref answer"
              value={answers.ref}
              onChange={event => setAnswer("ref", event.target.value as GitFoundationsAnswers["ref"])}
            >
              <option value="">Chọn đáp án</option>
              <option value="immutable">Luôn trỏ mãi vào một commit</option>
              <option value="moves">Có thể di chuyển sang commit khác</option>
            </select>
          </label>

          <label>3. Direct parent nghĩa là gì?
            <select
              aria-label="Git foundations direct parent answer"
              value={answers.directParent}
              onChange={event => setAnswer("directParent", event.target.value as GitFoundationsAnswers["directParent"])}
            >
              <option value="">Chọn đáp án</option>
              <option value="any-ancestor">Bất kỳ commit nào ở phía sau lịch sử</option>
              <option value="one-edge">Commit nối trực tiếp bằng một parent edge</option>
            </select>
          </label>

          <label>4. Ancestor khác direct parent ở đâu?
            <select
              aria-label="Git foundations ancestry answer"
              value={answers.ancestry}
              onChange={event => setAnswer("ancestry", event.target.value as GitFoundationsAnswers["ancestry"])}
            >
              <option value="">Chọn đáp án</option>
              <option value="same-as-parent">Không khác; hai khái niệm giống nhau</option>
              <option value="multi-edge">Có thể reachable qua nhiều parent edges</option>
            </select>
          </label>
        </div>

        <button type="button" onClick={() => setChecked(true)}>Check foundations readiness</button>
        <p className="foundationStatus" role="status">
          {!checked
            ? "Chưa check. Self-check này không ghi assessment state."
            : readiness.passed
              ? "Sẵn sàng vào graph diagnostic lab: bốn mental-model checks đều đúng."
              : "Chưa sẵn sàng: xem lại concept tương ứng rồi thử lại; không có điểm nào bị trừ."}
        </p>

      </section>

      {checked && readiness.passed && (
        <section className="foundationCheck evidenceBridge" aria-label="Git evidence reading bridge">
          <div>
            <span className="kicker">EVIDENCE BRIDGE · TEACHING ONLY</span>
            <h3>Từ raw evidence tới ba predicate chẩn đoán</h3>
            <p>
              Đây là fixture thứ ba, tách khỏi cả lesson và incident assessment. Đọc nguồn trước,
              rồi suy ra commit thực sự được build, thứ tự direct parents và ancestry reachability.
              Sai ở đây chỉ nhận feedback; không ghi checkpoint và không cấp assessment credit.
            </p>
          </div>

          <div className="evidenceBank" aria-label="Git evidence bridge sources">
            {Object.values(GIT_EVIDENCE_BRIDGE_SOURCES).map(source => (
              <article key={source.id}>
                <strong>{source.title}</strong>
                <code>{source.id}</code>
                <pre>{source.output}</pre>
              </article>
            ))}
          </div>

          <div className="foundationQuestions">
            <label>1. Commit nào thực sự được checkout và đóng gói?
              <select
                aria-label="Git evidence bridge consumed commit"
                value={bridgeAnswers.consumedCommit}
                onChange={event => setBridgeAnswer("consumedCommit", event.target.value as GitEvidenceBridgeAnswers["consumedCommit"])}
              >
                <option value="">Chọn từ evidence</option>
                <option value="base">{E.base}</option>
                <option value="integration">{E.integration}</option>
                <option value="later">{E.later}</option>
              </select>
            </label>

            <label>2. Ordered direct parents của commit đó là gì?
              <select
                aria-label="Git evidence bridge ordered parents"
                value={bridgeAnswers.orderedParents}
                onChange={event => setBridgeAnswer("orderedParents", event.target.value as GitEvidenceBridgeAnswers["orderedParents"])}
              >
                <option value="">Chọn parent[0] → parent[1]</option>
                <option value="topic-base">{E.topic} → {E.base}</option>
                <option value="base-topic">{E.base} → {E.topic}</option>
                <option value="root-base">{E.root} → {E.base}</option>
              </select>
            </label>

            <label>3. {E.root} có là ancestor của consumed commit không?
              <select
                aria-label="Git evidence bridge ancestry"
                value={bridgeAnswers.rootAncestry}
                onChange={event => setBridgeAnswer("rootAncestry", event.target.value as GitEvidenceBridgeAnswers["rootAncestry"])}
              >
                <option value="">Chọn kết luận</option>
                <option value="yes">Có · reachable qua parent edges</option>
                <option value="no">Không · chỉ direct parent mới tính</option>
              </select>
            </label>
          </div>

          <button type="button" onClick={() => setBridgeChecked(true)}>Check evidence predicates</button>

          <div className="bridgeFeedback" role="status">
            {!bridgeChecked ? (
              <p>Chưa check. Hãy đối chiếu cả ba nguồn, không suy từ pipeline xanh.</p>
            ) : (
              <>
                <p>
                  {bridgeResult.passed
                    ? "Đủ ba predicate: bạn đã nối checkout/build metadata với graph thay vì đoán từ ref hoặc trạng thái job."
                    : "Còn predicate chưa khớp raw evidence. Đối chiếu từng source bên dưới rồi thử lại."}
                </p>
                <ul>
                  <li>
                    Consumed commit: {bridgeResult.consumedCommit ? "đúng" : "chưa đúng"} — checkout HEAD và
                    bundle source_commit phải cùng chỉ tới <code>{E.integration}</code>.
                  </li>
                  <li>
                    Ordered parents: {bridgeResult.orderedParents ? "đúng" : "chưa đúng"} — graph record ghi
                    parent[0] = <code>{E.base}</code>, parent[1] = <code>{E.topic}</code>.
                  </li>
                  <li>
                    Ancestry: {bridgeResult.rootAncestry ? "đúng" : "chưa đúng"} — <code>{E.root}</code> reachable
                    tới consumed commit qua nhiều parent edges, dù không phải direct parent.
                  </li>
                </ul>
              </>
            )}
          </div>

          {bridgeChecked && bridgeResult.passed && (
            <a className="foundationCta" href="#git-graph-practice">Vào graph diagnostic lab →</a>
          )}
        </section>
      )}
    </section>
  );
}
