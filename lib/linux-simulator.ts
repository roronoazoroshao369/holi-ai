export type Line = { kind: "output" | "success" | "error"; text: string };
export type ScenarioId = "guided" | "transfer" | "path-search" | "differential-listener" | "differential-process";
export type DifferentialScenarioId = "differential-listener" | "differential-process";
export type DifferentialOrder = "listener-first" | "process-first";
export type DifferentialStep = 0 | 1;
export const DEFAULT_DIFFERENTIAL_ORDER: DifferentialOrder = "listener-first";

export function isDifferentialScenario(scenario: ScenarioId): scenario is DifferentialScenarioId {
  return scenario === "differential-listener" || scenario === "differential-process";
}

export function differentialScenario(order: DifferentialOrder, step: DifferentialStep): DifferentialScenarioId {
  if (order === "listener-first") return step === 0 ? "differential-listener" : "differential-process";
  return step === 0 ? "differential-process" : "differential-listener";
}

export type Hypothesis = "" | "permission" | "network" | "process";
export type FileMode = "600" | "644" | "640";
export type IncidentState =
  | { kind: "file-access"; mode: FileMode }
  | { kind: "path-access"; directoryMode: "700" | "711"; fileMode: "644" }
  | { kind: "tcp-service"; processRunning: boolean; listenerPort: 8080 | 9090 | null };
export type ObservationState = { symptom: boolean; resource: boolean; identity: boolean };

type ScenarioBase = {
  title: string;
  family: "file-access" | "path-access" | "tcp-service";
  summary: string;
  resourceLabel: string;
  identityLabel: string;
  correctHypothesis: Exclude<Hypothesis, "">;
  explanation: string;
  explanationPrompt: string;
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
type PathAccessScenario = ScenarioBase & {
  family: "path-access";
  path: string;
  parentPath: string;
  worker: string;
  identity: string;
  targetDirectoryMode: "711";
};
type TcpServiceScenario = ScenarioBase & {
  family: "tcp-service";
  service: string;
  healthEndpoint: string;
  initialProcessRunning: boolean;
  initialPort: 9090 | null;
  targetPort: 8080;
  repairAction: "configure-listener" | "start-service";
};
type ScenarioDefinition = FileScenario | PathAccessScenario | TcpServiceScenario;

const differentialTitle = "Health endpoint differential diagnosis";
const differentialSummary = "Client cannot connect to 127.0.0.1:8080. Diagnose from process and socket evidence before choosing a causal class.";
const differentialReadme = "Symptom: connection refused at http://127.0.0.1:8080/health. Collect client symptom, process state and listening-socket evidence before changing service state. The same symptom can have different causes, so infer the causal layer only from observations.";
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
    readme: "Symptom: HTTP 403 for /srv/reports/status.html. Worker: report-worker. This report is private to group web. Collect HTTP, file and identity evidence, record a hypothesis, repair with the least read access needed, then verify.",
    repairSyntax: "chmod MODE PATH",
    commands: {
      symptom: "curl localhost",
      resource: "ls -l /srv/reports/status.html",
      identity: "id report-worker",
      repair: "chmod 640 /srv/reports/status.html"
    }
  },
  "path-search": {
    title: "3. HTTP 403 do path-search",
    family: "path-access",
    summary: "File đã readable nhưng worker vẫn bị 403 vì một parent directory thiếu quyền search (x). Chẩn đoán theo path component, không chmod file theo quán tính.",
    resourceLabel: "path components",
    identityLabel: "danh tính worker",
    correctHypothesis: "permission",
    path: "/srv/private/site/index.html",
    parentPath: "/srv/private/site",
    worker: "www-data",
    identity: "uid=33(www-data) gid=33(www-data) groups=33(www-data)",
    targetDirectoryMode: "711",
    explanation: "parent-search-required",
    explanationPrompt: "Vì sao file mode 644 vẫn có thể trả 403, và repair tối thiểu nằm ở đâu?",
    readme: "Symptom: HTTP 403 for /private/index.html. Worker: www-data. The file itself is mode 644. Collect HTTP, effective identity and every path component with namei-style evidence before repair. A parent directory may block traversal even when the file is readable.",
    repairSyntax: "chmod MODE DIRECTORY",
    commands: {
      symptom: "curl localhost/private",
      resource: "namei -l /srv/private/site/index.html",
      identity: "id www-data",
      repair: "chmod 711 /srv/private/site"
    }
  },
  "differential-listener": {
    title: differentialTitle,
    family: "tcp-service",
    summary: differentialSummary,
    resourceLabel: "socket state",
    identityLabel: "process state",
    correctHypothesis: "network",
    service: "api-server",
    healthEndpoint: "http://127.0.0.1:8080/health",
    initialProcessRunning: true,
    initialPort: 9090,
    targetPort: 8080,
    repairAction: "configure-listener",
    explanation: "listener-port-match",
    explanationPrompt: "Cơ chế nào được evidence hỗ trợ sau khi endpoint hoạt động?",
    readme: differentialReadme,
    repairSyntax: "configure SERVICE --listen ADDRESS:PORT",
    commands: {
      symptom: "curl 127.0.0.1:8080/health",
      resource: "ss -ltnp",
      identity: "ps -o pid,user,comm -C api-server",
      repair: "configure api-server --listen 127.0.0.1:8080"
    }
  },
  "differential-process": {
    title: differentialTitle,
    family: "tcp-service",
    summary: differentialSummary,
    resourceLabel: "socket state",
    identityLabel: "process state",
    correctHypothesis: "process",
    service: "api-server",
    healthEndpoint: "http://127.0.0.1:8080/health",
    initialProcessRunning: false,
    initialPort: null,
    targetPort: 8080,
    repairAction: "start-service",
    explanation: "process-started",
    explanationPrompt: "Cơ chế nào được evidence hỗ trợ sau khi endpoint hoạt động?",
    readme: differentialReadme,
    repairSyntax: "start SERVICE --listen ADDRESS:PORT",
    commands: {
      symptom: "curl 127.0.0.1:8080/health",
      resource: "ss -ltnp",
      identity: "ps -o pid,user,comm -C api-server",
      repair: "start api-server --listen 127.0.0.1:8080"
    }
  }
} satisfies Record<ScenarioId, ScenarioDefinition>;

