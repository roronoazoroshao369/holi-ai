const { test, expect } = require("@playwright/test");

const storageKey = "holi.devops.git-ci-practice";

function collectRuntimeErrors(page, sink) {
  page.on("pageerror", error => sink.push("pageerror: " + String(error)));
  page.on("console", message => {
    if (message.type() === "error") sink.push("console.error: " + message.text());
  });
}

async function collectEvidence(page) {
  await page.getByRole("button", { name: "Inspect workflow" }).click();
  await page.getByRole("button", { name: "Inspect producer log" }).click();
  await page.getByRole("button", { name: "Inspect consumer failure" }).click();
}

async function lockHypothesis(page, value) {
  await page.getByRole("combobox", { name: "Git CI hypothesis" }).selectOption(value);
  await page.getByRole("button", { name: "Lock Git CI hypothesis" }).click();
}

async function repairAndRerun(page, value) {
  await page.getByRole("combobox", { name: "Git CI repair" }).selectOption(value);
  await page.getByRole("button", { name: "Apply simulated repair" }).click();
  await page.getByRole("button", { name: "Rerun simulated pipeline" }).click();
}

async function fillExplanation(page, consumerFact = "site-dist") {
  await page.getByRole("combobox", { name: "Git CI workflow evidence" }).selectOption("git-ci:before:workflow");
  await page.getByRole("textbox", { name: "Git CI workflow fact" }).fill("artifact name crosses build job output");
  await page.getByRole("combobox", { name: "Git CI producer evidence" }).selectOption("git-ci:before:producer");
  await page.getByRole("textbox", { name: "Git CI producer fact" }).fill("web-dist");
  await page.getByRole("combobox", { name: "Git CI consumer evidence" }).selectOption("git-ci:before:consumer");
  await page.getByRole("textbox", { name: "Git CI consumer fact" }).fill(consumerFact);
  await page.getByRole("textbox", { name: "Git CI causal relation" }).fill("producer-consumer-artifact-contract");
  await page.getByRole("textbox", { name: "Git CI minimal repair" }).fill("map-current-artifact-output");
}

async function fillTransfer(page, predictedPath) {
  await page.getByRole("combobox", { name: "Git CI transfer producer evidence" }).selectOption("git-ci:transfer:producer");
  await page.getByRole("textbox", { name: "Git CI transfer producer fact" }).fill("reports/coverage.json");
  await page.getByRole("combobox", { name: "Git CI transfer consumer evidence" }).selectOption("git-ci:transfer:consumer");
  await page.getByRole("textbox", { name: "Git CI transfer consumer fact" }).fill("workspace/report/coverage.json");
  await page.getByRole("textbox", { name: "Git CI transfer predicted path" }).fill(predictedPath);
  await page.getByRole("textbox", { name: "Git CI transfer causal relation" }).fill("artifact-extraction-preserves-relative-path");
}

test("Git CI production flow requires evidence-backed diagnosis before verified green and changed transfer", async ({ page }) => {
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");

  const lab = page.getByRole("region", { name: "Git CI simulated incident" });
  await expect(lab).toBeVisible();
  await expect(lab).toContainText("SIMULATED");
  await expect(lab).not.toContainText("web-dist");
  await expect(lab).not.toContainText("site-dist");
  await expect(page.getByRole("combobox", { name: "Git CI hypothesis" })).toBeDisabled();

  await collectEvidence(page);
  await expect(lab).toContainText("web-dist");
  await expect(lab).toContainText("site-dist");
  await expect(page.getByRole("combobox", { name: "Git CI hypothesis" })).toBeEnabled();

  await lockHypothesis(page, "runner-permission");
  await repairAndRerun(page, "map-current-artifact-output");
  await expect(lab).toContainText("Pipeline xanh, nhưng assessment KHÔNG verified");
  await expect(page.getByRole("region", { name: "Git CI source linked explanation" })).toHaveCount(0);

  await page.getByRole("button", { name: "Reset Git/CI incident" }).click();
  await collectEvidence(page);
  await lockHypothesis(page, "artifact-contract");
  await repairAndRerun(page, "chmod-workspace");
  await expect(lab).toContainText("Pipeline vẫn đỏ");
  await expect(page.getByRole("region", { name: "Git CI source linked explanation" })).toHaveCount(0);

  await page.getByRole("button", { name: "Reset Git/CI incident" }).click();
  await collectEvidence(page);
  await lockHypothesis(page, "artifact-contract");
  await repairAndRerun(page, "map-current-artifact-output");
  await expect(lab).toContainText("Pipeline xanh + diagnosis/evidence gate hợp lệ");
  await expect(page.getByRole("region", { name: "Git CI source linked explanation" })).toBeVisible();

  await fillExplanation(page, "web-dist");
  await page.getByRole("button", { name: "Check Git CI explanation" }).click();
  await expect(lab).toContainText("Explanation chưa nối đúng");
  await expect(page.getByRole("region", { name: "Git CI unfamiliar transfer" })).toHaveCount(0);

  await page.getByRole("textbox", { name: "Git CI consumer fact" }).fill("site-dist");
  await page.getByRole("button", { name: "Check Git CI explanation" }).click();
  await expect(lab).toContainText("Explanation hợp lệ");
  await expect(page.getByRole("region", { name: "Git CI unfamiliar transfer" })).toBeVisible();

  await fillTransfer(page, "workspace/report/coverage.json");
  await page.getByRole("button", { name: "Check Git CI transfer" }).click();
  await expect(lab).toContainText("Transfer chưa đúng");

  await page.getByRole("textbox", { name: "Git CI transfer predicted path" }).fill("workspace/report/reports/coverage.json");
  await page.getByRole("button", { name: "Check Git CI transfer" }).click();
  await expect(lab).toContainText("Hoàn tất Git & CI vertical slice");

  await page.reload();
  await expect(page.getByRole("region", { name: "Git CI unfamiliar transfer" })).toContainText("Hoàn tất Git & CI vertical slice");

  const persisted = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(persisted.state.transferPassed).toBe(true);
  expect(persisted.state.verified).toBe(true);

  persisted.state.verified = false;
  await page.evaluate(([key, value]) => localStorage.setItem(key, JSON.stringify(value)), [storageKey, persisted]);
  await page.reload();
  await expect(lab).toContainText("Checkpoint Git/CI cũ/hỏng đã bị loại bỏ an toàn");
  await expect(page.getByRole("combobox", { name: "Git CI hypothesis" })).toBeDisabled();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const evidenceButton = page.getByRole("button", { name: "Inspect workflow" });
  await evidenceButton.focus();
  expect(await evidenceButton.evaluate(element => {
    const style = getComputedStyle(element);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  })).toBe(true);

  expect(runtimeErrors).toEqual([]);
});

test("Git CI practice degrades safely when localStorage is unavailable", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    for (const method of ["getItem", "setItem", "removeItem"]) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() { throw new DOMException("blocked", "SecurityError"); }
      });
    }
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  collectRuntimeErrors(page, runtimeErrors);
  await page.goto("/");
  const lab = page.getByRole("region", { name: "Git CI simulated incident" });
  await expect(lab).toContainText("Không xác nhận được lưu bền vững");
  await expect(page.getByRole("combobox", { name: "Git CI hypothesis" })).toBeDisabled();
  expect(runtimeErrors).toEqual([]);
  await context.close();
});
