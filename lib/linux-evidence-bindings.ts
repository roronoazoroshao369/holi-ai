import type { EvidenceClaim, EvidenceRecord, LabState } from "./linux-simulator.ts";

// Facts come only from captured text, never from the answer rubric or repair state.
// This bounded parser is a copying aid for the SIMULATED permission fixtures.
export function observationClaims(record: EvidenceRecord): EvidenceClaim[] {
  if (record.phase !== "before-repair" || record.output.length > 4000) return [];
  const claims = new Set<string>();
  const http = /^HTTP\/1\.1 (\d{3})\b/.exec(record.output);
  if (http) claims.add(http[1]);
  const identity = /^uid=(\d+)\([^\n]+?\) gid=\d+\([^\n]+?\) groups=(.+)$/.exec(record.output);
  if (identity) {
    const groups = identity[2].split(",").map(group => /^\d+\(([^()]+)\)$/.exec(group.trim())?.[1]);
    if (groups.length && groups.every(Boolean)) claims.add(identity[1] + ":" + groups.join(","));
  }
  const paths: { mode: string; path: string; directory: boolean }[] = [];
  for (const line of record.output.split("\n")) {
    const match = /^([d-])([rwx-]{9})\s+(.*)$/.exec(line);
    if (!match) continue;
    const bits = match[2];
    // Reject nonsensical positional permission letters instead of guessing.
    if (!/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(bits)) continue;
    const mode = [0, 3, 6].map(offset =>
      (bits[offset] === "r" ? 4 : 0) + (bits[offset + 1] === "w" ? 2 : 0) + (bits[offset + 2] === "x" ? 1 : 0)).join("");
    const tokens = match[3].split(/\s+/);
    const path = tokens.at(-1)!;
    const ownerIndex = /^\d+$/.test(tokens[0]) ? 1 : 0;
    const owner = tokens[ownerIndex];
    const group = tokens[ownerIndex + 1];
    if (!path.startsWith("/") || !owner || !group) continue;
    claims.add(mode);
    claims.add(mode + ":" + owner + ":" + group);
    claims.add(mode + ":" + path);
    paths.push({ mode, path, directory: match[1] === "d" });
  }
  // Every observed parent/file pairing is available. The learner must choose
  // which parent matters; no blocked-directory or minimal-repair inference.
  for (const parent of paths.filter(item => item.directory)) {
    for (const file of paths.filter(item => !item.directory)) {
      if (file.path.startsWith(parent.path === "/" ? "/" : parent.path + "/")) {
        claims.add(parent.mode + "-parent-" + file.mode + "-file");
      }
    }
  }
  return [...claims].filter(claim => claim.length <= 100).map(claim => ({ evidenceId: record.id, claim }));
}

export function permissionObservationClaims(state: LabState): EvidenceClaim[] {
  if (!state.verified || !["guided", "transfer", "path-search"].includes(state.scenario)) return [];
  return Object.values(state.preRepairEvidence).flatMap(record =>
    record && record.scenario === state.scenario ? observationClaims(record) : []);
}
