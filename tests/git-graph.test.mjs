import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from '../lib/git-graph-simulator.ts';
import { initialCiLabState } from '../lib/ci-simulator.ts';
import { ciCheckpointFor, parseCiCheckpoint, loadCiPractice, saveCiPractice, CI_PRACTICE_SCHEMA_VERSION, CI_FIXTURE_VERSION } from '../lib/ci-practice-persistence.ts';
const S = g.GRAPH_SHAS;
function reason() {
  const facts = { symptom: 'passed:acceptance-not-met', review: `${S.base}:${S.head}`, graph: `${S.head}=${S.root}`, workflow: S.head, build: `${S.head}:${S.head}`, intent: `${S.integration}:${S.base}:${S.head}` };
  return { sources: Object.fromEntries(g.GRAPH_SLOTS.map(slot => [slot, { id: g.graphEvidence(slot).id, fact: facts[slot] }])), relation: 'pr-head-omits-required-base' };
}
function evidence() { return g.GRAPH_SLOTS.reduce(g.inspectGraph, g.initialGraphState()); }
function drafted(a = reason()) { return g.editGraphReason(evidence(), a); }
function locked(a = reason(), className = 'integration-selection') { return g.lockGraph(drafted(a), className); }
function verified(a = reason(), className = 'integration-selection', commit = S.integration) { return g.verifyGraph(g.rebuildGraph(g.selectGraphCommit(locked(a, className), commit))); }
function explanation() { return { ...reason(), repair: S.integration }; }
function explained() { return g.explainGraph(g.editGraphExplanation(verified(), explanation())); }
function transfer() {
  return { sources: { history: { id: g.GRAPH_TRANSFER_SOURCES.history.id, fact: `${S.rebasedHead}=${S.rebasedFirst}` }, series: { id: g.GRAPH_TRANSFER_SOURCES.series.id, fact: 'p1,p2' }, request: { id: g.GRAPH_TRANSFER_SOURCES.request.id, fact: S.base } }, selectedCommit: S.rebasedHead, baseAncestor: 'yes', originalHeadAncestor: 'no', parentCount: '1', relation: 'base-ancestor-and-reviewed-series' };
}
function completed() { return g.checkGraphTransfer(g.editGraphTransfer(explained(), transfer())); }
function checkpoint(s) { return ciCheckpointFor({ ...initialCiLabState(), graphPractice: s }); }

test('graph incident starts neutral and needs all six observed sources before any commitment', () => {
  const copy = JSON.stringify(g.GRAPH_PROMPT);
  for (const clue of ['wrong head', 'wrong merge', 'missing parent', S.head, S.integration, 'pin']) assert.equal(copy.includes(clue), false);
  assert.equal(g.graphEvidenceReady(g.initialGraphState()), false);
  for (const slot of g.GRAPH_SLOTS) {
    const s = evidence(); delete s.evidence[slot];
    assert.equal(g.graphEvidenceReady(s), false);
    assert.equal(g.editGraphReason(s, reason()), s);
    assert.equal(g.lockGraph(s, 'integration-selection'), s);
    assert.equal(g.selectGraphCommit(s, S.integration), s);
  }
  assert.equal(g.graphEvidenceReady(evidence()), true);
  assert.equal(g.rebuildGraph(locked()).run, null);
  assert.equal(g.verifyGraph(locked()).verification, null);
});

test('bounded graph algorithms distinguish ordered direct parents, ancestry and linear change series', () => {
  assert.equal(g.graphAncestor(g.INCIDENT_GRAPH, S.base, S.head), false);
  assert.equal(g.graphAncestor(g.INCIDENT_GRAPH, S.base, S.integration), true);
  assert.equal(g.requiredParents(g.INCIDENT_GRAPH, S.integration, S.base, S.head), true);
  assert.equal(g.requiredParents(g.INCIDENT_GRAPH, S.integration, S.head, S.base), false);
  assert.equal(g.requiredParents(g.INCIDENT_GRAPH, S.otherIntegration, S.base, S.head), false);
  assert.equal(g.requiredParents([{ sha: 'tip', parents: [S.base, S.head, 'extra'] }], 'tip', S.base, S.head), false);
  assert.equal(g.graphAncestor(g.TRANSFER_GRAPH, S.base, S.rebasedHead), true);
  assert.equal(g.graphAncestor(g.TRANSFER_GRAPH, S.oldHead, S.rebasedHead), false);
  assert.equal(g.requiredParents(g.TRANSFER_GRAPH, S.rebasedHead, S.base, S.oldHead), false);
  assert.deepEqual(g.linearSeries(g.TRANSFER_GRAPH, S.base, S.rebasedHead), ['p1', 'p2']);
  assert.deepEqual(g.linearSeries(g.TRANSFER_GRAPH, S.base, S.later), ['p1', 'p2', 'p3']);
  assert.equal(g.linearSeries(g.TRANSFER_GRAPH, S.base, S.oldHead), null);
  assert.equal(g.graphAncestor(g.TRANSFER_GRAPH, '__proto__', S.rebasedHead), false);
  const cyclic = [{ sha: 'a', parents: ['b'], change: 'p1' }, { sha: 'b', parents: ['a'], change: 'p2' }, { sha: 'c', parents: [] }];
  assert.equal(g.graphAncestor(cyclic, 'c', 'a'), false);
  assert.equal(g.linearSeries(cyclic, 'c', 'a'), null);
});

