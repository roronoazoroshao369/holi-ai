const { test, expect } = require("@playwright/test");

const storageKey = "holi.devops.linux-practice";

function collectRuntimeErrors(page, sink) {
  page.on("pageerror", error => sink.push("pageerror: " + String(error)));
  page.on("console", message => {
    if (message.type() === "error") sink.push("console.error: " + message.text());
  });
}

async function runCommand(page, command) {
  const input = page.getByRole("textbox", { name: "Lab terminal command" });
  await input.fill(command);
  await input.press("Enter");
}

async function submitHypothesis(page, value) {
  const input = page.getByRole("textbox", { name: "Giả thuyết" });
  await input.fill(value);
  await page.getByRole("button", { name: "Ghi hypothesis" }).click();
  await expect(input).toBeDisabled();
}

async function fillPermissionTransfer(page, overrides = {}) {
  const values = {
    identityEvidenceId: "transfer:before:identity",
    identityFact: "1001:report-worker,web",
    resourceEvidenceId: "transfer:before:resource",
    resourceFact: "600:root:web",
    fixedMode: "640",
    hypotheticalIdentity: "1001:report-worker",
    predictedSymptom: "403",
    repairNeed: "required",
    causalClaim: "group-membership-required",
    ...overrides
  };
  await page.getByRole("combobox", { name: "Nguồn identity gốc", exact: true }).selectOption(values.identityEvidenceId);
  await page.getByRole("textbox", { name: "Fact identity gốc", exact: true }).fill(values.identityFact);
  await page.getByRole("combobox", { name: "Nguồn file gốc", exact: true }).selectOption(values.resourceEvidenceId);
  await page.getByRole("textbox", { name: "Fact file gốc", exact: true }).fill(values.resourceFact);
  await page.getByRole("textbox", { name: "Mode giữ cố định", exact: true }).fill(values.fixedMode);
  await page.getByRole("textbox", { name: "Identity giả định", exact: true }).fill(values.hypotheticalIdentity);
  await page.getByRole("textbox", { name: "Dự đoán HTTP permission", exact: true }).fill(values.predictedSymptom);
  await page.getByRole("textbox", { name: "Access repair còn cần", exact: true }).fill(values.repairNeed);
  await page.getByRole("textbox", { name: "Quan hệ permission", exact: true }).fill(values.causalClaim);
}

async function submitPermissionTransfer(page, overrides = {}) {
  await fillPermissionTransfer(page, overrides);
  await page.getByRole("button", { name: "Kiểm tra permission transfer" }).click();
}

async function fillPathTransfer(page, overrides = {}) {
  const values = {
    identityEvidenceId: "path-search:before:identity", identityFact: "33:www-data",
    pathEvidenceId: "path-search:before:resource", pathFact: "700:/srv/private/site",
    fileFact: "644:/srv/private/site/index.html", changedParent: "/srv/private/archive",
    changedParentMode: "700", predictedSymptom: "403", repairNeed: "directory-search",
    causalClaim: "parent-search-required", ...overrides
  };
  await page.getByRole("combobox", { name: "Nguồn identity path-search", exact: true }).selectOption(values.identityEvidenceId);
  await page.getByRole("textbox", { name: "Fact identity path-search", exact: true }).fill(values.identityFact);
  await page.getByRole("combobox", { name: "Nguồn path gốc", exact: true }).selectOption(values.pathEvidenceId);
  await page.getByRole("textbox", { name: "Fact parent gốc", exact: true }).fill(values.pathFact);
  await page.getByRole("textbox", { name: "Fact file readable", exact: true }).fill(values.fileFact);
  await page.getByRole("textbox", { name: "Parent mới", exact: true }).fill(values.changedParent);
  await page.getByRole("textbox", { name: "Mode parent mới", exact: true }).fill(values.changedParentMode);
  await page.getByRole("textbox", { name: "Dự đoán HTTP path-search", exact: true }).fill(values.predictedSymptom);
  await page.getByRole("textbox", { name: "Repair target path-search", exact: true }).fill(values.repairNeed);
  await page.getByRole("textbox", { name: "Quan hệ path-search", exact: true }).fill(values.causalClaim);
}
async function submitPathTransfer(page, overrides = {}) {
  await fillPathTransfer(page, overrides);
  await page.getByRole("button", { name: "Kiểm tra path-search transfer" }).click();
}

