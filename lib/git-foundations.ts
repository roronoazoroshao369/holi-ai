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
