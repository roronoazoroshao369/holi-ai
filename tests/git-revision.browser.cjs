const { test, expect } = require('@playwright/test');
const key = 'holi.devops.git-ci-practice';
const sha = { built: 'a4'.repeat(20), intended: 'b7'.repeat(20), tagObject: 'c8'.repeat(20), tagCommit: 'd9'.repeat(20), branchNow: 'e2'.repeat(20) };
const slots = ['symptom', 'workflow', 'refs', 'build', 'intent'];
const names = ['release check', 'checkout config', 'reference snapshot', 'build metadata', 'release request'];
function errors(page, sink) {
  page.on('pageerror', e => sink.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') sink.push(m.text()); });
}
async function collect(page) { for (const name of names) await page.getByRole('button', { name: 'Inspect ' + name, exact: true }).click(); }
async function lock(page, hypothesis = 'revision-selection') {
  await page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true }).selectOption(hypothesis);
  await page.getByRole('button', { name: 'Lock Git revision hypothesis', exact: true }).click();
}
async function repair(page, value = 'pin-intended-sha') {
  await page.getByRole('combobox', { name: 'Git revision repair', exact: true }).selectOption(value);
  await page.getByRole('button', { name: 'Apply Git revision repair', exact: true }).click();
  await page.getByRole('button', { name: 'Rebuild simulated release', exact: true }).click();
}
async function fillExplanation(page) {
  const facts = { symptom: 'passed:acceptance-not-met', workflow: 'refs/heads/release', refs: `refs/heads/release=${sha.built}`, build: sha.built, intent: sha.intended };
  for (const slot of slots) {
    await page.getByRole('combobox', { name: `Git revision ${slot} source`, exact: true }).selectOption('git-revision:before:' + slot);
    await page.getByRole('textbox', { name: `Git revision ${slot} fact`, exact: true }).fill(facts[slot]);
  }
  await page.getByRole('textbox', { name: 'Git revision explanation relation', exact: true }).fill('checkout-ref-resolves-build-commit');
  await page.getByRole('textbox', { name: 'Git revision explanation repair', exact: true }).fill('pin-intended-sha');
}
async function fillTransfer(page, selectedRevision = sha.tagCommit) {
  const values = { tagSource: 'git-revision:transfer:tag', tagObject: sha.tagObject, targetCommit: sha.tagCommit,
    branchSource: 'git-revision:transfer:branch', branchCommit: sha.branchNow, intentSource: 'git-revision:transfer:intent',
    selectedRevision, relation: 'annotated-tag-peels-to-commit' };
  for (const [field, value] of Object.entries(values)) {
    const locator = page.getByRole(field.endsWith('Source') ? 'combobox' : 'textbox', { name: 'Git revision transfer ' + field, exact: true });
    if (field.endsWith('Source')) await locator.selectOption(value); else await locator.fill(value);
  }
}
async function saved(page, predicate) {
  await expect.poll(() => page.evaluate(([key, expression]) => {
    const v = JSON.parse(localStorage.getItem(key));
    if (!v) return false;
    const s = v.state.revisionPractice;
    if (expression === 'complete') return s.transferPassed;
    if (expression === 'fresh') return Object.keys(s.evidence).length === 0 && s.hypothesis === '' && !s.transferPassed;
    if (expression === 'transfer-draft') return !s.transferPassed && s.transfer?.selectedRevision === 'c8'.repeat(20);
    if (expression === 'explanation-draft') return !s.explained && s.transfer === null && s.explanation?.sources.intent.fact === 'a4'.repeat(20);
    if (expression === 'wrong-diagnosis') return s.hypothesis === 'cache-content' && s.verification !== null && !s.verified;
    return true;
  }, [key, predicate])).toBe(true);
}

