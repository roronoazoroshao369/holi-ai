import test from "node:test";
import assert from "node:assert/strict";
import { differentialScenario, execute, initialLabState, recordHypothesis, explain, scenarios } from "../lib/linux-simulator.ts";

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
    assert.equal(explain(state, "owner-read").explained, false);
    assert.equal(explain(state, fixture.explanation).explained, true);
  }
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
    assert.equal(explain(state, wrong).explained, false);
    assert.equal(explain(state, fixture.explanation).explained, true);
  }
});

test("repair syntax is hidden until evidence-backed hypothesis is locked", () => {
  for (const scenario of ["guided", "differential-listener", "differential-process"]) {
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
  for (const scenario of ["guided", "transfer", "differential-listener", "differential-process"]) {
    const changed = run(initialLabState(scenario), scenarios[scenario].commands.repair);
    assert.deepEqual(run(changed, "reset"), initialLabState(scenario));
  }
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
