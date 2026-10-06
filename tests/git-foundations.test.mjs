import test from "node:test";
import assert from "node:assert/strict";
import {
  GIT_FOUNDATIONS_FIXTURE,
  GIT_FOUNDATIONS_GRAPH,
  checkGitFoundationsReadiness,
  emptyGitFoundationsAnswers,
  teachingAncestor
} from "../lib/git-foundations.ts";
import { GRAPH_SHAS } from "../lib/git-graph-simulator.ts";

test("teaching fixture is disjoint from graph assessment fixture", () => {
  const teaching = new Set(Object.values(GIT_FOUNDATIONS_FIXTURE.commits));
  const assessment = new Set(Object.values(GRAPH_SHAS));
  for (const sha of teaching) assert.equal(assessment.has(sha), false);
});

test("teaching graph distinguishes a direct parent from a multi-edge ancestor", () => {
  const C = GIT_FOUNDATIONS_FIXTURE.commits;
  const later = GIT_FOUNDATIONS_GRAPH.find(node => node.sha === C.later);
  assert.deepEqual(later?.parents, [C.merge]);
  assert.equal(later?.parents.includes(C.base), false);
  assert.equal(teachingAncestor(GIT_FOUNDATIONS_GRAPH, C.base, C.later), true);
  assert.equal(teachingAncestor(GIT_FOUNDATIONS_GRAPH, C.root, C.later), true);
  assert.equal(teachingAncestor(GIT_FOUNDATIONS_GRAPH, C.feature, C.base), false);
});

test("readiness requires all four mental-model distinctions", () => {
  const correct = {
    snapshot: "commit",
    ref: "moves",
    directParent: "one-edge",
    ancestry: "multi-edge"
  };
  assert.equal(checkGitFoundationsReadiness(correct).passed, true);

  for (const [field, wrong] of [
    ["snapshot", "branch"],
    ["ref", "immutable"],
    ["directParent", "any-ancestor"],
    ["ancestry", "same-as-parent"]
  ]) {
    const answer = { ...correct, [field]: wrong };
    assert.equal(checkGitFoundationsReadiness(answer).passed, false);
    assert.equal(checkGitFoundationsReadiness(answer)[field], false);
  }
});

test("empty readiness is fail-closed", () => {
  const result = checkGitFoundationsReadiness(emptyGitFoundationsAnswers());
  assert.deepEqual(result, {
    snapshot: false,
    ref: false,
    directParent: false,
    ancestry: false,
    passed: false
  });
});
