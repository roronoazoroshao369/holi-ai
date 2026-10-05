import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCiRepair,
  ciEvidenceReady,
  initialCiLabState,
  inspectCiEvidence,
  lockCiHypothesis,
  rerunCiPipeline,
  submitCiExplanation,
  submitCiTransfer
} from "../lib/ci-simulator.ts";
import {
  CI_FIXTURE_VERSION,
  CI_PRACTICE_SCHEMA_VERSION,
  CI_PRACTICE_STORAGE_KEY,
  loadCiPractice,
  parseCiCheckpoint,
  saveCiPractice
} from "../lib/ci-practice-persistence.ts";

function evidence(state = initialCiLabState()) {
  for (const slot of ["workflow", "producer", "consumer"]) state = inspectCiEvidence(state, slot);
  return state;
}

function correctExplanation(overrides = {}) {
  return {
    workflowEvidenceId: "git-ci:before:workflow",
    workflowFact: "artifact name crosses build job output",
    producerEvidenceId: "git-ci:before:producer",
    producerFact: "web-dist",
    consumerEvidenceId: "git-ci:before:consumer",
    consumerFact: "site-dist",
    causalClaim: "producer-consumer-artifact-contract",
    minimalRepair: "map-current-artifact-output",
    ...overrides
  };
}

function correctTransfer(overrides = {}) {
  return {
    producerEvidenceId: "git-ci:transfer:producer",
    producerFact: "reports/coverage.json",
    consumerEvidenceId: "git-ci:transfer:consumer",
    consumerFact: "workspace/report/coverage.json",
    predictedPath: "workspace/report/reports/coverage.json",
    causalClaim: "artifact-extraction-preserves-relative-path",
    ...overrides
  };
}

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
    peek(key) { return data.get(key); }
  };
}

test("Git CI evidence must precede a locked hypothesis", () => {
  let state = initialCiLabState();
  state = inspectCiEvidence(state, "workflow");
  assert.equal(ciEvidenceReady(state), false);
  assert.equal(lockCiHypothesis(state, "artifact-contract").hypothesis, "");
  state = inspectCiEvidence(state, "producer");
  state = inspectCiEvidence(state, "consumer");
  assert.equal(ciEvidenceReady(state), true);
  assert.equal(lockCiHypothesis(state, "artifact-contract").hypothesis, "artifact-contract");
});

test("correct repair after wrong diagnosis may go green but cannot verify mastery", () => {
  let state = lockCiHypothesis(evidence(), "runner-permission");
  state = applyCiRepair(state, "map-current-artifact-output");
  state = rerunCiPipeline(state);
  assert.equal(state.runStatus, "passed");
  assert.equal(state.verified, false);
  assert.equal(state.evidenceBackedRepair, false);
});

test("only minimal artifact output mapping repair verifies after correct diagnosis", () => {
  for (const wrong of ["rename-built-files", "chmod-workspace", "rerun-only"]) {
    let state = lockCiHypothesis(evidence(), "artifact-contract");
    state = applyCiRepair(state, wrong);
    state = rerunCiPipeline(state);
    assert.equal(state.runStatus, "failed");
    assert.equal(state.verified, false);
  }
  let state = lockCiHypothesis(evidence(), "artifact-contract");
  state = applyCiRepair(state, "map-current-artifact-output");
  state = rerunCiPipeline(state);
  assert.equal(state.runStatus, "passed");
  assert.equal(state.verified, true);
});

test("source-linked explanation requires all captured facts", () => {
  let state = lockCiHypothesis(evidence(), "artifact-contract");
  state = rerunCiPipeline(applyCiRepair(state, "map-current-artifact-output"));
  assert.equal(submitCiExplanation(state, correctExplanation({ consumerFact: "web-dist" })).explained, false);
  state = submitCiExplanation(state, correctExplanation());
  assert.equal(state.explained, true);
});

test("changed transfer requires applying path extraction semantics rather than copying the first repair", () => {
  let state = lockCiHypothesis(evidence(), "artifact-contract");
  state = rerunCiPipeline(applyCiRepair(state, "map-current-artifact-output"));
  state = submitCiExplanation(state, correctExplanation());
  assert.equal(submitCiTransfer(state, correctTransfer({ predictedPath: "workspace/report/coverage.json" })).transferPassed, false);
  state = submitCiTransfer(state, correctTransfer());
  assert.equal(state.transferPassed, true);
});

test("Git CI persistence round-trips valid state and rejects stale or forged completion", () => {
  let state = lockCiHypothesis(evidence(), "artifact-contract");
  state = rerunCiPipeline(applyCiRepair(state, "map-current-artifact-output"));
  state = submitCiExplanation(state, correctExplanation());
  state = submitCiTransfer(state, correctTransfer());

  const storage = memoryStorage();
  assert.equal(saveCiPractice(storage, state), true);
  const loaded = loadCiPractice(storage);
  assert.equal(loaded.status, "restored");
  assert.equal(loaded.state.transferPassed, true);

  const raw = JSON.parse(storage.peek(CI_PRACTICE_STORAGE_KEY));
  raw.state.verified = false;
  assert.equal(parseCiCheckpoint(JSON.stringify(raw)), null);

  assert.equal(parseCiCheckpoint(JSON.stringify({
    schemaVersion: CI_PRACTICE_SCHEMA_VERSION - 1,
    fixtureVersion: CI_FIXTURE_VERSION,
    state
  })), null);
});

test("Git CI unavailable storage falls back to fresh ephemeral state", () => {
  const blocked = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
  const loaded = loadCiPractice(blocked);
  assert.equal(loaded.status, "unavailable");
  assert.equal(loaded.state.hypothesis, "");
});
