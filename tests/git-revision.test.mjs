import test from 'node:test';
import assert from 'node:assert/strict';
import * as git from '../lib/git-revision-simulator.ts';
import { initialCiLabState } from '../lib/ci-simulator.ts';
import { ciCheckpointFor, parseCiCheckpoint, isValidCiLabState } from '../lib/ci-practice-persistence.ts';
const sha = git.REVISION_SHAS;
function evidence() { return git.REVISION_SLOTS.reduce(git.inspectRevision, git.initialRevisionState()); }
function rationale() {
  const s = evidence(), value = git.emptyRevisionRationale();
  const facts = { workflow: 'refs/heads/release', refs: `refs/heads/release=${sha.built};refs/heads/main=${sha.intended}`, build: sha.built, intent: sha.intended };
  for (const slot of ['workflow', 'refs', 'build', 'intent']) value.sources[slot] = { id: s.evidence[slot].id, fact: facts[slot] };
  value.relation = 'checkout-ref-resolves-build-commit';
  return value;
}
function rebuilt(hypothesis = 'revision-selection', repair = 'pin-intended-sha', why = rationale()) {
  return git.rebuildRevision(git.repairRevision(git.lockRevision(evidence(), hypothesis, why), repair));
}
function explanation() {
  const facts = { symptom: 'passed:acceptance-not-met', workflow: 'refs/heads/release', refs: `refs/heads/release=${sha.built}`, build: sha.built, intent: sha.intended };
  return { sources: Object.fromEntries(git.REVISION_SLOTS.map(slot => [slot, { id: git.revisionEvidence(slot).id, fact: facts[slot] }])), relation: 'checkout-ref-resolves-build-commit', repair: 'pin-intended-sha' };
}
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
    assert.equal(git.lockRevision(s, 'revision-selection', rationale()).hypothesis, '');
    assert.equal(git.repairRevision(s, 'pin-intended-sha').repair, '');
  }
  const s = git.lockRevision(evidence(), 'cache-content', rationale());
  assert.deepEqual(git.lockRevision(s, 'revision-selection', rationale()), s);
  const repaired = git.repairRevision(s, 'pin-intended-sha');
  assert.deepEqual(git.repairRevision(repaired, 'purge-cache'), repaired);
  assert.deepEqual(git.inspectRevision(repaired, 'refs'), repaired);
});
test('correct class with wrong pre-repair facts cannot earn verified learning', () => {
  for (const slot of ['workflow', 'refs', 'build', 'intent']) {
    const why = rationale(); why.sources[slot].fact = 'wrong';
    assert.equal(git.verifyRevision(rebuilt('revision-selection', 'pin-intended-sha', why)).verified, false, slot);
  }
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
  for (const s of [git.initialRevisionState(), evidence(), git.lockRevision(evidence(), 'cache-content', rationale()), rebuilt(), git.verifyRevision(rebuilt()), explained(), completed(), git.editRevisionTransfer(completed(), transfer()), git.editRevisionExplanation(completed(), explanation())]) {
    assert.equal(git.isValidRevisionState(s), true);
    assert.deepEqual(parseCiCheckpoint(JSON.stringify(checkpoint(s))).state.revisionPractice, s);
  }
  const raw = checkpoint(completed()); raw.schemaVersion = 1;
  assert.equal(parseCiCheckpoint(JSON.stringify(raw)), null);
  const fixture = checkpoint(completed()); fixture.fixtureVersion = 1;
  assert.equal(parseCiCheckpoint(JSON.stringify(fixture)), null);
});
test('contradictory or forged derived checkpoints fail closed', () => {
  const mutations = [
    s => { s.hypothesis = ''; }, s => { delete s.evidence.refs; }, s => { s.evidence.refs.output = 'forged'; },
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
  const s = evidence();
  for (const input of ['not-a-hypothesis', 'unknown-repair', 'invalid-token', '__invalid__']) {
    assert.deepEqual(git.lockRevision(s, input, rationale()), s);
    assert.deepEqual(git.repairRevision(s, input), s);
  }
  for (const a of [null, [], {}, { sources: {} }, { ...explanation(), extra: true }]) {
    assert.equal(git.validRevisionExplanation(a), false);
  }
  assert.equal(git.validRevisionTransfer({ ...transfer(), relation: 'x'.repeat(161) }), false);
  assert.equal(isValidCiLabState({ ...initialCiLabState(), revisionPractice: {} }), false);
});
