import test from "node:test";
import assert from "node:assert/strict";
import { checkCausalTransfer, checkPermissionTransfer, checkPathTransfer, differentialScenario, editCausalTransfer, editPermissionTransfer, editPathTransfer, execute, initialLabState, recordHypothesis, explain, editReasoning, scenarios } from "../lib/linux-simulator.ts";


function reasoningFor(state, mechanism = scenarios[state.scenario].explanation) {
  const scenario = state.scenario;
  const family = scenarios[scenario].family;
  const file = family === "file-access";
  const path = family === "path-access";
  return {
    symptom: { evidenceId: scenario + ":before:symptom", claim: file || path ? "403" : "refused" },
    identity: { evidenceId: scenario + ":before:identity", claim: path ? "33:www-data" : file ? (scenario === "guided" ? "33:www-data" : "1001:report-worker,web") : (scenario === "differential-listener" ? "present" : "absent") },
    resource: { evidenceId: scenario + ":before:resource", claim: path ? "700-parent-644-file" : file ? "600" : (scenario === "differential-listener" ? "9090" : "none") },
    mechanism: { evidenceIds: [scenario + ":before:resource", scenario + ":before:identity"], claim: mechanism },
    target: path ? "711" : file ? scenarios[scenario].targetMode : "8080"
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

function pathCounterfactualFor(overrides = {}) {
  return {
    identityEvidenceId: "path-search:before:identity",
    identityFact: "33:www-data",
    pathEvidenceId: "path-search:before:resource",
    pathFact: "700:/srv/private/site",
    fileFact: "644:/srv/private/site/index.html",
    changedParent: "/srv/private/archive",
    changedParentMode: "700",
    predictedSymptom: "403",
    repairNeed: "directory-search",
    causalClaim: "parent-search-required",
    ...overrides
  };
}

function run(state, command) {
  return execute(state, command).state;
}

function evidence(scenario) {
  let state = initialLabState(scenario);
  const fixture = scenarios[scenario];
  for (const command of [fixture.commands.symptom, fixture.commands.resource, fixture.commands.identity]) {
    state = run(state, command);
  }
  return state;
}

function diagnosed(scenario, hypothesis = scenarios[scenario].correctHypothesis) {
  return recordHypothesis(evidence(scenario), hypothesis);
}

function repaired(scenario) {
  return run(diagnosed(scenario), scenarios[scenario].commands.repair);
}

test("guided permission health requires pre-repair evidence and hypothesis", () => {
  let state = initialLabState("guided");
  state = run(state, scenarios.guided.commands.symptom);
  assert.equal(state.observations.symptom, true);
  state = run(state, scenarios.guided.commands.resource);
  state = run(state, scenarios.guided.commands.identity);
  state = recordHypothesis(state, "permission");
  state = run(state, scenarios.guided.commands.repair);
  assert.equal(state.verified, false);
  assert.match(execute(state, scenarios.guided.commands.resource).lines[0].text, /-rw-r--r--/);
  state = run(state, scenarios.guided.commands.symptom);
  assert.equal(state.verified, true);
});

test("permission transfer still rejects memorized overbroad 644", () => {
  let state = diagnosed("transfer");
  state = run(state, "chmod 644 /srv/reports/status.html");
  const response = execute(state, scenarios.transfer.commands.symptom);
  assert.match(response.lines[0].text, /200 OK/);
  assert.equal(response.state.verified, false);
  state = run(response.state, scenarios.transfer.commands.repair);
  assert.equal(run(state, scenarios.transfer.commands.symptom).verified, true);
});

test("permission scenarios require the evidence-backed access-class explanation", () => {
  for (const scenario of ["guided", "transfer"]) {
    const fixture = scenarios[scenario];
    let state = repaired(scenario);
    state = run(state, fixture.commands.symptom);
    assert.equal(state.verified, true);
    assert.equal(explain(state, reasoningFor(state, "owner-read")).explained, false);
    assert.equal(explain(state, reasoningFor(state)).explained, true);
  }
});

test("permission counterfactual changes only group membership after the minimal 640 repair", () => {
  let state = run(repaired("transfer"), scenarios.transfer.commands.symptom);
  state = explain(state, reasoningFor(state));
  assert.equal(state.explained, true);

  for (const wrong of [
    { identityEvidenceId: "transfer:before:resource" },
    { identityFact: "1001:report-worker" },
    { resourceEvidenceId: "transfer:before:identity" },
    { resourceFact: "640:root:web" },
    { fixedMode: "644" },
    { hypotheticalIdentity: "1001:report-worker,web" },
    { predictedSymptom: "200" },
    { repairNeed: "none" },
    { causalClaim: "other-read" }
  ]) {
    assert.equal(checkPermissionTransfer(state, permissionCounterfactualFor(wrong)).permissionTransferPassed, false);
  }

  state = checkPermissionTransfer(state, permissionCounterfactualFor());
  assert.equal(state.permissionTransferPassed, true);
  assert.deepEqual(state.permissionTransfer, permissionCounterfactualFor());
});

test("path-search separates readable file bits from parent traversal and rejects blind file chmod", () => {
  let state = diagnosed("path-search");
  const evidenceBefore = structuredClone(state.preRepairEvidence);
  const blind = execute(state, "chmod 644 /srv/private/site/index.html");
  assert.match(blind.lines[0].text, /already 644/i);
  assert.deepEqual(blind.state.preRepairEvidence, evidenceBefore);
  assert.equal(blind.state.repairedWithEvidence, false);

  state = run(state, scenarios["path-search"].commands.repair);
  state = run(state, scenarios["path-search"].commands.symptom);
  assert.equal(state.verified, true);
  assert.equal(explain(state, reasoningFor(state, "other-read")).explained, false);
  state = explain(state, reasoningFor(state));
  assert.equal(state.explained, true);

  for (const wrong of [
    { pathEvidenceId: "path-search:before:identity" },
    { pathFact: "711:/srv/private/site" },
    { fileFact: "600:/srv/private/site/index.html" },
    { changedParentMode: "711" },
    { predictedSymptom: "200" },
    { repairNeed: "file-read" },
    { causalClaim: "other-read" }
  ]) assert.equal(checkPathTransfer(state, pathCounterfactualFor(wrong)).pathTransferPassed, false);

  state = checkPathTransfer(state, pathCounterfactualFor());
  assert.equal(state.pathTransferPassed, true);
  const edited = editPathTransfer(state, pathCounterfactualFor({ repairNeed: "file-read" }));
  assert.equal(edited.pathTransferPassed, false);
  assert.equal(run(state, "reset").pathTransferPassed, false);
});

test("editing or resetting permission transfer revokes it, while differential reset preserves a passed gate", () => {
  let transfer = run(repaired("transfer"), scenarios.transfer.commands.symptom);
  transfer = explain(transfer, reasoningFor(transfer));
  transfer = checkPermissionTransfer(transfer, permissionCounterfactualFor());
  assert.equal(transfer.permissionTransferPassed, true);

  const edited = editPermissionTransfer(transfer, permissionCounterfactualFor({ predictedSymptom: "200" }));
  assert.equal(edited.permissionTransferPassed, false);
  assert.equal(edited.permissionTransfer.predictedSymptom, "200");

  const carried = initialLabState(
    "differential-listener",
    "listener-first",
    0,
    null,
    false,
    transfer.permissionTransfer,
    true
  );
  const resetDifferential = run(carried, "reset");
  assert.equal(resetDifferential.permissionTransferPassed, true);
  assert.deepEqual(resetDifferential.permissionTransfer, permissionCounterfactualFor());

  const resetTransfer = run(transfer, "reset");
  assert.equal(resetTransfer.permissionTransferPassed, false);
  assert.equal(resetTransfer.permissionTransfer, null);
});

test("same-symptom differential cases have neutral learner-facing identity and initial symptom", () => {
  const listener = scenarios["differential-listener"];
  const process = scenarios["differential-process"];

  assert.equal(listener.title, process.title);
  assert.equal(listener.summary, process.summary);
  assert.equal(listener.readme, process.readme);
  assert.equal(listener.commands.symptom, process.commands.symptom);
  assert.equal(listener.commands.resource, process.commands.resource);
  assert.equal(listener.commands.identity, process.commands.identity);

  const prompt = [listener.title, listener.summary, listener.readme].join(" ");
  assert.doesNotMatch(prompt, /9090|no matching api-server|configure api-server|start api-server/i);

  const listenerSymptom = execute(initialLabState("differential-listener"), listener.commands.symptom).lines[0].text;
  const processSymptom = execute(initialLabState("differential-process"), process.commands.symptom).lines[0].text;
  assert.equal(listenerSymptom, processSymptom);
  assert.match(listenerSymptom, /Connection refused/);

  const listenerHelp = execute(initialLabState("differential-listener"), "help").lines[0].text;
  const processHelp = execute(initialLabState("differential-process"), "help").lines[0].text;
  assert.equal(listenerHelp, processHelp);
  assert.doesNotMatch(listenerHelp, /Repair syntax|configure|start api-server/i);
});

test("explicit differential assignment deterministically supports both orderings and reset preserves it", () => {
  for (const [order, expected] of [
    ["listener-first", ["differential-listener", "differential-process"]],
    ["process-first", ["differential-process", "differential-listener"]]
  ]) {
    assert.equal(differentialScenario(order, 0), expected[0]);
    assert.equal(differentialScenario(order, 1), expected[1]);

    for (const step of [0, 1]) {
      const scenario = expected[step];
      const initial = initialLabState(scenario, order, step);
      assert.equal(initial.differentialOrder, order);
      assert.equal(initial.differentialStep, step);
      assert.equal(initial.scenario, scenario);

      const changed = run(initial, scenarios[scenario].commands.repair);
      assert.deepEqual(run(changed, "reset"), initial);
    }
  }
});

test("process and socket observations discriminate the competing connection-refused causes", () => {
  const listener = initialLabState("differential-listener");
  assert.match(execute(listener, scenarios["differential-listener"].commands.identity).lines[0].text, /842 app api-server/);
  assert.match(execute(listener, scenarios["differential-listener"].commands.resource).lines[0].text, /127\.0\.0\.1:9090/);

  const process = initialLabState("differential-process");
  assert.match(execute(process, scenarios["differential-process"].commands.identity).lines[0].text, /no matching api-server process/);
  assert.match(execute(process, scenarios["differential-process"].commands.resource).lines[0].text, /No LISTEN socket/);
});

test("wrong causal class cannot pass either differential case even after the correct repair command", () => {
  for (const [scenario, wrong] of [
    ["differential-listener", "process"],
    ["differential-process", "network"]
  ]) {
    const fixture = scenarios[scenario];
    let state = diagnosed(scenario, wrong);
    state = run(state, fixture.commands.repair);
    const response = execute(state, fixture.commands.symptom);
    assert.match(response.lines[0].text, /200 OK/);
    assert.equal(response.state.verified, false);

    state = diagnosed(scenario);
    state = run(state, fixture.commands.repair);
    state = run(state, fixture.commands.symptom);
    assert.equal(state.verified, true);
  }
});

test("differential cases require distinct mechanism explanations after diagnosis", () => {
  for (const scenario of ["differential-listener", "differential-process"]) {
    const fixture = scenarios[scenario];
    let state = repaired(scenario);
    state = run(state, fixture.commands.symptom);
    assert.equal(state.verified, true);
    const wrong = scenario === "differential-listener" ? "process-started" : "listener-port-match";
    assert.equal(explain(state, reasoningFor(state, wrong)).explained, false);
    assert.equal(explain(state, reasoningFor(state)).explained, true);
  }
});

test("repair syntax is hidden until evidence-backed hypothesis is locked", () => {
  for (const scenario of ["guided", "path-search", "differential-listener", "differential-process"]) {
    const fixture = scenarios[scenario];
    const before = execute(initialLabState(scenario), "help").lines[0].text;
    assert.doesNotMatch(before, /Repair syntax/);
    const after = execute(diagnosed(scenario), "help").lines[0].text;
    assert.match(after, /Repair syntax/);
    assert.ok(after.includes(fixture.repairSyntax));
  }
});

test("commands cannot mutate a different incident family or competing differential case", () => {
  const listener = initialLabState("differential-listener");
  assert.deepEqual(run(listener, scenarios["differential-process"].commands.repair), listener);
  assert.deepEqual(run(listener, "chmod 644 /srv/site/index.html"), listener);

  const process = initialLabState("differential-process");
  assert.deepEqual(run(process, scenarios["differential-listener"].commands.repair), process);

  const permission = initialLabState("guided");
  assert.deepEqual(run(permission, scenarios["differential-listener"].commands.repair), permission);
  assert.deepEqual(run(permission, scenarios["differential-process"].commands.repair), permission);
});

test("wrong hypotheses, missing observations and post-repair hypothesis changes fail closed", () => {
  for (const missing of ["symptom", "resource", "identity"]) {
    let state = initialLabState("guided");
    const fixture = scenarios.guided;
    for (const key of ["symptom", "resource", "identity"]) {
      if (key !== missing) state = run(state, fixture.commands[key]);
    }
    state = recordHypothesis(state, "permission");
    state = run(state, fixture.commands.repair);
    state = recordHypothesis(state, "permission");
    assert.equal(run(state, fixture.commands.symptom).verified, false);
  }

  let state = diagnosed("guided", "network");
  state = run(state, scenarios.guided.commands.repair);
  assert.equal(run(state, scenarios.guided.commands.symptom).verified, false);
  assert.deepEqual(recordHypothesis(evidence("guided"), "unknown"), evidence("guided"));
});

test("blind repairs cannot manufacture diagnostic completion across families", () => {
  for (const scenario of ["guided", "differential-listener", "differential-process"]) {
    const fixture = scenarios[scenario];
    let state = run(initialLabState(scenario), fixture.commands.repair);
    state = run(state, fixture.commands.resource);
    state = run(state, fixture.commands.identity);
    state = run(state, fixture.commands.symptom);
    assert.equal(state.verified, false);
  }
});

test("reset restores exact current fixture and attempts remain immutable", () => {
  for (const scenario of ["guided", "transfer", "path-search", "differential-listener", "differential-process"]) {
    const changed = run(initialLabState(scenario), scenarios[scenario].commands.repair);
    assert.deepEqual(run(changed, "reset"), initialLabState(scenario));
  }
});


test("listener counterfactual requires canonical sources, observed facts and causal prediction", () => {
  let state = run(repaired("differential-listener"), scenarios["differential-listener"].commands.symptom);
  state = explain(state, reasoningFor(state));
  assert.equal(state.explained, true);

  for (const wrong of [
    { processEvidenceId: "differential-listener:before:resource" },
    { processFact: "absent" },
    { socketEvidenceId: "differential-listener:before:symptom" },
    { socketFact: "8080" },
    { predictedSymptom: "refused" },
    { repairNeed: "listener-change" },
    { causalClaim: "process-started" }
  ]) {
    assert.equal(checkCausalTransfer(state, counterfactualFor(wrong)).causalTransferPassed, false);
  }

  state = checkCausalTransfer(state, counterfactualFor());
  assert.equal(state.causalTransferPassed, true);
  assert.deepEqual(state.causalTransfer, counterfactualFor());
});

test("editing or resetting the listener counterfactual revokes transfer completion", () => {
  let state = run(repaired("differential-listener"), scenarios["differential-listener"].commands.symptom);
  state = explain(state, reasoningFor(state));
  state = checkCausalTransfer(state, counterfactualFor());
  assert.equal(state.causalTransferPassed, true);

  const edited = editCausalTransfer(state, counterfactualFor({ predictedSymptom: "refused" }));
  assert.equal(edited.causalTransferPassed, false);
  assert.equal(edited.causalTransfer.predictedSymptom, "refused");

  const reset = run(state, "reset");
  assert.equal(reset.causalTransferPassed, false);
  assert.equal(reset.causalTransfer, null);
});

test("listener-first transfer survives only when advancing to and resetting the second process case", () => {
  let listener = initialLabState("differential-listener", "listener-first", 0);
  const fixture = scenarios["differential-listener"];
  for (const command of [fixture.commands.symptom, fixture.commands.resource, fixture.commands.identity]) listener = run(listener, command);
  listener = recordHypothesis(listener, "network");
  listener = run(listener, fixture.commands.repair);
  listener = run(listener, fixture.commands.symptom);
  listener = explain(listener, reasoningFor(listener));
  listener = checkCausalTransfer(listener, counterfactualFor());
  assert.equal(listener.causalTransferPassed, true);

  const process = initialLabState("differential-process", "listener-first", 1, listener.causalTransfer, true);
  const reset = run(process, "reset");
  assert.equal(reset.causalTransferPassed, true);
  assert.deepEqual(reset.causalTransfer, counterfactualFor());
});

test("unsupported hostile input is inert and no arbitrary execution is introduced", () => {
  for (const scenario of ["guided", "differential-listener", "differential-process"]) {
    const state = initialLabState(scenario);
    for (const command of [
      "curl localhost; id",
      "chmod 777 /srv/site/index.html",
      "$(id)",
      "configure api-server --listen 0.0.0.0:22",
      "start api-server --listen 0.0.0.0:22",
      "x".repeat(5000)
    ]) {
      assert.deepEqual(run(state, command), state);
      assert.equal(execute(state, command).lines[0].kind, "error");
    }
  }
});


test("structured explanation rejects mismatched sources, facts, causal links and minimal targets", () => {
  for (const scenario of Object.keys(scenarios)) {
    const state = run(repaired(scenario), scenarios[scenario].commands.symptom);
    const correct = reasoningFor(state);
    assert.equal(explain(state, correct).explained, true);
    for (const slot of ["symptom", "identity", "resource"]) {
      const source = structuredClone(correct);
      source[slot].evidenceId = correct[slot === "identity" ? "resource" : "identity"].evidenceId;
      assert.equal(explain(state, source).explained, false);
      const fact = structuredClone(correct);
      fact[slot].claim = "incorrect";
      assert.equal(explain(state, fact).explained, false);
    }
    const duplicate = structuredClone(correct);
    duplicate.mechanism.evidenceIds = [correct.identity.evidenceId, correct.identity.evidenceId];
    assert.equal(explain(state, duplicate).explained, false);
    const irrelevant = structuredClone(correct);
    irrelevant.mechanism.evidenceIds = [correct.identity.evidenceId, correct.symptom.evidenceId];
    assert.equal(explain(state, irrelevant).explained, false);
    const all = structuredClone(correct);
    all.mechanism.evidenceIds.push(correct.symptom.evidenceId);
    assert.equal(explain(state, all).explained, false);
    const target = structuredClone(correct);
    target.target = scenario === "transfer" ? "644" : "777";
    assert.equal(explain(state, target).explained, false);
    assert.equal(explain(state, "other-read").explained, false);
  }
});

test("before-repair snapshots are immutable and cannot be collected retrospectively", () => {
  for (const scenario of Object.keys(scenarios)) {
    const fixture = scenarios[scenario];
    let state = diagnosed(scenario);
    const snapshots = structuredClone(state.preRepairEvidence);
    state = run(state, fixture.commands.repair);
    for (const command of [fixture.commands.resource, fixture.commands.identity, fixture.commands.symptom]) {
      state = run(state, command);
    }
    assert.deepEqual(state.preRepairEvidence, snapshots);
    let blind = run(initialLabState(scenario), fixture.commands.repair);
    for (const command of [fixture.commands.resource, fixture.commands.identity, fixture.commands.symptom]) {
      blind = run(blind, command);
    }
    assert.deepEqual(blind.preRepairEvidence, {});
    assert.equal(explain(blind, reasoningFor(blind)).explained, false);
    assert.deepEqual(recordHypothesis(blind, fixture.correctHypothesis), blind);
  }
});

test("hypothesis lock, explanation reset and cross-case sources fail closed", () => {
  let state = diagnosed("differential-listener", "process");
  assert.deepEqual(recordHypothesis(state, "network"), state);
  state = run(run(state, scenarios[state.scenario].commands.repair), scenarios[state.scenario].commands.symptom);
  assert.equal(explain(state, reasoningFor(state)).explained, false);
  state = run(repaired("differential-listener"), scenarios["differential-listener"].commands.symptom);
  const cross = reasoningFor(state);
  cross.resource.evidenceId = "differential-process:before:resource";
  assert.equal(explain(state, cross).explained, false);
  state = explain(state, reasoningFor(state));
  assert.deepEqual(run(state, "reset"), initialLabState("differential-listener"));
  const repairedAgain = run(state, scenarios[state.scenario].commands.repair);
  assert.equal(repairedAgain.reasoning, null);
  assert.equal(repairedAgain.explained, false);
});

test("captured snapshot output matches the actual initial command output", () => {
  for (const scenario of Object.keys(scenarios)) {
    for (const slot of ["symptom", "identity", "resource"]) {
      const response = execute(initialLabState(scenario), scenarios[scenario].commands[slot]);
      assert.equal(response.state.preRepairEvidence[slot].output, response.lines[0].text);
      assert.equal(response.state.preRepairEvidence[slot].command, scenarios[scenario].commands[slot]);
    }
  }
});

test("editing a completed reasoning draft revokes completion until deterministic recheck", () => {
  let state = run(repaired("guided"), scenarios.guided.commands.symptom);
  state = explain(state, reasoningFor(state));
  assert.equal(state.explained, true);
  const draft = reasoningFor(state);
  draft.symptom.claim = "200";
  const edited = editReasoning(state, draft);
  assert.equal(edited.explained, false);
  assert.equal(explain(edited, edited.reasoning).explained, false);
  assert.equal(explain(edited, reasoningFor(edited)).explained, true);
  assert.equal(state.reasoning.symptom.claim, "403");
});
