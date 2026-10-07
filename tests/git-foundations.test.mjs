import test from "node:test";
import assert from "node:assert/strict";
import {
  GIT_EVIDENCE_BRIDGE_FIXTURE,
  GIT_EVIDENCE_BRIDGE_GRAPH,
  GIT_EVIDENCE_BRIDGE_SOURCES,
  GIT_FOUNDATIONS_FIXTURE,
  GIT_FOUNDATIONS_GRAPH,
  checkGitEvidenceBridge,
  checkGitFoundationsReadiness,
  emptyGitEvidenceBridgeAnswers,
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


test("evidence bridge fixture is disjoint from foundations and assessment fixtures", () => {
  const bridge = new Set(Object.values(GIT_EVIDENCE_BRIDGE_FIXTURE.commits));
  const foundations = new Set(Object.values(GIT_FOUNDATIONS_FIXTURE.commits));
  const assessment = new Set(Object.values(GRAPH_SHAS));
  for (const sha of bridge) {
    assert.equal(foundations.has(sha), false);
    assert.equal(assessment.has(sha), false);
    assert.match(sha, /^[0-9a-f]+$/);
  }
});

test("evidence bridge exposes raw sources needed for consumed commit, ordered parents and ancestry", () => {
  const B = GIT_EVIDENCE_BRIDGE_FIXTURE.commits;
  assert.match(GIT_EVIDENCE_BRIDGE_SOURCES.ref.output, new RegExp(B.integration));
  assert.match(GIT_EVIDENCE_BRIDGE_SOURCES.checkout.output, new RegExp(`checkout HEAD: ${B.integration}`));
  assert.match(GIT_EVIDENCE_BRIDGE_SOURCES.checkout.output, new RegExp(`bundle source_commit: ${B.integration}`));
  const integration = GIT_EVIDENCE_BRIDGE_GRAPH.find(node => node.sha === B.integration);
  assert.deepEqual(integration?.parents, [B.base, B.topic]);
  assert.equal(teachingAncestor(GIT_EVIDENCE_BRIDGE_GRAPH, B.root, B.integration), true);
  assert.equal(integration?.parents.includes(B.root), false);
});

test("evidence bridge checks each diagnostic predicate independently and fails closed", () => {
  const correct = {
    consumedCommit: "integration",
    orderedParents: "base-topic",
    rootAncestry: "yes"
  };
  assert.deepEqual(checkGitEvidenceBridge(correct), {
    consumedCommit: true,
    orderedParents: true,
    rootAncestry: true,
    passed: true
  });

  for (const [field, wrong] of [
    ["consumedCommit", "base"],
    ["orderedParents", "topic-base"],
    ["rootAncestry", "no"]
  ]) {
    const answer = { ...correct, [field]: wrong };
    const result = checkGitEvidenceBridge(answer);
    assert.equal(result[field], false);
    assert.equal(result.passed, false);
  }

  assert.deepEqual(checkGitEvidenceBridge(emptyGitEvidenceBridgeAnswers()), {
    consumedCommit: false,
    orderedParents: false,
    rootAncestry: false,
    passed: false
  });
});
