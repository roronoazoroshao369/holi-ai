"use client";
import { FormEvent, useEffect, useState } from "react";
import { execute, explain, initialLabState, recordHypothesis, scenarios, type Line as ReplyLine } from "../lib/linux-simulator";
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
    if (cmd === "reset") { setAnswer(""); setFeedback(""); }
    setCommand("");
  }

  function restartPractice() {
    const storage = browserStorage();
    const cleared = storage ? clearPractice(storage) : false;
    setState(initialLabState());
    setLines(welcome);
    setCommand("");
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

  const evidenceReady = state.observed && state.identityObserved && state.symptomObserved;
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
        <summary>Mô hình: Linux quyết định quyền đọc như thế nào?</summary>
        <p>Process chạy với UID và các GID. File có owner, group và ba bộ quyền r/w/x.
          Kernel chọn bộ owner nếu UID trùng; nếu không, chọn group khi GID phù hợp; còn lại chọn other.
          Các bộ quyền không cộng dồn. 4 = read, 2 = write, 1 = execute.</p>
        <p>HTTP 403 chưa đủ kết luận lỗi quyền file. Đối chiếu symptom, quyền file và danh tính worker.
          Fixture này giả định thư mục cha cho phép traversal, không có ACL/SELinux hoặc lỗi cấu hình khác.
          Trong production cần kiểm tra các yếu tố đó. Không dùng 777 để che lỗi.</p>
      </details>
      <h3>{state.scenario === "guided" ? "1. Chẩn đoán có hướng dẫn" : "2. Tình huống chuyển giao"}</h3>
      <p>File: <code>{scenarios[state.scenario].path}</code>. Worker: <code>{scenarios[state.scenario].worker}</code>.
        Mục tiêu: quyền đọc tối thiểu cho worker, không thêm quyền ghi/chạy.
        {state.scenario === "guided" ? " Trang này là nội dung công khai." : " Báo cáo chỉ dành cho nhóm web; không mở quyền đọc cho other."}</p>
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
      <p>Bằng chứng: HTTP {state.symptomObserved ? "✓" : "—"} · quyền file {state.observed ? "✓" : "—"} · danh tính {state.identityObserved ? "✓" : "—"}.</p>
      <label>Giả thuyết trước khi sửa
        <select aria-label="Giả thuyết" value={state.hypothesis} disabled={!evidenceReady || state.mode !== "600"}
          onChange={event => setState(recordHypothesis(state, event.target.value))}>
          <option value="">Chọn sau khi thu thập đủ bằng chứng</option>
          <option value="permission">Worker thiếu quyền đọc file</option>
          <option value="network">Kết nối TCP chưa thiết lập</option>
          <option value="process">Worker không tồn tại</option>
        </select>
      </label>
      {state.verified && <form onSubmit={event => {
        event.preventDefault();
        const result = explain(state, answer);
        setState(result);
        setFeedback(result.explained ? "Đúng: bạn đã liên hệ danh tính worker với bộ quyền được chọn." : "Chưa đúng. Đối chiếu UID, GID và owner/group của file; HTTP 200 chỉ chứng minh dịch vụ trả lời.");
      }}>
        <label>Vì sao worker đọc được file sau sửa?
          <select aria-label="Giải thích cơ chế" value={answer} onChange={event => { setAnswer(event.target.value); setFeedback(""); }}>
            <option value="">Chọn cơ chế được bằng chứng hỗ trợ</option>
            <option value="owner-read">UID worker trùng owner, nên dùng quyền owner</option>
            <option value="group-read">GID worker thuộc group file, nên dùng quyền group</option>
            <option value="other-read">UID và GID không khớp file, nên dùng quyền other</option>
          </select>
        </label>
        <button disabled={!answer} type="submit">Kiểm tra giải thích</button>
      </form>}
      <p role="status">{feedback}</p>
      {state.explained && state.scenario === "guided" && <button onClick={() => {
        setState(initialLabState("transfer")); setLines(welcome); setCommand(""); setAnswer(""); setFeedback("");
      }}>Thử tình huống mới</button>}
      {state.explained && state.scenario === "transfer" && <p role="status">Hoàn tất hai tình huống luyện tập. Đây là tín hiệu thực hành cục bộ, chưa phải chứng nhận mastery.</p>}
      <p>Lệnh <code>reset</code> xóa evidence của tình huống hiện tại và checkpoint mới sẽ ghi trạng thái reset. Nút “Học lại từ đầu” quay về tình huống có hướng dẫn. Transcript terminal không được persist.</p>
    </div>
  );
}
