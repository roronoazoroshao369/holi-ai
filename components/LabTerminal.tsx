"use client";
import { FormEvent, useState } from "react";
import { execute, explain, initialLabState, recordHypothesis, scenarios, type Line as ReplyLine } from "../lib/linux-simulator";
type Line = ReplyLine | { kind: "input"; text: string };
const welcome: Line[] = [{ kind: "output", text: "SIMULATED — Type cat README.txt. No commands run on a Linux host." }];
export function LabTerminal() {
  const [lines, setLines] = useState<Line[]>(welcome);
  const [state, setState] = useState(() => initialLabState());
  const [command, setCommand] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
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
  const evidenceReady = state.observed && state.identityObserved && state.symptomObserved;
  return (
    <div className="learningLab">
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
      <p>Tiến trình chỉ nằm trong phiên trang; tải lại sẽ bắt đầu lại. Lệnh reset xóa toàn bộ bằng chứng của tình huống hiện tại.</p>
    </div>
  );
}
