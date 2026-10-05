export type CiEvidenceSlot = "workflow" | "producer" | "consumer";
export type CiHypothesis = "" | "artifact-contract" | "test-regression" | "runner-permission";
export type CiRepair = "" | "map-current-artifact-output" | "rename-built-files" | "chmod-workspace" | "rerun-only";
export type CiRunStatus = "not-run" | "failed" | "passed";

export type CiEvidenceRecord = {
  id: string;
  slot: CiEvidenceSlot;
  phase: "before-repair";
  title: string;
  output: string;
};

export type CiExplanation = {
  workflowEvidenceId: string;
  workflowFact: string;
  producerEvidenceId: string;
  producerFact: string;
  consumerEvidenceId: string;
  consumerFact: string;
  causalClaim: string;
  minimalRepair: string;
};

export type CiTransferAnswer = {
  producerEvidenceId: string;
  producerFact: string;
  consumerEvidenceId: string;
  consumerFact: string;
  predictedPath: string;
  causalClaim: string;
};

export type CiLabState = {
  evidenceSeen: Record<CiEvidenceSlot, boolean>;
  preRepairEvidence: Partial<Record<CiEvidenceSlot, CiEvidenceRecord>>;
  hypothesis: CiHypothesis;
  repair: CiRepair;
  evidenceBackedRepair: boolean;
  runStatus: CiRunStatus;
  verified: boolean;
  explanation: CiExplanation | null;
  explained: boolean;
  transfer: CiTransferAnswer | null;
  transferPassed: boolean;
};

export const CI_EVIDENCE_SLOTS: CiEvidenceSlot[] = ["workflow", "producer", "consumer"];

const evidence: Record<CiEvidenceSlot, CiEvidenceRecord> = {
  workflow: {
    id: "git-ci:before:workflow",
    slot: "workflow",
    phase: "before-repair",
    title: "Workflow definition",
    output: [
      "build.outputs.artifact_name <- steps.legacy_meta.outputs.artifact_name",
      "steps.meta writes artifact_name=web-dist",
      "upload-artifact name <- steps.meta.outputs.artifact_name",
      "verify downloads name <- needs.build.outputs.artifact_name"
    ].join("\n")
  },
  producer: {
    id: "git-ci:before:producer",
    slot: "producer",
    phase: "before-repair",
    title: "Producer job log",
    output: [
      "meta: artifact_name=web-dist",
      "upload-artifact: archived dist/site",
      "upload-artifact: artifact web-dist uploaded successfully"
    ].join("\n")
  },
  consumer: {
    id: "git-ci:before:consumer",
    slot: "consumer",
    phase: "before-repair",
    title: "Consumer job failure",
    output: [
      "download-artifact: requested name site-dist",
      "Error: Unable to find any artifacts for the associated workflow",
      "verify job stopped before content checks"
    ].join("\n")
  }
};

export const CI_TRANSFER_EVIDENCE = {
  producer: {
    id: "git-ci:transfer:producer",
    title: "Changed producer artifact",
    output: "artifact coverage-report contains reports/coverage.json"
  },
  consumer: {
    id: "git-ci:transfer:consumer",
    title: "Changed consumer check",
    output: "artifact coverage-report is extracted to workspace/report; consumer opens workspace/report/coverage.json"
  }
} as const;

export function initialCiLabState(): CiLabState {
  return {
    evidenceSeen: { workflow: false, producer: false, consumer: false },
    preRepairEvidence: {},
    hypothesis: "",
    repair: "",
    evidenceBackedRepair: false,
    runStatus: "not-run",
    verified: false,
    explanation: null,
    explained: false,
    transfer: null,
    transferPassed: false
  };
}

function sameEvidence(value: unknown, expected: CiEvidenceRecord): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(expected) as (keyof CiEvidenceRecord)[];
  return Object.keys(record).length === keys.length && keys.every(key => record[key] === expected[key]);
}

export function ciEvidenceReady(state: CiLabState): boolean {
  return CI_EVIDENCE_SLOTS.every(slot =>
    state.evidenceSeen[slot] && sameEvidence(state.preRepairEvidence[slot], evidence[slot])
  );
}

export function inspectCiEvidence(state: CiLabState, slot: CiEvidenceSlot): CiLabState {
  if (state.repair) return state;
  return {
    ...state,
    evidenceSeen: { ...state.evidenceSeen, [slot]: true },
    preRepairEvidence: { ...state.preRepairEvidence, [slot]: structuredClone(evidence[slot]) }
  };
}