export type LabState = {
  scenario: ScenarioId;
  differentialOrder: DifferentialOrder;
  differentialStep: DifferentialStep;
  incident: IncidentState;
  observations: ObservationState;
  preRepairEvidence: Partial<Record<EvidenceSlot, EvidenceRecord>>;
  reasoning: ReasoningAnswer | null;
  permissionTransfer: PermissionTransferAnswer | null;
  permissionTransferPassed: boolean;
  causalTransfer: CausalTransferAnswer | null;
  causalTransferPassed: boolean;
  pathTransfer: PathTransferAnswer | null;
  pathTransferPassed: boolean;
  hypothesis: Hypothesis;
  repairedWithEvidence: boolean;
  verified: boolean;
  explained: boolean;
};

function initialIncident(scenario: ScenarioId): IncidentState {
  const fixture = scenarios[scenario];
  if (fixture.family === "file-access") return { kind: "file-access", mode: "600" };
  if (fixture.family === "path-access") return { kind: "path-access", directoryMode: "700", fileMode: "644" };
  return {
    kind: "tcp-service",
    processRunning: fixture.initialProcessRunning,
    listenerPort: fixture.initialPort
  };
}

export function initialLabState(
  scenario: ScenarioId = "guided",
  differentialOrder: DifferentialOrder = DEFAULT_DIFFERENTIAL_ORDER,
  differentialStep?: DifferentialStep,
  causalTransfer: CausalTransferAnswer | null = null,
  causalTransferPassed = false,
  permissionTransfer: PermissionTransferAnswer | null = null,
  permissionTransferPassed = false,
  pathTransfer: PathTransferAnswer | null = null,
  pathTransferPassed = false
): LabState {
  const resolvedStep: DifferentialStep = differentialStep ??
    (isDifferentialScenario(scenario) && differentialScenario(differentialOrder, 0) !== scenario ? 1 : 0);

  if (isDifferentialScenario(scenario) && differentialScenario(differentialOrder, resolvedStep) !== scenario) {
    throw new Error("Differential scenario does not match its explicit order/step assignment.");
  }
  if (!isDifferentialScenario(scenario) && resolvedStep !== 0) {
    throw new Error("Non-differential scenarios cannot use differential step 1.");
  }

  return {
    scenario,
    differentialOrder,
    differentialStep: resolvedStep,
    incident: initialIncident(scenario),
    observations: { symptom: false, resource: false, identity: false },
    preRepairEvidence: {},
    reasoning: null,
    permissionTransfer: permissionTransfer ? structuredClone(permissionTransfer) : null,
    permissionTransferPassed,
    causalTransfer: causalTransfer ? structuredClone(causalTransfer) : null,
    causalTransferPassed,
    pathTransfer: pathTransfer ? structuredClone(pathTransfer) : null,
    pathTransferPassed,
    hypothesis: "",
    repairedWithEvidence: false,
    verified: false,
    explained: false
  };
}

