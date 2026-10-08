"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  causalTransferSatisfied,
  checkCausalTransfer,
  checkPermissionTransfer,
  checkPathTransfer,
  differentialScenario,
  editCausalTransfer,
  editPermissionTransfer,
  editPathTransfer,
  emptyCausalTransfer,
  emptyPermissionTransfer,
  emptyPathTransfer,
  evidenceReady,
  evidenceSlots,
  editReasoning,
  emptyReasoning,
  execute,
  explain,
  initialLabState,
  isDifferentialScenario,
  permissionTransferSatisfied,
  pathTransferSatisfied,
  recordHypothesis,
  scenarios,
  type EvidenceClaim,
  type CausalTransferAnswer,
  type PermissionTransferAnswer,
  type PathTransferAnswer,
  type ReasoningAnswer,
  type DifferentialOrder,
  type DifferentialStep,
  type Line as ReplyLine,
  type ScenarioId
} from "../lib/linux-simulator";
import { clearPractice, loadPractice, savePractice, type PracticeStorage } from "../lib/practice-persistence";

import { permissionObservationClaims } from "../lib/linux-evidence-bindings";

type Line = ReplyLine | { kind: "input"; text: string };
type PersistenceState = "checking" | "saved" | "unavailable";
const welcome: Line[] = [{ kind: "output", text: "SIMULATED — Type cat README.txt. No commands run on a Linux host." }];

function browserStorage(): PracticeStorage | null {
  try { return window.localStorage; } catch { return null; }
}

function chooseDifferentialOrder(): DifferentialOrder {
  try {
    const value = new Uint8Array(1);
    window.crypto.getRandomValues(value);
    return value[0] % 2 === 0 ? "listener-first" : "process-first";
  } catch {
    return "listener-first";
  }
}

