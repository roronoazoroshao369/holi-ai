import test from "node:test";
import assert from "node:assert/strict";
import { checkCausalTransfer, checkPermissionTransfer, execute, explain, initialLabState, recordHypothesis, scenarios } from "../lib/linux-simulator.ts";
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

function counterfactualFor(overrides = {}) {
  return {
    processEvidenceId: "differential-listener:before:identity",
    processFact: "present",
    socketEvidenceId: "differential-listener:before:resource",
    socketFact: "9090",
    predictedSymptom: "200",
    repairNeed: "none",
    causalClaim: "listener-target-match",
    ...overrides
  };
}

function permissionCounterfactualFor(overrides = {}) {
  return {
    identityEvidenceId: "transfer:before:identity",
    identityFact: "1001:report-worker,web",
    resourceEvidenceId: "transfer:before:resource",
    resourceFact: "600:root:web",
    fixedMode: "640",
    hypotheticalIdentity: "1001:report-worker",
    predictedSymptom: "403",
    repairNeed: "required",
    causalClaim: "group-membership-required",
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

function evidence(
  scenario = "guided",
  order,
  step,
  causalTransfer = null,
  causalTransferPassed = false,
  permissionTransfer = null,
  permissionTransferPassed = false
) {
  if (scenario.startsWith("differential") && permissionTransfer === null) {
    permissionTransfer = permissionCounterfactualFor();
    permissionTransferPassed = true;
  }
  let state = initialLabState(
    scenario,
    order,
    step,
    causalTransfer,
    causalTransferPassed,
    permissionTransfer,
    permissionTransferPassed
  );
  const fixture = scenarios[scenario];
  for (const command of [fixture.commands.symptom, fixture.commands.resource, fixture.commands.identity]) {
    state = execute(state, command).state;
  }
  return recordHypothesis(state, fixture.correctHypothesis);
}

function completed(
  scenario = "guided",
  order,
  step,
  causalTransfer = null,
  causalTransferPassed = false,
  permissionTransfer = null,
  permissionTransferPassed = false
) {
  const fixture = scenarios[scenario];
  let state = evidence(
    scenario,
    order,
    step,
    causalTransfer,
    causalTransferPassed,
    permissionTransfer,
    permissionTransferPassed
  );
  state = execute(state, fixture.commands.repair).state;
  state = execute(state, fixture.commands.symptom).state;
  state = explain(state, reasoningFor(state));
  if (scenario === "transfer") state = checkPermissionTransfer(state, permissionCounterfactualFor());
  return state;
}

test("valid partial and completed checkpoints round-trip across all incident cases", () => {
  const listenerPassed = checkCausalTransfer(completed("differential-listener", "listener-first", 0), counterfactualFor());
  for (const state of [
    evidence("guided"),
    completed("guided"),
    evidence("transfer"),
    completed("transfer"),
    evidence("differential-listener", "listener-first", 0),
    completed("differential-listener", "listener-first", 0),
    listenerPassed,
    evidence("differential-process", "process-first", 0),
    completed("differential-process", "process-first", 0),
    completed("differential-process", "listener-first", 1, listenerPassed.causalTransfer, true),
    evidence("differential-listener", "process-first", 1),
    completed("differential-listener", "process-first", 1),
    checkCausalTransfer(completed("differential-listener", "process-first", 1), counterfactualFor())
  ]) {
    const storage = memoryStorage();
    assert.equal(savePractice(storage, state), true);
    const loaded = loadPractice(storage);
    assert.equal(loaded.status, "restored");
    assert.deepEqual(loaded.state, state);
  }
});

test("completion requires permission transfer before differential and both transfer gates at the end", () => {
  assert.deepEqual(checkpointFor(completed("guided")).completed, { guided: true, transfer: false, differential: false });
  assert.deepEqual(checkpointFor(completed("transfer")).completed, { guided: true, transfer: true, differential: false });

  let transferWithoutCounterfactual = evidence("transfer");
  transferWithoutCounterfactual = execute(transferWithoutCounterfactual, scenarios.transfer.commands.repair).state;
  transferWithoutCounterfactual = execute(transferWithoutCounterfactual, scenarios.transfer.commands.symptom).state;
  transferWithoutCounterfactual = explain(transferWithoutCounterfactual, reasoningFor(transferWithoutCounterfactual));
  assert.deepEqual(checkpointFor(transferWithoutCounterfactual).completed, { guided: true, transfer: false, differential: false });

  assert.deepEqual(checkpointFor(completed("differential-listener", "listener-first", 0)).completed, { guided: true, transfer: true, differential: false });

  const listenerPassed = checkCausalTransfer(completed("differential-listener", "listener-first", 0), counterfactualFor());
  const finalProcess = checkpointFor(completed("differential-process", "listener-first", 1, listenerPassed.causalTransfer, true));
  assert.deepEqual(finalProcess.completed, { guided: true, transfer: true, differential: true });

  const finalListenerState = checkCausalTransfer(completed("differential-listener", "process-first", 1), counterfactualFor());
  const reversed = checkpointFor(finalListenerState);
  assert.deepEqual(reversed.completed, { guided: true, transfer: true, differential: true });

  finalProcess.completed.differential = false;
  assert.equal(parseCheckpoint(JSON.stringify(finalProcess)), null);
});

test("corrupt JSON is discarded and starts clean", () => {
  const storage = memoryStorage({ [PRACTICE_STORAGE_KEY]: "{bad json" });
  const loaded = loadPractice(storage);
  assert.equal(loaded.status, "discarded");
  assert.deepEqual(loaded.state, initialLabState());
  assert.equal(storage.peek(PRACTICE_STORAGE_KEY), undefined);
});

test("schema and fixture version mismatches including stale v6 fail closed", () => {
  const checkpoint = checkpointFor(evidence());
  for (const changed of [
    { ...checkpoint, schemaVersion: PRACTICE_SCHEMA_VERSION + 1 },
    { ...checkpoint, fixtureVersion: LINUX_FIXTURE_VERSION + 1 },
    { ...checkpoint, schemaVersion: 6, fixtureVersion: 5 },
    { ...checkpoint, schemaVersion: 5, fixtureVersion: 5 },
    { ...checkpoint, schemaVersion: 4, fixtureVersion: 4 },
    { ...checkpoint, schemaVersion: 3, fixtureVersion: 3 }
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


test("permission transfer persistence rejects forged identity/resource facts and impossible carry", () => {
  const passed = completed("transfer");
  const valid = checkpointFor(passed);
  assert.ok(parseCheckpoint(JSON.stringify(valid)));

  for (const mutate of [
    checkpoint => { checkpoint.state.permissionTransfer.identityEvidenceId = "transfer:before:resource"; },
    checkpoint => { checkpoint.state.permissionTransfer.resourceFact = "640:root:web"; },
    checkpoint => { checkpoint.state.permissionTransfer.fixedMode = "644"; },
    checkpoint => { checkpoint.state.permissionTransfer.hypotheticalIdentity = "1001:report-worker,web"; },
    checkpoint => { checkpoint.state.permissionTransfer.predictedSymptom = "200"; },
    checkpoint => { checkpoint.state.permissionTransferPassed = false; checkpoint.completed.transfer = false; },
    checkpoint => { checkpoint.state.permissionTransfer.extra = "forged"; }
  ]) {
    const forged = structuredClone(valid);
    mutate(forged);
    if (forged.state.permissionTransferPassed === false) {
      assert.ok(parseCheckpoint(JSON.stringify(forged)));
    } else {
      assert.equal(parseCheckpoint(JSON.stringify(forged)), null);
    }
  }

  const guided = checkpointFor(completed("guided"));
  guided.state.permissionTransfer = permissionCounterfactualFor();
  guided.state.permissionTransferPassed = true;
  assert.equal(parseCheckpoint(JSON.stringify(guided)), null);

  const differential = checkpointFor(evidence("differential-process", "process-first", 0));
  differential.state.permissionTransfer = null;
  differential.state.permissionTransferPassed = false;
  differential.completed.transfer = false;
  assert.equal(parseCheckpoint(JSON.stringify(differential)), null);
});

test("counterfactual persistence rejects forged answers and impossible sequence carry", () => {
  const passed = checkCausalTransfer(completed("differential-listener", "listener-first", 0), counterfactualFor());
  const valid = checkpointFor(passed);
  assert.ok(parseCheckpoint(JSON.stringify(valid)));

  for (const mutate of [
    checkpoint => { checkpoint.state.causalTransfer.processEvidenceId = "differential-listener:before:resource"; },
    checkpoint => { checkpoint.state.causalTransfer.predictedSymptom = "refused"; },
    checkpoint => { checkpoint.state.causalTransferPassed = false; checkpoint.state.scenario = "differential-process"; checkpoint.state.differentialStep = 1; },
    checkpoint => { checkpoint.state.causalTransfer.extra = "forged"; }
  ]) {
    const forged = structuredClone(valid);
    mutate(forged);
    assert.equal(parseCheckpoint(JSON.stringify(forged)), null);
  }

  const processFirst = checkpointFor(completed("differential-process", "process-first", 0));
  processFirst.state.causalTransfer = counterfactualFor();
  processFirst.state.causalTransferPassed = true;
  assert.equal(parseCheckpoint(JSON.stringify(processFirst)), null);

  const listenerPassed = checkCausalTransfer(completed("differential-listener", "listener-first", 0), counterfactualFor());
  const carried = checkpointFor(completed("differential-process", "listener-first", 1, listenerPassed.causalTransfer, true));
  assert.ok(parseCheckpoint(JSON.stringify(carried)));
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
