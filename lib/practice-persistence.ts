import {
  DEFAULT_DIFFERENTIAL_ORDER,
  causalTransferAnswerMatches,
  causalTransferSatisfied,
  differentialScenario,
  evidenceReady,
  evidenceSlots,
  initialEvidence,
  reasoningMatches,
  sameEvidence,
  validReasoningShape,
  initialLabState,
  isDifferentialScenario,
  permissionTransferAnswerMatches,
  permissionTransferSatisfied,
  pathTransferAnswerMatches,
  pathTransferSatisfied,
  scenarios,
  targetReached,
  validCausalTransferShape,
  validPermissionTransferShape,
  validPathTransferShape,
  type DifferentialOrder,
  type LabState
} from "./linux-simulator.ts";

export const PRACTICE_STORAGE_KEY = "holi.devops.linux-practice";
export const PRACTICE_SCHEMA_VERSION = 8 as const;
export const LINUX_FIXTURE_VERSION = 6 as const;

type Completion = { guided: boolean; transfer: boolean; pathSearch: boolean; differential: boolean };
export type PracticeCheckpoint = {
  schemaVersion: typeof PRACTICE_SCHEMA_VERSION;
  fixtureVersion: typeof LINUX_FIXTURE_VERSION;
  state: LabState;
  completed: Completion;
};
export type PracticeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type LoadStatus = "empty" | "restored" | "discarded" | "unavailable";
export type PracticeLoadResult = { status: LoadStatus; state: LabState };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectedCompletion(state: LabState): Completion {
  const inDifferential = isDifferentialScenario(state.scenario);
  const permissionDone = permissionTransferSatisfied(state);
  const pathDone = pathTransferSatisfied(state);
  const beyondTransfer = state.scenario === "path-search" || inDifferential;
  return {
    guided: state.scenario !== "guided" || state.explained,
    transfer: beyondTransfer ? permissionDone : state.scenario === "transfer" && state.explained && permissionDone,
    pathSearch: inDifferential ? pathDone : state.scenario === "path-search" && state.explained && pathDone,
    differential: inDifferential && state.differentialStep === 1 && state.explained &&
      permissionDone && pathDone && causalTransferSatisfied(state)
  };
}

function validIncident(state: LabState): boolean {
  const fixture = scenarios[state.scenario];
  if (!isRecord(state.incident) || typeof state.incident.kind !== "string") return false;

  if (fixture.family === "file-access") {
    return state.incident.kind === "file-access" &&
      (state.incident.mode === "600" || state.incident.mode === "644" || state.incident.mode === "640");
  }
  if (fixture.family === "path-access") {
    return state.incident.kind === "path-access" &&
      state.incident.fileMode === "644" &&
      (state.incident.directoryMode === "700" || state.incident.directoryMode === "711");
  }

  if (state.incident.kind !== "tcp-service" || typeof state.incident.processRunning !== "boolean") return false;
  if (state.incident.listenerPort !== null && state.incident.listenerPort !== 8080 && state.incident.listenerPort !== 9090) return false;
  if (!state.incident.processRunning && state.incident.listenerPort !== null) return false;

  const initial = state.incident.processRunning === fixture.initialProcessRunning &&
    state.incident.listenerPort === fixture.initialPort;
  const target = state.incident.processRunning && state.incident.listenerPort === fixture.targetPort;
  return initial || target;
}

function incidentIsInitial(state: LabState): boolean {
  const fixture = scenarios[state.scenario];
  if (fixture.family === "file-access") {
    return state.incident.kind === "file-access" && state.incident.mode === "600";
  }
  if (fixture.family === "path-access") {
    return state.incident.kind === "path-access" && state.incident.directoryMode === "700" && state.incident.fileMode === "644";
  }
  return state.incident.kind === "tcp-service" &&
    state.incident.processRunning === fixture.initialProcessRunning &&
    state.incident.listenerPort === fixture.initialPort;
}

