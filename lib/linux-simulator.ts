export type Line = { kind: "output" | "success" | "error"; text: string };
export type ScenarioId = "guided" | "transfer" | "listener";
export type Hypothesis = "" | "permission" | "network" | "process";
export type FileMode = "600" | "644" | "640";
export type IncidentState =
  | { kind: "file-access"; mode: FileMode }
  | { kind: "tcp-listener"; listenerPort: 8080 | 9090 };
export type ObservationState = { symptom: boolean; resource: boolean; identity: boolean };

type ExplanationOption = { value: string; label: string };
type ScenarioBase = {
  title: string;
  family: "file-access" | "tcp-listener";
  summary: string;
  resourceLabel: string;
  identityLabel: string;
  correctHypothesis: Exclude<Hypothesis, "">;
  explanation: string;
  explanationPrompt: string;
  explanationOptions: readonly ExplanationOption[];
  readme: string;
  repairSyntax: string;
  commands: {
    symptom: string;
    resource: string;
    identity: string;
    repair: string;
  };
};
type FileScenario = ScenarioBase & {
  family: "file-access";
  path: string;
  owner: string;
  group: string;
  worker: string;
  identity: string;
  targetMode: "644" | "640";
};
type ListenerScenario = ScenarioBase & {
  family: "tcp-listener";
  service: string;
  healthEndpoint: string;
  initialPort: 9090;
  targetPort: 8080;
};
type ScenarioDefinition = FileScenario | ListenerScenario;

export const scenarios = {
  guided: {
    title: "1. Chẩn đoán có hướng dẫn",
    family: "file-access",
    summary: "Trang này là nội dung công khai. Mục tiêu: cấp quyền đọc tối thiểu cho worker, không thêm quyền ghi/chạy.",
    resourceLabel: "quyền file",
    identityLabel: "danh tính worker",
    correctHypothesis: "permission",
    path: "/srv/site/index.html",
    owner: "root",
    group: "root",
    worker: "www-data",
    identity: "uid=33(www-data) gid=33(www-data) groups=33(www-data)",
    targetMode: "644",
    explanation: "other-read",
    explanationPrompt: "Vì sao worker đọc được file sau sửa?",
    explanationOptions: [
      { value: "owner-read", label: "UID worker trùng owner, nên dùng quyền owner" },
      { value: "group-read", label: "GID worker thuộc group file, nên dùng quyền group" },
      { value: "other-read", label: "UID và GID không khớp file, nên dùng quyền other" }
    ],
    readme: "Symptom: HTTP 403 for /srv/site/index.html. Worker: www-data. Collect HTTP, file and identity evidence, record a hypothesis, repair with the least read access needed, then verify. Directory traversal and all other configuration are healthy in this fixture.",
    repairSyntax: "chmod MODE PATH",
    commands: {
      symptom: "curl localhost",
      resource: "ls -l /srv/site/index.html",
      identity: "id www-data",
      repair: "chmod 644 /srv/site/index.html"
    }
  },
  transfer: {
    title: "2. Tình huống chuyển giao",
    family: "file-access",
    summary: "Báo cáo chỉ dành cho nhóm web; không mở quyền đọc cho other. Mục tiêu vẫn là quyền đọc tối thiểu.",
    resourceLabel: "quyền file",
    identityLabel: "danh tính worker",
    correctHypothesis: "permission",
    path: "/srv/reports/status.html",
    owner: "root",
    group: "web",
    worker: "report-worker",
    identity: "uid=1001(report-worker) gid=1001(report-worker) groups=1001(report-worker),2000(web)",
    targetMode: "640",
    explanation: "group-read",
    explanationPrompt: "Vì sao report-worker đọc được file với quyền tối thiểu?",
    explanationOptions: [
      { value: "owner-read", label: "UID worker trùng owner, nên dùng quyền owner" },
      { value: "group-read", label: "GID worker thuộc group file, nên dùng quyền group" },
      { value: "other-read", label: "Worker cần quyền other để đọc file" }
    ],
    readme: "Symptom: HTTP 403 for /srv/reports/status.html. Worker: report-worker. This report is private to group web. Collect HTTP, file and identity evidence, record a hypothesis, repair with the least read access needed, then verify.",
    repairSyntax: "chmod MODE PATH",
    commands: {
      symptom: "curl localhost",
      resource: "ls -l /srv/reports/status.html",
      identity: "id report-worker",
      repair: "chmod 640 /srv/reports/status.html"
    }
  },
  listener: {
    title: "3. Incident lạ: health endpoint không truy cập được",
    family: "tcp-listener",
    summary: "Health endpoint phải ở 127.0.0.1:8080 nhưng client đang bị từ chối kết nối. Hãy xác định causal layer từ evidence trước khi sửa.",
    resourceLabel: "socket listener",
    identityLabel: "trạng thái process",
    correctHypothesis: "network",
    service: "api-server",
    healthEndpoint: "http://127.0.0.1:8080/health",
    initialPort: 9090,
    targetPort: 8080,
    explanation: "listener-port-match",
    explanationPrompt: "Cơ chế nào giải thích vì sao health endpoint hoạt động sau sửa?",
    explanationOptions: [
      { value: "process-exists", label: "Chỉ cần process tồn tại thì mọi TCP port đều nhận kết nối" },
      { value: "listener-port-match", label: "Socket phải LISTEN đúng địa chỉ/port mà client đang gọi" },
      { value: "file-mode", label: "Quyền đọc file quyết định TCP port mà process lắng nghe" }
    ],
    readme: "Symptom: connection refused at http://127.0.0.1:8080/health. The service should answer on port 8080. Collect client symptom, process state and listening-socket evidence before changing configuration. Decide from those observations whether the causal layer is process state or network/listener state.",
    repairSyntax: "configure SERVICE --listen ADDRESS:PORT",
    commands: {
      symptom: "curl 127.0.0.1:8080/health",
      resource: "ss -ltnp",
      identity: "ps -o pid,user,comm -C api-server",
      repair: "configure api-server --listen 127.0.0.1:8080"
    }
  }
} satisfies Record<ScenarioId, ScenarioDefinition>;

