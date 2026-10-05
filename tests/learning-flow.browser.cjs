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

async function explainWith(page, value) {
  const explanation = page.getByRole("combobox", { name: "Giải thích cơ chế" });
  await explanation.selectOption(value);
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
}

test("production flow differentiates same connection symptom using process and socket evidence", async ({ page }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);

  await page.goto("/");
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 4,
    fixtureVersion: 4,
    state: {
      scenario: "guided",
      differentialOrder: "listener-first",
      differentialStep: 0,
      incident: { kind: "file-access", mode: "600" },
      observations: { symptom: false, resource: false, identity: false },
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: false, transfer: false, differential: false }
  })), storageKey);
  await page.reload();

  const hypothesis = page.getByRole("textbox", { name: "Giả thuyết" });
  await expect(page.getByRole("textbox", { name: "Lab terminal command" })).toBeVisible();
  await expect(hypothesis).toBeDisabled();

  await runCommand(page, "chmod 644 /srv/site/index.html");
  await runCommand(page, "curl localhost");
  await expect(page.getByRole("combobox", { name: "Giải thích cơ chế" })).toHaveCount(0);

  await runCommand(page, "reset");
  for (const command of ["curl localhost", "ls -l /srv/site/index.html", "id www-data"]) {
    await runCommand(page, command);
  }
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
  await expect(page.getByRole("combobox", { name: "Giải thích cơ chế" })).toHaveCount(0);
  await runCommand(page, "chmod 640 /srv/reports/status.html");
  await runCommand(page, "curl localhost");
  await explainWith(page, "group-read");
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
  await expect(page.getByRole("combobox", { name: "Giải thích cơ chế" })).toHaveCount(0);

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
  await explainWith(page, "listener-port-match");
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
  await expect(page.getByRole("combobox", { name: "Giải thích cơ chế" })).toHaveCount(0);

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
  await expect(page.getByText(/Hoàn tất bốn tình huống luyện tập/)).toHaveCount(0);
  await explainWith(page, "process-started");
  await expect(page.getByText(/Hoàn tất bốn tình huống luyện tập/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Hoàn tất bốn tình huống luyện tập/)).toBeVisible();
  await expect(page.getByText(/Đã phục hồi checkpoint hợp lệ/)).toBeVisible();
  await expect(page.getByText(/KHÔNG PHẢI MASTERY/)).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("production browser exercises the reversed process-first differential order", async ({ page }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");

  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 4,
    fixtureVersion: 4,
    state: {
      scenario: "differential-process",
      differentialOrder: "process-first",
      differentialStep: 0,
      incident: { kind: "tcp-service", processRunning: false, listenerPort: null },
      observations: { symptom: false, resource: false, identity: false },
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, differential: false }
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
  await expect(page.getByText(/Hoàn tất bốn tình huống luyện tập/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Hoàn tất bốn tình huống luyện tập/)).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("browser persistence and resilience fail closed with differential schema v4", async ({ page, browser }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");
  await expect(page.getByText(/Tiến trình thực hành được lưu trên trình duyệt này/)).toBeVisible();

  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 4,
    fixtureVersion: 4,
    state: {
      scenario: "differential-listener",
      differentialOrder: "listener-first",
      differentialStep: 0,
      incident: { kind: "tcp-service", processRunning: true, listenerPort: 9090 },
      observations: { symptom: false, resource: false, identity: false },
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, differential: false }
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
    schemaVersion: 4,
    fixtureVersion: 4,
    state: {
      scenario: "differential-listener",
      differentialOrder: "process-first",
      differentialStep: 0,
      incident: { kind: "tcp-service", processRunning: true, listenerPort: 9090 },
      observations: { symptom: false, resource: false, identity: false },
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, differential: false }
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
    schemaVersion: 3,
    fixtureVersion: 3,
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
  await expect(blockedPage.getByText(/Hoàn tất bốn tình huống luyện tập/)).toHaveCount(0);
  expect(blockedErrors).toEqual([]);
  await blockedContext.close();

  expect(runtimeErrors).toEqual([]);
});