export function ciEvidenceFor(slot: CiEvidenceSlot): CiEvidenceRecord {
  return structuredClone(evidence[slot]);
}

export function lockCiHypothesis(state: CiLabState, hypothesis: string): CiLabState {
  if (state.hypothesis || !ciEvidenceReady(state)) return state;
  if (!["artifact-contract", "test-regression", "runner-permission"].includes(hypothesis)) return state;
  return { ...state, hypothesis: hypothesis as CiHypothesis };
}

export function applyCiRepair(state: CiLabState, repair: string): CiLabState {
  if (!state.hypothesis || state.repair) return state;
  if (!["map-current-artifact-output", "rename-built-files", "chmod-workspace", "rerun-only"].includes(repair)) return state;
  const selected = repair as CiRepair;
  return {
    ...state,
    repair: selected,
    evidenceBackedRepair: ciEvidenceReady(state) &&
      state.hypothesis === "artifact-contract" &&
      selected === "map-current-artifact-output",
    runStatus: "not-run",
    verified: false,
    explanation: null,
    explained: false,
    transfer: null,
    transferPassed: false
  };
}

export function rerunCiPipeline(state: CiLabState): CiLabState {
  if (!state.repair) return state;
  const passed = state.repair === "map-current-artifact-output";
  return {
    ...state,
    runStatus: passed ? "passed" : "failed",
    verified: passed && state.evidenceBackedRepair,
    explanation: null,
    explained: false,
    transfer: null,
    transferPassed: false
  };
}

export function validCiExplanationShape(answer: unknown): answer is CiExplanation {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return false;
  const a = answer as Record<string, unknown>;
  const keys = ["workflowEvidenceId", "workflowFact", "producerEvidenceId", "producerFact", "consumerEvidenceId", "consumerFact", "causalClaim", "minimalRepair"];
  return Object.keys(a).length === keys.length &&
    keys.every(key => typeof a[key] === "string" && (a[key] as string).length <= 120);
}

export function explanationMatches(answer: unknown): answer is CiExplanation {
  if (!validCiExplanationShape(answer)) return false;
  const a = answer as unknown as Record<string, string>;
  const n = (value: unknown) => String(value).trim().toLowerCase();
  return a.workflowEvidenceId === "git-ci:before:workflow" &&
    n(a.workflowFact) === "stale job output mapping" &&
    a.producerEvidenceId === "git-ci:before:producer" &&
    n(a.producerFact) === "web-dist" &&
    a.consumerEvidenceId === "git-ci:before:consumer" &&
    n(a.consumerFact) === "site-dist" &&
    n(a.causalClaim) === "producer-consumer-artifact-contract" &&
    n(a.minimalRepair) === "map-current-artifact-output";
}

export function submitCiExplanation(state: CiLabState, answer: CiExplanation): CiLabState {
  if (!state.verified || !ciEvidenceReady(state)) return state;
  const explained = explanationMatches(answer);
  return {
    ...state,
    explanation: structuredClone(answer),
    explained,
    transfer: null,
    transferPassed: false
  };
}

export function validCiTransferShape(answer: unknown): answer is CiTransferAnswer {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return false;
  const a = answer as Record<string, unknown>;
  const keys = ["producerEvidenceId", "producerFact", "consumerEvidenceId", "consumerFact", "predictedPath", "causalClaim"];
  return Object.keys(a).length === keys.length &&
    keys.every(key => typeof a[key] === "string" && (a[key] as string).length <= 160);
}

export function transferMatches(answer: unknown): answer is CiTransferAnswer {
  if (!validCiTransferShape(answer)) return false;
  const a = answer as unknown as Record<string, string>;
  const n = (value: unknown) => String(value).trim().toLowerCase();
  return a.producerEvidenceId === "git-ci:transfer:producer" &&
    n(a.producerFact) === "reports/coverage.json" &&
    a.consumerEvidenceId === "git-ci:transfer:consumer" &&
    n(a.consumerFact) === "workspace/report/coverage.json" &&
    n(a.predictedPath) === "workspace/report/reports/coverage.json" &&
    n(a.causalClaim) === "artifact-extraction-preserves-relative-path";
}

export function submitCiTransfer(state: CiLabState, answer: CiTransferAnswer): CiLabState {
  if (!state.explained || !explanationMatches(state.explanation)) return state;
  return {
    ...state,
    transfer: structuredClone(answer),
    transferPassed: transferMatches(answer)
  };
}

export function resetCiLab(): CiLabState {
  return initialCiLabState();
}