async function fillCausalTransfer(page, overrides = {}) {
  const values = {
    processEvidenceId: "differential-listener:before:identity",
    processFact: "present",
    socketEvidenceId: "differential-listener:before:resource",
    socketFact: "9090",
    predictedSymptom: "200",
    repairNeed: "none",
    causalClaim: "listener-target-match",
    ...overrides
  };
  await page.getByRole("combobox", { name: "Nguồn process gốc", exact: true }).selectOption(values.processEvidenceId);
  await page.getByRole("textbox", { name: "Fact process gốc", exact: true }).fill(values.processFact);
  await page.getByRole("combobox", { name: "Nguồn socket gốc", exact: true }).selectOption(values.socketEvidenceId);
  await page.getByRole("textbox", { name: "Fact socket gốc", exact: true }).fill(values.socketFact);
  await page.getByRole("textbox", { name: "Dự đoán symptom", exact: true }).fill(values.predictedSymptom);
  await page.getByRole("textbox", { name: "Repair còn cần", exact: true }).fill(values.repairNeed);
  await page.getByRole("textbox", { name: "Quan hệ nhân quả", exact: true }).fill(values.causalClaim);
}

async function submitCausalTransfer(page, overrides = {}) {
  await fillCausalTransfer(page, overrides);
  await page.getByRole("button", { name: "Kiểm tra dự đoán" }).click();
}

async function fillReasoning(page, mechanism) {
  const scenario = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state.scenario, storageKey);
  const file = scenario === "guided" || scenario === "transfer";
  const path = scenario === "path-search";
  const claims = {
    symptom: file || path ? "403" : "refused",
    identity: path ? "33:www-data" : file ? (scenario === "guided" ? "33:www-data" : "1001:report-worker,web") : (scenario === "differential-listener" ? "present" : "absent"),
    resource: path ? "700-parent-644-file" : file ? "600" : (scenario === "differential-listener" ? "9090" : "none")
  };
  for (const slot of ["symptom", "identity", "resource"]) {
    await page.getByRole("combobox", { name: "Nguồn " + slot, exact: true }).selectOption(scenario + ":before:" + slot);
    await page.getByRole("textbox", { name: "Nhận định " + slot, exact: true }).fill(claims[slot]);
  }
  await page.getByRole("combobox", { name: "Bằng chứng cơ chế 1", exact: true }).selectOption(scenario + ":before:resource");
  await page.getByRole("combobox", { name: "Bằng chứng cơ chế 2", exact: true }).selectOption(scenario + ":before:identity");
  await page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true }).fill(mechanism);
  await page.getByRole("textbox", { name: "Đích sửa tối thiểu", exact: true }).fill(path ? "711" : file ? (scenario === "guided" ? "644" : "640") : "8080");
}

async function explainWith(page, value) {
  await fillReasoning(page, value);
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
}

