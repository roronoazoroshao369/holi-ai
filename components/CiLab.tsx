"use client";

import { useEffect, useMemo, useState } from "react";
import { GitRevisionLab } from "./GitRevisionLab";
import {
  CI_EVIDENCE_SLOTS,
  CI_TRANSFER_EVIDENCE,
  applyCiRepair,
  ciEvidenceFor,
  ciEvidenceReady,
  initialCiLabState,
  inspectCiEvidence,
  lockCiHypothesis,
  rerunCiPipeline,
  submitCiExplanation,
  submitCiTransfer,
  type CiExplanation,
  type CiHypothesis,
  type CiLabState,
  type CiRepair,
  type CiTransferAnswer
} from "../lib/ci-simulator";
import {
  CI_PRACTICE_STORAGE_KEY,
  clearCiPractice,
  loadCiPractice,
  saveCiPractice,
  type CiStorage,
  type CiLoadStatus
} from "../lib/ci-practice-persistence";

const emptyExplanation = (): CiExplanation => ({
  workflowEvidenceId: "",
  workflowFact: "",
  producerEvidenceId: "",
  producerFact: "",
  consumerEvidenceId: "",
  consumerFact: "",
  causalClaim: "",
  minimalRepair: ""
});

const emptyTransfer = (): CiTransferAnswer => ({
  producerEvidenceId: "",
  producerFact: "",
  consumerEvidenceId: "",
  consumerFact: "",
  predictedPath: "",
  causalClaim: ""
});

function browserCiStorage(): CiStorage | null {
  try { return window.localStorage; } catch { return null; }
}