export function evidenceReady(state: LabState): boolean {
  return evidenceSlots.every(slot => state.observations[slot] &&
    sameEvidence(state.preRepairEvidence[slot], initialEvidence(state.scenario, slot)));
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

export function targetReached(state: LabState): boolean {
  const fixture = scenarios[state.scenario];
  if (fixture.family === "file-access") {
    return state.incident.kind === "file-access" && state.incident.mode === fixture.targetMode;
  }
  if (fixture.family === "path-access") {
    return state.incident.kind === "path-access" && state.incident.directoryMode === fixture.targetDirectoryMode && state.incident.fileMode === "644";
  }
  return state.incident.kind === "tcp-service" &&
    state.incident.processRunning &&
    state.incident.listenerPort === fixture.targetPort;
}

export function recordHypothesis(state: LabState, hypothesis: string): LabState {
  if (state.hypothesis || !incidentIsInitial(state) || !evidenceReady(state)) return state;
  if (!["permission", "network", "process"].includes(hypothesis)) return state;
  return { ...state, hypothesis: hypothesis as Hypothesis };
}

export const evidenceSlots = ["symptom", "identity", "resource"] as const;
export type EvidenceSlot = typeof evidenceSlots[number];
export type EvidenceRecord = {
  id: string;
  scenario: ScenarioId;
  slot: EvidenceSlot;
  phase: "before-repair";
  command: string;
  output: string;
};
export type EvidenceClaim = { evidenceId: string; claim: string };
export type ReasoningAnswer = {
  symptom: EvidenceClaim;
  identity: EvidenceClaim;
  resource: EvidenceClaim;
  mechanism: { evidenceIds: [string, string]; claim: string };
  target: string;
};

export function emptyReasoning(): ReasoningAnswer {
  return {
    symptom: { evidenceId: "", claim: "" },
    identity: { evidenceId: "", claim: "" },
    resource: { evidenceId: "", claim: "" },
    mechanism: { evidenceIds: ["", ""], claim: "" },
    target: ""
  };
}

export type CausalTransferAnswer = {
  processEvidenceId: string;
  processFact: string;
  socketEvidenceId: string;
  socketFact: string;
  predictedSymptom: string;
  repairNeed: string;
  causalClaim: string;
};

export function emptyCausalTransfer(): CausalTransferAnswer {
  return {
    processEvidenceId: "",
    processFact: "",
    socketEvidenceId: "",
    socketFact: "",
    predictedSymptom: "",
    repairNeed: "",
    causalClaim: ""
  };
}

export function validCausalTransferShape(value: unknown): value is CausalTransferAnswer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answer = value as Record<string, unknown>;
  const keys = ["processEvidenceId", "processFact", "socketEvidenceId", "socketFact", "predictedSymptom", "repairNeed", "causalClaim"];
  if (Object.keys(answer).length !== keys.length || !keys.every(key => Object.hasOwn(answer, key))) return false;
  return keys.every(key => typeof answer[key] === "string" && (answer[key] as string).length <= 100);
}

export function causalTransferAnswerMatches(answer: unknown): boolean {
  if (!validCausalTransferShape(answer)) return false;
  const normalized = (value: string) => value.trim().toLowerCase();
  return answer.processEvidenceId === "differential-listener:before:identity" &&
    normalized(answer.processFact) === "present" &&
    answer.socketEvidenceId === "differential-listener:before:resource" &&
    normalized(answer.socketFact) === "9090" &&
    normalized(answer.predictedSymptom) === "200" &&
    normalized(answer.repairNeed) === "none" &&
    normalized(answer.causalClaim) === "listener-target-match";
}

