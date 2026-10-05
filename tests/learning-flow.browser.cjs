// Run against npm start. PLAYWRIGHT_MODULE and CHROMIUM_PATH may select a local runtime.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? {
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-gpu", "--disable-zygote", "--disable-dev-shm-usage"]
  } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    await page.goto(process.env.BASE_URL || "http://127.0.0.1:3000");
    const input = page.getByRole("textbox", { name: "Lab terminal command" });
    const command = async cmd => { await input.fill(cmd); await input.press("Enter"); };
    const hypothesis = page.getByRole("combobox", { name: "Giả thuyết", exact: true });
    const explanation = page.getByRole("combobox", { name: "Giải thích cơ chế" });
    const next = page.getByRole("button", { name: "Thử tình huống mới" });
    assert.equal(await hypothesis.isDisabled(), true);
    await command("chmod 644 /srv/site/index.html");
    await command("curl localhost");
    assert.equal(await explanation.count(), 0);
    assert.equal(await next.count(), 0);
    await command("reset");
    for (const cmd of ["curl localhost", "ls -l /srv/site/index.html", "id www-data"]) await command(cmd);
    await hypothesis.selectOption("permission");
    await command("chmod 644 /srv/site/index.html");
    assert.equal(await explanation.count(), 0);
    await command("curl localhost");
    await explanation.selectOption("group-read");
    await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
    assert.equal(await next.count(), 0);
    await explanation.selectOption("other-read");
    await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
    await next.click();
    assert.equal(await hypothesis.inputValue(), "");
    assert.equal(await explanation.count(), 0);
    for (const cmd of ["curl localhost", "ls -l /srv/reports/status.html", "id report-worker"]) await command(cmd);
    await hypothesis.selectOption("permission");
    await command("chmod 644 /srv/reports/status.html");
    await command("curl localhost");
    assert.equal(await explanation.count(), 0);
    await command("chmod 640 /srv/reports/status.html");
    await command("curl localhost");
    await explanation.selectOption("group-read");
    await page.getByRole("button", { name: "Kiểm tra giải thích" }).click();
    await page.getByText(/Hoàn tất hai tình huống luyện tập/).waitFor();
    await command("reset");
    assert.equal(await page.getByText(/Hoàn tất hai tình huống luyện tập/).count(), 0);
    await page.reload();
    await command("curl localhost");
    await page.getByText("HTTP/1.1 403 Forbidden", { exact: true }).waitFor();
    assert.equal(await hypothesis.isDisabled(), true);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await input.focus();
    assert.notEqual(await input.evaluate(e => getComputedStyle(e).outlineStyle), "none");
    assert.deepEqual(errors, []);
    if (process.env.SCREENSHOT_PATH) await page.locator("#lab").screenshot({ path: process.env.SCREENSHOT_PATH });
    console.log("PASS: production guided/transfer flow, blind repair, explanation gates, reset, refresh, mobile width, focus and runtime errors.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
