"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  differentialScenario,
  evidenceReady,
  evidenceSlots,
  editReasoning,
  emptyReasoning,
  execute,
  explain,
  initialLabState,
  isDifferentialScenario,
  recordHypothesis,
  scenarios,
  type ReasoningAnswer,
  type DifferentialOrder,
  type DifferentialStep,
  type Line as ReplyLine,
  type ScenarioId
} from "../lib/linux-simulator";
import { clearPractice, loadPractice, savePractice, type PracticeStorage } from "../lib/practice-persistence";

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
    setState(initialLabState(nextScenario, state.differentialOrder, differentialStep));
    setLines(welcome);
    setCommand("");
    setHypothesisDraft("");
    setHypothesisFeedback("");
    setFeedback("");
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
  const evidenceLabels = { symptom: "E1 · symptom", identity: "E2 · " + fixture.identityLabel, resource: "E3 · " + fixture.resourceLabel };

  function updateAnswer(next: ReasoningAnswer) {
    setState(editReasoning(state, next));
    setFeedback("");
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
        <p>Fixture permission giả định directory traversal, ACL/SELinux và cấu hình khác đang khỏe. Các health incident là simulator deterministic, không phải network stack thật.
          Trong production cần kiểm tra thêm namespace, firewall, bind address, service manager và logs.</p>
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
          Output sau sửa không thay thế các snapshot này. Bài này kiểm tra một bộ từ khóa hữu hạn, chưa đánh giá văn bản tự do.</p>
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
        <p>{fixture.family === "file-access"
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

      {state.explained && state.scenario === "guided" && <button onClick={() => advanceScenario("transfer")}>Thử tình huống permission mới</button>}
      {state.explained && state.scenario === "transfer" &&
        <button onClick={() => advanceScenario(differentialScenario(state.differentialOrder, 0), 0)}>Thử differential diagnosis</button>}
      {state.explained && inDifferential && state.differentialStep === 0 &&
        <button onClick={() => advanceScenario(differentialScenario(state.differentialOrder, 1), 1)}>Thử case cùng symptom</button>}
      {state.explained && inDifferential && state.differentialStep === 1 &&
        <p role="status">Hoàn tất bốn tình huống luyện tập, gồm hai health incident có cùng symptom nhưng evidence dẫn tới causal class khác nhau. Đây vẫn chỉ là tín hiệu thực hành cục bộ, chưa phải chứng nhận mastery.</p>}

      <p>Lệnh <code>reset</code> xóa observations/hypothesis của tình huống hiện tại nhưng giữ nguyên health-case assignment ẩn. Nút “Học lại từ đầu” quay về tình huống có hướng dẫn và chọn lại assignment cho lần luyện mới. Transcript terminal không được persist.</p>
    </div>
  );
}