export function causalTransferSatisfied(state: LabState): boolean {
  return state.causalTransferPassed && causalTransferAnswerMatches(state.causalTransfer);
}

export function editCausalTransfer(state: LabState, answer: CausalTransferAnswer): LabState {
  if (state.scenario !== "differential-listener" || !state.explained || !validCausalTransferShape(answer)) return state;
  return { ...state, causalTransfer: structuredClone(answer), causalTransferPassed: false };
}

export function checkCausalTransfer(state: LabState, answer: CausalTransferAnswer): LabState {
  if (state.scenario !== "differential-listener" || !state.explained || !reasoningMatches(state, state.reasoning) ||
      !validCausalTransferShape(answer)) return state;
  return {
    ...state,
    causalTransfer: structuredClone(answer),
    causalTransferPassed: causalTransferAnswerMatches(answer)
  };
}

export type PermissionTransferAnswer = {
  identityEvidenceId: string;
  identityFact: string;
  resourceEvidenceId: string;
  resourceFact: string;
  fixedMode: string;
  hypotheticalIdentity: string;
  predictedSymptom: string;
  repairNeed: string;
  causalClaim: string;
};

export function emptyPermissionTransfer(): PermissionTransferAnswer {
  return {
    identityEvidenceId: "",
    identityFact: "",
    resourceEvidenceId: "",
    resourceFact: "",
    fixedMode: "",
    hypotheticalIdentity: "",
    predictedSymptom: "",
    repairNeed: "",
    causalClaim: ""
  };
}

export function validPermissionTransferShape(value: unknown): value is PermissionTransferAnswer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answer = value as Record<string, unknown>;
  const keys = [
    "identityEvidenceId", "identityFact", "resourceEvidenceId", "resourceFact", "fixedMode",
    "hypotheticalIdentity", "predictedSymptom", "repairNeed", "causalClaim"
  ];
  if (Object.keys(answer).length !== keys.length || !keys.every(key => Object.hasOwn(answer, key))) return false;
  return keys.every(key => typeof answer[key] === "string" && (answer[key] as string).length <= 100);
}

export function permissionTransferAnswerMatches(answer: unknown): boolean {
  if (!validPermissionTransferShape(answer)) return false;
  const normalized = (value: string) => value.trim().toLowerCase();
  return answer.identityEvidenceId === "transfer:before:identity" &&
    normalized(answer.identityFact) === "1001:report-worker,web" &&
    answer.resourceEvidenceId === "transfer:before:resource" &&
    normalized(answer.resourceFact) === "600:root:web" &&
    normalized(answer.fixedMode) === "640" &&
    normalized(answer.hypotheticalIdentity) === "1001:report-worker" &&
    normalized(answer.predictedSymptom) === "403" &&
    normalized(answer.repairNeed) === "required" &&
    normalized(answer.causalClaim) === "group-membership-required";
}

export function permissionTransferSatisfied(state: LabState): boolean {
  return state.permissionTransferPassed && permissionTransferAnswerMatches(state.permissionTransfer);
}

export function editPermissionTransfer(state: LabState, answer: PermissionTransferAnswer): LabState {
  if (state.scenario !== "transfer" || !state.explained || !validPermissionTransferShape(answer)) return state;
  return { ...state, permissionTransfer: structuredClone(answer), permissionTransferPassed: false };
}

export function checkPermissionTransfer(state: LabState, answer: PermissionTransferAnswer): LabState {
  if (state.scenario !== "transfer" || !state.explained || !reasoningMatches(state, state.reasoning) ||
      !validPermissionTransferShape(answer)) return state;
  return {
    ...state,
    permissionTransfer: structuredClone(answer),
    permissionTransferPassed: permissionTransferAnswerMatches(answer)
  };
}

export type PathTransferAnswer = {
  identityEvidenceId: string;
  identityFact: string;
  pathEvidenceId: string;
  pathFact: string;
  fileFact: string;
  changedParent: string;
  changedParentMode: string;
  predictedSymptom: string;
  repairNeed: string;
  causalClaim: string;
};