export function isValidLabState(value: unknown): value is LabState {
  if (!isRecord(value)) return false;
  if (value.scenario !== "guided" && value.scenario !== "transfer" && value.scenario !== "path-search" &&
      value.scenario !== "differential-listener" && value.scenario !== "differential-process") return false;
  if (value.differentialOrder !== "listener-first" && value.differentialOrder !== "process-first") return false;
  if (value.differentialStep !== 0 && value.differentialStep !== 1) return false;
  if (isDifferentialScenario(value.scenario)) {
    if (differentialScenario(value.differentialOrder, value.differentialStep) !== value.scenario) return false;
  } else if (value.differentialStep !== 0) {
    return false;
  }
  if (!isRecord(value.observations)) return false;
  for (const key of ["symptom", "resource", "identity"] as const) {
    if (typeof value.observations[key] !== "boolean") return false;
  }
  for (const key of ["repairedWithEvidence", "verified", "explained"] as const) {
    if (typeof value[key] !== "boolean") return false;
  }
  if (typeof value.hypothesis !== "string" || !["", "permission", "network", "process"].includes(value.hypothesis)) return false;
  if (value.permissionTransfer !== null && !validPermissionTransferShape(value.permissionTransfer)) return false;
  if (typeof value.permissionTransferPassed !== "boolean") return false;
  if (value.causalTransfer !== null && !validCausalTransferShape(value.causalTransfer)) return false;
  if (typeof value.causalTransferPassed !== "boolean") return false;
  if (value.pathTransfer !== null && !validPathTransferShape(value.pathTransfer)) return false;
  if (typeof value.pathTransferPassed !== "boolean") return false;

  if (!isRecord(value.preRepairEvidence)) return false;
  if (Object.keys(value.preRepairEvidence).some(key => !evidenceSlots.includes(key as typeof evidenceSlots[number]))) return false;
  for (const slot of evidenceSlots) {
    const record = value.preRepairEvidence[slot];
    if (record !== undefined && (!value.observations[slot] || !sameEvidence(record, initialEvidence(value.scenario, slot)))) return false;
  }
  if (value.reasoning !== null && !validReasoningShape(value.reasoning)) return false;
  const state = value as LabState;
  if (!validIncident(state)) return false;
  if (incidentIsInitial(state) && evidenceSlots.some(slot => state.observations[slot] !== Boolean(state.preRepairEvidence[slot]))) return false;

  const ready = evidenceReady(state);
  if (state.hypothesis && !ready) return false;
  if (state.repairedWithEvidence &&
      (!ready || incidentIsInitial(state) || state.hypothesis !== scenarios[state.scenario].correctHypothesis)) return false;
  if (state.verified && (!state.repairedWithEvidence || !targetReached(state))) return false;
  if (state.reasoning !== null && !state.verified) return false;
  if (state.explained && (!state.verified || !reasoningMatches(state, state.reasoning))) return false;

  if (state.permissionTransferPassed && !permissionTransferAnswerMatches(state.permissionTransfer)) return false;
  if (state.permissionTransfer !== null && !state.permissionTransferPassed &&
      (state.scenario !== "transfer" || !state.explained)) return false;
  if (state.permissionTransferPassed) {
    const currentPermission = state.scenario === "transfer" && state.explained;
    const carriedPermission = state.scenario === "path-search" || isDifferentialScenario(state.scenario);
    if (!currentPermission && !carriedPermission) return false;
  }
  if ((state.scenario === "path-search" || isDifferentialScenario(state.scenario)) && !permissionTransferSatisfied(state)) return false;

  if (state.pathTransferPassed && !pathTransferAnswerMatches(state.pathTransfer)) return false;
  if (state.pathTransfer !== null && !state.pathTransferPassed &&
      (state.scenario !== "path-search" || !state.explained)) return false;
  if (state.pathTransferPassed) {
    const currentPath = state.scenario === "path-search" && state.explained;
    const carriedPath = isDifferentialScenario(state.scenario);
    if (!currentPath && !carriedPath) return false;
  }
  if (isDifferentialScenario(state.scenario) && !pathTransferSatisfied(state)) return false;

  if (state.causalTransferPassed && !causalTransferAnswerMatches(state.causalTransfer)) return false;
  if (state.causalTransfer !== null && !state.causalTransferPassed &&
      (state.scenario !== "differential-listener" || !state.explained)) return false;
  if (state.causalTransferPassed) {
    const currentListener = state.scenario === "differential-listener" && state.explained;
    const listenerCompletedEarlier = state.scenario === "differential-process" &&
      state.differentialOrder === "listener-first" && state.differentialStep === 1;
    if (!currentListener && !listenerCompletedEarlier) return false;
  }
  if (state.scenario === "differential-process" &&
      state.differentialOrder === "listener-first" && state.differentialStep === 1 &&
      !state.causalTransferPassed) return false;
  return true;
}

