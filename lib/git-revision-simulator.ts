// Fixture-only model. No git, YAML, shell, network or host execution.
export const REVISION_SHAS = {
  built: "a4".repeat(20), intended: "b7".repeat(20),
  tagObject: "c8".repeat(20), tagCommit: "d9".repeat(20), branchNow: "e2".repeat(20)
} as const;
export const REVISION_SLOTS = ["symptom", "workflow", "refs", "build", "intent"] as const;
export type RevisionSlot = typeof REVISION_SLOTS[number];
export type RevisionEvidence = { id: string; slot: RevisionSlot; phase: "before-repair"; title: string; output: string };
export type RevisionHypothesis = "" | "revision-selection" | "cache-content" | "deployment-target";
export type RevisionRepair = "" | "pin-intended-sha" | "purge-cache" | "redirect-target" | "rebuild-only";
export type RevisionExplanation = {
  sources: Record<RevisionSlot, { id: string; fact: string }>;
  relation: string; repair: string;
};
export type RevisionTransfer = {
  tagSource: string; tagObject: string; targetCommit: string;
  branchSource: string; branchCommit: string;
  intentSource: string; selectedRevision: string; relation: string;
};
export type RevisionState = {
  evidence: Partial<Record<RevisionSlot, RevisionEvidence>>;
  hypothesis: RevisionHypothesis; repair: RevisionRepair;
  run: null | { pipeline: "passed"; checkoutSha: string; metadataSha: string };
  verification: null | { actualSha: string; intendedSha: string };
  verified: boolean;
  explanation: RevisionExplanation | null; explained: boolean;
  transfer: RevisionTransfer | null; transferPassed: boolean;
};
export const REVISION_PROMPT = {
  title: "Release acceptance incident",
  summary: "Release đã được tạo, nhưng acceptance chưa đạt. Thu thập các nguồn rồi phân biệt observation với inference trước khi thay đổi cấu hình.",
  symptom: "release pipeline: PASSED; release acceptance: NOT MET"
} as const;
const outputs: Record<RevisionSlot, [string, string]> = {
  symptom: ["Release check", "pipeline: PASSED; package tests: 28/28; acceptance: NOT MET; delivery target: staging; cache: disabled"],
  workflow: ["Checkout configuration", "release job: checkout.ref = refs/heads/release; build reads checked-out tree; release metadata records checkout SHA"],
  refs: ["Reference snapshot", `At build start:\nrefs/heads/main -> ${REVISION_SHAS.intended}\nrefs/heads/release -> ${REVISION_SHAS.built}`],
  build: ["Build metadata", `checkout HEAD = ${REVISION_SHAS.built}\nweb-bundle source_commit = ${REVISION_SHAS.built}\npipeline PASSED; tests 28/28`],
  intent: ["Release request", `Delivery target: staging\nApproved source revision: ${REVISION_SHAS.intended}\nThe approved snapshot is on refs/heads/main at build start.`]
};
export function revisionEvidence(slot: RevisionSlot): RevisionEvidence {
  return { id: `git-revision:before:${slot}`, slot, phase: "before-repair", title: outputs[slot][0], output: outputs[slot][1] };
}
export const REVISION_TRANSFER_SOURCES = {
  tag: { id: "git-revision:transfer:tag", output: `refs/tags/v2.4 -> object ${REVISION_SHAS.tagObject} (type tag)\nTag object ${REVISION_SHAS.tagObject}: object ${REVISION_SHAS.tagCommit}; type commit` },
  branch: { id: "git-revision:transfer:branch", output: `refs/heads/main now -> ${REVISION_SHAS.branchNow}` },
  intent: { id: "git-revision:transfer:intent", output: "Reproduce the source tree of release v2.4; select an immutable COMMIT revision for checkout. The main branch has advanced since this release." }
} as const;
export function emptyRevisionExplanation(): RevisionExplanation {
  return { sources: Object.fromEntries(REVISION_SLOTS.map(slot => [slot, { id: "", fact: "" }])) as RevisionExplanation["sources"], relation: "", repair: "" };
}
export function emptyRevisionTransfer(): RevisionTransfer {
  return { tagSource: "", tagObject: "", targetCommit: "", branchSource: "", branchCommit: "", intentSource: "", selectedRevision: "", relation: "" };
}
export function initialRevisionState(): RevisionState {
  return { evidence: {}, hypothesis: "", repair: "", run: null, verification: null, verified: false, explanation: null, explained: false, transfer: null, transferPassed: false };
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function keys(value: unknown, expected: string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).length === expected.length && expected.every(k => Object.hasOwn(value, k));
}
function texts(value: unknown, expected: string[]): boolean {
  return keys(value, expected) && expected.every(k => typeof value[k] === "string" && (value[k] as string).length <= 160);
}
function equalRecord(value: unknown, expected: Record<string, unknown>): boolean {
  return keys(value, Object.keys(expected)) && Object.keys(expected).every(k => value[k] === expected[k]);
}
const norm = (s: string) => s.trim().toLowerCase();
export function revisionEvidenceReady(state: RevisionState): boolean {
  return REVISION_SLOTS.every(slot => equalRecord(state.evidence[slot], revisionEvidence(slot)));
}
export function inspectRevision(state: RevisionState, slot: RevisionSlot): RevisionState {
  if (state.repair || !REVISION_SLOTS.includes(slot)) return state;
  return { ...state, evidence: { ...state.evidence, [slot]: revisionEvidence(slot) } };
}
export function lockRevision(state: RevisionState, hypothesis: string): RevisionState {
  if (state.hypothesis || state.repair || !revisionEvidenceReady(state) ||
      !["revision-selection", "cache-content", "deployment-target"].includes(hypothesis)) return state;
  return { ...state, hypothesis: hypothesis as RevisionHypothesis };
}
export function repairRevision(state: RevisionState, repair: string): RevisionState {
  if (!state.hypothesis || state.repair || !revisionEvidenceReady(state) ||
      !["pin-intended-sha", "purge-cache", "redirect-target", "rebuild-only"].includes(repair)) return state;
  return { ...state, repair: repair as RevisionRepair, run: null, verification: null, verified: false, explanation: null, explained: false, transfer: null, transferPassed: false };
}
export function rebuildRevision(state: RevisionState): RevisionState {
  if (!state.repair || !state.hypothesis || !revisionEvidenceReady(state)) return state;
  const sha = state.repair === "pin-intended-sha" ? REVISION_SHAS.intended : REVISION_SHAS.built;
  return { ...state, run: { pipeline: "passed", checkoutSha: sha, metadataSha: sha }, verification: null, verified: false, explanation: null, explained: false, transfer: null, transferPassed: false };
}
export function verifyRevision(state: RevisionState): RevisionState {
  if (!state.run || !state.repair || !revisionEvidenceReady(state)) return state;
  const match = state.run.checkoutSha === REVISION_SHAS.intended && state.run.metadataSha === REVISION_SHAS.intended;
  return { ...state, verification: { actualSha: state.run.metadataSha, intendedSha: REVISION_SHAS.intended },
    verified: match && state.hypothesis === "revision-selection" && state.repair === "pin-intended-sha",
    explanation: null, explained: false, transfer: null, transferPassed: false };
}
export function validRevisionExplanation(answer: unknown): answer is RevisionExplanation {
  if (!keys(answer, ["sources", "relation", "repair"]) || !keys(answer.sources, [...REVISION_SLOTS])) return false;
  return texts({ relation: answer.relation, repair: answer.repair }, ["relation", "repair"]) &&
    REVISION_SLOTS.every(slot => texts((answer.sources as Record<string, unknown>)[slot], ["id", "fact"]));
}
export function revisionExplanationMatches(state: RevisionState, answer: unknown): answer is RevisionExplanation {
  if (!validRevisionExplanation(answer) || !revisionEvidenceReady(state)) return false;
  const facts: Record<RevisionSlot, string> = {
    symptom: "passed:acceptance-not-met", workflow: "refs/heads/release",
    refs: `refs/heads/release=${REVISION_SHAS.built}`, build: REVISION_SHAS.built, intent: REVISION_SHAS.intended
  };
  return REVISION_SLOTS.every(slot => answer.sources[slot].id === state.evidence[slot]?.id && norm(answer.sources[slot].fact) === facts[slot]) &&
    norm(answer.relation) === "checkout-ref-resolves-build-commit" && norm(answer.repair) === "pin-intended-sha";
}
export function editRevisionExplanation(state: RevisionState, answer: RevisionExplanation): RevisionState {
  if (!state.verified || !validRevisionExplanation(answer)) return state;
  return { ...state, explanation: structuredClone(answer), explained: false, transfer: null, transferPassed: false };
}
export function explainRevision(state: RevisionState): RevisionState {
  if (!state.verified || !validRevisionExplanation(state.explanation)) return state;
  return { ...state, explained: revisionExplanationMatches(state, state.explanation), transfer: null, transferPassed: false };
}
export function validRevisionTransfer(answer: unknown): answer is RevisionTransfer {
  return texts(answer, Object.keys(emptyRevisionTransfer()));
}
export function revisionTransferMatches(answer: unknown): answer is RevisionTransfer {
  if (!validRevisionTransfer(answer)) return false;
  return answer.tagSource === REVISION_TRANSFER_SOURCES.tag.id && norm(answer.tagObject) === REVISION_SHAS.tagObject &&
    norm(answer.targetCommit) === REVISION_SHAS.tagCommit && answer.branchSource === REVISION_TRANSFER_SOURCES.branch.id &&
    norm(answer.branchCommit) === REVISION_SHAS.branchNow && answer.intentSource === REVISION_TRANSFER_SOURCES.intent.id &&
    norm(answer.selectedRevision) === REVISION_SHAS.tagCommit && norm(answer.relation) === "annotated-tag-peels-to-commit";
}
export function editRevisionTransfer(state: RevisionState, answer: RevisionTransfer): RevisionState {
  if (!state.explained || !revisionExplanationMatches(state, state.explanation) || !validRevisionTransfer(answer)) return state;
  return { ...state, transfer: structuredClone(answer), transferPassed: false };
}
export function checkRevisionTransfer(state: RevisionState): RevisionState {
  if (!state.verified || !state.explained || !revisionExplanationMatches(state, state.explanation)) return state;
  return { ...state, transferPassed: revisionTransferMatches(state.transfer) };
}
export function isValidRevisionState(value: unknown): value is RevisionState {
  if (!keys(value, Object.keys(initialRevisionState())) || !record(value.evidence) ||
      Object.keys(value.evidence).some(k => !REVISION_SLOTS.includes(k as RevisionSlot))) return false;
  if (!Object.keys(value.evidence).every(k => equalRecord((value.evidence as Record<string, unknown>)[k], revisionEvidence(k as RevisionSlot)))) return false;
  if (!["", "revision-selection", "cache-content", "deployment-target"].includes(value.hypothesis as string) ||
      !["", "pin-intended-sha", "purge-cache", "redirect-target", "rebuild-only"].includes(value.repair as string)) return false;
  if (!["verified", "explained", "transferPassed"].every(k => typeof value[k] === "boolean")) return false;
  const s = value as unknown as RevisionState;
  if (s.hypothesis && !revisionEvidenceReady(s) || s.repair && !s.hypothesis) return false;
  if (s.run !== null) {
    const sha = s.repair === "pin-intended-sha" ? REVISION_SHAS.intended : REVISION_SHAS.built;
    if (!s.repair || !equalRecord(s.run, { pipeline: "passed", checkoutSha: sha, metadataSha: sha })) return false;
  }
  if (s.verification !== null && (!s.run || !equalRecord(s.verification, { actualSha: s.run.metadataSha, intendedSha: REVISION_SHAS.intended }))) return false;
  const expectedVerified = Boolean(s.verification && s.run && s.run.checkoutSha === REVISION_SHAS.intended &&
    s.run.metadataSha === REVISION_SHAS.intended && s.hypothesis === "revision-selection" && s.repair === "pin-intended-sha" && revisionEvidenceReady(s));
  if (s.verified !== expectedVerified) return false;
  if (s.explanation !== null && (!s.verified || !validRevisionExplanation(s.explanation))) return false;
  // False is legal for an edited, not yet submitted, correct draft.
  if (s.explained && (!s.verified || !revisionExplanationMatches(s, s.explanation))) return false;
  if (s.transfer !== null && (!s.explained || !validRevisionTransfer(s.transfer))) return false;
  if (s.transferPassed && (!s.explained || !s.verified || !revisionTransferMatches(s.transfer))) return false;
  return true;
}
