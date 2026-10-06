"use client";
import { useState } from "react";
import {
  REVISION_PROMPT, REVISION_SLOTS, REVISION_TRANSFER_SOURCES, initialRevisionState,
  revisionEvidenceReady, emptyRevisionRationale, editRevisionRationale, revisionRationaleComplete, inspectRevision, lockRevision, repairRevision, rebuildRevision, verifyRevision,
  emptyRevisionExplanation, editRevisionExplanation, explainRevision,
  emptyRevisionTransfer, editRevisionTransfer, checkRevisionTransfer,
  type RevisionState, type RevisionHypothesis, type RevisionRepair, type RevisionTransfer
} from "../lib/git-revision-simulator";

export function GitRevisionLab({ state, onChange }: { state: RevisionState; onChange: (next: RevisionState) => void }) {
  const [hypothesis, setHypothesis] = useState<RevisionHypothesis>("");
  const [repair, setRepair] = useState<RevisionRepair>("");
  const ready = revisionEvidenceReady(state);
  const rationale = state.rationale ?? emptyRevisionRationale();
  const answer = state.explanation ?? emptyRevisionExplanation();
  const transfer = state.transfer ?? emptyRevisionTransfer();
  const titles = { symptom: "release check", workflow: "checkout config", refs: "reference snapshot", build: "build metadata", intent: "release request" };
  const transferLabels: Record<keyof RevisionTransfer, string> = {
    tagSource: "Tag source", tagObject: "Tag object SHA", targetCommit: "Tag target commit SHA",
    branchSource: "Branch source", branchCommit: "Current branch SHA", intentSource: "Transfer request source",
    selectedRevision: "Selected immutable commit SHA", relation: "Transfer relation"
  };
  return <section className="revisionLab" aria-label="Git revision simulated incident">
    <div className="ciLabHeader"><div><span className="kicker">GIT / SIMULATED</span><h3>{REVISION_PROMPT.title}</h3><p>{REVISION_PROMPT.summary}</p></div>
      <div className="ciTruth"><strong>SIMULATED</strong><span>Snapshot và SHA là fixture, không phải repo Git thật hoặc chứng nhận năng lực.</span></div></div>
    <button type="button" className="secondaryButton" onClick={() => { onChange(initialRevisionState()); setHypothesis(""); setRepair(""); }}>Reset Git revision incident</button>
    <div className="ciStatus"><b>Observed symptom</b><code>{REVISION_PROMPT.symptom}</code></div>
    <details><summary>Understand · revision và kết quả vận hành</summary>
      <p>Commit SHA xác định snapshot. Ref là tên tham chiếu tới object; branch có thể di chuyển. Checkout quyết định cây nguồn build dùng. Test pass chỉ nói kiểm tra đã chạy thành công.</p>
      <p>Tách dữ kiện trong source khỏi kết luận nguyên nhân. Bài dùng grammar hữu hạn, grading deterministic; chưa chấm văn bản tự do.</p></details>
    <section className="reasoningPanel" aria-label="Git revision evidence"><h4>1. Thu năm nguồn trước sửa</h4>
      <div className="ciEvidenceActions">{REVISION_SLOTS.map(slot => <button key={slot} type="button" disabled={Boolean(state.repair)} onClick={() => onChange(inspectRevision(state, slot))}>Inspect {titles[slot]}</button>)}</div>
      <div className="evidenceBank">{REVISION_SLOTS.map(slot => state.evidence[slot] && <article key={slot}><strong>{state.evidence[slot]!.title}</strong><code>{state.evidence[slot]!.id}</code><pre>{state.evidence[slot]!.output}</pre></article>)}</div>
      <p>{Object.keys(state.evidence).length}/5 nguồn đã thu. Snapshot giữ nguyên sau repair.</p></section>
    <section className="reasoningPanel" aria-label="Git revision pre-repair rationale"><h4>2. Khóa inference trước repair</h4>
      <label>Causal hypothesis<select aria-label="Git revision hypothesis" value={state.hypothesis || hypothesis} disabled={!ready || Boolean(state.hypothesis)} onChange={e => setHypothesis(e.target.value as RevisionHypothesis)}>
        <option value="">Chọn causal class</option><option value="revision-selection">Revision selection</option><option value="cache-content">Cached content</option><option value="deployment-target">Delivery target</option></select></label>
      {ready && <>
        <p>Ghi observation từ mỗi source đã thu, rồi chọn relation hỗ trợ inference. Facts: symptom dùng PIPELINE_STATUS:acceptance-ACCEPTANCE_RESULT
          (lowercase, nối bằng dấu gạch ngang); workflow dùng ref; refs dùng REF=SHA; build và intent dùng SHA.
          Relation: checkout-ref-resolves-build-commit / cache-reuses-output / target-routes-delivery.</p>
        <p>Khóa lưu cả class và rationale, không chấm đúng/sai lúc này. Muốn đổi sau lock phải reset; kết quả repair không sửa được lập luận đã khóa.</p>
        <fieldset disabled={Boolean(state.hypothesis)}><legend>Observation trước sửa</legend>
          {REVISION_SLOTS.map(slot => <div key={slot}>
            <label>{titles[slot]} source<select aria-label={`Git revision rationale ${slot} source`} value={rationale.sources[slot].id}
              onChange={e => onChange(editRevisionRationale(state, { ...rationale, sources: { ...rationale.sources, [slot]: { ...rationale.sources[slot], id: e.target.value } } }))}>
              <option value="">Chọn source đã thu</option>{REVISION_SLOTS.map(s => <option key={s} value={state.evidence[s]?.id}>{state.evidence[s]?.id}</option>)}</select></label>
            <label>{titles[slot]} fact<input aria-label={`Git revision rationale ${slot} fact`} maxLength={160} value={rationale.sources[slot].fact}
              onChange={e => onChange(editRevisionRationale(state, { ...rationale, sources: { ...rationale.sources, [slot]: { ...rationale.sources[slot], fact: e.target.value } } }))} /></label>
          </div>)}
          <label>Relation<input aria-label="Git revision rationale relation" maxLength={160} value={rationale.relation}
            onChange={e => onChange(editRevisionRationale(state, { ...rationale, relation: e.target.value }))} /></label>
        </fieldset>
        {state.hypothesis && <p>Class và rationale đã khóa. Dữ kiện không được sửa theo kết quả rebuild.</p>}
      </>}
      <button type="button" disabled={!ready || !hypothesis || !revisionRationaleComplete(state.rationale) || Boolean(state.hypothesis)} onClick={() => onChange(lockRevision(state, hypothesis))}>Lock Git revision hypothesis</button></section>
    {state.hypothesis && <section className="reasoningPanel" aria-label="Git revision repair"><h4>3. Sửa tối thiểu · rebuild · verify</h4>
      <label>Repair<select aria-label="Git revision repair" value={state.repair || repair} disabled={Boolean(state.repair)} onChange={e => setRepair(e.target.value as RevisionRepair)}>
        <option value="">Chọn thay đổi</option><option value="pin-intended-sha">Pin checkout vào commit SHA đã duyệt</option><option value="purge-cache">Xóa cache</option><option value="redirect-target">Đổi delivery target</option><option value="rebuild-only">Chỉ rebuild</option></select></label>
      <button type="button" disabled={!repair || Boolean(state.repair)} onClick={() => onChange(repairRevision(state, repair))}>Apply Git revision repair</button>
      {state.repair && <p>Repair ID đã chọn: <code>{state.repair}</code>.</p>}
      {state.repair && <button type="button" onClick={() => onChange(rebuildRevision(state))}>Rebuild simulated release</button>}
      {state.run && <><pre className="revisionOutput">{`pipeline: ${state.run.pipeline}\ncheckout HEAD: ${state.run.checkoutSha}\nrelease source_commit: ${state.run.metadataSha}`}</pre><button type="button" onClick={() => onChange(verifyRevision(state))}>Verify consumed revision</button></>}
      <p role="status">{!state.run ? "Chưa rebuild." : !state.verification ? "Pipeline xanh; chưa xác minh revision." : state.verified ? "Revision đã khớp và diagnosis/rationale trước sửa hợp lệ." : "Assessment chưa verified: kiểm tra actual SHA, intended SHA và diagnosis/rationale đã khóa."}</p>
      {state.verification && <pre className="revisionOutput">{`Actual: ${state.verification.actualSha}\nIntended: ${state.verification.intendedSha}`}</pre>}</section>}
    {state.verified && <section className="reasoningPanel" aria-label="Git revision explanation"><h4>4. Source-linked explanation</h4>
      <p>Facts: symptom dùng passed:acceptance-not-met; workflow dùng ref; refs dùng REF=SHA; build và intent dùng SHA.
        Relation: checkout-ref-resolves-build-commit / cache-reuses-output / target-routes-delivery. Repair: ID của thay đổi đã chọn.</p>
      {REVISION_SLOTS.map(slot => <fieldset key={slot}><legend>{titles[slot]} · observation trước sửa</legend>
        <label>Source<select aria-label={`Git revision ${slot} source`} value={answer.sources[slot].id} onChange={e => onChange(editRevisionExplanation(state, { ...answer, sources: { ...answer.sources, [slot]: { ...answer.sources[slot], id: e.target.value } } }))}>
          <option value="">Chọn source đã thu</option>{REVISION_SLOTS.map(s => <option key={s} value={state.evidence[s]?.id}>{state.evidence[s]?.id}</option>)}</select></label>
        <label>Fact<input aria-label={`Git revision ${slot} fact`} maxLength={160} value={answer.sources[slot].fact} onChange={e => onChange(editRevisionExplanation(state, { ...answer, sources: { ...answer.sources, [slot]: { ...answer.sources[slot], fact: e.target.value } } }))} /></label></fieldset>)}
      <fieldset><legend>Inference</legend>{(["relation", "repair"] as const).map(key => <label key={key}>{key}<input aria-label={`Git revision explanation ${key}`} maxLength={160} value={answer[key]} onChange={e => onChange(editRevisionExplanation(state, { ...answer, [key]: e.target.value }))} /></label>)}</fieldset>
      <button type="button" onClick={() => onChange(explainRevision(state))}>Check Git revision explanation</button>
      <p role="status">{state.explained ? "Giải thích Git revision hợp lệ." : state.explanation ? "Giải thích chưa được xác nhận; kiểm tra source, fact và relation." : ""}</p></section>}
    {state.explained && <section className="reasoningPanel" aria-label="Git revision tag transfer"><h4>5. Changed transfer · release reference</h4>
      <p>Áp dụng tham chiếu vào biểu diễn mới. Không dùng lại SHA incident đầu. Relation: annotated-tag-peels-to-commit / branch-tip-is-release / tag-object-is-source-tree.</p>
      <div className="evidenceBank">{Object.values(REVISION_TRANSFER_SOURCES).map(source => <article key={source.id}><code>{source.id}</code><pre>{source.output}</pre></article>)}</div>
      <fieldset>{(Object.keys(transferLabels) as (keyof RevisionTransfer)[]).map(key => <label key={key}>{transferLabels[key]}
        {key.endsWith("Source") ? <select aria-label={`Git revision transfer ${key}`} value={transfer[key]} onChange={e => onChange(editRevisionTransfer(state, { ...transfer, [key]: e.target.value }))}>
          <option value="">Chọn source</option>{Object.values(REVISION_TRANSFER_SOURCES).map(source => <option key={source.id} value={source.id}>{source.id}</option>)}</select>
          : <input aria-label={`Git revision transfer ${key}`} maxLength={160} value={transfer[key]} onChange={e => onChange(editRevisionTransfer(state, { ...transfer, [key]: e.target.value }))} />}</label>)}</fieldset>
      <button type="button" onClick={() => onChange(checkRevisionTransfer(state))}>Check Git revision transfer</button>
      <p role="status">{state.transferPassed ? "Hoàn tất Git revision slice: evidence, diagnosis, revision verification, explanation và tag transfer." : state.transfer ? "Transfer chưa được xác nhận; phân biệt object, commit target và branch hiện tại." : ""}</p></section>}
  </section>;
}

