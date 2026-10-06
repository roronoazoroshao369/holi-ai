import test from 'node:test';
import assert from 'node:assert/strict';
import * as git from '../lib/git-revision-simulator.ts';
import { initialCiLabState } from '../lib/ci-simulator.ts';
import { ciCheckpointFor, parseCiCheckpoint, isValidCiLabState } from '../lib/ci-practice-persistence.ts';
const sha = git.REVISION_SHAS;
function evidence() { return git.REVISION_SLOTS.reduce(git.inspectRevision, git.initialRevisionState()); }
function rebuilt(hypothesis = 'revision-selection', repair = 'pin-intended-sha') {
  return git.rebuildRevision(git.repairRevision(git.lockRevision(drafted(), hypothesis), repair));
}
function explanation() {
  const facts = { symptom: 'passed:acceptance-not-met', workflow: 'refs/heads/release', refs: `refs/heads/release=${sha.built}`, build: sha.built, intent: sha.intended };
  return { sources: Object.fromEntries(git.REVISION_SLOTS.map(slot => [slot, { id: git.revisionEvidence(slot).id, fact: facts[slot] }])), relation: 'checkout-ref-resolves-build-commit', repair: 'pin-intended-sha' };
}
function rationale() { const { repair, ...answer } = explanation(); return answer; }
function drafted(answer = rationale()) { return git.editRevisionRationale(evidence(), answer); }
function explained() { return git.explainRevision(git.editRevisionExplanation(git.verifyRevision(rebuilt()), explanation())); }
function transfer(overrides = {}) {
  return { tagSource: git.REVISION_TRANSFER_SOURCES.tag.id, tagObject: sha.tagObject, targetCommit: sha.tagCommit,
    branchSource: git.REVISION_TRANSFER_SOURCES.branch.id, branchCommit: sha.branchNow, intentSource: git.REVISION_TRANSFER_SOURCES.intent.id,
    selectedRevision: sha.tagCommit, relation: 'annotated-tag-peels-to-commit', ...overrides };
}
function completed() { return git.checkRevisionTransfer(git.editRevisionTransfer(explained(), transfer())); }
function checkpoint(revision) { return ciCheckpointFor({ ...initialCiLabState(), revisionPractice: revision }); }

