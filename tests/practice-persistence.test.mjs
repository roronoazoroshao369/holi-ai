import test from "node:test";
import assert from "node:assert/strict";
import { execute, explain, initialLabState, recordHypothesis, scenarios } from "../lib/linux-simulator.ts";
import {
  LINUX_FIXTURE_VERSION,
  PRACTICE_SCHEMA_VERSION,
  PRACTICE_STORAGE_KEY,
  checkpointFor,
  clearPractice,
  loadPractice,
  parseCheckpoint,
  savePractice
} from "../lib/practice-persistence.ts";

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
    peek(key) { return data.get(key); }
  };
}

function evidence(scenario = "guided") {
  let state = initialLabState(scenario);
  const fixture = scenarios[scenario];
  for (const command of [fixture.commands.symptom, fixture.commands.resource, fixture.commands.identity]) {
    state = execute(state, command).state;
  }
  return recordHypothesis(state, fixture.correctHypothesis);
}

function completed(scenario = "guided") {
  const fixture = scenarios[scenario];
  let state = evidence(scenario);
  state = execute(state, fixture.commands.repair).state;
  state = execute(state, fixture.commands.symptom).state;
  return explain(state, fixture.explanation);
}

test("valid partial and completed checkpoints round-trip across all incident cases", () => {
  for (const state of [
    evidence("guided"),
    completed("guided"),
    evidence("transfer"),
    completed("transfer"),
    evidence("differential-listener"),
    completed("differential-listener"),
    evidence("differential-process"),
    completed("differential-process")
  ]) {
    const storage = memoryStorage();
    assert.equal(savePractice(storage, state), true);
    const loaded = loadPractice(storage);
    assert.equal(loaded.status, "restored");
    assert.deepEqual(loaded.state, state);
  }
});

test("completion is derived from sequence position and final differential explanation", () => {
  assert.deepEqual(checkpointFor(completed("guided")).completed, { guided: true, transfer: false, differential: false });
  assert.deepEqual(checkpointFor(completed("transfer")).completed, { guided: true, transfer: true, differential: false });
  assert.deepEqual(checkpointFor(completed("differential-listener")).completed, { guided: true, transfer: true, differential: false });
  const checkpoint = checkpointFor(completed("differential-process"));
  assert.deepEqual(checkpoint.completed, { guided: true, transfer: true, differential: true });
  checkpoint.completed.differential = false;
  assert.equal(parseCheckpoint(JSON.stringify(checkpoint)), null);
});

test("corrupt JSON is discarded and starts clean", () => {
  const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: "{bad json" });
  const loaded = loadPractice(storage);
  assert.equal(loaded.status, "discarded");
  assert.deepEqual(loaded.state, initialLabState());
  assert.equal(storage.peek(PRACTICE_STORAGE_KEY), undefined);
});

test("schema and fixture version mismatches including v2 fail closed", () => {
  const checkpoint = checkpointFor(evidence());
  for (const changed of [
    { ...checkpoint, schemaVersion: PRACTICE_SCHEMA_VERSION + 1 },
    { ...checkpoint, fixtureVersion: LINUX_FIXTURE_VERSION + 1 },
    { ...checkpoint, schemaVersion: 2, fixtureVersion: 2 }
  ]) {
    const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: JSON.stringify(changed) });
    assert.equal(loadPractice(storage).status, "discarded");
  }
});

test("scenario-family and competing-case state mismatches are rejected", () => {
  const familyMismatch = checkpointFor(evidence("differential-listener"));
  familyMismatch.state = { ...familyMismatch.state, incident: { kind: "file-access", mode: "644" } };
  assert.equal(parseCheckpoint(JSON.stringify(familyMismatch)), null);

  const crossCase = checkpointFor(evidence("differential-listener"));
  crossCase.state = {
    ...crossCase.state,
    incident: { kind: "tcp-service", processRunning: false, listenerPort: null }
  };
  assert.equal(parseCheckpoint(JSON.stringify(crossCase)), null);

  const impossibleSocket = checkpointFor(evidence("differential-process"));
  impossibleSocket.state = {
    ...impossibleSocket.state,
    incident: { kind: "tcp-service", processRunning: false, listenerPort: 9090 }
  };
  assert.equal(parseCheckpoint(JSON.stringify(impossibleSocket)), null);
});

test("impossible verified, explained or untouched-repaired states are rejected", () => {
  const impossible = checkpointFor(initialLabState());
  impossible.state = {
    ...impossible.state,
    incident: { kind: "file-access", mode: "644" },
    verified: true,
    explained: true
  };
  impossible.completed = { guided: true, transfer: false, differential: false };
  assert.equal(parseCheckpoint(JSON.stringify(impossible)), null);

  const untouched = checkpointFor(evidence("differential-process"));
  untouched.state = { ...untouched.state, repairedWithEvidence: true };
  assert.equal(parseCheckpoint(JSON.stringify(untouched)), null);
});

test("unavailable storage falls back to ephemeral clean practice", () => {
  const blocked = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
  const loaded = loadPractice(blocked);
  assert.equal(loaded.status, "unavailable");
  assert.deepEqual(loaded.state, initialLabState());
  assert.equal(savePractice(blocked, evidence()), false);
  assert.equal(clearPractice(blocked), false);
});