export type LabState = {
  scenario: ScenarioId;
  incident: IncidentState;
  observations: ObservationState;
  hypothesis: Hypothesis;
  repairedWithEvidence: boolean;
  verified: boolean;
  explained: boolean;
};

function initialIncident(scenario: ScenarioId): IncidentState {
  const fixture = scenarios[scenario];
  return fixture.family === "file-access"
    ? { kind: "file-access", mode: "600" }
    : { kind: "tcp-listener", listenerPort: fixture.initialPort };
}

export function initialLabState(scenario: ScenarioId = "guided"): LabState {
  return {
    scenario,
    incident: initialIncident(scenario),
    observations: { symptom: false, resource: false, identity: false },
    hypothesis: "",
    repairedWithEvidence: false,
    verified: false,
    explained: false
  };
}

export function evidenceReady(state: LabState): boolean {
  return state.observations.symptom && state.observations.resource && state.observations.identity;
}

function incidentIsInitial(state: LabState): boolean {
  const fixture = scenarios[state.scenario];
  if (fixture.family === "file-access") return state.incident.kind === "file-access" && state.incident.mode === "600";
  return state.incident.kind === "tcp-listener" && state.incident.listenerPort === fixture.initialPort;
}

export function targetReached(state: LabState): boolean {
  const fixture = scenarios[state.scenario];
  if (fixture.family === "file-access") {
    return state.incident.kind === "file-access" && state.incident.mode === fixture.targetMode;
  }
  return state.incident.kind === "tcp-listener" && state.incident.listenerPort === fixture.targetPort;
}

export function recordHypothesis(state: LabState, hypothesis: string): LabState {
  if (!incidentIsInitial(state) || !evidenceReady(state)) return state;
  if (!["permission", "network", "process"].includes(hypothesis)) return state;
  return { ...state, hypothesis: hypothesis as Hypothesis };
}

export function explain(state: LabState, answer: string): LabState {
  return { ...state, explained: state.verified && answer === scenarios[state.scenario].explanation };
}

function withObservation(state: LabState, key: keyof ObservationState): LabState {
  return { ...state, observations: { ...state.observations, [key]: true } };
}

function fileHealthy(scenario: "guided" | "transfer", mode: FileMode): boolean {
  return scenario === "guided" ? mode === "644" : mode === "640" || mode === "644";
}

