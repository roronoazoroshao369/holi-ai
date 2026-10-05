import test from "node:test";
import assert from "node:assert/strict";
import { execute, initialLabState, recordHypothesis, explain, scenarios } from "../lib/linux-simulator.ts";
test("health is broken until repair and passing requires pre-repair evidence", () => {
  let state = initialLabState();
  state = execute(state, "curl localhost").state;
  assert.equal(state.symptomObserved, true);
  state = execute(state, "ls -l /srv/site/index.html").state;
  state = execute(state, "id www-data").state;
  state = recordHypothesis(state, "permission");
  state = execute(state, "chmod 644 /srv/site/index.html").state;
  assert.equal(state.verified, false);
  assert.match(execute(state, "ls -l /srv/site/index.html").lines[0].text, /-rw-r--r--/);
  state = execute(state, "curl localhost").state;
  assert.equal(state.verified, true);
});
function evidence(scenario) {
  let state = initialLabState(scenario);
  for (const cmd of ["curl localhost", "ls -l " + scenarios[scenario].path, "id " + scenarios[scenario].worker]) state = execute(state, cmd).state;
  return recordHypothesis(state, "permission");
}
test("both scenarios require correct explanation after verified minimal repair", () => {
  for (const scenario of ["guided", "transfer"]) {
    let state = evidence(scenario);
    assert.equal(explain(state, scenarios[scenario].explanation).explained, false);
    state = execute(state, "chmod " + scenarios[scenario].targetMode + " " + scenarios[scenario].path).state;
    assert.equal(state.verified, false);
    state = execute(state, "curl localhost").state;
    assert.equal(state.verified, true);
    assert.equal(explain(state, "owner-read").explained, false);
    state = explain(state, scenarios[scenario].explanation);
    assert.equal(state.explained, true);
    assert.deepEqual(execute(state, "reset").state, initialLabState(scenario));
  }
});
test("memorized 644 restores transfer HTTP but excessive access fails assessment", () => {
  let state = execute(evidence("transfer"), "chmod 644 /srv/reports/status.html").state;
  const response = execute(state, "curl localhost");
  assert.match(response.lines[0].text, /200 OK/);
  assert.equal(response.state.verified, false);
  state = execute(response.state, "chmod 640 /srv/reports/status.html").state;
  assert.equal(execute(state, "curl localhost").state.verified, true);
});
test("wrong hypothesis, missing evidence, post-repair hypotheses and unsupported answers fail closed", () => {
  for (const missing of ["http", "file", "identity"]) {
    let state = initialLabState();
    if (missing !== "http") state = execute(state, "curl localhost").state;
    if (missing !== "file") state = execute(state, "ls -l /srv/site/index.html").state;
    if (missing !== "identity") state = execute(state, "id www-data").state;
    state = recordHypothesis(state, "permission");
    state = execute(state, "chmod 644 /srv/site/index.html").state;
    state = recordHypothesis(state, "permission");
    assert.equal(execute(state, "curl localhost").state.verified, false);
  }
  let state = recordHypothesis(evidence("guided"), "network");
  state = execute(state, "chmod 644 /srv/site/index.html").state;
  assert.equal(execute(state, "curl localhost").state.verified, false);
  assert.deepEqual(recordHypothesis(evidence("guided"), "unknown"), evidence("guided"));
});
test("repair invalidates verification and explanation; fixtures do not leak state", () => {
  let state = execute(evidence("guided"), "chmod 644 /srv/site/index.html").state;
  state = explain(execute(state, "curl localhost").state, "other-read");
  assert.equal(state.explained, true);
  state = execute(state, "chmod 640 /srv/site/index.html").state;
  assert.equal(state.explained, false);
  assert.equal(state.verified, false);
  assert.match(execute(state, "curl localhost").lines[0].text, /403/);
  assert.deepEqual(execute(initialLabState("transfer"), "chmod 644 /srv/site/index.html").state, initialLabState("transfer"));
});
test("blind repair and inspection after repair cannot bypass the evidence gate", () => {
  let state = execute(initialLabState(), "chmod 644 /srv/site/index.html").state;
  state = execute(state, "ls -l /srv/site/index.html").state;
  state = execute(state, "chmod 644 /srv/site/index.html").state;
  state = execute(state, "curl localhost").state;
  assert.equal(state.verified, false);
});
test("reset clears all evidence and attempts are isolated", () => {
  const first = execute(initialLabState(), "chmod 644 /srv/site/index.html").state;
  const second = initialLabState();
  assert.equal(second.mode, "600");
  assert.deepEqual(execute(first, "reset").state, second);
});
test("unsupported hostile input is inert and state is immutable", () => {
  const state = initialLabState();
  for (const command of ["curl localhost; id", "chmod 777 /srv/site/index.html", "$(id)", "x".repeat(5000)]) {
    assert.deepEqual(execute(state, command).state, state);
    assert.equal(execute(state, command).lines[0].kind, "error");
  }
});
