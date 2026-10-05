import { initialLabState, scenarios, type LabState } from "./linux-simulator.ts";

export const PRACTICE_STORAGE_KEY = "holi.devops.linux-practice";
export const PRACTICE_SCHEMA_VERSION = 1 as const;
export const LINUX_FIXTURE_VERSION = 1 as const;

type Completion = { guided: boolean; transfer: boolean };
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
    guided: state.scenario === "transfer" || (state.scenario === "guided" && state.explained),
    transfer: state.scenario === "transfer" && state.explained
  };
}

export function isValidLabState(value: unknown): value is LabState {
  if (!isRecord(value)) return false;
  if (value.scenario !== "guided" && value.scenario !== "transfer") return false;
  if (value.mode !== "600" && value.mode !== "644" && value.mode !== "640") return false;
  for (const key of ["observed", "identityObserved", "symptomObserved", "repairedWithEvidence", "verified", "explained"] as const) {
    if (typeof value[key] !== "boolean") return false;
  }
  if (typeof value.hypothesis !== "string" || !["", "permission", "network", "process"].includes(value.hypothesis)) return false;

  const state = value as LabState;
  const evidenceReady = state.observed && state.identityObserved && state.symptomObserved;
  if (state.hypothesis && !evidenceReady) return false;
  if (state.mode === "600" && (state.repairedWithEvidence || state.verified || state.explained)) return false;
  if (state.repairedWithEvidence && (!evidenceReady || state.hypothesis !== "permission")) return false;
  if (state.verified && (!state.repairedWithEvidence || state.mode !== scenarios[state.scenario].targetMode)) return false;
  if (state.explained && !state.verified) return false;
  return true;
}

export function checkpointFor(state: LabState): PracticeCheckpoint {
  return {
    schemaVersion: PRACTICE_SCHEMA_VERSION,
    fixtureVersion: LINUX_FIXTURE_VERSION,
    state: { ...state },
    completed: expectedCompletion(state)
  };
}

export function parseCheckpoint(raw: string): PracticeCheckpoint | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== PRACTICE_SCHEMA_VERSION || value.fixtureVersion !== LINUX_FIXTURE_VERSION) return null;
  if (!isValidLabState(value.state) || !isRecord(value.completed)) return null;
  if (typeof value.completed.guided !== "boolean" || typeof value.completed.transfer !== "boolean") return null;
  const expected = expectedCompletion(value.state);
  if (value.completed.guided !== expected.guided || value.completed.transfer !== expected.transfer) return null;
  return value as PracticeCheckpoint;
}

export function loadPractice(storage: PracticeStorage): PracticeLoadResult {
  let raw: string | null;
  try { raw = storage.getItem(PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialLabState() }; }
  if (raw === null) return { status: "empty", state: initialLabState() };

  const checkpoint = parseCheckpoint(raw);
  if (checkpoint) return { status: "restored", state: { ...checkpoint.state } };

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
