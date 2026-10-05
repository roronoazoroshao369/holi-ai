import { initialLabState, scenarios, targetReached, type LabState } from "./linux-simulator.ts";

export const PRACTICE_STORAGE_KEY = "holi.devops.linux-practice";
export const PRACTICE_SCHEMA_VERSION = 2 as const;
export const LINUX_FIXTURE_VERSION = 2 as const;

type Completion = { guided: boolean; transfer: boolean; listener: boolean };
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
  return {
    guided: state.scenario === "transfer" || state.scenario === "listener" || (state.scenario === "guided" && state.explained),
    transfer: state.scenario === "listener" || (state.scenario === "transfer" && state.explained),
    listener: state.scenario === "listener" && state.explained
  };
}

function validIncident(state: LabState): boolean {
  const fixture = scenarios[state.scenario];
  if (!isRecord(state.incident) || typeof state.incident.kind !== "string") return false;
  if (fixture.family === "file-access") {
    return state.incident.kind === "file-access" &&
      (state.incident.mode === "600" || state.incident.mode === "644" || state.incident.mode === "640");
  }
  return state.incident.kind === "tcp-listener" &&
    (state.incident.listenerPort === 8080 || state.incident.listenerPort === 9090);
}

export function isValidLabState(value: unknown): value is LabState {
  if (!isRecord(value)) return false;
  if (value.scenario !== "guided" && value.scenario !== "transfer" && value.scenario !== "listener") return false;
  if (!isRecord(value.observations)) return false;
  for (const key of ["symptom", "resource", "identity"] as const) {
    if (typeof value.observations[key] !== "boolean") return false;
  }
  for (const key of ["repairedWithEvidence", "verified", "explained"] as const) {
    if (typeof value[key] !== "boolean") return false;
  }
  if (typeof value.hypothesis !== "string" || !["", "permission", "network", "process"].includes(value.hypothesis)) return false;

  const state = value as LabState;
  if (!validIncident(state)) return false;

  const evidenceReady = state.observations.symptom && state.observations.resource && state.observations.identity;
  if (state.hypothesis && !evidenceReady) return false;
  if (state.repairedWithEvidence && (!evidenceReady || state.hypothesis !== scenarios[state.scenario].correctHypothesis)) return false;
  if (state.verified && (!state.repairedWithEvidence || !targetReached(state))) return false;
  if (state.explained && !state.verified) return false;
  return true;
}

export function checkpointFor(state: LabState): PracticeCheckpoint {
  return {
    schemaVersion: PRACTICE_SCHEMA_VERSION,
    fixtureVersion: LINUX_FIXTURE_VERSION,
    state: {
      ...state,
      incident: { ...state.incident },
      observations: { ...state.observations }
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
  for (const key of ["guided", "transfer", "listener"] as const) {
    if (typeof value.completed[key] !== "boolean") return null;
  }
  const expected = expectedCompletion(value.state);
  if (value.completed.guided !== expected.guided ||
      value.completed.transfer !== expected.transfer ||
      value.completed.listener !== expected.listener) return null;
  return value as PracticeCheckpoint;
}

export function loadPractice(storage: PracticeStorage): PracticeLoadResult {
  let raw: string | null;
  try { raw = storage.getItem(PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialLabState() }; }
  if (raw === null) return { status: "empty", state: initialLabState() };

  const checkpoint = parseCheckpoint(raw);
  if (checkpoint) {
    return {
      status: "restored",
      state: {
        ...checkpoint.state,
        incident: { ...checkpoint.state.incident },
        observations: { ...checkpoint.state.observations }
      }
    };
  }

  try { storage.removeItem(PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialLabState() }; }
  return { status: "discarded", state: initialLabState() };
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
