export type Line = { kind: "output" | "success" | "error"; text: string };
export type ScenarioId = "guided" | "transfer";
export const scenarios = {
  guided: { path: "/srv/site/index.html", owner: "root", group: "root", worker: "www-data", identity: "uid=33(www-data) gid=33(www-data) groups=33(www-data)", targetMode: "644", explanation: "other-read" },
  transfer: { path: "/srv/reports/status.html", owner: "root", group: "web", worker: "report-worker", identity: "uid=1001(report-worker) gid=1001(report-worker) groups=1001(report-worker),2000(web)", targetMode: "640", explanation: "group-read" }
} as const;
export type LabState = {
  scenario: ScenarioId; mode: "600" | "644" | "640";
  observed: boolean; identityObserved: boolean; symptomObserved: boolean;
  hypothesis: string; repairedWithEvidence: boolean; verified: boolean; explained: boolean;
};
export function initialLabState(scenario: ScenarioId = "guided"): LabState {
  return { scenario, mode: "600", observed: false, identityObserved: false, symptomObserved: false,
    hypothesis: "", repairedWithEvidence: false, verified: false, explained: false };
}
export function recordHypothesis(state: LabState, hypothesis: string): LabState {
  if (state.mode !== "600" || !state.observed || !state.identityObserved || !state.symptomObserved) return state;
  if (!["permission", "network", "process"].includes(hypothesis)) return state;
  return { ...state, hypothesis };
}
export function explain(state: LabState, answer: string): LabState {
  return { ...state, explained: state.verified && answer === scenarios[state.scenario].explanation };
}
export function execute(state: LabState, command: string): { state: LabState; lines: Line[] } {
  const fixture = scenarios[state.scenario];
  const next = { ...state };
  const cmd = command.trim();
  let text: string;
  let kind: Line["kind"] = "output";
  if (cmd === "ls -l " + fixture.path) {
    next.observed = true;
    const permissions = { "600": "-rw-------", "644": "-rw-r--r--", "640": "-rw-r-----" };
    text = permissions[state.mode] + " 1 " + fixture.owner + " " + fixture.group + " 1842 Oct 5 " + fixture.path;
  } else if (cmd === "id " + fixture.worker) {
    next.identityObserved = true;
    text = fixture.identity;
  } else if (["chmod 644 " + fixture.path, "chmod 640 " + fixture.path].includes(cmd)) {
    if (state.mode === "600") next.repairedWithEvidence = state.observed && state.identityObserved && state.symptomObserved && state.hypothesis === "permission";
    next.mode = cmd.includes("644") ? "644" : "640";
    next.verified = false;
    next.explained = false;
    text = "Permissions updated. Verify HTTP; a healthy service alone does not prove a minimal repair.";
  } else {
    switch (cmd) {
      case "pwd": text = "/opt/holi-lab"; break;
      case "ls": text = "README.txt"; break;
      case "cat README.txt":
        text = "Symptom: HTTP 403 for " + fixture.path + ". Worker: " + fixture.worker + ". Collect HTTP, file and identity evidence, record a hypothesis, repair with the least read access needed, then verify. Directory traversal and all other configuration are healthy in this fixture."; break;
      case "curl localhost": {
        const healthy = state.mode === "644" || (state.scenario === "transfer" && state.mode === "640");
        if (!healthy) {
          if (state.mode === "600") next.symptomObserved = true;
          kind = "error"; text = "HTTP/1.1 403 Forbidden";
        } else {
          next.verified = state.repairedWithEvidence && state.mode === fixture.targetMode;
          kind = "success";
          text = "HTTP/1.1 200 OK\n" + (next.verified
            ? "Evidence and minimal repair verified. Now explain the access mechanism."
            : "Service healthy; assessment incomplete. Check minimal access and pre-repair evidence. Reset if you repaired blindly.");
        }
        break;
      }
      case "reset": return { state: initialLabState(state.scenario), lines: [{ kind: "output", text: "Fixture reset. All evidence and explanation cleared." }] };
      case "help": text = "Mission: cat README.txt. Inspect: ls -l " + fixture.path + ". Identity: id " + fixture.worker + ". HTTP: curl localhost. Repair syntax: chmod MODE PATH. Reset: reset."; break;
      default: kind = "error"; text = "Command unavailable in this SIMULATED environment. Type help.";
    }
  }
  return { state: next, lines: [{ kind, text }] };
}
