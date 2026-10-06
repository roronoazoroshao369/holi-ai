// Finite synthetic fixtures only. No Git, Actions, YAML, shell or network execution.
export const GRAPH_SHAS = {
  root: '10'.repeat(20), base: '21'.repeat(20), head: '32'.repeat(20),
  integration: '43'.repeat(20), otherHead: '54'.repeat(20), otherIntegration: '65'.repeat(20),
  oldFirst: '76'.repeat(20), oldHead: '87'.repeat(20), rebasedFirst: '98'.repeat(20),
  rebasedHead: 'a9'.repeat(20), later: 'ba'.repeat(20)
} as const;
const S = GRAPH_SHAS;
export type CommitNode = { sha: string; parents: readonly string[]; change?: string };
export const INCIDENT_GRAPH: readonly CommitNode[] = [
  { sha: S.root, parents: [] }, { sha: S.base, parents: [S.root] },
  { sha: S.head, parents: [S.root] }, { sha: S.integration, parents: [S.base, S.head] },
  { sha: S.otherHead, parents: [S.root] }, { sha: S.otherIntegration, parents: [S.base, S.otherHead] }
];
export const TRANSFER_GRAPH: readonly CommitNode[] = [
  { sha: S.root, parents: [] }, { sha: S.base, parents: [S.root] },
  { sha: S.oldFirst, parents: [S.root], change: 'p1' }, { sha: S.oldHead, parents: [S.oldFirst], change: 'p2' },
  { sha: S.rebasedFirst, parents: [S.base], change: 'p1' }, { sha: S.rebasedHead, parents: [S.rebasedFirst], change: 'p2' },
  { sha: S.later, parents: [S.rebasedHead], change: 'p3' }
];
// Reflexive ancestry, as in the bounded reachability check: unknown objects fail closed.
export function graphAncestor(graph: readonly CommitNode[], ancestor: string, descendant: string): boolean {
  const nodes = new Map(graph.map(n => [n.sha, n]));
  if (!nodes.has(ancestor) || !nodes.has(descendant)) return false;
  const pending = [descendant], seen = new Set<string>();
  while (pending.length) {
    const sha = pending.pop()!;
    if (seen.has(sha)) continue;
    seen.add(sha);
    if (sha === ancestor) return true;
    pending.push(...(nodes.get(sha)?.parents ?? []));
  }
  return false;
}
export function requiredParents(graph: readonly CommitNode[], commit: string, base: string, head: string): boolean {
  const parents = graph.find(n => n.sha === commit)?.parents;
  return Boolean(parents && parents.length === 2 && parents[0] === base && parents[1] === head);
}
// This transfer's explicit linear-series contract, not a generic rebase equivalence proof.
export function linearSeries(graph: readonly CommitNode[], base: string, tip: string): string[] | null {
  const result: string[] = [], seen = new Set<string>();
  let current = tip;
  while (current !== base) {
    if (seen.has(current)) return null;
    seen.add(current);
    const node = graph.find(n => n.sha === current);
    if (!node || node.parents.length !== 1 || !node.change) return null;
    result.unshift(node.change); current = node.parents[0];
  }
  return graph.some(n => n.sha === base) ? result : null;
}
export const GRAPH_SLOTS = ['symptom', 'review', 'graph', 'workflow', 'build', 'intent'] as const;
export type GraphSlot = typeof GRAPH_SLOTS[number];
export type GraphEvidence = { id: string; slot: GraphSlot; phase: 'before-repair'; title: string; output: string };
export type GraphReason = { sources: Record<GraphSlot, { id: string; fact: string }>; relation: string };
export type GraphExplanation = GraphReason & { repair: string };
export const GRAPH_TRANSFER_SLOTS = ['history', 'series', 'request'] as const;
export type GraphTransfer = {
  sources: Record<typeof GRAPH_TRANSFER_SLOTS[number], { id: string; fact: string }>;
  selectedCommit: string; baseAncestor: string; originalHeadAncestor: string; parentCount: string; relation: string;
};
export type GraphHypothesis = '' | 'integration-selection' | 'cache-content' | 'delivery-target';
export type GraphState = {
  evidence: Partial<Record<GraphSlot, GraphEvidence>>;
  hypothesis: GraphHypothesis; rationale: GraphReason | null; selectedCommit: string;
  run: null | { pipeline: 'passed'; checkoutSha: string; metadataSha: string };
  verification: null | { consumedMatch: boolean; graphMatch: boolean; parents: string[] };
  verified: boolean; explanation: GraphExplanation | null; explained: boolean;
  transfer: GraphTransfer | null; transferPassed: boolean;
};
export const GRAPH_PROMPT = {
  title: 'Delivery acceptance investigation',
  summary: 'Delivery được tạo, nhưng acceptance chưa đạt. Thu thập nguồn, khóa lập luận rồi kiểm tra kết quả thực sự.',
  symptom: 'delivery pipeline: PASSED; acceptance: NOT MET'
} as const;
const graphText = (graph: readonly CommitNode[]) => graph.map(n => `${n.sha} parents=[${n.parents.join(',')}]${n.change ? ` change=${n.change}` : ''}`).join('\n');
const outputs: Record<GraphSlot, [string, string]> = {
  symptom: ['Delivery checks', 'pipeline: PASSED; acceptance: NOT MET; cache disabled; delivery target staging'],
  review: ['Review snapshot', `Approved base snapshot: ${S.base}\nReviewed PR head: ${S.head}`],
  graph: ['Object records', graphText(INCIDENT_GRAPH)],
  workflow: ['Job configuration', `checkout uses reviewed PR head: ${S.head}\nbuild reads checkout tree; metadata records checkout SHA`],
  build: ['Produced metadata', `checkout HEAD: ${S.head}\nbundle source_commit: ${S.head}\npipeline: PASSED`],
  intent: ['Delivery request', `Target staging. Use immutable integration commit ${S.integration}.\nContract: first parent is approved base ${S.base}; second parent is reviewed PR head ${S.head}.\nThis request requires ordered direct parents, not merely ancestry or green checks.`]
};
export function graphEvidence(slot: GraphSlot): GraphEvidence {
  return { id: `git-graph:before:${slot}`, slot, phase: 'before-repair', title: outputs[slot][0], output: outputs[slot][1] };
}
export const GRAPH_TRANSFER_SOURCES = {
  history: { id: 'git-graph:transfer:history', output: graphText(TRANSFER_GRAPH) },
  series: { id: 'git-graph:transfer:series', output: `Reviewed old head ${S.oldHead}: change series [p1,p2].\nReplayed commits retain fixture change IDs. New identities need not preserve original commit ancestry. These IDs are stipulated fixture evidence, not real Git semantic/signature verification.` },
  request: { id: 'git-graph:transfer:request', output: `Changed contract: fast-forward delivery. Approved base ${S.base} must be an ancestor; changes since base must be exactly [p1,p2], no extra p3.\nSelect an immutable commit. Two direct parents and original PR-head ancestry are NOT required.\nReport selected commit's direct parent count and both ancestry predicates.` }
} as const;
export function emptyGraphReason(): GraphReason {
  return { sources: Object.fromEntries(GRAPH_SLOTS.map(s => [s, { id: '', fact: '' }])) as GraphReason['sources'], relation: '' };
}
export function emptyGraphExplanation(): GraphExplanation { return { ...emptyGraphReason(), repair: '' }; }
export function emptyGraphTransfer(): GraphTransfer {
  return { sources: Object.fromEntries(GRAPH_TRANSFER_SLOTS.map(s => [s, { id: '', fact: '' }])) as GraphTransfer['sources'], selectedCommit: '', baseAncestor: '', originalHeadAncestor: '', parentCount: '', relation: '' };
}
export function initialGraphState(): GraphState {
  return { evidence: {}, hypothesis: '', rationale: null, selectedCommit: '', run: null, verification: null, verified: false, explanation: null, explained: false, transfer: null, transferPassed: false };
}
function record(x: unknown): x is Record<string, unknown> { return Boolean(x && typeof x === 'object' && !Array.isArray(x)); }
function keys(x: unknown, fields: readonly string[]): x is Record<string, unknown> {
  return record(x) && Object.keys(x).length === fields.length && fields.every(k => Object.hasOwn(x, k));
}
function texts(x: unknown, fields: readonly string[]): x is Record<string, string> {
  return keys(x, fields) && fields.every(k => typeof x[k] === 'string' && (x[k] as string).length <= 160);
}
function equal(x: unknown, y: Record<string, unknown>): boolean { return keys(x, Object.keys(y)) && Object.keys(y).every(k => x[k] === y[k]); }
const norm = (s: string) => s.trim().toLowerCase();
function sourceShape(x: unknown, slots: readonly string[]): boolean { return keys(x, slots) && slots.every(s => texts(x[s], ['id', 'fact'])); }
export function validGraphReason(x: unknown): x is GraphReason {
  return keys(x, ['sources', 'relation']) && sourceShape(x.sources, GRAPH_SLOTS) && typeof x.relation === 'string' && x.relation.length <= 160;
}
export function graphReasonComplete(x: unknown): x is GraphReason {
  return validGraphReason(x) && Boolean(x.relation.trim()) && GRAPH_SLOTS.every(s => Boolean(x.sources[s].id.trim() && x.sources[s].fact.trim()));
}
export function graphEvidenceReady(s: GraphState): boolean { return GRAPH_SLOTS.every(slot => equal(s.evidence[slot], graphEvidence(slot))); }
export function inspectGraph(s: GraphState, slot: GraphSlot): GraphState {
  if (s.selectedCommit || !GRAPH_SLOTS.includes(slot)) return s;
  return { ...s, evidence: { ...s.evidence, [slot]: graphEvidence(slot) } };
}
export function editGraphReason(s: GraphState, answer: GraphReason): GraphState {
  if (s.hypothesis || !graphEvidenceReady(s) || !validGraphReason(answer)) return s;
  return { ...s, rationale: structuredClone(answer) };
}
export function graphReasonMatches(s: GraphState, answer: unknown): answer is GraphReason {
  if (!validGraphReason(answer) || !graphEvidenceReady(s)) return false;
  const facts: Record<GraphSlot, string> = {
    symptom: 'passed:acceptance-not-met', review: `${S.base}:${S.head}`, graph: `${S.head}=${S.root}`,
    workflow: S.head, build: `${S.head}:${S.head}`, intent: `${S.integration}:${S.base}:${S.head}`
  };
  return GRAPH_SLOTS.every(slot => answer.sources[slot].id === s.evidence[slot]?.id && norm(answer.sources[slot].fact) === facts[slot]) && norm(answer.relation) === 'pr-head-omits-required-base';
}
export function lockGraph(s: GraphState, hypothesis: string): GraphState {
  if (s.hypothesis || !graphEvidenceReady(s) || !graphReasonComplete(s.rationale) || !['integration-selection', 'cache-content', 'delivery-target'].includes(hypothesis)) return s;
  // Completeness only; no correctness feedback before repair.
  return { ...s, hypothesis: hypothesis as GraphHypothesis, rationale: structuredClone(s.rationale) };
}
export const GRAPH_CANDIDATES = [S.head, S.base, S.integration, S.otherIntegration] as readonly string[];
export function selectGraphCommit(s: GraphState, commit: string): GraphState {
  if (!s.hypothesis || s.selectedCommit || !graphReasonComplete(s.rationale) || !GRAPH_CANDIDATES.includes(commit)) return s;
  return { ...s, selectedCommit: commit, run: null, verification: null, verified: false, explanation: null, explained: false, transfer: null, transferPassed: false };
}
export function rebuildGraph(s: GraphState): GraphState {
  if (!s.selectedCommit || !s.hypothesis || !graphEvidenceReady(s) || !graphReasonComplete(s.rationale)) return s;
  return { ...s, run: { pipeline: 'passed', checkoutSha: s.selectedCommit, metadataSha: s.selectedCommit }, verification: null, verified: false, explanation: null, explained: false, transfer: null, transferPassed: false };
}
function verificationFor(s: GraphState): NonNullable<GraphState['verification']> {
  const sha = s.run!.checkoutSha;
  return { consumedMatch: sha === S.integration && s.run!.metadataSha === S.integration,
    graphMatch: requiredParents(INCIDENT_GRAPH, sha, S.base, S.head), parents: [...(INCIDENT_GRAPH.find(n => n.sha === sha)?.parents ?? [])] };
}
export function verifyGraph(s: GraphState): GraphState {
  if (!s.run || !s.selectedCommit || !graphEvidenceReady(s)) return s;
  const verification = verificationFor(s);
  return { ...s, verification, verified: verification.consumedMatch && verification.graphMatch && s.hypothesis === 'integration-selection' && graphReasonMatches(s, s.rationale), explanation: null, explained: false, transfer: null, transferPassed: false };
}
export function validGraphExplanation(x: unknown): x is GraphExplanation {
  return keys(x, ['sources', 'relation', 'repair']) && typeof x.repair === 'string' && x.repair.length <= 160 && validGraphReason({ sources: x.sources, relation: x.relation });
}
export function graphExplanationMatches(s: GraphState, x: unknown): x is GraphExplanation {
  return validGraphExplanation(x) && graphReasonMatches(s, { sources: x.sources, relation: x.relation }) && norm(x.repair) === S.integration;
}
export function editGraphExplanation(s: GraphState, x: GraphExplanation): GraphState {
  return !s.verified || !validGraphExplanation(x) ? s : { ...s, explanation: structuredClone(x), explained: false, transfer: null, transferPassed: false };
}
export function explainGraph(s: GraphState): GraphState {
  return !s.verified ? s : { ...s, explained: graphExplanationMatches(s, s.explanation), transfer: null, transferPassed: false };
}
export function validGraphTransfer(x: unknown): x is GraphTransfer {
  return keys(x, Object.keys(emptyGraphTransfer())) && sourceShape(x.sources, GRAPH_TRANSFER_SLOTS) && texts(Object.fromEntries(['selectedCommit', 'baseAncestor', 'originalHeadAncestor', 'parentCount', 'relation'].map(k => [k, x[k]])), ['selectedCommit', 'baseAncestor', 'originalHeadAncestor', 'parentCount', 'relation']);
}
export function graphTransferMatches(x: unknown): x is GraphTransfer {
  if (!validGraphTransfer(x)) return false;
  const facts = { history: `${S.rebasedHead}=${S.rebasedFirst}`, series: 'p1,p2', request: S.base };
  const commit = norm(x.selectedCommit), series = linearSeries(TRANSFER_GRAPH, S.base, commit);
  const baseAncestor = graphAncestor(TRANSFER_GRAPH, S.base, commit), originalAncestor = graphAncestor(TRANSFER_GRAPH, S.oldHead, commit);
  const parents = TRANSFER_GRAPH.find(n => n.sha === commit)?.parents;
  return GRAPH_TRANSFER_SLOTS.every(slot => x.sources[slot].id === GRAPH_TRANSFER_SOURCES[slot].id && norm(x.sources[slot].fact) === facts[slot]) &&
    baseAncestor && !originalAncestor && series?.join(',') === 'p1,p2' && norm(x.baseAncestor) === 'yes' && norm(x.originalHeadAncestor) === 'no' &&
    norm(x.parentCount) === String(parents?.length) && norm(x.relation) === 'base-ancestor-and-reviewed-series';
}
export function editGraphTransfer(s: GraphState, x: GraphTransfer): GraphState {
  return !s.explained || !graphExplanationMatches(s, s.explanation) || !validGraphTransfer(x) ? s : { ...s, transfer: structuredClone(x), transferPassed: false };
}
export function checkGraphTransfer(s: GraphState): GraphState {
  return !s.verified || !s.explained || !graphExplanationMatches(s, s.explanation) ? s : { ...s, transferPassed: graphTransferMatches(s.transfer) };
}
export function isValidGraphState(x: unknown): x is GraphState {
  if (!keys(x, Object.keys(initialGraphState())) || !record(x.evidence) || Object.keys(x.evidence).some(k => !GRAPH_SLOTS.includes(k as GraphSlot))) return false;
  if (!Object.keys(x.evidence).every(k => equal((x.evidence as Record<string, unknown>)[k], graphEvidence(k as GraphSlot)))) return false;
  if (!['', 'integration-selection', 'cache-content', 'delivery-target'].includes(x.hypothesis as string) || typeof x.selectedCommit !== 'string' || x.selectedCommit !== '' && !GRAPH_CANDIDATES.includes(x.selectedCommit)) return false;
  if (!['verified', 'explained', 'transferPassed'].every(k => typeof x[k] === 'boolean')) return false;
  const s = x as unknown as GraphState;
  if (s.rationale !== null && (!graphEvidenceReady(s) || !validGraphReason(s.rationale))) return false;
  if (s.hypothesis && (!graphEvidenceReady(s) || !graphReasonComplete(s.rationale)) || s.selectedCommit && !s.hypothesis) return false;
  if (s.run !== null && (!s.selectedCommit || !equal(s.run, { pipeline: 'passed', checkoutSha: s.selectedCommit, metadataSha: s.selectedCommit }))) return false;
  if (s.verification !== null) {
    if (!s.run || !keys(s.verification, ['consumedMatch', 'graphMatch', 'parents'])) return false;
    const expected = verificationFor(s);
    if (s.verification.consumedMatch !== expected.consumedMatch || s.verification.graphMatch !== expected.graphMatch || !Array.isArray(s.verification.parents) || JSON.stringify(s.verification.parents) !== JSON.stringify(expected.parents)) return false;
  }
  const verified = Boolean(s.verification?.consumedMatch && s.verification.graphMatch && s.hypothesis === 'integration-selection' && graphReasonMatches(s, s.rationale));
  if (s.verified !== verified) return false;
  if (s.explanation !== null && (!s.verified || !validGraphExplanation(s.explanation)) || s.explained && (!s.verified || !graphExplanationMatches(s, s.explanation))) return false;
  if (s.transfer !== null && (!s.explained || !validGraphTransfer(s.transfer)) || s.transferPassed && (!s.verified || !s.explained || !graphTransferMatches(s.transfer))) return false;
  return true;
}