test('neutral revision prompt does not disclose selection failure, refs, SHA or repair', () => {
  assert.doesNotMatch(JSON.stringify(git.REVISION_PROMPT), /wrong.ref|stale.branch|wrong.commit|pin-intended|refs\/heads|a4a4|b7b7/i);
});
test('every required pre-repair source is needed and hypothesis locks immutably', () => {
  for (const missing of git.REVISION_SLOTS) {
    let s = git.initialRevisionState();
    for (const slot of git.REVISION_SLOTS.filter(x => x !== missing)) s = git.inspectRevision(s, slot);
    assert.equal(git.lockRevision(s, 'revision-selection').hypothesis, '');
    assert.equal(git.repairRevision(s, 'pin-intended-sha').repair, '');
  }
  const s = git.lockRevision(drafted(), 'cache-content');
  assert.deepEqual(git.lockRevision(s, 'revision-selection'), s);
  const repaired = git.repairRevision(s, 'pin-intended-sha');
  assert.deepEqual(git.repairRevision(repaired, 'purge-cache'), repaired);
  assert.deepEqual(git.inspectRevision(repaired, 'refs'), repaired);
});
test('mechanical green and matching SHA after wrong diagnosis cannot earn verified learning', () => {
  const s = git.verifyRevision(rebuilt('cache-content'));
  assert.equal(s.run.pipeline, 'passed');
  assert.equal(s.verification.actualSha, sha.intended);
  assert.equal(s.verified, false);
  assert.equal(git.editRevisionExplanation(s, explanation()).explanation, null);
  assert.equal(git.isValidRevisionState(s), true);
});
test('only minimal revision repair plus explicit SHA verification passes; green alone does not', () => {
  for (const repair of ['purge-cache', 'redirect-target', 'rebuild-only']) {
    const s = git.verifyRevision(rebuilt('revision-selection', repair));
    assert.equal(s.run.pipeline, 'passed');
    assert.equal(s.verification.actualSha, sha.built);
    assert.equal(s.verified, false);
  }
  const s = rebuilt();
  assert.equal(s.verified, false);
  assert.equal(s.verification, null);
  assert.equal(git.verifyRevision(s).verified, true);
});
test('correct causal label cannot compensate for any wrong source ID or source fact', () => {
  const s = git.verifyRevision(rebuilt());
  for (const slot of git.REVISION_SLOTS) {
    for (const key of ['id', 'fact']) {
      const a = explanation(); a.sources[slot][key] = 'wrong';
      assert.equal(git.explainRevision(git.editRevisionExplanation(s, a)).explained, false);
    }
  }
  assert.equal(explained().explained, true);
});
test('tag transfer distinguishes tag object, target commit and moving branch; all sources validate independently', () => {
  assert.equal(completed().transferPassed, true);
  for (const [key, wrong] of Object.entries(transfer())) {
    const a = transfer({ [key]: key === 'selectedRevision' ? sha.tagObject : 'wrong' });
    assert.equal(git.checkRevisionTransfer(git.editRevisionTransfer(explained(), a)).transferPassed, false, key);
  }
  for (const selectedRevision of [sha.built, sha.intended, sha.branchNow, sha.tagObject, 'refs/heads/main', 'refs/tags/v2.4']) {
    assert.equal(git.revisionTransferMatches(transfer({ selectedRevision })), false);
  }
});
test('editing explanation or transfer, rebuild, verification and reset revoke dependent completion', () => {
  const s = completed();
  const edited = git.editRevisionExplanation(s, explanation());
  assert.equal(edited.explained, false); assert.equal(edited.transfer, null); assert.equal(edited.transferPassed, false);
  assert.equal(git.editRevisionTransfer(s, transfer()).transferPassed, false);
  const rebuiltAgain = git.rebuildRevision(s);
  assert.equal(rebuiltAgain.verified, false); assert.equal(rebuiltAgain.transfer, null);
  assert.equal(git.verifyRevision(s).explained, false);
  assert.deepEqual(git.initialRevisionState().evidence, {});
  assert.equal(git.initialRevisionState().transferPassed, false);
});
test('refresh round-trips every reachable stage including drafts; versions are independent from Linux', () => {
  for (const s of [git.initialRevisionState(), evidence(), drafted(), git.editRevisionRationale(evidence(), git.emptyRevisionRationale()), git.lockRevision(drafted(), 'cache-content'), rebuilt(), git.verifyRevision(rebuilt()), explained(), completed(), git.editRevisionTransfer(completed(), transfer()), git.editRevisionExplanation(completed(), explanation())]) {
    assert.equal(git.isValidRevisionState(s), true);
    assert.deepEqual(parseCiCheckpoint(JSON.stringify(checkpoint(s))).state.revisionPractice, s);
  }
  const raw = checkpoint(completed()); raw.schemaVersion = 2;
  assert.equal(parseCiCheckpoint(JSON.stringify(raw)), null);
  const fixture = checkpoint(completed()); fixture.fixtureVersion = 2;
  assert.equal(parseCiCheckpoint(JSON.stringify(fixture)), null);
});
test('contradictory or forged derived checkpoints fail closed', () => {
  const mutations = [
    s => { s.hypothesis = ''; }, s => { s.rationale = null; }, s => { s.rationale.sources.intent.fact = sha.built; }, s => { s.rationale.sources.refs.id = 'fake'; }, s => { s.rationale.relation = 'cache-reuses-output'; }, s => { delete s.evidence.refs; }, s => { s.evidence.refs.output = 'forged'; },
    s => { s.run = null; }, s => { s.run.checkoutSha = sha.built; }, s => { s.run.metadataSha = sha.built; },
    s => { s.verification = null; }, s => { s.verification.actualSha = sha.built; }, s => { s.verified = false; },
    s => { s.explained = false; }, s => { s.explanation.sources.intent.fact = sha.built; },
    s => { s.transfer.selectedRevision = sha.tagObject; }, s => { s.transfer.tagSource = 'fake'; },
    s => { s.extraCompletion = true; }, s => { s.explanation.sources.refs = []; }
  ];
  for (const mutate of mutations) {
    const raw = checkpoint(completed()); mutate(raw.state.revisionPractice);
    assert.equal(parseCiCheckpoint(JSON.stringify(raw)), null, String(mutate));
  }
  const fresh = git.initialRevisionState(); fresh.transferPassed = true;
  assert.equal(git.isValidRevisionState(fresh), false);
});
test('hostile or malformed input is inert and cannot become persisted reasoning', () => {
  const s = drafted();
  for (const input of ['git reset --hard', '$(touch /tmp/pwn)', 'eval(1)', '__proto__']) {
    assert.deepEqual(git.lockRevision(s, input), s);
    assert.deepEqual(git.repairRevision(s, input), s);
  }
  for (const a of [null, [], {}, { sources: {} }, { ...explanation(), extra: true }]) {
    assert.equal(git.validRevisionExplanation(a), false);
  }
  assert.equal(git.validRevisionTransfer({ ...transfer(), relation: 'x'.repeat(161) }), false);
  assert.equal(isValidCiLabState({ ...initialCiLabState(), revisionPractice: {} }), false);
});