export function emptyPathTransfer(): PathTransferAnswer {
  return {
    identityEvidenceId: "",
    identityFact: "",
    pathEvidenceId: "",
    pathFact: "",
    fileFact: "",
    changedParent: "",
    changedParentMode: "",
    predictedSymptom: "",
    repairNeed: "",
    causalClaim: ""
  };
}

export function validPathTransferShape(value: unknown): value is PathTransferAnswer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answer = value as Record<string, unknown>;
  const keys = ["identityEvidenceId", "identityFact", "pathEvidenceId", "pathFact", "fileFact", "changedParent", "changedParentMode", "predictedSymptom", "repairNeed", "causalClaim"];
  if (Object.keys(answer).length !== keys.length || !keys.every(key => Object.hasOwn(answer, key))) return false;
  return keys.every(key => typeof answer[key] === "string" && (answer[key] as string).length <= 100);
}

export function pathTransferAnswerMatches(answer: unknown): boolean {
  if (!validPathTransferShape(answer)) return false;
  const normalized = (value: string) => value.trim().toLowerCase();
  return answer.identityEvidenceId === "path-search:before:identity" &&
    normalized(answer.identityFact) === "33:www-data" &&
    answer.pathEvidenceId === "path-search:before:resource" &&
    normalized(answer.pathFact) === "700:/srv/private/site" &&
    normalized(answer.fileFact) === "644:/srv/private/site/index.html" &&
    normalized(answer.changedParent) === "/srv/private/archive" &&
    normalized(answer.changedParentMode) === "700" &&
    normalized(answer.predictedSymptom) === "403" &&
    normalized(answer.repairNeed) === "directory-search" &&
    normalized(answer.causalClaim) === "parent-search-required";
}

export function pathTransferSatisfied(state: LabState): boolean {
  return state.pathTransferPassed && pathTransferAnswerMatches(state.pathTransfer);
}

export function editPathTransfer(state: LabState, answer: PathTransferAnswer): LabState {
  if (state.scenario !== "path-search" || !state.explained || !validPathTransferShape(answer)) return state;
  return { ...state, pathTransfer: structuredClone(answer), pathTransferPassed: false };
}

export function checkPathTransfer(state: LabState, answer: PathTransferAnswer): LabState {
  if (state.scenario !== "path-search" || !state.explained || !reasoningMatches(state, state.reasoning) ||
      !validPathTransferShape(answer)) return state;
  return { ...state, pathTransfer: structuredClone(answer), pathTransferPassed: pathTransferAnswerMatches(answer) };
}

// Canonical immutable fixture output, captured only by a diagnostic command before repair.
// An ID identifies a source, not a trusted learner or an anti-cheat credential.
export function initialEvidence(scenario: ScenarioId, slot: EvidenceSlot): EvidenceRecord {
  const fixture = scenarios[scenario];
  let output: string;
  if (fixture.family === "file-access") {
    output = slot === "symptom" ? "HTTP/1.1 403 Forbidden"
      : slot === "identity" ? fixture.identity
      : "-rw------- 1 " + fixture.owner + " " + fixture.group + " 1842 Oct 5 " + fixture.path;
  } else if (fixture.family === "path-access") {
    output = slot === "symptom" ? "HTTP/1.1 403 Forbidden"
      : slot === "identity" ? fixture.identity
      : "drwxr-xr-x root root /\ndrwxr-xr-x root root /srv\ndrwxr-xr-x root root /srv/private\ndrwx------ root root /srv/private/site\n-rw-r--r-- root root /srv/private/site/index.html";
  } else {
    output = slot === "symptom" ? "curl: (7) Failed to connect to 127.0.0.1 port 8080: Connection refused"
      : slot === "identity" ? (fixture.initialProcessRunning ? "842 app api-server" : "no matching api-server process")
      : fixture.initialPort === null ? "No LISTEN socket owned by api-server"
      : 'LISTEN 0 128 127.0.0.1:9090 0.0.0.0:* users:(("api-server",pid=842,fd=7))';
  }
  return { id: scenario + ":before:" + slot, scenario, slot, phase: "before-repair", command: fixture.commands[slot], output };
}

