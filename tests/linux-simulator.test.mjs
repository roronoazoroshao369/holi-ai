import test from "node:test";
import assert from "node:assert/strict";
import { execute, initialLabState, recordHypothesis, explain, scenarios } from "../lib/linux-simulator.ts";

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

function diagnosed(scenario) {
  const fixture = scenarios[scenario];
  return recordHypothesis(evidence(scenario), fixture.correctHypothesis);
}

function repaired(scenario) {
  const fixture = scenarios[scenario];
  return run(diagnosed(scenario), fixture.commands.repair);
}

test("guided permission health is broken until evidence, hypothesis, repair and verification", () => {
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

test("permission scenarios require mechanism explanation after verified minimal repair", () => {
  for (const scenario of ["guided", "transfer"]) {
    const fixture = scenarios[scenario];
    let state = diagnosed(scenario);
    assert.equal(explain(state, fixture.explanation).explained, false);
    state = run(state, fixture.commands.repair);
    state = run(state, fixture.commands.symptom);
    assert.equal(state.verified, true);
    assert.equal(explain(state, "owner-read").explained, false);
    state = explain(state, fixture.explanation);
    assert.equal(state.explained, true);
    assert.deepEqual(run(state, "reset"), initialLabState(scenario));
  }
});

test("memorized 644 restores transfer HTTP but excessive access fails assessment", () => {
  let state = diagnosed("transfer");
  state = run(state, "chmod 644 /srv/reports/status.html");
  const response = execute(state, scenarios.transfer.commands.symptom);
  assert.match(response.lines[0].text, /200 OK/);
  assert.equal(response.state.verified, false);
  state = run(response.state, scenarios.transfer.commands.repair);
  assert.equal(run(state, scenarios.transfer.commands.symptom).verified, true);
});

test("unfamiliar listener incident distinguishes process existence from socket binding", () => {
  let state = evidence("listener");
  assert.match(execute(initialLabState("listener"), scenarios.listener.commands.identity).lines[0].text, /api-server/);
  assert.match(execute(initialLabState("listener"), scenarios.listener.commands.resource).lines[0].text, /127\.0\.0\.1:9090/);

  state = recordHypothesis(state, "process");
  state = run(state, scenarios.listener.commands.repair);
  state = run(state, scenarios.listener.commands.symptom);
  assert.equal(state.verified, false);

  state = diagnosed("listener");
  state = run(state, scenarios.listener.commands.repair);
  state = run(state, scenarios.listener.commands.symptom);
  assert.equal(state.verified, true);
  assert.equal(explain(state, "process-exists").explained, false);
  assert.equal(explain(state, scenarios.listener.explanation).explained, true);
});

test("wrong hypotheses, missing observations and post-repair hypotheses fail closed", () => {
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

  let state = recordHypothesis(evidence("guided"), "network");
  state = run(state, scenarios.guided.commands.repair);
  assert.equal(run(state, scenarios.guided.commands.symptom).verified, false);
  assert.deepEqual(recordHypothesis(evidence("guided"), "unknown"), evidence("guided"));
});

test("repair invalidates verification and explanation while incident families stay isolated", () => {
  let state = repaired("guided");
  state = run(state, scenarios.guided.commands.symptom);
  state = explain(state, scenarios.guided.explanation);
  assert.equal(state.explained, true);
  state = run(state, "chmod 640 /srv/site/index.html");
  assert.equal(state.explained, false);
  assert.equal(state.verified, false);
  assert.match(execute(state, scenarios.guided.commands.symptom).lines[0].text, /403/);

  const listener = initialLabState("listener");
  assert.deepEqual(run(listener, "chmod 644 /srv/site/index.html"), listener);
  const permission = initialLabState("guided");
  assert.deepEqual(run(permission, scenarios.listener.commands.repair), permission);
});

test("blind repairs cannot manufacture diagnostic completion in either incident family", () => {
  let state = run(initialLabState("guided"), scenarios.guided.commands.repair);
  state = run(state, scenarios.guided.commands.resource);
  state = run(state, scenarios.guided.commands.symptom);
  assert.equal(state.verified, false);

  state = run(initialLabState("listener"), scenarios.listener.commands.repair);
  state = run(state, scenarios.listener.commands.identity);
  state = run(state, scenarios.listener.commands.resource);
  state = run(state, scenarios.listener.commands.symptom);
  assert.equal(state.verified, false);
  assert.equal(state.observations.symptom, false);
});

test("reset clears observations and attempts are immutable and isolated", () => {
  const first = run(initialLabState("guided"), scenarios.guided.commands.repair);
  const second = initialLabState("guided");
  assert.equal(second.incident.kind, "file-access");
  assert.deepEqual(run(first, "reset"), second);
  assert.deepEqual(initialLabState("listener"), initialLabState("listener"));
});

test("unsupported hostile input is inert and no arbitrary execution is introduced", () => {
  for (const scenario of ["guided", "listener"]) {
    const state = initialLabState(scenario);
    for (const command of ["curl localhost; id", "chmod 777 /srv/site/index.html", "$(id)", "configure api-server --listen 0.0.0.0:22", "x".repeat(5000)]) {
      assert.deepEqual(run(state, command), state);
      assert.equal(execute(state, command).lines[0].kind, "error");
    }
  }
});

test("help exposes evidence vocabulary and repair syntax without running commands", () => {
  const state = initialLabState("listener");
  const result = execute(state, "help");
  assert.deepEqual(result.state, state);
  assert.match(result.lines[0].text, /ss -ltnp/);
  assert.match(result.lines[0].text, /configure SERVICE --listen ADDRESS:PORT/);
});