test("production flow differentiates same connection symptom using process and socket evidence", async ({ page }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);

  await page.goto("/");
  await expect(page.getByText(/Tiến trình thực hành được lưu trên trình duyệt này/)).toBeVisible();
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 8,
    fixtureVersion: 6,
    state: {
      scenario: "guided",
      differentialOrder: "listener-first",
      differentialStep: 0,
      incident: { kind: "file-access", mode: "600" },
      observations: { symptom: false, resource: false, identity: false },
      preRepairEvidence: {},
      reasoning: null,
      permissionTransfer: null,
      permissionTransferPassed: false,
      pathTransfer: null,
      pathTransferPassed: false,
      causalTransfer: null,
      causalTransferPassed: false,
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: false, transfer: false, pathSearch: false, differential: false }
  })), storageKey);
  await page.reload();

  const hypothesis = page.getByRole("textbox", { name: "Giả thuyết" });
  await expect(page.getByRole("textbox", { name: "Lab terminal command" })).toBeVisible();
  await expect(hypothesis).toBeDisabled();

  await runCommand(page, "chmod 644 /srv/site/index.html");
  await runCommand(page, "curl localhost");
  await expect(page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true })).toHaveCount(0);

  await runCommand(page, "reset");
  for (const command of ["curl localhost", "ls -l /srv/site/index.html", "id www-data"]) {
    await runCommand(page, command);
  }
  await submitHypothesis(page, "permission");
  await runCommand(page, "chmod 644 /srv/site/index.html");
  await runCommand(page, "curl localhost");
  await fillReasoning(page, "other-read");
  await page.getByRole("combobox", { name: "Nguồn resource", exact: true }).selectOption("guided:before:symptom");
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
  await expect(page.getByRole("button", { name: "Thử tình huống permission mới" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Nguồn resource", exact: true })).toHaveValue("guided:before:symptom");
  await expect(page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true })).toHaveValue("other-read");
  await expect(page.getByRole("region", { name: "Lập luận từ bằng chứng" })).toContainText("-rw-------");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const reasoningInput = page.getByRole("textbox", { name: "Nhận định identity", exact: true });
  await reasoningInput.focus();
  expect(await reasoningInput.evaluate(element => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  })).toBe(true);
  await page.getByRole("region", { name: "Lập luận từ bằng chứng" }).screenshot({ path: "test-results/reasoning-mobile.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("region", { name: "Lập luận từ bằng chứng" }).screenshot({ path: "test-results/reasoning-desktop.png" });
  await runCommand(page, "ls -l /srv/site/index.html");
  await expect(page.getByRole("region", { name: "Lập luận từ bằng chứng" })).toContainText("-rw-------");
  await runCommand(page, "reset");
  await expect(page.getByRole("region", { name: "Lập luận từ bằng chứng" })).toHaveCount(0);
  const resetState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state, storageKey);
  expect(resetState.preRepairEvidence).toEqual({});
  expect(resetState.reasoning).toBeNull();
  for (const command of ["curl localhost", "ls -l /srv/site/index.html", "id www-data"]) await runCommand(page, command);
  await submitHypothesis(page, "permission");
  await runCommand(page, "chmod 644 /srv/site/index.html");
  await runCommand(page, "curl localhost");
  await explainWith(page, "other-read");
  await page.getByRole("button", { name: "Thử tình huống permission mới" }).click();

  for (const command of ["curl localhost", "ls -l /srv/reports/status.html", "id report-worker"]) {
    await runCommand(page, command);
  }
  await submitHypothesis(page, "permission");
  await runCommand(page, "chmod 644 /srv/reports/status.html");
  await runCommand(page, "curl localhost");
  await expect(page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true })).toHaveCount(0);
  await runCommand(page, "chmod 640 /srv/reports/status.html");
  await runCommand(page, "curl localhost");
  await explainWith(page, "group-read");
  await expect(page.getByRole("region", { name: "Dự đoán permission counterfactual" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thử HTTP 403 do path-search" })).toHaveCount(0);
  await submitPermissionTransfer(page, { identityEvidenceId: "transfer:before:resource" });
  await expect(page.getByRole("button", { name: "Thử HTTP 403 do path-search" })).toHaveCount(0);
  await submitPermissionTransfer(page, { predictedSymptom: "200" });
  await expect(page.getByRole("button", { name: "Thử HTTP 403 do path-search" })).toHaveCount(0);
  await submitPermissionTransfer(page);
  await expect(page.getByRole("button", { name: "Thử HTTP 403 do path-search" })).toBeVisible();
  await page.getByRole("textbox", { name: "Dự đoán HTTP permission", exact: true }).fill("200");
  await expect(page.getByRole("button", { name: "Thử HTTP 403 do path-search" })).toHaveCount(0);
  await submitPermissionTransfer(page);
  await page.getByRole("button", { name: "Thử HTTP 403 do path-search" }).click();

  await expect(page.getByRole("heading", { name: "3. HTTP 403 do path-search" })).toBeVisible();
  for (const command of ["curl localhost/private", "namei -l /srv/private/site/index.html", "id www-data"]) await runCommand(page, command);
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("-rw-r--r--");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("drwx------");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("/srv/private");
  await submitHypothesis(page, "permission");
  await runCommand(page, "chmod 644 /srv/private/site/index.html");
  await runCommand(page, "curl localhost/private");
  await expect(page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true })).toHaveCount(0);
  await runCommand(page, "chmod 711 /srv/private/site");
  await runCommand(page, "curl localhost/private");
  await explainWith(page, "parent-search-required");
  await expect(page.getByRole("region", { name: "Dự đoán path-search transfer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thử differential diagnosis" })).toHaveCount(0);
  await submitPathTransfer(page, { repairNeed: "file-read" });
  await expect(page.getByRole("button", { name: "Thử differential diagnosis" })).toHaveCount(0);
  await submitPathTransfer(page);
  await expect(page.getByRole("button", { name: "Thử differential diagnosis" })).toBeVisible();
  await page.getByRole("textbox", { name: "Repair target path-search", exact: true }).fill("file-read");
  await expect(page.getByRole("button", { name: "Thử differential diagnosis" })).toHaveCount(0);
  await submitPathTransfer(page);
  await page.getByRole("button", { name: "Thử differential diagnosis" }).click();

  const differentialHeading = page.getByRole("heading", { name: "Health endpoint differential diagnosis" });
  await expect(differentialHeading).toBeVisible();

  await runCommand(page, "help");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).not.toContainText("Repair syntax");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).not.toContainText("configure api-server");

  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("842 app api-server");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("127.0.0.1:9090");

  await submitHypothesis(page, "process");
  await runCommand(page, "configure api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await expect(page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true })).toHaveCount(0);

  await runCommand(page, "reset");
  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await submitHypothesis(page, "network");
  await runCommand(page, "help");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("configure SERVICE --listen ADDRESS:PORT");
  await runCommand(page, "configure api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await explainWith(page, "process-started");
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await fillReasoning(page, "listener-port-match");
  await page.getByRole("textbox", { name: "Nhận định identity", exact: true }).fill("absent");
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await fillReasoning(page, "listener-port-match");
  await page.getByRole("combobox", { name: "Bằng chứng cơ chế 2", exact: true }).selectOption("differential-listener:before:resource");
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await explainWith(page, "listener-port-match");
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Dự đoán counterfactual" })).toBeVisible();

  await submitCausalTransfer(page, { processEvidenceId: "differential-listener:before:resource" });
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await submitCausalTransfer(page, { predictedSymptom: "refused" });
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await submitCausalTransfer(page);
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toBeVisible();

  await page.getByRole("textbox", { name: "Dự đoán symptom", exact: true }).fill("refused");
  await expect(page.getByRole("button", { name: "Thử case cùng symptom" })).toHaveCount(0);
  await submitCausalTransfer(page);
  await page.getByRole("button", { name: "Thử case cùng symptom" }).click();

  await expect(differentialHeading).toBeVisible();
  await runCommand(page, "help");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).not.toContainText("Repair syntax");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).not.toContainText("start api-server");

  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("no matching api-server process");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("No LISTEN socket owned by api-server");

  await submitHypothesis(page, "network");
  await runCommand(page, "start api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await expect(page.getByRole("textbox", { name: "Giải thích cơ chế", exact: true })).toHaveCount(0);

  await runCommand(page, "reset");
  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await submitHypothesis(page, "process");
  await runCommand(page, "help");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("start SERVICE --listen ADDRESS:PORT");
  await runCommand(page, "start api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await explainWith(page, "listener-port-match");
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toHaveCount(0);
  await explainWith(page, "process-started");
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toBeVisible();
  await expect(page.getByText(/Đã phục hồi checkpoint hợp lệ/)).toBeVisible();
  await page.evaluate(key => {
    const checkpoint = JSON.parse(localStorage.getItem(key));
    checkpoint.state.reasoning.resource.claim = "9090";
    localStorage.setItem(key, JSON.stringify(checkpoint));
  }, storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();
  await expect(page.getByText(/KHÔNG PHẢI MASTERY/)).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("production browser exercises the reversed process-first differential order", async ({ page }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");
  await expect(page.getByText(/Tiến trình thực hành được lưu trên trình duyệt này/)).toBeVisible();

  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 8,
    fixtureVersion: 6,
    state: {
      scenario: "differential-process",
      differentialOrder: "process-first",
      differentialStep: 0,
      incident: { kind: "tcp-service", processRunning: false, listenerPort: null },
      observations: { symptom: false, resource: false, identity: false },
      preRepairEvidence: {},
      reasoning: null,
      permissionTransfer: {
        identityEvidenceId: "transfer:before:identity",
        identityFact: "1001:report-worker,web",
        resourceEvidenceId: "transfer:before:resource",
        resourceFact: "600:root:web",
        fixedMode: "640",
        hypotheticalIdentity: "1001:report-worker",
        predictedSymptom: "403",
        repairNeed: "required",
        causalClaim: "group-membership-required"
      },
      permissionTransferPassed: true,
      pathTransfer: {
        identityEvidenceId: "path-search:before:identity", identityFact: "33:www-data",
        pathEvidenceId: "path-search:before:resource", pathFact: "700:/srv/private/site",
        fileFact: "644:/srv/private/site/index.html", changedParent: "/srv/private/archive",
        changedParentMode: "700", predictedSymptom: "403", repairNeed: "directory-search",
        causalClaim: "parent-search-required"
      },
      pathTransferPassed: true,
      causalTransfer: null,
      causalTransferPassed: false,
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, pathSearch: true, differential: false }
  })), storageKey);
  await page.reload();

  const differentialHeading = page.getByRole("heading", { name: "Health endpoint differential diagnosis" });
  await expect(differentialHeading).toBeVisible();
  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("no matching api-server process");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("No LISTEN socket owned by api-server");
  await submitHypothesis(page, "process");
  await runCommand(page, "start api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await explainWith(page, "process-started");
  await page.getByRole("button", { name: "Thử case cùng symptom" }).click();

  await expect(differentialHeading).toBeVisible();
  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("842 app api-server");
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("127.0.0.1:9090");
  await submitHypothesis(page, "network");
  await runCommand(page, "configure api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await explainWith(page, "listener-port-match");
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toHaveCount(0);
  await submitCausalTransfer(page, { causalClaim: "process-started" });
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toHaveCount(0);
  await submitCausalTransfer(page);
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("browser persistence and resilience fail closed with practice schema v8", async ({ page, browser }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");
  await expect(page.getByText(/Tiến trình thực hành được lưu trên trình duyệt này/)).toBeVisible();

  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 8,
    fixtureVersion: 6,
    state: {
      scenario: "differential-listener",
      differentialOrder: "listener-first",
      differentialStep: 0,
      incident: { kind: "tcp-service", processRunning: true, listenerPort: 9090 },
      observations: { symptom: false, resource: false, identity: false },
      preRepairEvidence: {},
      reasoning: null,
      permissionTransfer: {
        identityEvidenceId: "transfer:before:identity",
        identityFact: "1001:report-worker,web",
        resourceEvidenceId: "transfer:before:resource",
        resourceFact: "600:root:web",
        fixedMode: "640",
        hypotheticalIdentity: "1001:report-worker",
        predictedSymptom: "403",
        repairNeed: "required",
        causalClaim: "group-membership-required"
      },
      permissionTransferPassed: true,
      pathTransfer: {
        identityEvidenceId: "path-search:before:identity", identityFact: "33:www-data",
        pathEvidenceId: "path-search:before:resource", pathFact: "700:/srv/private/site",
        fileFact: "644:/srv/private/site/index.html", changedParent: "/srv/private/archive",
        changedParentMode: "700", predictedSymptom: "403", repairNeed: "directory-search",
        causalClaim: "parent-search-required"
      },
      pathTransferPassed: true,
      causalTransfer: null,
      causalTransferPassed: false,
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, pathSearch: true, differential: false }
  })), storageKey);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Health endpoint differential diagnosis" })).toBeVisible();
  await expect(page.getByText(/KHÔNG PHẢI MASTERY/)).toBeVisible();

  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await expect(page.getByRole("textbox", { name: "Giả thuyết" })).toBeEnabled();
  await runCommand(page, "reset");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Health endpoint differential diagnosis" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Giả thuyết" })).toBeDisabled();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state.differentialOrder, storageKey)).toBe("listener-first");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state.differentialStep, storageKey)).toBe(0);

  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 8,
    fixtureVersion: 6,
    state: {
      scenario: "differential-listener",
      differentialOrder: "process-first",
      differentialStep: 0,
      incident: { kind: "tcp-service", processRunning: true, listenerPort: 9090 },
      observations: { symptom: false, resource: false, identity: false },
      preRepairEvidence: {},
      reasoning: null,
      permissionTransfer: {
        identityEvidenceId: "transfer:before:identity",
        identityFact: "1001:report-worker,web",
        resourceEvidenceId: "transfer:before:resource",
        resourceFact: "600:root:web",
        fixedMode: "640",
        hypotheticalIdentity: "1001:report-worker",
        predictedSymptom: "403",
        repairNeed: "required",
        causalClaim: "group-membership-required"
      },
      permissionTransferPassed: true,
      pathTransfer: {
        identityEvidenceId: "path-search:before:identity", identityFact: "33:www-data",
        pathEvidenceId: "path-search:before:resource", pathFact: "700:/srv/private/site",
        fileFact: "644:/srv/private/site/index.html", changedParent: "/srv/private/archive",
        changedParentMode: "700", predictedSymptom: "403", repairNeed: "directory-search",
        causalClaim: "parent-search-required"
      },
      pathTransferPassed: true,
      causalTransfer: null,
      causalTransferPassed: false,
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, pathSearch: true, differential: false }
  })), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();

  await page.getByRole("button", { name: "Học lại từ đầu" }).click();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();

  await page.evaluate(key => localStorage.setItem(key, "{bad json"), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();

  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 7,
    fixtureVersion: 5,
    state: {},
    completed: {}
  })), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Giả thuyết" })).toBeDisabled();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const commandInput = page.getByRole("textbox", { name: "Lab terminal command" });
  await commandInput.focus();
  expect(await commandInput.evaluate(element => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  })).toBe(true);

  const blockedContext = await browser.newContext();
  await blockedContext.addInitScript(() => {
    for (const method of ["getItem", "setItem", "removeItem"]) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() { throw new DOMException("blocked", "SecurityError"); }
      });
    }
  });
  const blockedPage = await blockedContext.newPage();
  const blockedErrors = [];
  collectRuntimeErrors(blockedPage, blockedErrors);
  await blockedPage.goto("/");
  await expect(blockedPage.getByRole("button", { name: "Thử lưu lại" })).toBeVisible();
  await expect(blockedPage.getByText(/Không xác nhận được lưu bền vững/)).toBeVisible();
  await expect(blockedPage.getByText(/Hoàn tất năm tình huống luyện tập và ba transfer gates/)).toHaveCount(0);
  expect(blockedErrors).toEqual([]);
  await blockedContext.close();

  expect(runtimeErrors).toEqual([]);
});

