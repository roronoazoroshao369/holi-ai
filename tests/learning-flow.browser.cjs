const { test, expect } = require("@playwright/test");

const storageKey = "holi.devops.linux-practice";

function collectRuntimeErrors(page, sink) {
  page.on("pageerror", error => sink.push(`pageerror: ${String(error)}`));
  page.on("console", message => {
    if (message.type() === "error") sink.push(`console.error: ${message.text()}`);
  });
}

async function runCommand(input, command) {
  await input.fill(command);
  await input.press("Enter");
}

test("production learning flow persists safely across real browser reloads", async ({ page, browser }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);

  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Lab terminal command" });
  const hypothesis = page.getByRole("combobox", { name: "Giả thuyết", exact: true });
  const explanation = page.getByRole("combobox", { name: "Giải thích cơ chế" });
  const next = page.getByRole("button", { name: "Thử tình huống mới" });

  await expect(input).toBeVisible();
  await expect(hypothesis).toBeDisabled();

  // Blind repair cannot manufacture verified progress.
  await runCommand(input, "chmod 644 /srv/site/index.html");
  await runCommand(input, "curl localhost");
  await expect(explanation).toHaveCount(0);
  await expect(next).toHaveCount(0);

  // Guided flow requires evidence -> hypothesis -> minimal repair -> verify -> explain.
  await runCommand(input, "reset");
  for (const command of ["curl localhost", "ls -l /srv/site/index.html", "id www-data"]) {
    await runCommand(input, command);
  }
  await hypothesis.selectOption("permission");
  await runCommand(input, "chmod 644 /srv/site/index.html");
  await expect(explanation).toHaveCount(0);
  await runCommand(input, "curl localhost");
  await explanation.selectOption("group-read");
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
  await expect(next).toHaveCount(0);
  await explanation.selectOption("other-read");
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
  await next.click();
  await expect(hypothesis).toHaveValue("");
  await expect(explanation).toHaveCount(0);

  // Transfer fixture rejects memorized 644 and requires group-scoped 640.
  for (const command of ["curl localhost", "ls -l /srv/reports/status.html", "id report-worker"]) {
    await runCommand(input, command);
  }
  await hypothesis.selectOption("permission");
  await runCommand(input, "chmod 644 /srv/reports/status.html");
  await runCommand(input, "curl localhost");
  await expect(explanation).toHaveCount(0);
  await runCommand(input, "chmod 640 /srv/reports/status.html");
  await runCommand(input, "curl localhost");
  await explanation.selectOption("group-read");
  await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
  await expect(page.getByText(/Hoàn tất hai tình huống luyện tập/)).toBeVisible();

  // Completion is resumable after refresh, but remains explicitly untrusted local practice.
  await page.reload();
  await expect(page.getByText(/Hoàn tất hai tình huống luyện tập/)).toBeVisible();
  await expect(page.getByText(/Đã phục hồi checkpoint hợp lệ/)).toBeVisible();
  await expect(page.getByText(/KHÔNG PHẢI MASTERY/)).toBeVisible();

  // Reset retries the current transfer fixture and persists the reset state.
  await runCommand(input, "reset");
  await expect(page.getByText(/Hoàn tất hai tình huống luyện tập/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "2. Tình huống chuyển giao" })).toBeVisible();
  await expect(hypothesis).toBeDisabled();

  // Full restart returns to guided practice and survives refresh.
  await page.getByRole("button", { name: "Học lại từ đầu" }).click();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "1. Chẩn đoán có hướng dẫn" })).toBeVisible();

  // Corrupt persisted data is discarded rather than manufacturing completion.
  await page.evaluate(key => localStorage.setItem(key, "{bad json"), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(page.getByText(/Hoàn tất hai tình huống luyện tập/)).toHaveCount(0);
  await expect(hypothesis).toBeDisabled();

  // Stale schema/fixture data also fails closed in the browser hydration path.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 0,
    fixtureVersion: 0,
    state: {},
    completed: {}
  })), storageKey);
  await page.reload();
  await expect(page.getByText(/Checkpoint cũ\/hỏng đã bị loại bỏ an toàn/)).toBeVisible();
  await expect(hypothesis).toBeDisabled();

  // Responsive layout must not overflow horizontally and keyboard focus stays visible.
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await input.focus();
  expect(await input.evaluate(element => {
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
  await expect(blockedPage.getByText(/Hoàn tất hai tình huống luyện tập/)).toHaveCount(0);
  expect(blockedErrors).toEqual([]);
  await blockedContext.close();

  expect(runtimeErrors).toEqual([]);
});
