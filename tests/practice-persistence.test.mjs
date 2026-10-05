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

test("valid partial and completed checkpoints round-trip across both incident families", () => {
  for (const state of [
    evidence("guided"),
    completed("guided"),
    evidence("transfer"),
    completed("transfer"),
    evidence("listener"),
    completed("listener")
  ]) {
    const storage = memoryStorage();
    assert.equal(savePractice(storage, state), true);
    const loaded = loadPractice(storage);
    assert.equal(loaded.status, "restored");
    assert.deepEqual(loaded.state, state);
  }
});

test("completion flags are derived through guided, transfer and unfamiliar listener progression", () => {
  assert.deepEqual(checkpointFor(completed("guided")).completed, { guided: true, transfer: false, listener: false });
  assert.deepEqual(checkpointFor(completed("transfer")).completed, { guided: true, transfer: true, listener: false });
  const checkpoint = checkpointFor(completed("listener"));
  assert.deepEqual(checkpoint.completed, { guided: true, transfer: true, listener: true });
  checkpoint.completed.listener = false;
  assert.equal(parseCheckpoint(JSON.stringify(checkpoint)), null);
});

test("corrupt JSON is discarded and starts clean", () => {
  const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: "{bad json" });
  const loaded = loadPractice(storage);
  assert.equal(loaded.status, "discarded");
  assert.deepEqual(loaded.state, initialLabState());
  assert.equal(storage.peek(PRACTICE_STORAGE_KEY), undefined);
});

test("schema and fixture version mismatches fail closed", () => {
  const checkpoint = checkpointFor(evidence());
  for (const changed of [
    { ...checkpoint, schemaVersion: PRACTICE_SCHEMA_VERSION + 1 },
    { ...checkpoint, fixtureVersion: LINUX_FIXTURE_VERSION + 1 },
    { ...checkpoint, schemaVersion: 1, fixtureVersion: 1 }
  ]) {
    const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: JSON.stringify(changed) });
    assert.equal(loadPractice(storage).status, "discarded");
  }
});

test("scenario-family mismatches and impossible completion states are rejected", () => {
  const mismatch = checkpointFor(evidence("listener"));
  mismatch.state = { ...mismatch.state, incident: { kind: "file-access", mode: "644" } };
  assert.equal(parseCheckpoint(JSON.stringify(mismatch)), null);

  const impossible = checkpointFor(initialLabState());
  impossible.state = {
    ...impossible.state,
    incident: { kind: "file-access", mode: "644" },
    verified: true,
    explained: true
  };
  impossible.completed = { guided: true, transfer: false, listener: false };
  assert.equal(parseCheckpoint(JSON.stringify(impossible)), null);
});

test("repaired provenance cannot exist on an untouched fixture", () => {
  const impossible = checkpointFor(evidence("listener"));
  impossible.state = { ...impossible.state, repairedWithEvidence: true };
  assert.equal(parseCheckpoint(JSON.stringify(impossible)), null);
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
