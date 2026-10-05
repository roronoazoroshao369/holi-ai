"use client";
import { FormEvent, useEffect, useState } from "react";
import { evidenceReady, execute, explain, initialLabState, recordHypothesis, scenarios, type Line as ReplyLine, type ScenarioId } from "../lib/linux-simulator";
import { clearPractice, loadPractice, savePractice, type PracticeStorage } from "../lib/practice-persistence";

type Line = ReplyLine | { kind: "input"; text: string };
type PersistenceState = "checking" | "saved" | "unavailable";
const welcome: Line[] = [{ kind: "output", text: "SIMULATED — Type cat README.txt. No commands run on a Linux host." }];

function browserStorage(): PracticeStorage | null {
  try { return window.localStorage; } catch { return null; }
}

export function LabTerminal() {
  const [lines, setLines] = useState<Line[]>(welcome);
  const [state, setState] = useState(() => initialLabState());
  const [command, setCommand] = useState("");
  const [hypothesisDraft, setHypothesisDraft] = useState("");
  const [hypothesisFeedback, setHypothesisFeedback] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [storageUsable, setStorageUsable] = useState(false);
  const [persistence, setPersistence] = useState<PersistenceState>("checking");
  const [persistenceNotice, setPersistenceNotice] = useState("");

  useEffect(() => {
    const storage = browserStorage();
    if (!storage) {
      setStorageUsable(false);
      setPersistence("unavailable");
      setPersistenceNotice("Trình duyệt không cho truy cập localStorage; lab vẫn chạy nhưng tiến trình chỉ tồn tại trong tab hiện tại.");
      setHydrated(true);
      return;
    }
    const loaded = loadPractice(storage);
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
      setAnswer("");
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

  function advanceScenario(nextScenario: ScenarioId) {
    setState(initialLabState(nextScenario));
    setLines(welcome);
    setCommand("");
    setHypothesisDraft("");
    setHypothesisFeedback("");
    setAnswer("");
    setFeedback("");
  }

  function restartPractice() {
    const storage = browserStorage();
    const cleared = storage ? clearPractice(storage) : false;
    setState(initialLabState());
    setLines(welcome);
    setCommand("");
    setHypothesisDraft("");
    setHypothesisFeedback("");
    setAnswer("");
    setFeedback("");
    if (cleared) {
      setStorageUsable(true);
      setPersistenceNotice("Đã xóa checkpoint cũ và bắt đầu lại từ tình huống có hướng dẫn.");
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
        <p>HTTP/curl chỉ cho biết symptom. Process tồn tại chưa chứng minh socket đang LISTEN đúng port; file tồn tại chưa chứng minh process có access class phù hợp.
          Hãy thu thập dữ liệu về resource và identity/process trước khi ghi hypothesis.</p>
        <p>Fixture permission giả định directory traversal, ACL/SELinux và cấu hình khác đang khỏe. Incident listener là simulator TCP, không phải network stack thật.
          Trong production phải kiểm tra thêm namespace, firewall, bind address, service manager và logs.</p>
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

      <p>Bằng chứng: symptom {state.observations.symptom ? "✓" : "—"} · {fixture.resourceLabel} {state.observations.resource ? "✓" : "—"} · {fixture.identityLabel} {state.observations.identity ? "✓" : "—"}.</p>

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

      {state.verified && <form onSubmit={event => {
        event.preventDefault();
        const result = explain(state, answer);
        setState(result);
        setFeedback(result.explained ? "Đúng: explanation khớp với evidence và cơ chế của incident." : "Chưa đúng. Đối chiếu observation với cơ chế trước khi kết luận.");
      }}>
        <label>{fixture.explanationPrompt}
          <select aria-label="Giải thích cơ chế" value={answer} onChange={event => { setAnswer(event.target.value); setFeedback(""); }}>
            <option value="">Chọn cơ chế được bằng chứng hỗ trợ</option>
            {fixture.explanationOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button disabled={!answer} type="submit">Kiểm tra giải thích</button>
      </form>}
      <p role="status">{feedback}</p>

      {state.explained && state.scenario === "guided" && <button onClick={() => advanceScenario("transfer")}>Thử tình huống permission mới</button>}
      {state.explained && state.scenario === "transfer" && <button onClick={() => advanceScenario("listener")}>Thử incident khác cơ chế</button>}
      {state.explained && state.scenario === "listener" && <p role="status">Hoàn tất ba tình huống luyện tập, gồm một incident listener/port khác cơ chế permission. Đây vẫn chỉ là tín hiệu thực hành cục bộ, chưa phải chứng nhận mastery.</p>}

      <p>Lệnh <code>reset</code> xóa observations/hypothesis của tình huống hiện tại và checkpoint mới sẽ ghi trạng thái reset. Nút “Học lại từ đầu” quay về tình huống có hướng dẫn. Transcript terminal không được persist.</p>
    </div>
  );
}
