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


function reasoningFor(state, mechanism = scenarios[state.scenario].explanation) {
  const scenario = state.scenario;
  const file = scenarios[scenario].family === "file-access";
  return {
    symptom: { evidenceId: scenario + ":before:symptom", claim: file ? "403" : "refused" },
    identity: { evidenceId: scenario + ":before:identity", claim: file ? (scenario === "guided" ? "33:www-data" : "1001:report-worker,web") : (scenario === "differential-listener" ? "present" : "absent") },
    resource: { evidenceId: scenario + ":before:resource", claim: file ? "600" : (scenario === "differential-listener" ? "9090" : "none") },
    mechanism: { evidenceIds: [scenario + ":before:resource", scenario + ":before:identity"], claim: mechanism },
    target: file ? scenarios[scenario].targetMode : "8080"
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

function evidence(scenario = "guided", order, step) {
  let state = initialLabState(scenario, order, step);
  const fixture = scenarios[scenario];
  for (const command of [fixture.commands.symptom, fixture.commands.resource, fixture.commands.identity]) {
    state = execute(state, command).state;
  }
  return recordHypothesis(state, fixture.correctHypothesis);
}

function completed(scenario = "guided", order, step) {
  const fixture = scenarios[scenario];
  let state = evidence(scenario, order, step);
  state = execute(state, fixture.commands.repair).state;
  state = execute(state, fixture.commands.symptom).state;
  return explain(state, reasoningFor(state));
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
    completed("differential-process"),
    evidence("differential-process", "process-first", 0),
    completed("differential-process", "process-first", 0),
    evidence("differential-listener", "process-first", 1),
    completed("differential-listener", "process-first", 1)
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

  const reversed = checkpointFor(completed("differential-listener", "process-first", 1));
  assert.deepEqual(reversed.completed, { guided: true, transfer: true, differential: true });

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

test("schema and fixture version mismatches including v3 fail closed", () => {
  const checkpoint = checkpointFor(evidence());
  for (const changed of [
    { ...checkpoint, schemaVersion: PRACTICE_SCHEMA_VERSION + 1 },
    { ...checkpoint, fixtureVersion: LINUX_FIXTURE_VERSION + 1 },
    { ...checkpoint, schemaVersion: 4, fixtureVersion: 4 },
    { ...checkpoint, schemaVersion: 3, fixtureVersion: 3 },
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

  const orderMismatch = checkpointFor(evidence("differential-listener"));
  orderMismatch.state = { ...orderMismatch.state, differentialOrder: "process-first" };
  assert.equal(parseCheckpoint(JSON.stringify(orderMismatch)), null);

  const stepMismatch = checkpointFor(evidence("differential-process", "process-first", 0));
  stepMismatch.state = { ...stepMismatch.state, differentialStep: 1 };
  assert.equal(parseCheckpoint(JSON.stringify(stepMismatch)), null);
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
  const loaded = loadPractice(blocked, "process-first");
  assert.equal(loaded.status, "unavailable");
  assert.deepEqual(loaded.state, initialLabState("guided", "process-first"));
  assert.equal(savePractice(blocked, evidence()), false);
  assert.equal(clearPractice(blocked), false);
});


test("snapshot provenance and explained reasoning contradictions are rejected on restore", () => {
  const valid = checkpointFor(completed("differential-listener"));
  for (const mutate of [
    checkpoint => { checkpoint.state.preRepairEvidence.resource.output = "LISTEN on 8080"; },
    checkpoint => { checkpoint.state.preRepairEvidence.resource.scenario = "differential-process"; },
    checkpoint => { checkpoint.state.preRepairEvidence.resource.phase = "after-repair"; },
    checkpoint => { delete checkpoint.state.preRepairEvidence.identity; },
    checkpoint => { checkpoint.state.reasoning.identity.claim = "absent"; },
    checkpoint => { checkpoint.state.reasoning.resource.evidenceId = checkpoint.state.reasoning.symptom.evidenceId; },
    checkpoint => { checkpoint.state.reasoning.mechanism.evidenceIds.push(checkpoint.state.reasoning.symptom.evidenceId); },
    checkpoint => { checkpoint.state.reasoning.target = "9090"; },
    checkpoint => { checkpoint.state.preRepairEvidence.other = {}; }
  ]) {
    const corrupted = structuredClone(valid);
    mutate(corrupted);
    assert.equal(parseCheckpoint(JSON.stringify(corrupted)), null);
  }
});

test("failed structured attempts restore and checkpoint copies do not alias nested evidence", () => {
  let state = completed("transfer");
  const wrong = reasoningFor(state);
  wrong.target = "644";
  state = explain(state, wrong);
  const cp = checkpointFor(state);
  assert.ok(parseCheckpoint(JSON.stringify(cp)));
  const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: JSON.stringify(cp) });
  assert.deepEqual(loadPractice(storage).state, state);
  cp.state.preRepairEvidence.resource.output = "changed";
  cp.state.reasoning.mechanism.evidenceIds[0] = "changed";
  assert.notEqual(state.preRepairEvidence.resource.output, "changed");
  assert.notEqual(state.reasoning.mechanism.evidenceIds[0], "changed");
});

test("initial observation flags without captured evidence and extra reasoning keys are rejected", () => {
  const cp = checkpointFor(initialLabState());
  cp.state.observations.identity = true;
  assert.equal(parseCheckpoint(JSON.stringify(cp)), null);
  const extra = checkpointFor(completed());
  extra.state.reasoning.allEvidence = Object.values(extra.state.preRepairEvidence);
  assert.equal(parseCheckpoint(JSON.stringify(extra)), null);
});