function executeFileScenario(state: LabState, command: string, fixture: FileScenario): { state: LabState; lines: Line[] } | null {
  if (state.incident.kind !== "file-access") return null;
  const permissions = { "600": "-rw-------", "644": "-rw-r--r--", "640": "-rw-r-----" } as const;

  if (command === fixture.commands.resource) {
    const next = withObservation(state, "resource");
    return { state: next, lines: [{ kind: "output", text: permissions[state.incident.mode] + " 1 " + fixture.owner + " " + fixture.group + " 1842 Oct 5 " + fixture.path }] };
  }
  if (command === fixture.commands.identity) {
    const next = withObservation(state, "identity");
    return { state: next, lines: [{ kind: "output", text: fixture.identity }] };
  }
  if (command === "chmod 644 " + fixture.path || command === "chmod 640 " + fixture.path) {
    const nextMode: FileMode = command.includes("chmod 644 ") ? "644" : "640";
    const repairedWithEvidence = incidentIsInitial(state)
      ? evidenceReady(state) && state.hypothesis === fixture.correctHypothesis
      : state.repairedWithEvidence;
    return {
      state: {
        ...state,
        incident: { kind: "file-access", mode: nextMode },
        repairedWithEvidence,
        verified: false,
        explained: false
      },
      lines: [{ kind: "output", text: "Permissions updated. Verify HTTP; a healthy service alone does not prove a minimal repair." }]
    };
  }
  if (command === fixture.commands.symptom) {
    const healthy = fileHealthy(state.scenario as "guided" | "transfer", state.incident.mode);
    if (!healthy) {
      const next = withObservation(state, "symptom");
      return { state: next, lines: [{ kind: "error", text: "HTTP/1.1 403 Forbidden" }] };
    }
    const verified = state.repairedWithEvidence && targetReached(state);
    return {
      state: { ...state, verified },
      lines: [{
        kind: "success",
        text: "HTTP/1.1 200 OK\n" + (verified
          ? "Evidence and minimal repair verified. Now explain the access mechanism."
          : "Service healthy; assessment incomplete. Check minimal access and pre-repair evidence. Reset if you repaired blindly.")
      }]
    };
  }
  return null;
}

function executeListenerScenario(state: LabState, command: string, fixture: ListenerScenario): { state: LabState; lines: Line[] } | null {
  if (state.incident.kind !== "tcp-listener") return null;

  if (command === fixture.commands.identity) {
    const next = withObservation(state, "identity");
    return { state: next, lines: [{ kind: "output", text: "842 app api-server" }] };
  }
  if (command === fixture.commands.resource) {
    const next = withObservation(state, "resource");
    const port = state.incident.listenerPort;
    return { state: next, lines: [{ kind: "output", text: "LISTEN 0 128 127.0.0.1:" + port + " 0.0.0.0:* users:((\"api-server\",pid=842,fd=7))" }] };
  }
  if (command === fixture.commands.repair) {
    const repairedWithEvidence = incidentIsInitial(state)
      ? evidenceReady(state) && state.hypothesis === fixture.correctHypothesis
      : state.repairedWithEvidence;
    return {
      state: {
        ...state,
        incident: { kind: "tcp-listener", listenerPort: fixture.targetPort },
        repairedWithEvidence,
        verified: false,
        explained: false
      },
      lines: [{ kind: "output", text: "Listener configuration updated. Verify the exact health endpoint before concluding the incident is fixed." }]
    };
  }
  if (command === fixture.commands.symptom) {
    if (state.incident.listenerPort !== fixture.targetPort) {
      const next = withObservation(state, "symptom");
      return { state: next, lines: [{ kind: "error", text: "curl: (7) Failed to connect to 127.0.0.1 port 8080: Connection refused" }] };
    }
    const verified = state.repairedWithEvidence && targetReached(state);
    return {
      state: { ...state, verified },
      lines: [{
        kind: "success",
        text: "HTTP/1.1 200 OK\n" + (verified
          ? "Client endpoint and listening socket now match. Explain the network mechanism."
          : "Endpoint healthy, but diagnosis evidence is incomplete. Reset if configuration changed before the hypothesis gate.")
      }]
    };
  }
  return null;
}

export function execute(state: LabState, command: string): { state: LabState; lines: Line[] } {
  const fixture = scenarios[state.scenario];
  const cmd = command.trim();

  if (cmd === "reset") {
    return { state: initialLabState(state.scenario), lines: [{ kind: "output", text: "Fixture reset. All observations, hypothesis and explanation cleared." }] };
  }
  if (cmd === "pwd") return { state, lines: [{ kind: "output", text: "/opt/holi-lab" }] };
  if (cmd === "ls") return { state, lines: [{ kind: "output", text: "README.txt" }] };
  if (cmd === "cat README.txt") return { state, lines: [{ kind: "output", text: fixture.readme }] };
  if (cmd === "help") {
    const text = "Mission: cat README.txt. Symptom: " + fixture.commands.symptom + ". Resource: " + fixture.commands.resource +
      ". Identity/process: " + fixture.commands.identity + ". Repair syntax: " + fixture.repairSyntax + ". Reset: reset.";
    return { state, lines: [{ kind: "output", text }] };
  }

  const result = fixture.family === "file-access"
    ? executeFileScenario(state, cmd, fixture)
    : executeListenerScenario(state, cmd, fixture);
  if (result) return result;

  return { state, lines: [{ kind: "error", text: "Command unavailable in this SIMULATED environment. Type help." }] };
}