export function LabTerminal() {
  const [lines, setLines] = useState<Line[]>(welcome);
  const [state, setState] = useState(() => initialLabState());
  const [command, setCommand] = useState("");
  const [hypothesisDraft, setHypothesisDraft] = useState("");
  const [hypothesisFeedback, setHypothesisFeedback] = useState("");
  const [feedback, setFeedback] = useState("");
  const [permissionTransferFeedback, setPermissionTransferFeedback] = useState("");
  const [pathTransferFeedback, setPathTransferFeedback] = useState("");
  const [transferFeedback, setTransferFeedback] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [storageUsable, setStorageUsable] = useState(false);
  const [persistence, setPersistence] = useState<PersistenceState>("checking");
  const [persistenceNotice, setPersistenceNotice] = useState("");

  useEffect(() => {
    const freshOrder = chooseDifferentialOrder();
    const storage = browserStorage();
    if (!storage) {
      setState(initialLabState("guided", freshOrder));
      setStorageUsable(false);
      setPersistence("unavailable");
      setPersistenceNotice("Trình duyệt không cho truy cập localStorage; lab vẫn chạy nhưng tiến trình và thứ tự health case ẩn chỉ tồn tại trong tab hiện tại.");
      setHydrated(true);
      return;
    }
    const loaded = loadPractice(storage, freshOrder);
    setState(loaded.state);
    if (loaded.status === "restored") {
      setLines([...welcome, { kind: "output", text: "Đã phục hồi checkpoint cục bộ. Transcript lệnh không được lưu; dùng các chỉ báo evidence bên dưới để tiếp tục." }]);
      setPersistenceNotice("Đã phục hồi checkpoint hợp lệ cho đúng phiên bản fixture.");
    } else if (loaded.status === "discarded") {
      setPersistenceNotice("Checkpoint cũ/hỏng đã bị loại bỏ an toàn; lab bắt đầu lại từ trạng thái sạch.");
    } else if (loaded.status === "unavailable") {
      setStorageUsable(false);
      setPersistence("unavailable");
      setPersistenceNotice("Không thể đọc/xóa localStorage; lab chuyển sang chế độ tạm thời và không khẳng định đã lưu tiến trình.");
    }
    if (loaded.status !== "unavailable") setStorageUsable(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !storageUsable) return;
    const storage = browserStorage();
    if (!storage || !savePractice(storage, state)) {
      setStorageUsable(false);
      setPersistence("unavailable");
      return;
    }
    setPersistence("saved");
  }, [hydrated, state, storageUsable]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;
    const result = execute(state, cmd);
    setState(result.state);
    setLines(current => [...current.slice(-100), { kind: "input", text: "$ " + cmd }, ...result.lines]);
    if (cmd === "reset") {
      setHypothesisDraft("");
      setHypothesisFeedback("");
      setFeedback("");
      setPermissionTransferFeedback("");
      setPathTransferFeedback("");
      setTransferFeedback("");
    }
    setCommand("");
  }

  function submitHypothesis(event: FormEvent) {
    event.preventDefault();
    const normalized = hypothesisDraft.trim().toLowerCase();
    const result = recordHypothesis(state, normalized);
    setState(result);
    if (result.hypothesis) {
      setHypothesisFeedback("Đã khóa hypothesis trước sửa: " + result.hypothesis + ".");
    } else {
      setHypothesisFeedback("Hypothesis chưa hợp lệ. Thu đủ evidence rồi nhập một lớp nguyên nhân: permission, process hoặc network.");
    }
  }

  function advanceScenario(nextScenario: ScenarioId, differentialStep: DifferentialStep = 0) {
    const carriedTransfer = causalTransferSatisfied(state) && state.causalTransfer
      ? structuredClone(state.causalTransfer)
      : null;
    const carriedPermissionTransfer = permissionTransferSatisfied(state) && state.permissionTransfer
      ? structuredClone(state.permissionTransfer)
      : null;
    const carriedPathTransfer = pathTransferSatisfied(state) && state.pathTransfer
      ? structuredClone(state.pathTransfer)
      : null;
    setState(initialLabState(
      nextScenario,
      state.differentialOrder,
      differentialStep,
      carriedTransfer,
      Boolean(carriedTransfer),
      carriedPermissionTransfer,
      Boolean(carriedPermissionTransfer),
      carriedPathTransfer,
      Boolean(carriedPathTransfer)
    ));
    setLines(welcome);
    setCommand("");
    setHypothesisDraft("");
    setHypothesisFeedback("");
    setFeedback("");
    setPermissionTransferFeedback("");
    setPathTransferFeedback("");
    setTransferFeedback("");
  }

  function restartPractice() {
    const storage = browserStorage();
    const cleared = storage ? clearPractice(storage) : false;
    const freshOrder = chooseDifferentialOrder();
    setState(initialLabState("guided", freshOrder));
    setLines(welcome);
    setCommand("");
    setHypothesisDraft("");
    setHypothesisFeedback("");
    setFeedback("");
    setPermissionTransferFeedback("");
    setTransferFeedback("");
    if (cleared) {
      setStorageUsable(true);
      setPersistenceNotice("Đã xóa checkpoint cũ, chọn lại thứ tự health case ẩn và bắt đầu từ tình huống có hướng dẫn.");
    } else {
      setStorageUsable(false);
      setPersistence("unavailable");
      setPersistenceNotice("Đã đặt lại lab trong tab này, nhưng không thể xác nhận checkpoint cục bộ đã được xóa.");
    }
  }

  function retryPersistence() {
    const storage = browserStorage();
    if (storage && savePractice(storage, state)) {
      const verification = loadPractice(storage);
      if (verification.status === "restored") {
        setStorageUsable(true);
        setPersistence("saved");
        setPersistenceNotice("Đã ghi và đọc lại checkpoint cục bộ hiện tại.");
        return;
      }
    }
    setStorageUsable(false);
    setPersistence("unavailable");
    setPersistenceNotice("localStorage vẫn không khả dụng; tiếp tục ở chế độ tạm thời.");
  }

  const fixture = scenarios[state.scenario];
  const ready = evidenceReady(state);
  const hypothesisLocked = Boolean(state.hypothesis);
  const inDifferential = isDifferentialScenario(state.scenario);
  const answer = state.reasoning ?? emptyReasoning();
  const permissionTransferAnswer = state.permissionTransfer ?? emptyPermissionTransfer();
  const permissionSatisfied = permissionTransferSatisfied(state);
  const pathTransferAnswer = state.pathTransfer ?? emptyPathTransfer();
  const pathSatisfied = pathTransferSatisfied(state);
  const transferAnswer = state.causalTransfer ?? emptyCausalTransfer();
  const transferSatisfied = causalTransferSatisfied(state);
  const evidenceLabels = { symptom: "E1 · symptom", identity: "E2 · " + fixture.identityLabel, resource: "E3 · " + fixture.resourceLabel };

  function updateAnswer(next: ReasoningAnswer) {
    setState(editReasoning(state, next));
    setFeedback("");
    if (state.scenario === "transfer") setPermissionTransferFeedback("");
    if (state.scenario === "path-search") setPathTransferFeedback("");
    if (state.scenario === "differential-listener") setTransferFeedback("");
  }

  function updatePermissionTransfer(next: PermissionTransferAnswer) {
    setState(editPermissionTransfer(state, next));
    setPermissionTransferFeedback("");
  }

  function updatePathTransfer(next: PathTransferAnswer) {
    setState(editPathTransfer(state, next));
    setPathTransferFeedback("");
  }

  function updateCausalTransfer(next: CausalTransferAnswer) {
    setState(editCausalTransfer(state, next));
    setTransferFeedback("");
  }

  const observedClaims = permissionObservationClaims(state);

  function observationBinding(label: string, current: EvidenceClaim, bind: (claim: EvidenceClaim) => void) {
    if (!observedClaims.length) return null;
    return <div className="observationBinding">
      <label>Chọn fact đã quan sát cho {label}
        <select aria-label={"Observation cho " + label}
          value={observedClaims.some(item => item.evidenceId === current.evidenceId && item.claim === current.claim)
            ? JSON.stringify(current) : ""}
          onChange={event => {
            const candidate = observedClaims.find(item => JSON.stringify(item) === event.target.value);
            if (candidate) bind(candidate);
          }}>
          <option value="">Chọn source + fact từ snapshot</option>
          {observedClaims.map(item => <option key={JSON.stringify(item)} value={JSON.stringify(item)}>
            {item.evidenceId.split(":").at(-1)} · {item.claim}
          </option>)}
        </select>
      </label>
      <button type="button" disabled={!current.evidenceId && !current.claim}
        onClick={() => bind({ evidenceId: "", claim: "" })}>Xóa binding {label}</button>
    </div>;
  }

  function evidenceOptions() {
    return <>
      <option value="">Chọn nguồn observation</option>
      {evidenceSlots.map(slot => state.preRepairEvidence[slot] &&
        <option key={slot} value={state.preRepairEvidence[slot]!.id}>{evidenceLabels[slot]}</option>)}
    </>;
  }

  return (
    <div className="learningLab">
      <div className="practicePersistence" aria-live="polite">
        <div>
          <strong>Checkpoint cục bộ · KHÔNG PHẢI MASTERY</strong>
          <p>{persistence === "checking" ? "Đang kiểm tra checkpoint…" : persistence === "saved"
            ? "Tiến trình thực hành được lưu trên trình duyệt này và có thể tiếp tục sau refresh. Dữ liệu phía client vẫn có thể bị sửa, nên không dùng làm chứng nhận tin cậy."
            : "Không xác nhận được lưu bền vững; lab vẫn dùng state tạm thời trong phiên hiện tại."}</p>
          {persistenceNotice && <p className="persistenceNotice">{persistenceNotice}</p>}
        </div>
        <div className="persistenceActions">
          {persistence === "unavailable" && <button type="button" onClick={retryPersistence}>Thử lưu lại</button>}
          <button type="button" className="secondaryButton" onClick={restartPractice}>Học lại từ đầu</button>
        </div>
      </div>

      <details>
        <summary>Mental model: tách observation khỏi conclusion</summary>
        <p>HTTP/curl chỉ cho biết symptom. Cùng một connection failure có thể xuất phát từ các causal layer khác nhau.
          Hãy kiểm tra process state và socket state trước khi khóa hypothesis; đừng suy ra nguyên nhân từ tên hoặc thứ tự fixture.</p>
        <p>Hai fixture permission đầu giả định directory traversal khỏe; path-search fixture tách riêng file-read khỏi parent-directory search (x). ACL/SELinux vẫn nằm ngoài mô hình.
          Các health incident là simulator deterministic, không phải network stack thật; production còn cần namespace, firewall, bind address, service manager và logs.</p>
      </details>

      <h3>{fixture.title}</h3>
      <p>{fixture.summary}</p>
      <div className="terminal">
        <div className="terminalTop"><span /><span /><span /><strong>SIMULATED · lab@holi:~</strong></div>
        <div className="terminalBody">
          <div role="log" aria-label="Kết quả terminal" aria-live="polite">
            {lines.map((line, index) => <div key={index} className={"terminalLine " + line.kind}>{line.text}</div>)}
          </div>
          <form onSubmit={submit} className="terminalPrompt">
            <span>$</span>
            <input aria-label="Lab terminal command" maxLength={200} autoComplete="off" value={command}
              onChange={event => setCommand(event.target.value)} placeholder="type a command…" />
            <button type="submit">Chạy</button>
          </form>
        </div>
      </div>

      <p>Observation đã xem: symptom {state.observations.symptom ? "✓" : "—"} · {fixture.resourceLabel} {state.observations.resource ? "✓" : "—"} · {fixture.identityLabel} {state.observations.identity ? "✓" : "—"}.</p>

      <form onSubmit={submitHypothesis}>
        <label>Giả thuyết trước khi sửa
          <input aria-label="Giả thuyết" value={hypothesisLocked ? state.hypothesis : hypothesisDraft}
            disabled={!ready || hypothesisLocked}
            onChange={event => { setHypothesisDraft(event.target.value); setHypothesisFeedback(""); }}
            placeholder="permission / process / network" />
        </label>
        <button type="submit" disabled={!ready || hypothesisLocked || !hypothesisDraft.trim()}>Ghi hypothesis</button>
      </form>
      <p role="status">{hypothesisFeedback}</p>

      {state.verified && <section className="reasoningPanel" aria-label="Lập luận từ bằng chứng">
        <h4>Nối bằng chứng với cơ chế</h4>
        <p>Đọc snapshot thu trước sửa. Chọn nguồn cho từng nhận định, rồi nối hai nguồn với cơ chế và đích sửa tối thiểu.
          Output sau sửa không thay thế các snapshot này. Có thể chọn source + fact đã quan sát hoặc tự nhập; việc chọn không xác nhận đáp án. Cơ chế, đích sửa và dự đoán vẫn do bạn lập luận. Bài này kiểm tra một bộ từ khóa hữu hạn, chưa đánh giá văn bản tự do.</p>
        <div className="evidenceBank">
          {evidenceSlots.map(slot => {
            const evidence = state.preRepairEvidence[slot];
            return evidence && <article key={slot}>
              <strong>{evidenceLabels[slot]} · trước sửa</strong>
              <code>{evidence.command}</code>
              <pre>{evidence.output}</pre>
            </article>;
          })}
        </div>
        <p>{fixture.family === "path-access"
          ? "Nhận định: symptom dùng mã HTTP; identity dùng UID:GROUPS; resource nối mode parent và file dạng 700-parent-644-file. Chọn parent liên quan từ snapshot. Cơ chế: parent-search-required / file-read-sufficient. Đích sửa: mode directory tối thiểu."
          : fixture.family === "file-access"
          ? "Nhận định: symptom dùng mã HTTP; identity dùng UID:GROUPS với tên các group theo thứ tự trong output (ví dụ 42:app,ops); resource dùng mode trước sửa. Cơ chế: owner-read / group-read / other-read. Đích sửa: mode tối thiểu."
          : "Nhận định: symptom dùng refused / ok; identity dùng present / absent; resource dùng port quan sát được hoặc none. Cơ chế: listener-port-match / process-started / file-mode. Đích sửa: port client cần."}</p>
        <form onSubmit={event => {
          event.preventDefault();
          const result = explain(state, answer);
          setState(result);
          setFeedback(result.explained ? "Đúng: các nguồn observation, nhận định và liên kết cơ chế đều khớp." : "Chưa đúng. Kiểm tra nguồn, nhận định, hai bằng chứng hỗ trợ cơ chế và đích sửa tối thiểu.");
        }}>
          {evidenceSlots.map(slot => <fieldset key={slot}>
            <legend>{slot === "symptom" ? "Symptom trước sửa" : slot === "identity" ? "Danh tính / process trước sửa" : "File / socket trước sửa"}</legend>
            <label>Nguồn bằng chứng
              <select aria-label={"Nguồn " + slot} value={answer[slot].evidenceId}
                onChange={event => updateAnswer({ ...answer, [slot]: { ...answer[slot], evidenceId: event.target.value } })}>
                {evidenceOptions()}
              </select>
            </label>
            {observationBinding(slot, answer[slot], candidate => updateAnswer({ ...answer, [slot]: candidate }))}
            <label>Nhận định từ observation
              <input aria-label={"Nhận định " + slot} maxLength={100} value={answer[slot].claim}
                onChange={event => updateAnswer({ ...answer, [slot]: { ...answer[slot], claim: event.target.value } })} />
            </label>
          </fieldset>)}
          <fieldset>
            <legend>Liên kết cơ chế</legend>
            {[0, 1].map(index => <label key={index}>Bằng chứng hỗ trợ {index + 1}
              <select aria-label={"Bằng chứng cơ chế " + (index + 1)} value={answer.mechanism.evidenceIds[index]}
                onChange={event => {
                  const ids: [string, string] = [...answer.mechanism.evidenceIds];
                  ids[index] = event.target.value;
                  updateAnswer({ ...answer, mechanism: { ...answer.mechanism, evidenceIds: ids } });
                }}>{evidenceOptions()}</select>
            </label>)}
            <label>Cơ chế được hai observation hỗ trợ
              <input aria-label="Giải thích cơ chế" maxLength={100} value={answer.mechanism.claim}
                onChange={event => updateAnswer({ ...answer, mechanism: { ...answer.mechanism, claim: event.target.value } })} />
            </label>
            <label>Đích sửa tối thiểu (mode hoặc port)
              <input aria-label="Đích sửa tối thiểu" maxLength={100} value={answer.target}
                onChange={event => updateAnswer({ ...answer, target: event.target.value })} />
            </label>
          </fieldset>
          <button type="submit">Kiểm tra giải thích</button>
        </form>
      </section>}
      <p role="status">{feedback}</p>

      {state.scenario === "transfer" && state.explained && <section className="reasoningPanel" aria-label="Dự đoán permission counterfactual">
        <h4>Permission counterfactual · đổi identity, giữ resource relation</h4>
        <p>Snapshot gốc cho thấy <code>report-worker</code> thuộc group <code>web</code> và file thuộc <code>root:web</code>. Sau repair tối thiểu <code>640</code>, giả sử chỉ identity thay đổi: worker không còn thuộc <code>web</code>. Ghi đúng source/fact gốc rồi dự đoán HTTP, việc access repair còn cần hay không và causal relation.</p>
        <form onSubmit={event => {
          event.preventDefault();
          const result = checkPermissionTransfer(state, permissionTransferAnswer);
          setState(result);
          setPermissionTransferFeedback(result.permissionTransferPassed
            ? "Đúng: group-read chỉ có hiệu lực khi worker còn là member của file group."
            : "Chưa đúng. Giữ file root:web ở mode 640 và chỉ thay membership của report-worker rồi suy ra quyền đọc.");
        }}>
          <fieldset>
            <legend>Evidence gốc</legend>
            <label>Nguồn identity gốc
              <select aria-label="Nguồn identity gốc" value={permissionTransferAnswer.identityEvidenceId}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, identityEvidenceId: event.target.value })}>
                {evidenceOptions()}
              </select>
            </label>
            {observationBinding("Fact identity gốc", { evidenceId: permissionTransferAnswer.identityEvidenceId, claim: permissionTransferAnswer.identityFact },
              candidate => updatePermissionTransfer({ ...permissionTransferAnswer, identityEvidenceId: candidate.evidenceId, identityFact: candidate.claim }))}
            <label>Fact identity gốc
              <input aria-label="Fact identity gốc" maxLength={100} value={permissionTransferAnswer.identityFact}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, identityFact: event.target.value })} />
            </label>
            <label>Nguồn file gốc
              <select aria-label="Nguồn file gốc" value={permissionTransferAnswer.resourceEvidenceId}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, resourceEvidenceId: event.target.value })}>
                {evidenceOptions()}
              </select>
            </label>
            {observationBinding("Fact file gốc", { evidenceId: permissionTransferAnswer.resourceEvidenceId, claim: permissionTransferAnswer.resourceFact },
              candidate => updatePermissionTransfer({ ...permissionTransferAnswer, resourceEvidenceId: candidate.evidenceId, resourceFact: candidate.claim }))}
            <label>Fact file gốc
              <input aria-label="Fact file gốc" maxLength={100} value={permissionTransferAnswer.resourceFact}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, resourceFact: event.target.value })} />
            </label>
          </fieldset>
          <fieldset>
            <legend>Giữ mode 640, bỏ membership web</legend>
            <label>Mode giữ cố định
              <input aria-label="Mode giữ cố định" maxLength={100} value={permissionTransferAnswer.fixedMode}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, fixedMode: event.target.value })} />
            </label>
            <label>Identity giả định
              <input aria-label="Identity giả định" maxLength={100} value={permissionTransferAnswer.hypotheticalIdentity}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, hypotheticalIdentity: event.target.value })} />
            </label>
            <label>Dự đoán HTTP permission
              <input aria-label="Dự đoán HTTP permission" maxLength={100} value={permissionTransferAnswer.predictedSymptom}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, predictedSymptom: event.target.value })} />
            </label>
            <label>Access repair còn cần
              <input aria-label="Access repair còn cần" maxLength={100} value={permissionTransferAnswer.repairNeed}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, repairNeed: event.target.value })} />
            </label>
            <label>Quan hệ permission
              <input aria-label="Quan hệ permission" maxLength={100} value={permissionTransferAnswer.causalClaim}
                onChange={event => updatePermissionTransfer({ ...permissionTransferAnswer, causalClaim: event.target.value })} />
            </label>
          </fieldset>
          <button type="submit">Kiểm tra permission transfer</button>
        </form>
        <p role="status">{permissionTransferFeedback}</p>
      </section>}

      {state.scenario === "path-search" && state.explained && <section className="reasoningPanel" aria-label="Dự đoán path-search transfer">
        <h4>Path-search transfer · đổi parent path, giữ file readable</h4>
        <p>Ở fixture gốc, file mode 644 nhưng parent <code>/srv/private/site</code> mode 700 chặn search. Với path mới <code>/srv/private/archive</code> cũng mode 700, hãy bind evidence gốc và dự đoán symptom/repair target. Chỉ chmod file 644 lần nữa không giải quyết traversal.</p>
        <form onSubmit={event => {
          event.preventDefault();
          const result = checkPathTransfer(state, pathTransferAnswer);
          setState(result);
          setPathTransferFeedback(result.pathTransferPassed
            ? "Đúng: read bit của file không thay thế search (x) trên từng parent directory."
            : "Chưa đúng. Giữ file readable, đổi sang parent khác mode 700 và xác định repair phải nhắm vào directory search.");
        }}>
          <fieldset>
            <legend>Evidence gốc</legend>
            <label>Nguồn identity path-search
              <select aria-label="Nguồn identity path-search" value={pathTransferAnswer.identityEvidenceId}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, identityEvidenceId: event.target.value })}>{evidenceOptions()}</select>
            </label>
            {observationBinding("Fact identity path-search", { evidenceId: pathTransferAnswer.identityEvidenceId, claim: pathTransferAnswer.identityFact },
              candidate => updatePathTransfer({ ...pathTransferAnswer, identityEvidenceId: candidate.evidenceId, identityFact: candidate.claim }))}
            <label>Fact identity path-search
              <input aria-label="Fact identity path-search" maxLength={100} value={pathTransferAnswer.identityFact}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, identityFact: event.target.value })} />
            </label>
            <label>Nguồn path gốc
              <select aria-label="Nguồn path gốc" value={pathTransferAnswer.pathEvidenceId}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, pathEvidenceId: event.target.value })}>{evidenceOptions()}</select>
            </label>
            {observationBinding("Fact parent gốc", { evidenceId: pathTransferAnswer.pathEvidenceId, claim: pathTransferAnswer.pathFact },
              candidate => updatePathTransfer({ ...pathTransferAnswer, pathEvidenceId: candidate.evidenceId, pathFact: candidate.claim }))}
            <label>Fact parent gốc
              <input aria-label="Fact parent gốc" maxLength={100} value={pathTransferAnswer.pathFact}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, pathFact: event.target.value })} />
            </label>
            {observationBinding("Fact file readable", { evidenceId: pathTransferAnswer.pathEvidenceId, claim: pathTransferAnswer.fileFact },
              candidate => updatePathTransfer({ ...pathTransferAnswer, pathEvidenceId: candidate.evidenceId, fileFact: candidate.claim }))}
            <label>Fact file readable
              <input aria-label="Fact file readable" maxLength={100} value={pathTransferAnswer.fileFact}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, fileFact: event.target.value })} />
            </label>
          </fieldset>
          <fieldset>
            <legend>Changed path</legend>
            <label>Parent mới
              <input aria-label="Parent mới" maxLength={100} value={pathTransferAnswer.changedParent}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, changedParent: event.target.value })} />
            </label>
            <label>Mode parent mới
              <input aria-label="Mode parent mới" maxLength={100} value={pathTransferAnswer.changedParentMode}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, changedParentMode: event.target.value })} />
            </label>
            <label>Dự đoán HTTP path-search
              <input aria-label="Dự đoán HTTP path-search" maxLength={100} value={pathTransferAnswer.predictedSymptom}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, predictedSymptom: event.target.value })} />
            </label>
            <label>Repair target path-search
              <input aria-label="Repair target path-search" maxLength={100} value={pathTransferAnswer.repairNeed}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, repairNeed: event.target.value })} />
            </label>
            <label>Quan hệ path-search
              <input aria-label="Quan hệ path-search" maxLength={100} value={pathTransferAnswer.causalClaim}
                onChange={event => updatePathTransfer({ ...pathTransferAnswer, causalClaim: event.target.value })} />
            </label>
          </fieldset>
          <button type="submit">Kiểm tra path-search transfer</button>
        </form>
        <p role="status">{pathTransferFeedback}</p>
      </section>}

      {state.scenario === "differential-listener" && state.explained && <section className="reasoningPanel" aria-label="Dự đoán counterfactual">
        <h4>Counterfactual transfer · đổi evidence, dự đoán hệ quả</h4>
        <p>Giữ nguyên observation rằng process api-server đang chạy. Trước bất kỳ repair nào, giả sử socket observation đổi từ listener đã quan sát sang <code>127.0.0.1:8080</code>. Dùng đúng hai snapshot gốc để ghi fact ban đầu, rồi dự đoán symptom của curl 8080, repair listener còn cần hay không và quan hệ nhân quả.</p>
        <form onSubmit={event => {
          event.preventDefault();
          const result = checkCausalTransfer(state, transferAnswer);
          setState(result);
          setTransferFeedback(result.causalTransferPassed
            ? "Đúng: prediction thay đổi theo socket evidence trong khi process fact được giữ cố định."
            : "Chưa đúng. Tách source/fact gốc khỏi prediction và kiểm tra xem listener đã trùng target 8080 thì hệ quả gì thay đổi.");
        }}>
          <fieldset>
            <legend>Evidence gốc được giữ / thay đổi</legend>
            <label>Nguồn process gốc
              <select aria-label="Nguồn process gốc" value={transferAnswer.processEvidenceId}
                onChange={event => updateCausalTransfer({ ...transferAnswer, processEvidenceId: event.target.value })}>
                {evidenceOptions()}
              </select>
            </label>
            <label>Fact process gốc
              <input aria-label="Fact process gốc" maxLength={100} value={transferAnswer.processFact}
                onChange={event => updateCausalTransfer({ ...transferAnswer, processFact: event.target.value })} />
            </label>
            <label>Nguồn socket gốc
              <select aria-label="Nguồn socket gốc" value={transferAnswer.socketEvidenceId}
                onChange={event => updateCausalTransfer({ ...transferAnswer, socketEvidenceId: event.target.value })}>
                {evidenceOptions()}
              </select>
            </label>
            <label>Fact socket gốc
              <input aria-label="Fact socket gốc" maxLength={100} value={transferAnswer.socketFact}
                onChange={event => updateCausalTransfer({ ...transferAnswer, socketFact: event.target.value })} />
            </label>
          </fieldset>
          <fieldset>
            <legend>Causal prediction sau thay đổi socket → 8080</legend>
            <label>Dự đoán symptom
              <input aria-label="Dự đoán symptom" maxLength={100} value={transferAnswer.predictedSymptom}
                onChange={event => updateCausalTransfer({ ...transferAnswer, predictedSymptom: event.target.value })} />
            </label>
            <label>Repair listener còn cần
              <input aria-label="Repair còn cần" maxLength={100} value={transferAnswer.repairNeed}
                onChange={event => updateCausalTransfer({ ...transferAnswer, repairNeed: event.target.value })} />
            </label>
            <label>Quan hệ nhân quả
              <input aria-label="Quan hệ nhân quả" maxLength={100} value={transferAnswer.causalClaim}
                onChange={event => updateCausalTransfer({ ...transferAnswer, causalClaim: event.target.value })} />
            </label>
          </fieldset>
          <button type="submit">Kiểm tra dự đoán</button>
        </form>
        <p role="status">{transferFeedback}</p>
      </section>}

      {state.explained && state.scenario === "guided" && <button onClick={() => advanceScenario("transfer")}>Thử tình huống permission mới</button>}
      {state.explained && state.scenario === "transfer" && permissionSatisfied &&
        <button onClick={() => advanceScenario("path-search")}>Thử HTTP 403 do path-search</button>}
      {state.explained && state.scenario === "path-search" && permissionSatisfied && pathSatisfied &&
        <button onClick={() => advanceScenario(differentialScenario(state.differentialOrder, 0), 0)}>Thử differential diagnosis</button>}
      {state.explained && inDifferential && state.differentialStep === 0 && permissionSatisfied && pathSatisfied &&
        (state.scenario !== "differential-listener" || transferSatisfied) &&
        <button onClick={() => advanceScenario(differentialScenario(state.differentialOrder, 1), 1)}>Thử case cùng symptom</button>}
      {state.explained && inDifferential && state.differentialStep === 1 && permissionSatisfied && pathSatisfied && transferSatisfied &&
        <p role="status">Hoàn tất năm tình huống luyện tập và ba transfer gates: group membership, parent-directory search và listener evidence. Đây vẫn chỉ là tín hiệu thực hành cục bộ, chưa phải chứng nhận mastery.</p>}

      <p>Lệnh <code>reset</code> xóa observations/hypothesis của tình huống hiện tại. Permission transfer được carry qua path-search/health; path-search transfer được carry vào health differential; listener counterfactual được giữ khi reset process case đứng sau nó. Reset ngay trên case sở hữu gate sẽ xóa draft chưa pass của gate đó. Hidden health-case assignment được giữ. Nút “Học lại từ đầu” xóa toàn bộ và chọn lại assignment. Transcript terminal không được persist.</p>
    </div>
  );
}

