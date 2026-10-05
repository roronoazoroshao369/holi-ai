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
  for (const cmd of ["curl localhost", "ls -l " + scenarios[scenario].path, "id " + scenarios[scenario].worker]) state = execute(state, cmd).state;
  return recordHypothesis(state, "permission");
}
function completed(scenario = "guided") {
  let state = evidence(scenario);
  state = execute(state, "chmod " + scenarios[scenario].targetMode + " " + scenarios[scenario].path).state;
  state = execute(state, "curl localhost").state;
  return explain(state, scenarios[scenario].explanation);
}

test("valid partial and completed checkpoints round-trip", () => {
  for (const state of [evidence("guided"), completed("guided"), evidence("transfer"), completed("transfer")]) {
    const storage = memoryStorage();
    assert.equal(savePractice(storage, state), true);
    const loaded = loadPractice(storage);
    assert.equal(loaded.status, "restored");
    assert.deepEqual(loaded.state, state);
  }
});

test("completion flags are derived and cannot contradict lab state", () => {
  const transfer = completed("transfer");
  const checkpoint = checkpointFor(transfer);
  assert.deepEqual(checkpoint.completed, { guided: true, transfer: true });
  checkpoint.completed.transfer = false;
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
    { ...checkpoint, fixtureVersion: LINUX_FIXTURE_VERSION + 1 }
  ]) {
    const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: JSON.stringify(changed) });
    assert.equal(loadPractice(storage).status, "discarded");
  }
});

test("impossible verified or explained state is rejected", () => {
  const impossible = checkpointFor(initialLabState());
  impossible.state = { ...impossible.state, mode: "644", verified: true, explained: true };
  impossible.completed = { guided: true, transfer: false };
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