test('rationale completeness is independent of correctness and locks without early grading', () => {
  assert.equal(g.lockGraph(evidence(), 'integration-selection').hypothesis, '');
  for (const slot of g.GRAPH_SLOTS) for (const key of ['id', 'fact']) {
    const a = reason(); a.sources[slot][key] = ' ';
    assert.equal(g.lockGraph(drafted(a), 'integration-selection').hypothesis, '');
  }
  const a = reason(); a.relation = ' ';
  assert.equal(g.lockGraph(drafted(a), 'integration-selection').hypothesis, '');
  const wrong = reason(); wrong.sources.graph.fact = `${S.head}=${S.base}`;
  assert.equal(locked(wrong).hypothesis, 'integration-selection');
  assert.equal(locked(wrong).verification, null);
});

test('every source ID, observed fact, relation and class independently gates verification after correct recovery', () => {
  const answers = [];
  for (const slot of g.GRAPH_SLOTS) for (const key of ['id', 'fact']) {
    const a = reason(); a.sources[slot][key] = key === 'id' ? 'git-graph:before:unrelated' : 'wrong'; answers.push(a);
  }
  answers.push({ ...reason(), relation: 'cache-reuses-output' });
  for (const a of answers) {
    const s = verified(a);
    assert.equal(s.run.pipeline, 'passed'); assert.equal(s.run.checkoutSha, S.integration); assert.equal(s.run.metadataSha, S.integration);
    assert.equal(s.verification.consumedMatch, true); assert.equal(s.verification.graphMatch, true);
    assert.equal(s.verified, false); assert.equal(g.isValidGraphState(s), true);
    assert.equal(g.editGraphReason(s, reason()), s);
    assert.equal(g.editGraphExplanation(s, explanation()), s); // Later explanation cannot rescue locked reasoning.
    assert.equal(parseCiCheckpoint(JSON.stringify(checkpoint({ ...s, verified: true }))), null);
  }
  for (const c of ['cache-content', 'delivery-target']) assert.equal(verified(reason(), c).verified, false);
});

test('green PR head, base and a two-parent integration of a different head do not satisfy the contract', () => {
  for (const commit of [S.head, S.base, S.otherIntegration]) {
    const s = verified(reason(), 'integration-selection', commit);
    assert.equal(s.run.pipeline, 'passed'); assert.equal(s.verified, false);
    assert.equal(s.verification.consumedMatch, false); assert.equal(s.verification.graphMatch, false);
    assert.deepEqual(s.verification.parents, g.INCIDENT_GRAPH.find(n => n.sha === commit).parents);
    assert.equal(g.isValidGraphState(s), true);
  }
  assert.equal(verified().verified, true);
  assert.deepEqual(verified().verification.parents, [S.base, S.head]);
  assert.equal(g.inspectGraph(verified(), 'graph').evidence.graph.output, g.graphEvidence('graph').output);
});

test('rationale input and lock snapshots cannot alias or be edited after lock', () => {
  const a = reason(), draft = drafted(a); a.sources.graph.fact = 'changed';
  assert.equal(draft.rationale.sources.graph.fact, `${S.head}=${S.root}`);
  const s = g.lockGraph(draft, 'integration-selection'); draft.rationale.sources.graph.fact = 'changed again';
  assert.equal(s.rationale.sources.graph.fact, `${S.head}=${S.root}`);
  assert.equal(g.editGraphReason(s, reason()), s);
  const built = g.rebuildGraph(g.selectGraphCommit(s, S.integration));
  assert.deepEqual(g.verifyGraph(built).rationale, s.rationale);
});

test('explanation checks each source and fact separately; edit and resubmit revoke transfer', () => {
  for (const slot of g.GRAPH_SLOTS) for (const key of ['id', 'fact']) {
    const a = explanation(); a.sources[slot][key] = 'wrong';
    assert.equal(g.explainGraph(g.editGraphExplanation(verified(), a)).explained, false);
  }
  for (const key of ['relation', 'repair']) {
    const a = explanation(); a[key] = 'wrong';
    assert.equal(g.explainGraph(g.editGraphExplanation(verified(), a)).explained, false);
  }
  assert.equal(explained().explained, true);
  const edited = g.editGraphExplanation(completed(), explanation());
  assert.equal(edited.explained, false); assert.equal(edited.transfer, null); assert.equal(edited.transferPassed, false);
  assert.equal(g.explainGraph(completed()).transfer, null);
});