export function CiLab() {
  const [state, setState] = useState<CiLabState>(() => initialCiLabState());
  const [loadStatus, setLoadStatus] = useState<CiLoadStatus>("empty");
  const [hydrated, setHydrated] = useState(false);
  const [storageWritable, setStorageWritable] = useState(true);
  const [revisionEpoch, setRevisionEpoch] = useState(0);
  const [hypothesisDraft, setHypothesisDraft] = useState<CiHypothesis>("");
  const [repairDraft, setRepairDraft] = useState<CiRepair>("");
  const [explanation, setExplanation] = useState<CiExplanation>(() => emptyExplanation());
  const [transfer, setTransfer] = useState<CiTransferAnswer>(() => emptyTransfer());

  useEffect(() => {
    const storage = browserCiStorage();
    const loaded = storage ? loadCiPractice(storage) : { status: "unavailable" as const, state: initialCiLabState() };
    setState(loaded.state);
    setLoadStatus(loaded.status);
    setStorageWritable(loaded.status !== "unavailable");
    if (loaded.state.explanation) setExplanation(loaded.state.explanation);
    if (loaded.state.transfer) setTransfer(loaded.state.transfer);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const storage = browserCiStorage();
    setStorageWritable(Boolean(storage && saveCiPractice(storage, state)));
  }, [hydrated, state]);

  const evidenceReady = ciEvidenceReady(state);
  const captured = useMemo(
    () => CI_EVIDENCE_SLOTS.flatMap(slot => state.preRepairEvidence[slot] ? [state.preRepairEvidence[slot]!] : []),
    [state.preRepairEvidence]
  );

  const resetAll = () => {
    setRevisionEpoch(current => current + 1);
    const storage = browserCiStorage();
    if (storage) clearCiPractice(storage);
    setState(initialCiLabState());
    setHypothesisDraft("");
    setRepairDraft("");
    setExplanation(emptyExplanation());
    setTransfer(emptyTransfer());
    setLoadStatus("empty");
  };

  if (!hydrated) {
    return <section className="ciLab" aria-label="Git CI simulated incident"><p>Đang nạp Git & CI practice…</p></section>;
  }

  return (
    <section className="ciLab" aria-label="Git CI simulated incident">
      <div className="ciLabHeader">
        <div>
          <span className="kicker">GIT & CI / SIMULATED INCIDENT</span>
          <h3>Pipeline delivery incident</h3>
          <p>
            Release-check đang đỏ và downstream chưa hoàn tất được artifact handoff. Điều tra từ nguồn trước khi sửa.
            Đây là mô phỏng deterministic trong browser, không phải GitHub Actions runner thật.
          </p>
        </div>
        <div className="ciTruth">
          <strong>SIMULATED</strong>
          <span>localStorage là dữ liệu client không tin cậy; completion này không phải chứng nhận.</span>
        </div>
      </div>

      <div className="practicePersistence">
        <div>
          <strong>GIT/CI CHECKPOINT · CLIENT-LOCAL</strong>
          <p>
            {loadStatus === "restored" ? "Đã khôi phục checkpoint Git/CI hợp lệ."
              : loadStatus === "discarded" ? "Checkpoint Git/CI cũ/hỏng đã bị loại bỏ an toàn."
              : storageWritable ? "Tiến trình Git/CI được lưu trên trình duyệt này."
              : "Không thể persist checkpoint Git/CI; practice vẫn chạy ephemeral."}
          </p>
        </div>
        <button className="secondaryButton" type="button" onClick={resetAll}>Reset Git/CI incident</button>
      </div>

      <div className="ciStatus" aria-label="Pipeline symptom">
        <b>Observed symptom</b>
        <code>release-check / verify-artifact → FAILED</code>
        <span>Chưa kết luận causal class từ symptom duy nhất.</span>
      </div>

      <section className="reasoningPanel" aria-label="Git CI evidence collection">
        <h4>1. Thu thập evidence trước repair</h4>
        <p>Ba nguồn đều là snapshot trước repair. Root cause không được đưa vào tiêu đề hay initial copy.</p>
        <div className="ciEvidenceActions">
          {CI_EVIDENCE_SLOTS.map(slot => (
            <button key={slot} type="button" disabled={Boolean(state.repair)}
              onClick={() => setState(current => inspectCiEvidence(current, slot))}>
              {slot === "workflow" ? "Inspect workflow" : slot === "producer" ? "Inspect producer log" : "Inspect consumer failure"}
            </button>
          ))}
        </div>
        <div className="evidenceBank">
          {captured.map(record => (
            <article key={record.id}>
              <strong>{record.title}</strong>
              <code>{record.id}</code>
              <pre>{record.output}</pre>
            </article>
          ))}
        </div>
      </section>

      <section className="reasoningPanel" aria-label="Git CI causal hypothesis">
        <h4>2. Khóa causal hypothesis</h4>
        <p>{evidenceReady ? "Đủ ba nguồn để khóa hypothesis." : "Hypothesis chỉ mở sau khi đủ workflow, producer và consumer evidence."}</p>
        <label>Giả thuyết Git CI
          <select aria-label="Git CI hypothesis" value={state.hypothesis || hypothesisDraft}
            disabled={!evidenceReady || Boolean(state.hypothesis)}
            onChange={event => setHypothesisDraft(event.target.value as CiHypothesis)}>
            <option value="">Chọn causal class</option>
            <option value="artifact-contract">Producer/consumer artifact contract</option>
            <option value="test-regression">Test regression in produced content</option>
            <option value="runner-permission">Runner/workspace permission</option>
          </select>
        </label>
        <button type="button" disabled={!evidenceReady || !hypothesisDraft || Boolean(state.hypothesis)}
          onClick={() => setState(current => lockCiHypothesis(current, hypothesisDraft))}>
          Lock Git CI hypothesis
        </button>
      </section>

      {state.hypothesis && <section className="reasoningPanel" aria-label="Git CI repair and rerun">
        <h4>3. Sửa tối thiểu rồi rerun</h4>
        <p>Repair đúng có thể làm pipeline xanh; nhưng chỉ diagnosis đúng trước repair mới tạo verified learning signal.</p>
        <label>Pipeline repair
          <select aria-label="Git CI repair" value={state.repair || repairDraft} disabled={Boolean(state.repair)}
            onChange={event => setRepairDraft(event.target.value as CiRepair)}>
            <option value="">Chọn một thay đổi</option>
            <option value="map-current-artifact-output">Map build job output sang metadata step hiện tại</option>
            <option value="rename-built-files">Đổi tên files bên trong artifact</option>
            <option value="chmod-workspace">Mở quyền workspace trước download</option>
            <option value="rerun-only">Không đổi config, chỉ rerun</option>
          </select>
        </label>
        <button type="button" disabled={!repairDraft || Boolean(state.repair)}
          onClick={() => setState(current => applyCiRepair(current, repairDraft))}>
          Apply simulated repair
        </button>
        {state.repair && <button type="button" onClick={() => setState(current => rerunCiPipeline(current))}>
          Rerun simulated pipeline
        </button>}
        <div className="ciRunResult" role="status">
          {state.runStatus === "not-run" ? "Chưa rerun."
            : state.runStatus === "failed" ? "Pipeline vẫn đỏ."
            : state.verified ? "Pipeline xanh + diagnosis/evidence gate hợp lệ."
            : "Pipeline xanh, nhưng assessment KHÔNG verified vì pre-repair diagnosis không đúng."}
        </div>
      </section>}

      {state.verified && <section className="reasoningPanel" aria-label="Git CI source linked explanation">
        <h4>4. Source-linked explanation</h4>
        <p>Liên kết workflow contract với producer metadata và consumer expectation; không chấp nhận mô tả chung chung.</p>
        <fieldset disabled={state.explained}>
          <label>Nguồn workflow
            <select aria-label="Git CI workflow evidence" value={explanation.workflowEvidenceId}
              onChange={event => setExplanation({ ...explanation, workflowEvidenceId: event.target.value })}>
              <option value="">Chọn source</option>
              <option value={ciEvidenceFor("workflow").id}>{ciEvidenceFor("workflow").id}</option>
            </select>
          </label>
          <label>Workflow fact
            <input aria-label="Git CI workflow fact" value={explanation.workflowFact}
              onChange={event => setExplanation({ ...explanation, workflowFact: event.target.value })} />
          </label>
          <label>Nguồn producer
            <select aria-label="Git CI producer evidence" value={explanation.producerEvidenceId}
              onChange={event => setExplanation({ ...explanation, producerEvidenceId: event.target.value })}>
              <option value="">Chọn source</option>
              <option value={ciEvidenceFor("producer").id}>{ciEvidenceFor("producer").id}</option>
            </select>
          </label>
          <label>Producer fact
            <input aria-label="Git CI producer fact" value={explanation.producerFact}
              onChange={event => setExplanation({ ...explanation, producerFact: event.target.value })} />
          </label>
          <label>Nguồn consumer
            <select aria-label="Git CI consumer evidence" value={explanation.consumerEvidenceId}
              onChange={event => setExplanation({ ...explanation, consumerEvidenceId: event.target.value })}>
              <option value="">Chọn source</option>
              <option value={ciEvidenceFor("consumer").id}>{ciEvidenceFor("consumer").id}</option>
            </select>
          </label>
          <label>Consumer fact
            <input aria-label="Git CI consumer fact" value={explanation.consumerFact}
              onChange={event => setExplanation({ ...explanation, consumerFact: event.target.value })} />
          </label>
          <label>Causal relation
            <input aria-label="Git CI causal relation" value={explanation.causalClaim}
              onChange={event => setExplanation({ ...explanation, causalClaim: event.target.value })} />
          </label>
          <label>Minimal repair
            <input aria-label="Git CI minimal repair" value={explanation.minimalRepair}
              onChange={event => setExplanation({ ...explanation, minimalRepair: event.target.value })} />
          </label>
        </fieldset>
        <button type="button" disabled={state.explained}
          onClick={() => setState(current => submitCiExplanation(current, explanation))}>
          Check Git CI explanation
        </button>
        <p role="status">{state.explanation && !state.explained ? "Explanation chưa nối đúng các source/fact." : state.explained ? "Explanation hợp lệ." : ""}</p>
      </section>}

      {state.explained && <section className="reasoningPanel" aria-label="Git CI unfamiliar transfer">
        <h4>5. Changed transfer · cùng relation, khác failure shape</h4>
        <p>Artifact name giờ đã khớp. Scenario mới đổi sang path semantics; không dùng lại literal repair của incident đầu.</p>
        <div className="evidenceBank">
          <article>
            <strong>{CI_TRANSFER_EVIDENCE.producer.title}</strong>
            <code>{CI_TRANSFER_EVIDENCE.producer.id}</code>
            <pre>{CI_TRANSFER_EVIDENCE.producer.output}</pre>
          </article>
          <article>
            <strong>{CI_TRANSFER_EVIDENCE.consumer.title}</strong>
            <code>{CI_TRANSFER_EVIDENCE.consumer.id}</code>
            <pre>{CI_TRANSFER_EVIDENCE.consumer.output}</pre>
          </article>
        </div>
        <fieldset disabled={state.transferPassed}>
          <label>Nguồn producer transfer
            <select aria-label="Git CI transfer producer evidence" value={transfer.producerEvidenceId}
              onChange={event => setTransfer({ ...transfer, producerEvidenceId: event.target.value })}>
              <option value="">Chọn source</option>
              <option value={CI_TRANSFER_EVIDENCE.producer.id}>{CI_TRANSFER_EVIDENCE.producer.id}</option>
            </select>
          </label>
          <label>Producer path fact
            <input aria-label="Git CI transfer producer fact" value={transfer.producerFact}
              onChange={event => setTransfer({ ...transfer, producerFact: event.target.value })} />
          </label>
          <label>Nguồn consumer transfer
            <select aria-label="Git CI transfer consumer evidence" value={transfer.consumerEvidenceId}
              onChange={event => setTransfer({ ...transfer, consumerEvidenceId: event.target.value })}>
              <option value="">Chọn source</option>
              <option value={CI_TRANSFER_EVIDENCE.consumer.id}>{CI_TRANSFER_EVIDENCE.consumer.id}</option>
            </select>
          </label>
          <label>Consumer path fact
            <input aria-label="Git CI transfer consumer fact" value={transfer.consumerFact}
              onChange={event => setTransfer({ ...transfer, consumerFact: event.target.value })} />
          </label>
          <label>Đường dẫn tối thiểu sau extraction
            <input aria-label="Git CI transfer predicted path" value={transfer.predictedPath}
              onChange={event => setTransfer({ ...transfer, predictedPath: event.target.value })} />
          </label>
          <label>Path relation
            <input aria-label="Git CI transfer causal relation" value={transfer.causalClaim}
              onChange={event => setTransfer({ ...transfer, causalClaim: event.target.value })} />
          </label>
        </fieldset>
        <button type="button" disabled={state.transferPassed}
          onClick={() => setState(current => submitCiTransfer(current, transfer))}>
          Check Git CI transfer
        </button>
        <p role="status">{state.transferPassed
          ? "Hoàn tất Git & CI vertical slice: diagnosis, minimal repair, green rerun, source-linked explanation và changed path transfer."
          : state.transfer ? "Transfer chưa đúng; dùng hai source mới và quan hệ extraction path." : ""}</p>
      </section>}

      <p className="ciBoundary">
        Security boundary: không có learner input nào được chạy trong host process; toàn bộ transitions là client-side exact-matched SIMULATED state.
        Storage key: <code>{CI_PRACTICE_STORAGE_KEY}</code>.
      </p>
      <GitRevisionLab key={revisionEpoch} state={state.revisionPractice}
        onChange={next => setState(current => ({ ...current, revisionPractice: next }))} />
    </section>
  );
}