test('Git revision production flow distinguishes green, consumed commit and causal learning; tag transfer persists and revokes', async ({ page }) => {
  const runtime = []; errors(page, runtime);
  await page.goto('/');
  const lab = page.getByRole('region', { name: 'Git revision simulated incident', exact: true });
  const explanation = page.getByRole('region', { name: 'Git revision explanation', exact: true });
  const transfer = page.getByRole('region', { name: 'Git revision tag transfer', exact: true });
  await expect(lab).toBeVisible();
  await expect(lab).toContainText('SIMULATED');
  for (const leak of ['refs/heads/release', sha.built, sha.intended, 'pin-intended-sha', 'wrong ref', 'stale branch']) await expect(lab).not.toContainText(leak);
  await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toBeDisabled();
  await expect(page.getByRole('region', { name: 'Git revision repair', exact: true })).toHaveCount(0);
  for (const name of names.slice(0, 4)) await page.getByRole('button', { name: 'Inspect ' + name, exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Inspect release request', exact: true }).click();
  await lock(page, 'cache-content');
  await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toBeDisabled();
  await repair(page);
  await expect(lab).toContainText('Pipeline xanh; chưa xác minh revision.');
  await expect(explanation).toHaveCount(0);
  await page.getByRole('button', { name: 'Verify consumed revision', exact: true }).click();
  await expect(lab).toContainText('Assessment chưa verified');
  await expect(explanation).toHaveCount(0);
  await saved(page, 'wrong-diagnosis');
  await page.reload();
  await expect(lab).toContainText('Assessment chưa verified');
  await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toHaveValue('cache-content');

  await page.getByRole('button', { name: 'Reset Git revision incident', exact: true }).click();
  await collect(page); await lock(page); await repair(page, 'purge-cache');
  await page.getByRole('button', { name: 'Verify consumed revision', exact: true }).click();
  await expect(lab).toContainText('Actual: ' + sha.built);
  await expect(lab).toContainText('Intended: ' + sha.intended);
  await expect(explanation).toHaveCount(0);

  await page.getByRole('button', { name: 'Reset Git revision incident', exact: true }).click();
  await collect(page); await lock(page); await repair(page);
  await expect(lab).toContainText('Repair ID đã chọn: pin-intended-sha');
  await expect(explanation).toHaveCount(0);
  await page.getByRole('button', { name: 'Verify consumed revision', exact: true }).click();
  await expect(explanation).toBeVisible();
  await fillExplanation(page);
  await page.getByRole('textbox', { name: 'Git revision build fact', exact: true }).fill(sha.intended);
  await page.getByRole('button', { name: 'Check Git revision explanation', exact: true }).click();
  await expect(transfer).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Git revision build fact', exact: true }).fill(sha.built);
  await page.getByRole('combobox', { name: 'Git revision refs source', exact: true }).selectOption('git-revision:before:build');
  await page.getByRole('button', { name: 'Check Git revision explanation', exact: true }).click();
  await expect(transfer).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Git revision refs source', exact: true }).selectOption('git-revision:before:refs');
  await page.getByRole('button', { name: 'Check Git revision explanation', exact: true }).click();
  await expect(transfer).toBeVisible();
  await fillTransfer(page, sha.tagObject);
  await page.getByRole('button', { name: 'Check Git revision transfer', exact: true }).click();
  await expect(transfer).not.toContainText('Hoàn tất Git revision slice');
  await page.getByRole('textbox', { name: 'Git revision transfer selectedRevision', exact: true }).fill(sha.branchNow);
  await page.getByRole('button', { name: 'Check Git revision transfer', exact: true }).click();
  await expect(transfer).not.toContainText('Hoàn tất Git revision slice');
  await page.getByRole('textbox', { name: 'Git revision transfer selectedRevision', exact: true }).fill(sha.tagCommit);
  await page.getByRole('button', { name: 'Check Git revision transfer', exact: true }).click();
  await expect(transfer).toContainText('Hoàn tất Git revision slice');
  await saved(page, 'complete');
  await page.reload(); await expect(transfer).toContainText('Hoàn tất Git revision slice');

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const field = page.getByRole('textbox', { name: 'Git revision transfer selectedRevision', exact: true });
  await field.focus();
  expect(await field.evaluate(e => getComputedStyle(e).outlineStyle !== 'none' && getComputedStyle(e).outlineWidth !== '0px')).toBe(true);
  await field.fill(sha.tagObject); await expect(transfer).not.toContainText('Hoàn tất Git revision slice');
  await saved(page, 'transfer-draft');
  await page.reload(); await expect(field).toHaveValue(sha.tagObject); await expect(transfer).not.toContainText('Hoàn tất Git revision slice');
  await field.fill(sha.tagCommit); await page.getByRole('button', { name: 'Check Git revision transfer', exact: true }).click();
  await expect(transfer).toContainText('Hoàn tất Git revision slice');
  await page.getByRole('textbox', { name: 'Git revision intent fact', exact: true }).fill(sha.built);
  await expect(transfer).toHaveCount(0); await saved(page, 'explanation-draft'); await page.reload(); await expect(transfer).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset Git revision incident', exact: true }).click(); await saved(page, 'fresh'); await page.reload();
  await expect(lab).toContainText('0/5 nguồn đã thu');
  await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toHaveValue('');
  expect(runtime).toEqual([]);
});

test('Git revision restores fail closed and Storage getter denial remains ephemeral with isolated reset', async ({ page, browser }) => {
  const runtime = []; errors(page, runtime); await page.goto('/'); await saved(page, 'initial');
  const lab = page.getByRole('region', { name: 'Git revision simulated incident', exact: true });
  await page.getByRole('button', { name: 'Inspect workflow', exact: true }).click();
  await collect(page); await lock(page);
  await page.getByRole('button', { name: 'Reset Git revision incident', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Git CI evidence collection', exact: true })).toContainText('Workflow definition');
  await collect(page); await lock(page);
  await page.getByRole('button', { name: 'Reset Git/CI incident', exact: true }).click();
  await collect(page);
  await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Reset Git revision incident', exact: true }).click();
  await saved(page, 'fresh');
  const fresh = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  for (const mode of ['forged', 'stale-schema', 'stale-fixture', 'corrupt']) {
    await saved(page, 'fresh');
    const value = structuredClone(fresh);
    if (mode === 'forged') value.state.revisionPractice.transferPassed = true;
    if (mode === 'stale-schema') value.schemaVersion = 1;
    if (mode === 'stale-fixture') value.fixtureVersion = 1;
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [key, mode === 'corrupt' ? '{bad' : JSON.stringify(value)]);
    await page.reload();
    await expect(page.getByRole('region', { name: 'Git CI simulated incident', exact: true })).toContainText('Checkpoint Git/CI cũ/hỏng đã bị loại bỏ an toàn');
    await expect(lab).toContainText('0/5 nguồn đã thu');
    await expect(page.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toBeDisabled();
  }
  const context = await browser.newContext();
  await context.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } }));
  const blocked = await context.newPage(); const blockedErrors = []; errors(blocked, blockedErrors); await blocked.goto('/');
  await expect(blocked.getByRole('region', { name: 'Git CI simulated incident', exact: true })).toContainText('Không thể persist checkpoint Git/CI');
  await collect(blocked); await lock(blocked); await repair(blocked);
  await blocked.getByRole('button', { name: 'Verify consumed revision', exact: true }).click();
  await expect(blocked.getByRole('region', { name: 'Git revision explanation', exact: true })).toBeVisible();
  await blocked.getByRole('button', { name: 'Reset Git/CI incident', exact: true }).click();
  await expect(blocked.getByRole('combobox', { name: 'Git revision hypothesis', exact: true })).toBeDisabled();
  expect(blockedErrors).toEqual([]); await context.close(); expect(runtime).toEqual([]);
});
