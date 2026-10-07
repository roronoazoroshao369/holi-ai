"use client";
import { useState } from 'react';
import {
  GRAPH_PROMPT, GRAPH_SLOTS, GRAPH_CANDIDATES, GRAPH_TRANSFER_SLOTS, GRAPH_TRANSFER_SOURCES,
  initialGraphState, graphEvidenceReady, graphReasonComplete, inspectGraph, emptyGraphReason,
  editGraphReason, lockGraph, selectGraphCommit, rebuildGraph, verifyGraph,
  emptyGraphExplanation, editGraphExplanation, explainGraph, emptyGraphTransfer, editGraphTransfer, checkGraphTransfer,
  type GraphState, type GraphReason, type GraphHypothesis, type GraphSlot
} from '../lib/git-graph-simulator';
const names = { symptom: 'delivery checks', review: 'review snapshot', graph: 'object records', workflow: 'job configuration', build: 'produced metadata', intent: 'delivery request' };
const SHA_TOKEN = /\b[a-f0-9]{40}\b/gi;
const FACT_BINDING: Partial<Record<GraphSlot, { separator: string; max: number }>> = {
  review: { separator: ':', max: 2 },
  graph: { separator: '=', max: 2 },
  workflow: { separator: '', max: 1 },
  build: { separator: ':', max: 2 },
  intent: { separator: ':', max: 3 }
};
const shortSha = (sha: string) => `${sha.slice(0, 8)}…${sha.slice(-6)}`;
export function GitGraphLab({ state, onChange }: { state: GraphState; onChange: (s: GraphState) => void }) {
  const [hypothesis, setHypothesis] = useState<GraphHypothesis>('');
  const [commit, setCommit] = useState('');
  const ready = graphEvidenceReady(state), reason = state.rationale ?? emptyGraphReason();
  const explanation = state.explanation ?? emptyGraphExplanation(), transfer = state.transfer ?? emptyGraphTransfer();
  function sourceShaTokens(sourceId: string) {
    const source = GRAPH_SLOTS.map(slot => state.evidence[slot]).find(item => item?.id === sourceId);
    return [...new Set(source?.output.match(SHA_TOKEN) ?? [])];
  }
  function reasonFields(answer: GraphReason, phase: 'rationale' | 'explanation', change: (x: GraphReason) => void) {
    return <>{GRAPH_SLOTS.map(slot => {
      const rule = FACT_BINDING[slot], tokens = sourceShaTokens(answer.sources[slot].id);
      const boundCount = answer.sources[slot].fact.match(SHA_TOKEN)?.length ?? 0;
      return <fieldset key={slot} disabled={phase === 'rationale' && Boolean(state.hypothesis)}><legend>{names[slot]}</legend>
        <label>Source<select aria-label={`Git graph ${phase} ${slot} source`} value={answer.sources[slot].id} onChange={e => change({ ...answer, sources: { ...answer.sources, [slot]: { ...answer.sources[slot], id: e.target.value } } })}>
          <option value="">Chọn source đã thu</option>{GRAPH_SLOTS.map(s => <option key={s} value={state.evidence[s]?.id}>{state.evidence[s]?.id}</option>)}</select></label>
        <label>Fact<input aria-label={`Git graph ${phase} ${slot} fact`} maxLength={160} value={answer.sources[slot].fact} onChange={e => change({ ...answer, sources: { ...answer.sources, [slot]: { ...answer.sources[slot], fact: e.target.value } } })} /></label>
        {rule && tokens.length > 0 && <div className="gitFactBinder" aria-label={`Git graph ${phase} ${slot} observed SHA binder`}>
          <span>Bind SHA từ source đã chọn · thứ tự click = thứ tự claim</span>
          <div>{tokens.map(sha => <button key={sha} type="button" className="secondaryButton" disabled={boundCount >= rule.max} aria-label={`Bind Git graph ${phase} ${slot} observed SHA ${sha}`} onClick={() => {
            const current = answer.sources[slot].fact.trim();
            const fact = rule.max === 1 ? sha : current ? `${current}${rule.separator}${sha}` : sha;
            change({ ...answer, sources: { ...answer.sources, [slot]: { ...answer.sources[slot], fact } } });
          }}><code>{shortSha(sha)}</code></button>)}</div>
        </div>}
      </fieldset>;
    })}<label>Relation<input aria-label={`Git graph ${phase} relation`} maxLength={160} disabled={phase === 'rationale' && Boolean(state.hypothesis)} value={answer.relation} onChange={e => change({ ...answer, relation: e.target.value })} /></label></>;
  }
  const grammar = <p>Facts grammar: symptom = PIPELINE_STATUS:acceptance-ACCEPTANCE_RESULT (lowercase, nối bằng dấu gạch ngang); review = BASE:PR_HEAD; graph = PR_HEAD=DIRECT_PARENT; workflow = checkout SHA; build = CHECKOUT:METADATA; intent = REQUESTED_COMMIT:FIRST_PARENT:SECOND_PARENT. Với SHA dài, chọn source rồi bind các giá trị quan sát theo đúng thứ tự claim; binder chỉ lấy token từ source đang chọn và không tự chọn đáp án. Relation: pr-head-omits-required-base / cache-reuses-output / target-routes-delivery. Đây là grammar hữu hạn, chưa chấm văn bản tự do.</p>;
  return <section id="git-graph-practice" className="revisionLab" aria-label="Git graph simulated incident">
    <div className="ciLabHeader"><div><span className="kicker">GIT / SIMULATED</span><h3>{GRAPH_PROMPT.title}</h3><p>{GRAPH_PROMPT.summary}</p></div><div className="ciTruth"><strong>SIMULATED</strong><span>Commit và logs là fixture, không phải Git repo hoặc Actions runner thật.</span></div></div>
    <button type="button" className="secondaryButton" onClick={() => { onChange(initialGraphState()); setHypothesis(''); setCommit(''); }}>Reset Git graph incident</button>
    <div className="ciStatus"><b>Observed symptom</b><code>{GRAPH_PROMPT.symptom}</code></div>
    <details><summary>Understand · snapshot và lịch sử</summary><p>Commit xác định cây nguồn và tham chiếu các parent commits. Ancestor là commit có thể đi tới qua một hoặc nhiều bước parent; direct parent chỉ cách một bước. Một commit có hai parents vẫn cần được đối chiếu với yêu cầu cụ thể. Build xanh chỉ xác nhận checks đã chạy, không tự chứng minh cấu trúc lịch sử.</p><p>Chính sách tích hợp có thể yêu cầu merge parents hoặc lịch sử tuyến tính. Không áp một hình dạng graph cho mọi yêu cầu.</p></details>
    <section className="reasoningPanel" aria-label="Git graph evidence"><h4>1. Thu sáu nguồn trước sửa</h4><div className="ciEvidenceActions">{GRAPH_SLOTS.map(slot => <button key={slot} type="button" disabled={Boolean(state.selectedCommit)} onClick={() => onChange(inspectGraph(state, slot))}>Inspect graph {names[slot]}</button>)}</div>
      <div className="evidenceBank">{GRAPH_SLOTS.map(slot => state.evidence[slot] && <article key={slot}><strong>{state.evidence[slot]!.title}</strong><code>{state.evidence[slot]!.id}</code><pre>{state.evidence[slot]!.output}</pre></article>)}</div><p>{Object.keys(state.evidence).length}/6 nguồn đã thu; snapshots giữ nguyên sau repair.</p></section>
    <section className="reasoningPanel" aria-label="Git graph rationale"><h4>2. Khóa inference và observation</h4>
      <label>Causal hypothesis<select aria-label="Git graph hypothesis" disabled={!ready || Boolean(state.hypothesis)} value={state.hypothesis || hypothesis} onChange={e => setHypothesis(e.target.value as GraphHypothesis)}><option value="">Chọn causal class</option><option value="integration-selection">Integration selection</option><option value="cache-content">Cached content</option><option value="delivery-target">Delivery target</option></select></label>
      {ready && <>{grammar}<p>Lock chỉ kiểm tra đủ dữ kiện, không chấm đúng/sai. Reset để đổi lập luận sau lock; repair không thể viết lại rationale.</p>{reasonFields(reason, 'rationale', x => onChange(editGraphReason(state, x)))}</>}
      <button type="button" disabled={!ready || !hypothesis || !graphReasonComplete(state.rationale) || Boolean(state.hypothesis)} onClick={() => onChange(lockGraph(state, hypothesis))}>Lock Git graph hypothesis</button></section>
    {state.hypothesis && <section className="reasoningPanel" aria-label="Git graph repair"><h4>3. Thay checkout · rebuild · verify</h4><p>Chỉ thay immutable checkout revision. Chọn từ các object đã quan sát; mỗi lựa chọn vẫn có thể build xanh.</p>
      <label>Checkout commit<select aria-label="Git graph checkout commit" disabled={Boolean(state.selectedCommit)} value={state.selectedCommit || commit} onChange={e => setCommit(e.target.value)}><option value="">Chọn immutable SHA</option>{GRAPH_CANDIDATES.map(sha => <option key={sha} value={sha}>{sha}</option>)}</select></label>
      <button type="button" disabled={!commit || Boolean(state.selectedCommit)} onClick={() => onChange(selectGraphCommit(state, commit))}>Apply Git graph checkout</button>
      {state.selectedCommit && <><p>Selected checkout: <code>{state.selectedCommit}</code></p><button type="button" onClick={() => onChange(rebuildGraph(state))}>Rebuild graph delivery</button></>}
      {state.run && <><pre className="revisionOutput">{`pipeline: ${state.run.pipeline}\ncheckout HEAD: ${state.run.checkoutSha}\nbundle source_commit: ${state.run.metadataSha}`}</pre><button type="button" onClick={() => onChange(verifyGraph(state))}>Verify graph delivery</button></>}
      <p role="status">{!state.run ? 'Chưa rebuild graph delivery.' : !state.verification ? 'Build xanh; chưa verify graph delivery.' : state.verified ? 'Graph delivery verified: commit, parents và rationale trước sửa hợp lệ.' : 'Graph assessment chưa verified; đối chiếu commit, parent contract và rationale đã khóa.'}</p>
      {state.verification && <pre className="revisionOutput">{`Consumed commit matches request: ${state.verification.consumedMatch}\nOrdered parent contract matches: ${state.verification.graphMatch}\nActual direct parents: ${state.verification.parents.join(',')}`}</pre>}</section>}
    {state.verified && <section className="reasoningPanel" aria-label="Git graph explanation"><h4>4. Giải thích cơ chế từ sources</h4>{grammar}
      {reasonFields(explanation, 'explanation', x => onChange(editGraphExplanation(state, { ...x, repair: explanation.repair })))}
      <label>Minimal repair SHA<input aria-label="Git graph explanation repair" maxLength={160} value={explanation.repair} onChange={e => onChange(editGraphExplanation(state, { ...explanation, repair: e.target.value }))} /></label>
      <button type="button" onClick={() => onChange(explainGraph(state))}>Check Git graph explanation</button><p role="status">{state.explained ? 'Giải thích graph hợp lệ.' : state.explanation ? 'Giải thích graph chưa được xác nhận; kiểm tra source, fact, relation và repair.' : ''}</p></section>}
    {state.explained && <section className="reasoningPanel" aria-label="Git graph transfer"><h4>5. Changed transfer · integration policy</h4><p>Yêu cầu và biểu diễn lịch sử đã thay đổi. Không sao chép quy tắc hai parents từ incident đầu. Change IDs chỉ là evidence được quy định trong fixture này, không chứng minh rebase tương đương trong Git thật.</p>
      <div className="evidenceBank">{GRAPH_TRANSFER_SLOTS.map(slot => <article key={slot}><code>{GRAPH_TRANSFER_SOURCES[slot].id}</code><pre>{GRAPH_TRANSFER_SOURCES[slot].output}</pre></article>)}</div>
      <p>Facts grammar: history = SELECTED_COMMIT=DIRECT_PARENT; series = CHANGE_IDS theo thứ tự, phân cách dấu phẩy; request = approved base SHA. Predicates: yes/no; parentCount: số nguyên. Relation: base-ancestor-and-reviewed-series / two-direct-parents / original-head-ancestor.</p>
      {GRAPH_TRANSFER_SLOTS.map(slot => <fieldset key={slot}><legend>{slot}</legend><label>Source<select aria-label={`Git graph transfer ${slot} source`} value={transfer.sources[slot].id} onChange={e => onChange(editGraphTransfer(state, { ...transfer, sources: { ...transfer.sources, [slot]: { ...transfer.sources[slot], id: e.target.value } } }))}><option value="">Chọn source</option>{GRAPH_TRANSFER_SLOTS.map(s => <option key={s} value={GRAPH_TRANSFER_SOURCES[s].id}>{GRAPH_TRANSFER_SOURCES[s].id}</option>)}</select></label>
        <label>Fact<input aria-label={`Git graph transfer ${slot} fact`} maxLength={160} value={transfer.sources[slot].fact} onChange={e => onChange(editGraphTransfer(state, { ...transfer, sources: { ...transfer.sources, [slot]: { ...transfer.sources[slot], fact: e.target.value } } }))} /></label></fieldset>)}
      {(['selectedCommit', 'baseAncestor', 'originalHeadAncestor', 'parentCount', 'relation'] as const).map(field => <label key={field}>{field}<input aria-label={`Git graph transfer ${field}`} maxLength={160} value={transfer[field]} onChange={e => onChange(editGraphTransfer(state, { ...transfer, [field]: e.target.value }))} /></label>)}
      <button type="button" onClick={() => onChange(checkGraphTransfer(state))}>Check Git graph transfer</button><p role="status">{state.transferPassed ? 'Hoàn tất graph slice: evidence, diagnosis, commit/parents verification, explanation và linear-history transfer.' : state.transfer ? 'Graph transfer chưa được xác nhận; đối chiếu ancestry và change-series contract.' : ''}</p></section>}
  </section>;
}
