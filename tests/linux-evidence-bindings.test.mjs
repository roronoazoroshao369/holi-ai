import test from "node:test";
import assert from "node:assert/strict";
import { observationClaims, permissionObservationClaims } from "../lib/linux-evidence-bindings.ts";
import { initialEvidence, initialLabState, execute, recordHypothesis, scenarios } from "../lib/linux-simulator.ts";

const facts = record => observationClaims(record).map(item => item.claim);

test("observed facts parse identity groups and file metadata without using repair answers", () => {
  assert.deepEqual(facts(initialEvidence("transfer", "identity")), ["1001:report-worker,web"]);
  assert.deepEqual(facts(initialEvidence("guided", "symptom")), ["403"]);
  const resource = initialEvidence("transfer", "resource");
  assert.deepEqual(facts(resource), ["600", "600:root:web", "600:/srv/reports/status.html"]);
  const changed = { ...resource, output: "-rw-r----- 1 alice ops 42 Oct 8 /var/new/report.txt" };
  assert.deepEqual(facts(changed), ["640", "640:alice:ops", "640:/var/new/report.txt"]);
});

test("path candidates include every observed parent rather than selecting the causal answer", () => {
  const candidates = facts(initialEvidence("path-search", "resource"));
  for (const fact of ["755:/", "755:/srv", "755:/srv/private", "700:/srv/private/site", "644:/srv/private/site/index.html", "755-parent-644-file", "700-parent-644-file"]) assert.ok(candidates.includes(fact), fact);
  assert.ok(!candidates.includes("711"));
  assert.ok(!candidates.includes("directory-search"));
  assert.ok(!candidates.includes("parent-search-required"));
  assert.deepEqual(observationClaims({ ...initialEvidence("path-search", "resource"), phase: "after-repair" }), []);
  assert.deepEqual(facts({ ...initialEvidence("guided", "resource"), output: "-xwrxwrxwr root root /bad" }), []);
  assert.deepEqual(facts({ ...initialEvidence("guided", "resource"), output: "x".repeat(4001) }), []);
});

test("bindings require verified permission practice and retain only captured pre-repair facts", () => {
  let state = initialLabState();
  assert.deepEqual(permissionObservationClaims(state), []);
  for (const command of [scenarios.guided.commands.symptom, scenarios.guided.commands.identity, scenarios.guided.commands.resource]) state = execute(state, command).state;
  assert.deepEqual(permissionObservationClaims(state), []);
  state = recordHypothesis(state, "permission");
  state = execute(state, "chmod 644 /srv/site/index.html").state;
  state = execute(state, "curl localhost").state;
  const candidates = permissionObservationClaims(state);
  assert.ok(candidates.some(item => item.claim === "600" && item.evidenceId === "guided:before:resource"));
  assert.ok(!candidates.some(item => item.claim === "644"));
  state = execute(state, "ls -l /srv/site/index.html").state;
  assert.deepEqual(permissionObservationClaims(state), candidates);
  assert.deepEqual(permissionObservationClaims(execute(state, "reset").state), []);
  assert.deepEqual(permissionObservationClaims({ ...state, scenario: "differential-listener" }), []);
  assert.deepEqual(permissionObservationClaims({ ...state, preRepairEvidence: { identity: initialEvidence("transfer", "identity") } }), []);
});