test('lock requires complete bounded pre-repair rationale; no early correctness oracle', () => {
  assert.equal(git.lockRevision(evidence(), 'revision-selection').hypothesis, '');
  assert.equal(git.editRevisionRationale(git.initialRevisionState(), rationale()).rationale, null);
  for (const slot of git.REVISION_SLOTS) for (const key of ['id', 'fact']) {
    const a = rationale(); a.sources[slot][key] = ' ';
    assert.equal(git.lockRevision(drafted(a), 'revision-selection').hypothesis, '');
  }
  const a = rationale(); a.relation = '';
  assert.equal(git.lockRevision(drafted(a), 'revision-selection').hypothesis, '');
  for (const a of [null, [], {}, { ...rationale(), repair: 'pin-intended-sha' }, { ...rationale(), relation: 'x'.repeat(161) }]) {
    assert.equal(git.validRevisionRationale(a), false);
    assert.deepEqual(git.editRevisionRationale(evidence(), a), evidence());
  }
});
test('each pre-repair source/fact and relation gates learning despite correct class and consumed SHA', () => {
  const wrong = [];
  for (const slot of git.REVISION_SLOTS) for (const key of ['id', 'fact']) {
    const a = rationale(); a.sources[slot][key] = key === 'id' ? git.revisionEvidence(slot === 'intent' ? 'build' : 'intent').id : 'wrong'; wrong.push(a);
  }
  wrong.push({ ...rationale(), relation: 'cache-reuses-output' });
  for (const a of wrong) {
    const locked = git.lockRevision(drafted(a), 'revision-selection');
    assert.equal(locked.hypothesis, 'revision-selection'); // Commit, not a grading oracle.
    const s = git.verifyRevision(git.rebuildRevision(git.repairRevision(locked, 'pin-intended-sha')));
    assert.equal(s.run.pipeline, 'passed'); assert.equal(s.run.checkoutSha, sha.intended); assert.equal(s.run.metadataSha, sha.intended);
    assert.equal(s.verified, false); assert.equal(git.editRevisionExplanation(s, explanation()).explanation, null);
    assert.equal(git.editRevisionRationale(s, rationale()), s);
    assert.equal(git.isValidRevisionState(s), true);
    assert.deepEqual(parseCiCheckpoint(JSON.stringify(checkpoint(s))).state.revisionPractice, s);
    assert.equal(parseCiCheckpoint(JSON.stringify(checkpoint({ ...s, verified: true }))), null);
  }
});
test('locked rationale is cloned and immutable across edits, rebuild, verify and explanation', () => {
  const a = rationale(); const draft = drafted(a); a.sources.build.fact = 'mutated';
  assert.equal(draft.rationale.sources.build.fact, sha.built);
  const locked = git.lockRevision(draft, 'revision-selection');
  draft.rationale.sources.build.fact = 'alias';
  assert.equal(locked.rationale.sources.build.fact, sha.built);
  assert.equal(git.editRevisionRationale(locked, rationale()), locked);
  let s = git.verifyRevision(git.rebuildRevision(git.repairRevision(locked, 'pin-intended-sha')));
  s = git.explainRevision(git.editRevisionExplanation(s, explanation()));
  assert.deepEqual(s.rationale, locked.rationale);
  assert.deepEqual(git.rebuildRevision(s).rationale, locked.rationale);
  assert.deepEqual(git.verifyRevision(s).rationale, locked.rationale);
  assert.equal(git.initialRevisionState().rationale, null);
});
