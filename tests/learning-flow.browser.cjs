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

test("production learning flow transfers from file access to unfamiliar listener diagnosis", async ({ page }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);

  await page.goto("/");
  const hypothesis = page.getByRole("textbox", { name: "Giả thuyết" });
  await expect(page.getByRole("textbox", { name: "Lab terminal command" })).toBeVisible();
  await expect(hypothesis).toBeDisabled();

  // Blind permission repair cannot manufacture verified progress.
  await runCommand(page, "chmod 644 /srv/site/index.html");
  await runCommand(page, "curl localhost");
  await expect(page.getByRole("combobox", { name: "Giải thích cơ chế" })).toHaveCount(0);

  // Guided permission flow: observations -> typed hypothesis -> minimal repair -> verify -> explain.
  await runCommand(page, "reset");
  for (const command of ["curl localhost", "ls -l /srv/site/index.html", "id www-data"]) {
    await runCommand(page, command);
  }
  await submitHypothesis(page, "permission");
  await runCommand(page, "chmod 644 /srv/site/index.html");
  await runCommand(page, "curl localhost");
  await explainWith(page, "group-read");
  await expect(page.getByRole("button", { name: "Thử tình huống permission mới" })).toHaveCount(0);
  await explainWith(page, "other-read");
  await page.getByRole("button", { name: "Thử tình huống permission mới" }).click();

  // Transfer fixture rejects memorized 644 and requires group-scoped 640.
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
  await page.getByRole("button", { name: "Thử incident khác cơ chế" }).click();

  // The unfamiliar family changes causal mechanism: process is alive, but the socket listens on 9090 instead of 8080.
  await expect(page.getByRole("heading", { name: /Incident lạ/ })).toBeVisible();
  await expect(hypothesis).toBeDisabled();
  for (const command of [
    "curl 127.0.0.1:8080/health",
    "ps -o pid,user,comm -C api-server",
    "ss -ltnp"
  ]) {
    await runCommand(page, command);
  }
  await expect(page.getByRole("log", { name: "Kết quả terminal" })).toContainText("127.0.0.1:9090");

  // Wrong causal class cannot pass even with the superficially correct repair.
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
  await runCommand(page, "configure api-server --listen 127.0.0.1:8080");
  await runCommand(page, "curl 127.0.0.1:8080/health");
  await explainWith(page, "process-exists");
  await expect(page.getByText(/Hoàn tất ba tình huống luyện tập/)).toHaveCount(0);
  await explainWith(page, "listener-port-match");
  await expect(page.getByText(/Hoàn tất ba tình huống luyện tập/)).toBeVisible();

  // Completion resumes after refresh but is still explicitly untrusted local practice.
  await page.reload();
  await expect(page.getByText(/Hoàn tất ba tình huống luyện tập/)).toBeVisible();
  await expect(page.getByText(/Đã phục hồi checkpoint hợp lệ/)).toBeVisible();
  await expect(page.getByText(/KHÔNG PHẢI MASTERY/)).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("browser persistence and resilience fail closed with the expanded fixture schema", async ({ page, browser }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");

  // A structurally valid local checkpoint may resume practice, but it remains client-controlled convenience state.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 2,
    fixtureVersion: 2,
    state: {
      scenario: "listener",
      incident: { kind: "tcp-listener", listenerPort: 9090 },
      observations: { symptom: false, resource: false, identity: false },
      hypothesis: "",
      repairedWithEvidence: false,
      verified: false,
      explained: false
    },
    completed: { guided: true, transfer: true, listener: false }
  })), storageKey);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Incident lạ/ })).toBeVisible();
  await expect(page.getByText(/KHÔNG PHẢI MASTERY/)).toBeVisible();

  // Reset clears current-fixture evidence and persists that reset.
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
  await expect(page.getByRole("heading", { name: /Incident lạ/ })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Giả thuyết" })).toBeDisabled();

  // Full restart returns to guided practice and survives refresh.
  await page.getByRole("button", { name: "Học lại từ đầu" }).click();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();

  // Corrupt persisted data is discarded rather than manufacturing completion.
  await page.evaluate(key => localStorage.setItem(key, "{bad json"), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();

  // Old v1 schema/fixture checkpoints are semantically stale and fail closed.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 1,
    fixtureVersion: 1,
    state: {},
    completed: {}
  })), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Giả thuyết" })).toBeDisabled();

  // Responsive layout must not overflow horizontally and keyboard focus stays visible.
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const commandInput = page.getByRole("textbox", { name: "Lab terminal command" });
  await commandInput.focus();
  expect(await commandInput.evaluate(element => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  })).toBe(true);

  // Storage failures are injected before navigation in a fresh context for deterministic behavior.
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
  await expect(blockedPage.getByText(/Hoàn tất ba tình huống luyện tập/)).toHaveCount(0);
  expect(blockedErrors).toEqual([]);
  await blockedContext.close();

  expect(runtimeErrors).toEqual([]);
});