test('transfer changes the graph mechanism: rebase identities need no original-head ancestry or second parent', () => {
  const s = completed(); assert.equal(s.transferPassed, true); assert.equal(g.isValidGraphState(s), true);
  for (const field of ['selectedCommit', 'baseAncestor', 'originalHeadAncestor', 'parentCount', 'relation']) {
    const a = transfer(); a[field] = field === 'selectedCommit' ? S.integration : 'wrong';
    assert.equal(g.graphTransferMatches(a), false);
  }
  for (const commit of [S.oldHead, S.later, S.base, S.integration, S.rebasedFirst]) {
    const a = transfer(); a.selectedCommit = commit;
    assert.equal(g.graphTransferMatches(a), false); // Old history, extra changes, empty or incomplete series.
  }
  for (const relation of ['two-direct-parents', 'original-head-ancestor']) assert.equal(g.graphTransferMatches({ ...transfer(), relation }), false);
  for (const slot of g.GRAPH_TRANSFER_SLOTS) for (const key of ['id', 'fact']) {
    const a = transfer(); a.sources[slot][key] = 'wrong';
    assert.equal(g.graphTransferMatches(a), false);
  }
  const edited = g.editGraphTransfer(s, transfer()); assert.equal(edited.transferPassed, false); assert.equal(edited.explained, true);
  assert.equal(g.editGraphTransfer(verified(), transfer()).transfer, null);
});

test('rebuild, reverify and reset revoke downstream confirmations but preserve locked rationale', () => {
  for (const action of [g.rebuildGraph, g.verifyGraph]) {
    const s = action(completed()); assert.equal(s.explanation, null); assert.equal(s.explained, false); assert.equal(s.transfer, null); assert.equal(s.transferPassed, false);
    assert.deepEqual(s.rationale, reason()); assert.equal(g.isValidGraphState(s), true);
  }
  assert.equal(g.rebuildGraph(completed()).verification, null);
  assert.equal(g.rebuildGraph(completed()).verified, false);
  assert.deepEqual(g.initialGraphState().evidence, {});
});

test('fresh, partial evidence, rationale draft/lock, wrong verified attempt and transfer drafts survive checkpoint round trips', () => {
  const wrong = reason(); wrong.sources.build.fact = 'wrong';
  const states = [g.initialGraphState(), g.inspectGraph(g.initialGraphState(), 'review'), drafted(), locked(), g.selectGraphCommit(locked(), S.integration), g.rebuildGraph(g.selectGraphCommit(locked(), S.integration)), verified(), verified(wrong), explained(), g.editGraphTransfer(completed(), { ...transfer(), parentCount: '2' }), completed()];
  for (const s of states) {
    const value = parseCiCheckpoint(JSON.stringify(checkpoint(s)));
    assert.ok(value, JSON.stringify(s)); assert.deepEqual(value.state.graphPractice, s);
  }
  assert.equal(CI_PRACTICE_SCHEMA_VERSION, 4); assert.equal(CI_FIXTURE_VERSION, 4);
  const old = checkpoint(completed()); old.schemaVersion = 3; old.fixtureVersion = 3;
  assert.equal(parseCiCheckpoint(JSON.stringify(old)), null);
});

test('contradictory evidence, consumed metadata, parent verification and derived completion fail closed', () => {
  const mutations = [
    s => { s.evidence.graph.output += ' altered'; }, s => { s.evidence.review.slot = 'graph'; },
    s => { s.evidence.extra = {}; }, s => { delete s.rationale.sources.graph; }, s => { s.rationale.relation = []; },
    s => { s.selectedCommit = S.head; }, s => { s.run.checkoutSha = S.base; }, s => { s.run.metadataSha = S.head; },
    s => { s.verification.graphMatch = false; }, s => { s.verification.consumedMatch = false; },
    s => { s.verification.parents.reverse(); }, s => { s.verification.parents.push(S.root); },
    s => { s.verification = null; }, s => { s.verified = false; }, s => { s.hypothesis = 'cache-content'; },
    s => { s.explanation.repair = S.head; }, s => { s.explained = false; }, s => { s.transfer.relation = 'two-direct-parents'; },
    s => { s.transfer.sources.history.fact = 'wrong'; }, s => { s.transfer = null; }, s => { s.extra = true; }
  ];
  for (const change of mutations) { const c = checkpoint(completed()); change(c.state.graphPractice); assert.equal(parseCiCheckpoint(JSON.stringify(c)), null, String(change)); }
  for (const field of ['verified', 'explained', 'transferPassed']) assert.equal(g.isValidGraphState({ ...g.initialGraphState(), [field]: true }), false);
});

test('malformed and executable-looking input stays inert; denied storage methods return ephemeral state', () => {
  for (const value of ['git merge main', '$(touch /tmp/pwn)', '<script>', '__proto__', 'x'.repeat(161)]) {
    assert.equal(g.lockGraph(drafted(), value).hypothesis, ''); assert.equal(g.selectGraphCommit(locked(), value).selectedCommit, '');
  }
  for (const a of [null, [], {}, { ...reason(), extra: true }, { ...reason(), relation: 'x'.repeat(161) }, { sources: {}, relation: 'a' }]) assert.equal(g.validGraphReason(a), false);
  assert.equal(g.validGraphTransfer({ ...transfer(), parentCount: 'x'.repeat(161) }), false);
  const blocked = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); }, removeItem() { throw Error('denied'); } };
  assert.equal(loadCiPractice(blocked).status, 'unavailable'); assert.equal(saveCiPractice(blocked, initialCiLabState()), false);
});
