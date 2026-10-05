export type Line = { kind: "output" | "success" | "error"; text: string };
export type LabState = { mode: "600" | "644"; observed: boolean; repairedWithEvidence: boolean; verified: boolean };
export function initialLabState(): LabState {
  return { mode: "600", observed: false, repairedWithEvidence: false, verified: false };
}
export function execute(state: LabState, command: string): { state: LabState; lines: Line[] } {
  const next = { ...state };
  let text: string;
  let kind: Line["kind"] = "output";
  switch (command.trim()) {
    case "pwd": text = "/opt/holi-lab"; break;
    case "ls": text = "README.txt"; break;
    case "cat README.txt":
      text = "Symptom: nginx returns 403 for /srv/site/index.html. Worker identity: www-data. Inspect permissions, repair minimally, then verify HTTP health."; break;
    case "ls -l /srv/site/index.html":
      next.observed = true;
      text = (state.mode === "600" ? "-rw-------" : "-rw-r--r--") + " 1 root root 1842 Oct 5 /srv/site/index.html"; break;
    case "chmod 644 /srv/site/index.html":
      if (state.mode === "600") next.repairedWithEvidence = state.observed;
      next.mode = "644";
      next.verified = false;
      text = "Permissions updated. Verify the HTTP response before concluding."; break;
    case "curl localhost":
      if (state.mode === "600") { kind = "error"; text = "HTTP/1.1 403 Forbidden"; }
      else {
        next.verified = state.repairedWithEvidence;
        kind = "success";
        text = "HTTP/1.1 200 OK\n" + (next.verified
          ? "Diagnostic practice passed: evidence collected before repair, HTTP verified. This is not a mastery assessment."
          : "Service healthy, but diagnostic practice is incomplete: reset and collect evidence before repairing.");
      }
      break;
    case "reset": return { state: initialLabState(), lines: [{ kind: "output", text: "Fixture reset. Service returns 403. No previous evidence retained." }] };
    case "help": text = "Read the mission with cat README.txt. Inspect: ls -l /srv/site/index.html. Check HTTP: curl localhost. Permission syntax: chmod MODE PATH. Use reset to restart."; break;
    default: kind = "error"; text = "Command unavailable in this SIMULATED environment. Type help.";
  }
  return { state: next, lines: [{ kind, text }] };
}