export function sameEvidence(value: unknown, expected: EvidenceRecord): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).length === Object.keys(expected).length &&
    (Object.keys(expected) as (keyof EvidenceRecord)[]).every(key => record[key] === expected[key]);
}

export function validReasoningShape(value: unknown): value is ReasoningAnswer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const exactKeys = (v: unknown, keys: string[]) => v !== null && typeof v === "object" && !Array.isArray(v) &&
    Object.keys(v).length === keys.length && keys.every(key => Object.hasOwn(v, key));
  if (!exactKeys(value, ["symptom", "identity", "resource", "mechanism", "target"])) return false;
  const answer = value as ReasoningAnswer;
  if (!evidenceSlots.every(slot => exactKeys(answer[slot], ["evidenceId", "claim"])) ||
      !exactKeys(answer.mechanism, ["evidenceIds", "claim"])) return false;
  const text = (v: unknown) => typeof v === "string" && v.length <= 100;
  return evidenceSlots.every(slot => answer[slot] && text(answer[slot].evidenceId) && text(answer[slot].claim)) &&
    Boolean(answer.mechanism && Array.isArray(answer.mechanism.evidenceIds) &&
      answer.mechanism.evidenceIds.length === 2 && answer.mechanism.evidenceIds.every(text) &&
      text(answer.mechanism.claim) && text(answer.target));
}

export function reasoningMatches(state: LabState, answer: unknown): boolean {
  if (!validReasoningShape(answer) || !evidenceReady(state)) return false;
  const fixture = scenarios[state.scenario];
  const claims = fixture.family === "file-access"
    ? { symptom: "403", identity: state.scenario === "guided" ? "33:www-data" : "1001:report-worker,web", resource: "600" }
    : fixture.family === "path-access"
      ? { symptom: "403", identity: "33:www-data", resource: "700-parent-644-file" }
      : { symptom: "refused", identity: fixture.initialProcessRunning ? "present" : "absent", resource: fixture.initialPort === null ? "none" : "9090" };
  const normalized = (s: string) => s.trim().toLowerCase();
  if (!evidenceSlots.every(slot => answer[slot].evidenceId === state.preRepairEvidence[slot]?.id &&
      normalized(answer[slot].claim) === claims[slot])) return false;
  const supportingIds = [state.preRepairEvidence.identity?.id, state.preRepairEvidence.resource?.id];
  return new Set(answer.mechanism.evidenceIds).size === 2 &&
    supportingIds.every(id => answer.mechanism.evidenceIds.includes(id!)) &&
    normalized(answer.mechanism.claim) === fixture.explanation &&
    normalized(answer.target) === (fixture.family === "file-access" ? fixture.targetMode : fixture.family === "path-access" ? fixture.targetDirectoryMode : String(fixture.targetPort));
}

export function editReasoning(state: LabState, answer: ReasoningAnswer): LabState {
  if (!state.verified || !validReasoningShape(answer)) return state;
  return {
    ...state,
    reasoning: structuredClone(answer),
    explained: false,
    ...(state.scenario === "transfer" ? { permissionTransfer: null, permissionTransferPassed: false } : {}),
    ...(state.scenario === "path-search" ? { pathTransfer: null, pathTransferPassed: false } : {}),
    ...(state.scenario === "differential-listener" ? { causalTransfer: null, causalTransferPassed: false } : {})
  };
}

export function explain(state: LabState, answer: ReasoningAnswer): LabState {
  if (!state.verified || !state.repairedWithEvidence || !targetReached(state) || !validReasoningShape(answer)) return state;
  const explained = reasoningMatches(state, answer);
  const revokePermissionTransfer = state.scenario === "transfer" && (!explained || !state.explained);
  const revokePathTransfer = state.scenario === "path-search" && (!explained || !state.explained);
  const revokeCausalTransfer = state.scenario === "differential-listener" && (!explained || !state.explained);
  return {
    ...state,
    reasoning: structuredClone(answer),
    explained,
    ...(revokePermissionTransfer ? { permissionTransfer: null, permissionTransferPassed: false } : {}),
    ...(revokePathTransfer ? { pathTransfer: null, pathTransferPassed: false } : {}),
    ...(revokeCausalTransfer ? { causalTransfer: null, causalTransferPassed: false } : {})
  };
}

