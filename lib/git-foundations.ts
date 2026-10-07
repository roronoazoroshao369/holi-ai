// Teaching-only fixture and self-check model. This state is deliberately separate from assessment persistence.
export const GIT_FOUNDATIONS_FIXTURE = {
  commits: {
    root: "c0ffee12abcd",
    base: "bada55e5cafe",
    feature: "f00dbabe1234",
    merge: "abc123def456",
    later: "deed5678beef"
  },
  refBefore: "bada55e5cafe",
  refAfter: "abc123def456"
} as const;

export type FoundationNode = { sha: string; parents: readonly string[] };

export const GIT_FOUNDATIONS_GRAPH: readonly FoundationNode[] = [
  { sha: GIT_FOUNDATIONS_FIXTURE.commits.root, parents: [] },
  { sha: GIT_FOUNDATIONS_FIXTURE.commits.base, parents: [GIT_FOUNDATIONS_FIXTURE.commits.root] },
  { sha: GIT_FOUNDATIONS_FIXTURE.commits.feature, parents: [GIT_FOUNDATIONS_FIXTURE.commits.root] },
  {
    sha: GIT_FOUNDATIONS_FIXTURE.commits.merge,
    parents: [GIT_FOUNDATIONS_FIXTURE.commits.base, GIT_FOUNDATIONS_FIXTURE.commits.feature]
  },
  { sha: GIT_FOUNDATIONS_FIXTURE.commits.later, parents: [GIT_FOUNDATIONS_FIXTURE.commits.merge] }
];

export type GitFoundationsAnswers = {
  snapshot: "" | "commit" | "branch";
  ref: "" | "moves" | "immutable";
  directParent: "" | "one-edge" | "any-ancestor";
  ancestry: "" | "multi-edge" | "same-as-parent";
};

export type GitFoundationsReadiness = {
  snapshot: boolean;
  ref: boolean;
  directParent: boolean;
  ancestry: boolean;
  passed: boolean;
};

export function emptyGitFoundationsAnswers(): GitFoundationsAnswers {
  return { snapshot: "", ref: "", directParent: "", ancestry: "" };
}

export function teachingAncestor(
  graph: readonly FoundationNode[],
  ancestor: string,
  descendant: string
): boolean {
  const nodes = new Map(graph.map(node => [node.sha, node]));
  if (!nodes.has(ancestor) || !nodes.has(descendant)) return false;
  const pending = [descendant];
  const seen = new Set<string>();
  while (pending.length) {
    const current = pending.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    if (current === ancestor) return true;
    pending.push(...(nodes.get(current)?.parents ?? []));
  }
  return false;
}

export function checkGitFoundationsReadiness(
  answers: GitFoundationsAnswers
): GitFoundationsReadiness {
  const result = {
    snapshot: answers.snapshot === "commit",
    ref: answers.ref === "moves",
    directParent: answers.directParent === "one-edge",
    ancestry: answers.ancestry === "multi-edge"
  };
  return { ...result, passed: Object.values(result).every(Boolean) };
}


// Teaching-only evidence synthesis bridge. Deliberately disjoint from both the foundations fixture
// and the scored Git graph assessment fixture. Component-local answers must never grant assessment credit.
export const GIT_EVIDENCE_BRIDGE_FIXTURE = {
  commits: {
    root: "e11dence0001",
    base: "e11dence0002",
    topic: "e11dence0003",
    integration: "e11dence0004",
    later: "e11dence0005"
  },
  refName: "release/candidate"
} as const;

const B = GIT_EVIDENCE_BRIDGE_FIXTURE.commits;

export const GIT_EVIDENCE_BRIDGE_GRAPH: readonly FoundationNode[] = [
  { sha: B.root, parents: [] },
  { sha: B.base, parents: [B.root] },
  { sha: B.topic, parents: [B.root] },
  { sha: B.integration, parents: [B.base, B.topic] },
  { sha: B.later, parents: [B.integration] }
];

const bridgeGraphText = GIT_EVIDENCE_BRIDGE_GRAPH
  .map(node => `${node.sha} parents=[${node.parents.join(",")}]`)
  .join("\n");

export const GIT_EVIDENCE_BRIDGE_SOURCES = {
  ref: {
    id: "git-teaching-bridge:ref",
    title: "Ref snapshot",
    output: `${GIT_EVIDENCE_BRIDGE_FIXTURE.refName} -> ${B.integration}\napproved/base -> ${B.base}`
  },
  checkout: {
    id: "git-teaching-bridge:checkout",
    title: "Checkout + build metadata",
    output: `checkout HEAD: ${B.integration}\nbundle source_commit: ${B.integration}\njob result: passed`
  },
  graph: {
    id: "git-teaching-bridge:graph",
    title: "Commit graph records",
    output: bridgeGraphText
  }
} as const;

export type GitEvidenceBridgeAnswers = {
  consumedCommit: "" | "integration" | "base" | "later";
  orderedParents: "" | "base-topic" | "topic-base" | "root-base";
  rootAncestry: "" | "yes" | "no";
};

export type GitEvidenceBridgeResult = {
  consumedCommit: boolean;
  orderedParents: boolean;
  rootAncestry: boolean;
  passed: boolean;
};

export function emptyGitEvidenceBridgeAnswers(): GitEvidenceBridgeAnswers {
  return { consumedCommit: "", orderedParents: "", rootAncestry: "" };
}

export function checkGitEvidenceBridge(
  answers: GitEvidenceBridgeAnswers
): GitEvidenceBridgeResult {
  const result = {
    consumedCommit: answers.consumedCommit === "integration",
    orderedParents: answers.orderedParents === "base-topic",
    rootAncestry: answers.rootAncestry === "yes"
  };
  return { ...result, passed: Object.values(result).every(Boolean) };
}
