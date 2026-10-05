import test from "node:test";
import assert from "node:assert/strict";
import { execute, initialLabState } from "../lib/linux-simulator.ts";
test("health is broken until repair and passing requires pre-repair evidence", () => {
  let state = initialLabState();
  assert.match(execute(state, "curl localhost").lines[0].text, /403/);
  state = execute(state, "ls -l /srv/site/index.html").state;
  state = execute(state, "chmod 644 /srv/site/index.html").state;
  assert.equal(state.verified, false);
  assert.match(execute(state, "ls -l /srv/site/index.html").lines[0].text, /-rw-r--r--/);
  state = execute(state, "curl localhost").state;
  assert.equal(state.verified, true);
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