function withObservation(state: LabState, key: EvidenceSlot): LabState {
  const snapshot = incidentIsInitial(state) && !state.preRepairEvidence[key]
    ? { ...state.preRepairEvidence, [key]: initialEvidence(state.scenario, key) }
    : state.preRepairEvidence;
  return { ...state, preRepairEvidence: snapshot, observations: { ...state.observations, [key]: true } };
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
        explained: false,
        reasoning: null,
        ...(state.scenario === "transfer" ? { permissionTransfer: null, permissionTransferPassed: false } : {})
      },
      lines: [{ kind: "output", text: "Permissions updated. Verify HTTP; a healthy service alone does not prove a minimal repair." }]
    };
  }
  if (command === fixture.commands.symptom) {
    const healthy = fileHealthy(state.scenario as "guided" | "transfer", state.incident.mode);
    if (!healthy) {
      return { state: withObservation(state, "symptom"), lines: [{ kind: "error", text: "HTTP/1.1 403 Forbidden" }] };
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

function executePathAccessScenario(state: LabState, command: string, fixture: PathAccessScenario): { state: LabState; lines: Line[] } | null {
  if (state.incident.kind !== "path-access") return null;
  if (command === fixture.commands.resource) {
    const next = withObservation(state, "resource");
    const directory = state.incident.directoryMode === "700" ? "drwx------" : "drwx--x--x";
    return { state: next, lines: [{ kind: "output", text: "drwxr-xr-x root root /\ndrwxr-xr-x root root /srv\ndrwxr-xr-x root root /srv/private\n" + directory + " root root " + fixture.parentPath + "\n-rw-r--r-- root root " + fixture.path }] };
  }
  if (command === fixture.commands.identity) {
    return { state: withObservation(state, "identity"), lines: [{ kind: "output", text: fixture.identity }] };
  }
  if (command === "chmod 644 " + fixture.path) {
    return { state: { ...state, verified: false, explained: false, reasoning: null, pathTransfer: null, pathTransferPassed: false },
      lines: [{ kind: "error", text: "File is already 644. HTTP remains blocked because parent-directory search permission is unchanged." }] };
  }
  if (command === fixture.commands.repair) {
    const repairedWithEvidence = incidentIsInitial(state)
      ? evidenceReady(state) && state.hypothesis === fixture.correctHypothesis
      : state.repairedWithEvidence;
    return {
      state: { ...state, incident: { kind: "path-access", directoryMode: "711", fileMode: "644" }, repairedWithEvidence,
        verified: false, explained: false, reasoning: null, pathTransfer: null, pathTransferPassed: false },
      lines: [{ kind: "output", text: "Parent directory search permission updated without changing file read/write bits. Verify HTTP." }]
    };
  }
  if (command === fixture.commands.symptom) {
    const healthy = state.incident.directoryMode === "711" && state.incident.fileMode === "644";
    if (!healthy) return { state: withObservation(state, "symptom"), lines: [{ kind: "error", text: "HTTP/1.1 403 Forbidden" }] };
    const verified = state.repairedWithEvidence && targetReached(state);
    return { state: { ...state, verified }, lines: [{ kind: "success", text: "HTTP/1.1 200 OK\n" + (verified
      ? "Evidence-backed path-search repair verified. Explain why readable file bits were insufficient."
      : "HTTP is healthy, but the evidence/least-privilege diagnosis gate is incomplete.") }] };
  }
  return null;
}

function executeTcpServiceScenario(state: LabState, command: string, fixture: TcpServiceScenario): { state: LabState; lines: Line[] } | null {
  if (state.incident.kind !== "tcp-service") return null;

  if (command === fixture.commands.identity) {
    const next = withObservation(state, "identity");
    return {
      state: next,
      lines: [{
        kind: "output",
        text: state.incident.processRunning ? "842 app api-server" : "no matching api-server process"
      }]
    };
  }
  if (command === fixture.commands.resource) {
    const next = withObservation(state, "resource");
    return {
      state: next,
      lines: [{
        kind: "output",
        text: state.incident.listenerPort === null
          ? "No LISTEN socket owned by api-server"
          : "LISTEN 0 128 127.0.0.1:" + state.incident.listenerPort + " 0.0.0.0:* users:((\"api-server\",pid=842,fd=7))"
      }]
    };
  }
  if (command === fixture.commands.repair) {
    const repairedWithEvidence = incidentIsInitial(state)
      ? evidenceReady(state) && state.hypothesis === fixture.correctHypothesis
      : state.repairedWithEvidence;
    return {
      state: {
        ...state,
        incident: { kind: "tcp-service", processRunning: true, listenerPort: fixture.targetPort },
        repairedWithEvidence,
        verified: false,
        explained: false,
        reasoning: null,
        ...(state.scenario === "differential-listener" ? { causalTransfer: null, causalTransferPassed: false } : {})
      },
      lines: [{
        kind: "output",
        text: fixture.repairAction === "start-service"
          ? "Service process started with the requested listener. Verify the exact health endpoint."
          : "Listener configuration updated. Verify the exact health endpoint."
      }]
    };
  }
  if (command === fixture.commands.symptom) {
    const healthy = state.incident.processRunning && state.incident.listenerPort === fixture.targetPort;
    if (!healthy) {
      return {
        state: withObservation(state, "symptom"),
        lines: [{ kind: "error", text: "curl: (7) Failed to connect to 127.0.0.1 port 8080: Connection refused" }]
      };
    }
    const verified = state.repairedWithEvidence && targetReached(state);
    return {
      state: { ...state, verified },
      lines: [{
        kind: "success",
        text: "HTTP/1.1 200 OK\n" + (verified
          ? "Evidence-backed repair verified. Now explain the mechanism."
          : "Endpoint healthy, but diagnosis is incomplete. Reset if service state changed before the correct hypothesis gate.")
      }]
    };
  }
  return null;
}

export function execute(state: LabState, command: string): { state: LabState; lines: Line[] } {
  const fixture = scenarios[state.scenario];
  const cmd = command.trim();

  if (cmd === "reset") {
    const preservePriorTransfer = state.scenario === "differential-process" &&
      state.differentialOrder === "listener-first" &&
      state.differentialStep === 1 &&
      causalTransferSatisfied(state);
    const preservePermissionTransfer = (state.scenario === "path-search" || isDifferentialScenario(state.scenario)) && permissionTransferSatisfied(state);
    const preservePathTransfer = isDifferentialScenario(state.scenario) && pathTransferSatisfied(state);
    return {
      state: initialLabState(
        state.scenario,
        state.differentialOrder,
        state.differentialStep,
        preservePriorTransfer ? state.causalTransfer : null,
        preservePriorTransfer,
        preservePermissionTransfer ? state.permissionTransfer : null,
        preservePermissionTransfer,
        preservePathTransfer ? state.pathTransfer : null,
        preservePathTransfer
      ),
      lines: [{
        kind: "output",
        text: preservePriorTransfer || preservePermissionTransfer
          ? "Fixture reset. Hidden differential assignment and previously passed transfer gates are preserved; current observations, hypothesis and explanation are cleared."
          : "Fixture reset. Hidden differential assignment is preserved; current observations, hypothesis, explanation and transfer drafts are cleared."
      }]
    };
  }
  if (cmd === "pwd") return { state, lines: [{ kind: "output", text: "/opt/holi-lab" }] };
  if (cmd === "ls") return { state, lines: [{ kind: "output", text: "README.txt" }] };
  if (cmd === "cat README.txt") return { state, lines: [{ kind: "output", text: fixture.readme }] };
  if (cmd === "help") {
    const repair = state.hypothesis ? " Repair syntax: " + fixture.repairSyntax + "." : " Record a hypothesis before repair.";
    const text = "Mission: cat README.txt. Symptom: " + fixture.commands.symptom + ". Resource: " + fixture.commands.resource +
      ". Identity/process: " + fixture.commands.identity + "." + repair + " Reset: reset.";
    return { state, lines: [{ kind: "output", text }] };
  }

  const result = fixture.family === "file-access"
    ? executeFileScenario(state, cmd, fixture)
    : fixture.family === "path-access"
      ? executePathAccessScenario(state, cmd, fixture)
      : executeTcpServiceScenario(state, cmd, fixture);
  if (result) return result;

  return { state, lines: [{ kind: "error", text: "Command unavailable in this SIMULATED environment. Type help." }] };
}