export function checkpointFor(state: LabState): PracticeCheckpoint {
  return {
    schemaVersion: PRACTICE_SCHEMA_VERSION,
    fixtureVersion: LINUX_FIXTURE_VERSION,
    state: {
      ...state,
      incident: { ...state.incident },
      observations: { ...state.observations },
      preRepairEvidence: structuredClone(state.preRepairEvidence),
      reasoning: state.reasoning ? structuredClone(state.reasoning) : null,
      permissionTransfer: state.permissionTransfer ? structuredClone(state.permissionTransfer) : null,
      pathTransfer: state.pathTransfer ? structuredClone(state.pathTransfer) : null,
      causalTransfer: state.causalTransfer ? structuredClone(state.causalTransfer) : null
    },
    completed: expectedCompletion(state)
  };
}

export function parseCheckpoint(raw: string): PracticeCheckpoint | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== PRACTICE_SCHEMA_VERSION || value.fixtureVersion !== LINUX_FIXTURE_VERSION) return null;
  if (!isValidLabState(value.state) || !isRecord(value.completed)) return null;
  for (const key of ["guided", "transfer", "pathSearch", "differential"] as const) {
    if (typeof value.completed[key] !== "boolean") return null;
  }
  const expected = expectedCompletion(value.state);
  if (value.completed.guided !== expected.guided ||
      value.completed.transfer !== expected.transfer ||
      value.completed.pathSearch !== expected.pathSearch ||
      value.completed.differential !== expected.differential) return null;
  return value as PracticeCheckpoint;
}

export function loadPractice(
  storage: PracticeStorage,
  freshOrder: DifferentialOrder = DEFAULT_DIFFERENTIAL_ORDER
): PracticeLoadResult {
  let raw: string | null;
  try { raw = storage.getItem(PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialLabState("guided", freshOrder) }; }
  if (raw === null) return { status: "empty", state: initialLabState("guided", freshOrder) };

  const checkpoint = parseCheckpoint(raw);
  if (checkpoint) {
    return {
      status: "restored",
      state: {
        ...checkpoint.state,
        incident: { ...checkpoint.state.incident },
        observations: { ...checkpoint.state.observations },
        preRepairEvidence: structuredClone(checkpoint.state.preRepairEvidence),
        reasoning: checkpoint.state.reasoning ? structuredClone(checkpoint.state.reasoning) : null,
        permissionTransfer: checkpoint.state.permissionTransfer ? structuredClone(checkpoint.state.permissionTransfer) : null,
        pathTransfer: checkpoint.state.pathTransfer ? structuredClone(checkpoint.state.pathTransfer) : null,
        causalTransfer: checkpoint.state.causalTransfer ? structuredClone(checkpoint.state.causalTransfer) : null
      }
    };
  }

  try { storage.removeItem(PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialLabState("guided", freshOrder) }; }
  return { status: "discarded", state: initialLabState("guided", freshOrder) };
}

export function savePractice(storage: PracticeStorage, state: LabState): boolean {
  try {
    storage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(checkpointFor(state)));
    return true;
  } catch {
    return false;
  }
}

export function clearPractice(storage: PracticeStorage): boolean {
  try {
    storage.removeItem(PRACTICE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

