import {
  CI_EVIDENCE_SLOTS,
  ciEvidenceFor,
  ciEvidenceReady,
  explanationMatches,
  initialCiLabState,
  transferMatches,
  type CiLabState
} from "./ci-simulator.ts";

export const CI_PRACTICE_STORAGE_KEY = "holi.devops.git-ci-practice";
export const CI_PRACTICE_SCHEMA_VERSION = 1 as const;
export const CI_FIXTURE_VERSION = 1 as const;

export type CiStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type CiLoadStatus = "empty" | "restored" | "discarded" | "unavailable";
export type CiLoadResult = { status: CiLoadStatus; state: CiLabState };

type CiCheckpoint = {
  schemaVersion: typeof CI_PRACTICE_SCHEMA_VERSION;
  fixtureVersion: typeof CI_FIXTURE_VERSION;
  state: CiLabState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isValidCiLabState(value: unknown): value is CiLabState {
  if (!isRecord(value) || !isRecord(value.evidenceSeen) || !isRecord(value.preRepairEvidence)) return false;
  for (const slot of CI_EVIDENCE_SLOTS) {
    if (typeof value.evidenceSeen[slot] !== "boolean") return false;
    const record = value.preRepairEvidence[slot];
    if (value.evidenceSeen[slot]) {
      if (!sameJson(record, ciEvidenceFor(slot))) return false;
    } else if (record !== undefined) return false;
  }
  if (Object.keys(value.evidenceSeen).length !== 3) return false;
  if (Object.keys(value.preRepairEvidence).some(key => !CI_EVIDENCE_SLOTS.includes(key as typeof CI_EVIDENCE_SLOTS[number]))) return false;

  if (typeof value.hypothesis !== "string" || !["", "artifact-contract", "test-regression", "runner-permission"].includes(value.hypothesis)) return false;
  if (typeof value.repair !== "string" || !["", "map-current-artifact-output", "rename-built-files", "chmod-workspace", "rerun-only"].includes(value.repair)) return false;
  if (typeof value.evidenceBackedRepair !== "boolean" || typeof value.verified !== "boolean" ||
      typeof value.explained !== "boolean" || typeof value.transferPassed !== "boolean") return false;
  if (typeof value.runStatus !== "string" || !["not-run", "failed", "passed"].includes(value.runStatus)) return false;

  const state = value as unknown as CiLabState;
  const ready = ciEvidenceReady(state);
  if (state.hypothesis && !ready) return false;
  if (state.repair && !state.hypothesis) return false;

  const expectedEvidenceBacked = Boolean(state.repair) && ready &&
    state.hypothesis === "artifact-contract" && state.repair === "map-current-artifact-output";
  if (state.evidenceBackedRepair !== expectedEvidenceBacked) return false;

  if (!state.repair && state.runStatus !== "not-run") return false;
  if (state.runStatus === "passed" && state.repair !== "map-current-artifact-output") return false;
  if (state.runStatus === "failed" && (!state.repair || state.repair === "map-current-artifact-output")) return false;
  if (state.verified !== (state.runStatus === "passed" && state.evidenceBackedRepair)) return false;

  if (state.explanation !== null && !isRecord(state.explanation)) return false;
  if (state.explained !== (state.explanation !== null && explanationMatches(state.explanation))) return false;
  if (state.explained && !state.verified) return false;
  if (state.transfer !== null && !isRecord(state.transfer)) return false;
  if (state.transfer !== null && !state.explained) return false;
  if (state.transferPassed !== (state.transfer !== null && transferMatches(state.transfer))) return false;
  return true;
}

export function ciCheckpointFor(state: CiLabState): CiCheckpoint {
  return {
    schemaVersion: CI_PRACTICE_SCHEMA_VERSION,
    fixtureVersion: CI_FIXTURE_VERSION,
    state: structuredClone(state)
  };
}

export function parseCiCheckpoint(raw: string): CiCheckpoint | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!isRecord(value) || value.schemaVersion !== CI_PRACTICE_SCHEMA_VERSION || value.fixtureVersion !== CI_FIXTURE_VERSION) return null;
  if (!isValidCiLabState(value.state)) return null;
  return value as unknown as CiCheckpoint;
}

export function loadCiPractice(storage: CiStorage): CiLoadResult {
  let raw: string | null;
  try { raw = storage.getItem(CI_PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialCiLabState() }; }
  if (raw === null) return { status: "empty", state: initialCiLabState() };

  const parsed = parseCiCheckpoint(raw);
  if (parsed) return { status: "restored", state: structuredClone(parsed.state) };

  try { storage.removeItem(CI_PRACTICE_STORAGE_KEY); }
  catch { return { status: "unavailable", state: initialCiLabState() }; }
  return { status: "discarded", state: initialCiLabState() };
}

export function saveCiPractice(storage: CiStorage, state: CiLabState): boolean {
  try {
    storage.setItem(CI_PRACTICE_STORAGE_KEY, JSON.stringify(ciCheckpointFor(state)));
    return true;
  } catch {
    return false;
  }
}

export function clearCiPractice(storage: CiStorage): boolean {
  try {
    storage.removeItem(CI_PRACTICE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
