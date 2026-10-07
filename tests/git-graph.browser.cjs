const { test, expect } = require('@playwright/test');
const key = 'holi.devops.git-ci-practice';
const S = { root: '10'.repeat(20), base: '21'.repeat(20), head: '32'.repeat(20), integration: '43'.repeat(20), otherIntegration: '65'.repeat(20), oldHead: '87'.repeat(20), rebasedFirst: '98'.repeat(20), rebasedHead: 'a9'.repeat(20), later: 'ba'.repeat(20) };
const slots = ['symptom', 'review', 'graph', 'workflow', 'build', 'intent'];
const names = ['delivery checks', 'review snapshot', 'object records', 'job configuration', 'produced metadata', 'delivery request'];
const facts = { symptom: 'passed:acceptance-not-met', review: `${S.base}:${S.head}`, graph: `${S.head}=${S.root}`, workflow: S.head, build: `${S.head}:${S.head}`, intent: `${S.integration}:${S.base}:${S.head}` };
function errors(page, sink) { page.on('pageerror', e => sink.push(String(e))); page.on('console', m => { if (m.type() === 'error') sink.push(m.text()); }); }
const lab = page => page.getByRole('region', { name: 'Git graph simulated incident', exact: true });
const region = (page, suffix) => page.getByRole('region', { name: 'Git graph ' + suffix, exact: true });
async function collect(page) { for (const name of names) await page.getByRole('button', { name: 'Inspect graph ' + name, exact: true }).click(); }
async function fillReason(page, phase = 'rationale') {
  for (const slot of slots) {
    await page.getByRole('combobox', { name: `Git graph ${phase} ${slot} source`, exact: true }).selectOption('git-graph:before:' + slot);
    await page.getByRole('textbox', { name: `Git graph ${phase} ${slot} fact`, exact: true }).fill(facts[slot]);
  }
  await page.getByRole('textbox', { name: `Git graph ${phase} relation`, exact: true }).fill('pr-head-omits-required-base');
  if (phase === 'explanation') await page.getByRole('textbox', { name: 'Git graph explanation repair', exact: true }).fill(S.integration);
}
async function bindReason(page, phase = 'rationale', graphPair = [S.head, S.root]) {
  const picks = {
    review: [S.base, S.head],
    graph: graphPair,
    workflow: [S.head],
    build: [S.head, S.head],
    intent: [S.integration, S.base, S.head]
  };
  for (const slot of slots) {
    await page.getByRole('combobox', { name: `Git graph ${phase} ${slot} source`, exact: true }).selectOption('git-graph:before:' + slot);
    if (slot === 'symptom') {
      await page.getByRole('textbox', { name: `Git graph ${phase} symptom fact`, exact: true }).fill('passed:acceptance-not-met');
      continue;
    }
    for (const sha of picks[slot]) {
      await page.getByRole('button', { name: `Bind Git graph ${phase} ${slot} observed SHA ${sha}`, exact: true }).click();
    }
  }
  await page.getByRole('textbox', { name: `Git graph ${phase} relation`, exact: true }).fill('pr-head-omits-required-base');
  if (phase === 'explanation') await page.getByRole('textbox', { name: 'Git graph explanation repair', exact: true }).fill(S.integration);
}
async function lock(page, hypothesis = 'integration-selection') {
  await page.getByRole('combobox', { name: 'Git graph hypothesis', exact: true }).selectOption(hypothesis);
  await page.getByRole('button', { name: 'Lock Git graph hypothesis', exact: true }).click();
}
async function recover(page, commit = S.integration) {
  await page.getByRole('combobox', { name: 'Git graph checkout commit', exact: true }).selectOption(commit);
  await page.getByRole('button', { name: 'Apply Git graph checkout', exact: true }).click();
  await page.getByRole('button', { name: 'Rebuild graph delivery', exact: true }).click();
  await expect(region(page, 'explanation')).toHaveCount(0);
  await expect(lab(page)).toContainText('Build xanh; chưa verify graph delivery.');
  await page.getByRole('button', { name: 'Verify graph delivery', exact: true }).click();
}
async function saved(page, stage) {
  await expect.poll(() => page.evaluate(([key, stage]) => {
    const c = JSON.parse(localStorage.getItem(key)); const s = c?.state.graphPractice; if (!s) return false;
    if (stage === 'fresh') return s.hypothesis === '' && s.rationale === null && Object.keys(s.evidence).length === 0;
    if (stage === 'draft') return s.hypothesis === '' && s.rationale?.sources.graph.fact === '32'.repeat(20) + '=' + '10'.repeat(20);
    if (stage === 'locked') return s.hypothesis === 'integration-selection' && s.rationale !== null && s.selectedCommit === '';
    if (stage === 'wrong') return s.verification?.consumedMatch && s.verification?.graphMatch && !s.verified;
    if (stage === 'transfer-draft') return s.explained && !s.transferPassed && s.transfer?.parentCount === '2';
    if (stage === 'complete') return s.transferPassed;
    if (stage === 'rebuild') return s.run && !s.verified && s.verification === null && s.explanation === null && s.transfer === null;
    if (stage === 'explanation-draft') return !s.explained && s.transfer === null && s.explanation?.sources.graph.fact === 'wrong';
    return false;
  }, [key, stage])).toBe(true);
}
async function fillTransfer(page) {
  const tf = { history: `${S.rebasedHead}=${S.rebasedFirst}`, series: 'p1,p2', request: S.base };
  for (const slot of ['history', 'series', 'request']) {
    await page.getByRole('combobox', { name: `Git graph transfer ${slot} source`, exact: true }).selectOption('git-graph:transfer:' + slot);
    await page.getByRole('textbox', { name: `Git graph transfer ${slot} fact`, exact: true }).fill(tf[slot]);
  }
  const values = { selectedCommit: S.rebasedHead, baseAncestor: 'yes', originalHeadAncestor: 'no', parentCount: '1', relation: 'base-ancestor-and-reviewed-series' };
  for (const [field, value] of Object.entries(values)) await page.getByRole('textbox', { name: 'Git graph transfer ' + field, exact: true }).fill(value);
}
async function reset(page) { await page.getByRole('button', { name: 'Reset Git graph incident', exact: true }).click(); await saved(page, 'fresh'); }

test('graph evidence binder builds SHA facts from the selected source without weakening locked reasoning', async ({ page }) => {
  const runtime = []; errors(page, runtime); await page.goto('/'); await expect(lab(page)).toBeVisible();
  await collect(page);

  await bindReason(page, 'rationale', [S.root, S.head]);
  await expect(page.getByRole('textbox', { name: 'Git graph rationale graph fact', exact: true })).toHaveValue(`${S.root}=${S.head}`);
  await lock(page); await recover(page);
  await expect(lab(page)).toContainText('Graph assessment chưa verified');
  await expect(region(page, 'explanation')).toHaveCount(0);

  await reset(page); await collect(page); await bindReason(page);
  await expect(page.getByRole('textbox', { name: 'Git graph rationale review fact', exact: true })).toHaveValue(`${S.base}:${S.head}`);
  await expect(page.getByRole('textbox', { name: 'Git graph rationale intent fact', exact: true })).toHaveValue(`${S.integration}:${S.base}:${S.head}`);
  await saved(page, 'draft'); await page.reload();
  await expect(page.getByRole('textbox', { name: 'Git graph rationale intent fact', exact: true })).toHaveValue(`${S.integration}:${S.base}:${S.head}`);
  await lock(page); await recover(page);
  await expect(region(page, 'explanation')).toBeVisible();
  expect(runtime).toEqual([]);
});

test('observed SHA binding completes explanation and changed transfer with fail-closed edits', async ({ page }) => {
  const runtime = []; errors(page, runtime); await page.goto('/'); await collect(page); await bindReason(page);
  const button = name => page.getByRole('button', { name, exact: true });
  const bind = async (field, sha) => button(`Bind Git graph ${field} observed SHA ${sha}`).click();
  const clear = async field => button(`Clear Git graph ${field} SHA binding`).click();
  const undo = async field => button(`Undo Git graph ${field} SHA binding`).click();
  const field = name => page.getByRole('textbox', { name: 'Git graph ' + name, exact: true });
  await undo('rationale graph');
  await expect(field('rationale graph fact')).toHaveValue(S.head);
  await bind('rationale graph', S.root);
  await lock(page);
  await expect(button('Undo Git graph rationale graph SHA binding')).toBeDisabled();
  await expect(button('Clear Git graph rationale graph SHA binding')).toBeDisabled();
  await recover(page);
  await bindReason(page, 'explanation'); await clear('explanation repair');
  // Source choice controls candidates, not a canonical repair answer.
  await page.getByRole('combobox', { name: 'Git graph explanation intent source', exact: true }).selectOption('git-graph:before:workflow');
  await expect(button(`Bind Git graph explanation repair observed SHA ${S.integration}`)).toHaveCount(0);
  await bind('explanation repair', S.head);
  await button('Check Git graph explanation').click();
  await expect(region(page, 'transfer')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Git graph explanation intent source', exact: true }).selectOption('git-graph:before:intent');
  await clear('explanation repair'); await bind('explanation repair', S.integration);
  await button('Check Git graph explanation').click(); await expect(region(page, 'transfer')).toBeVisible();
  await expect(button(`Bind Git graph transfer selectedCommit observed SHA ${S.rebasedHead}`)).toHaveCount(0);
  for (const slot of ['history', 'series', 'request']) {
    await page.getByRole('combobox', { name: `Git graph transfer ${slot} source`, exact: true }).selectOption('git-graph:transfer:' + slot);
  }
  await bind('transfer history', S.rebasedFirst); await bind('transfer history', S.rebasedHead);
  await bind('transfer request', S.base);
  await field('transfer series fact').fill('p1,p2');
  for (const [name, value] of Object.entries({ baseAncestor: 'yes', originalHeadAncestor: 'no', parentCount: '1', relation: 'base-ancestor-and-reviewed-series' })) await field('transfer ' + name).fill(value);
  await bind('transfer selectedCommit', S.rebasedHead);
  await button('Check Git graph transfer').click(); await expect(lab(page)).not.toContainText('Hoàn tất graph slice');
  await clear('transfer history'); await bind('transfer history', S.rebasedHead); await bind('transfer history', S.rebasedFirst);
  // A descendant retaining base ancestry still has an extra change and must fail.
  await undo('transfer selectedCommit'); await bind('transfer selectedCommit', S.later);
  await button('Check Git graph transfer').click(); await expect(lab(page)).not.toContainText('Hoàn tất graph slice');
  await undo('transfer selectedCommit'); await bind('transfer selectedCommit', S.rebasedHead);
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key))?.state.graphPractice.transfer?.selectedCommit, key)).toBe(S.rebasedHead);
  await page.reload(); await expect(field('transfer history fact')).toHaveValue(`${S.rebasedHead}=${S.rebasedFirst}`);
  await expect(field('transfer selectedCommit')).toHaveValue(S.rebasedHead);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await button('Undo Git graph transfer selectedCommit SHA binding').focus();
  await expect(button('Undo Git graph transfer selectedCommit SHA binding')).toBeFocused();
  expect(await button('Undo Git graph transfer selectedCommit SHA binding').evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  expect((await button('Undo Git graph transfer selectedCommit SHA binding').boundingBox()).height).toBeGreaterThanOrEqual(44);
  await button('Check Git graph transfer').click(); await saved(page, 'complete');
  await clear('transfer selectedCommit'); await expect(lab(page)).not.toContainText('Hoàn tất graph slice');
  await bind('transfer selectedCommit', S.rebasedHead); await button('Check Git graph transfer').click(); await saved(page, 'complete');
  await clear('explanation repair'); await expect(region(page, 'transfer')).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => { const s = JSON.parse(localStorage.getItem(key))?.state.graphPractice; return s && !s.explained && !s.transferPassed && s.transfer === null; }, key)).toBe(true);
  expect(runtime).toEqual([]);
});

test('graph diagnosis and source facts lock before repair; green and correct recovery cannot rescue wrong reasoning', async ({ page }) => {
  const runtime = []; errors(page, runtime); await page.goto('/'); await expect(lab(page)).toBeVisible();
  for (const clue of [S.head, S.integration, 'wrong head', 'missing parent', 'pr-head-omits-required-base']) await expect(lab(page)).not.toContainText(clue);
  await expect(region(page, 'repair')).toHaveCount(0);
  for (const name of names.slice(0, 5)) await page.getByRole('button', { name: 'Inspect graph ' + name, exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Git graph hypothesis', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Inspect graph delivery request', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lock Git graph hypothesis', exact: true })).toBeDisabled();
  await fillReason(page); await lock(page, 'cache-content'); await recover(page);
  await expect(lab(page)).toContainText('Graph assessment chưa verified'); await expect(lab(page)).toContainText('Ordered parent contract matches: true');
  await expect(region(page, 'explanation')).toHaveCount(0); await saved(page, 'wrong'); await page.reload();
  await expect(lab(page)).toContainText('Graph assessment chưa verified');
  await expect(page.getByRole('textbox', { name: 'Git graph rationale graph fact', exact: true })).toBeDisabled();
  await reset(page); await collect(page); await fillReason(page);
  await page.getByRole('combobox', { name: 'Git graph rationale graph source', exact: true }).selectOption('git-graph:before:review');
  await lock(page); await recover(page); await saved(page, 'wrong');
  await expect(region(page, 'explanation')).toHaveCount(0);
  await page.evaluate(key => { const c = JSON.parse(localStorage.getItem(key)); c.state.graphPractice.verified = true; localStorage.setItem(key, JSON.stringify(c)); }, key);
  await page.reload(); await expect(page.getByText('Checkpoint Git/CI cũ/hỏng đã bị loại bỏ an toàn.', { exact: true })).toBeVisible(); await saved(page, 'fresh');
  await collect(page); await fillReason(page); await lock(page); await recover(page, S.otherIntegration);
  await expect(lab(page)).toContainText('Consumed commit matches request: false'); await expect(lab(page)).toContainText('Ordered parent contract matches: false');
  await expect(region(page, 'explanation')).toHaveCount(0); expect(runtime).toEqual([]);
});

test('graph full production flow changes to linear ancestry/series transfer, persists drafts and revokes on edits/rebuild/reset', async ({ page }) => {
  const runtime = []; errors(page, runtime); await page.goto('/'); await expect(lab(page)).toBeVisible();
  // Sibling evidence is independent of graph reset and survives graph refresh.
  await page.getByRole('button', { name: 'Inspect release check', exact: true }).click();
  await collect(page); await fillReason(page); await saved(page, 'draft'); await page.reload();
  await expect(page.getByRole('textbox', { name: 'Git graph rationale graph fact', exact: true })).toHaveValue(facts.graph);
  await lock(page); await saved(page, 'locked'); await page.reload();
  await expect(page.getByRole('textbox', { name: 'Git graph rationale graph fact', exact: true })).toBeDisabled();
  await recover(page); await expect(region(page, 'explanation')).toBeVisible();
  await fillReason(page, 'explanation');
  await page.getByRole('textbox', { name: 'Git graph explanation graph fact', exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Check Git graph explanation', exact: true }).click(); await expect(region(page, 'transfer')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Git graph explanation graph fact', exact: true }).fill(facts.graph);
  await page.getByRole('button', { name: 'Check Git graph explanation', exact: true }).click(); await expect(region(page, 'transfer')).toBeVisible();
  await fillTransfer(page); await page.getByRole('textbox', { name: 'Git graph transfer relation', exact: true }).fill('two-direct-parents');
  await page.getByRole('button', { name: 'Check Git graph transfer', exact: true }).click(); await expect(lab(page)).toContainText('Graph transfer chưa được xác nhận');
  await page.getByRole('textbox', { name: 'Git graph transfer relation', exact: true }).fill('base-ancestor-and-reviewed-series');
  await page.getByRole('textbox', { name: 'Git graph transfer parentCount', exact: true }).fill('2'); await saved(page, 'transfer-draft'); await page.reload();
  await expect(page.getByRole('textbox', { name: 'Git graph transfer parentCount', exact: true })).toHaveValue('2');
  await page.getByRole('button', { name: 'Check Git graph transfer', exact: true }).click(); await expect(lab(page)).toContainText('Graph transfer chưa được xác nhận');
  await page.getByRole('textbox', { name: 'Git graph transfer parentCount', exact: true }).fill('1');
  await page.getByRole('textbox', { name: 'Git graph transfer selectedCommit', exact: true }).fill(S.oldHead);
  await page.getByRole('button', { name: 'Check Git graph transfer', exact: true }).click(); await expect(lab(page)).toContainText('Graph transfer chưa được xác nhận');
  await page.getByRole('textbox', { name: 'Git graph transfer selectedCommit', exact: true }).fill(S.later);
  await page.getByRole('button', { name: 'Check Git graph transfer', exact: true }).click(); await expect(lab(page)).toContainText('Graph transfer chưa được xác nhận');
  await page.getByRole('textbox', { name: 'Git graph transfer selectedCommit', exact: true }).fill(S.rebasedHead);
  await page.getByRole('button', { name: 'Check Git graph transfer', exact: true }).click(); await expect(lab(page)).toContainText('Hoàn tất graph slice'); await saved(page, 'complete'); await page.reload(); await expect(lab(page)).toContainText('Hoàn tất graph slice');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const focus = page.getByRole('button', { name: 'Check Git graph transfer', exact: true }); await focus.focus(); await expect(focus).toBeFocused();
  expect(await focus.evaluate(el => { const s = getComputedStyle(el); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0; })).toBe(true);
  await page.getByRole('textbox', { name: 'Git graph transfer parentCount', exact: true }).fill('2'); await expect(lab(page)).not.toContainText('Hoàn tất graph slice');
  await page.getByRole('textbox', { name: 'Git graph explanation graph fact', exact: true }).fill('wrong'); await saved(page, 'explanation-draft'); await expect(region(page, 'transfer')).toHaveCount(0);
  await page.getByRole('button', { name: 'Rebuild graph delivery', exact: true }).click(); await saved(page, 'rebuild'); await page.reload(); await expect(region(page, 'explanation')).toHaveCount(0);
  await page.getByRole('button', { name: 'Verify graph delivery', exact: true }).click(); await expect(region(page, 'explanation')).toBeVisible();
  await reset(page); await expect(page.getByRole('region', { name: 'Git revision evidence', exact: true })).toContainText('1/5 nguồn');
  await page.getByRole('button', { name: 'Reset Git/CI incident', exact: true }).click(); await saved(page, 'fresh'); await expect(page.getByRole('region', { name: 'Git revision evidence', exact: true })).toContainText('0/5 nguồn');
  expect(runtime).toEqual([]);
});

test('graph refresh rejects stale/corrupt/contradictory checkpoints and storage getter/method denial stays usable', async ({ page, browser }) => {
  const runtime = []; errors(page, runtime); await page.goto('/'); await expect(lab(page)).toBeVisible(); await saved(page, 'fresh');
  const fresh = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  for (const mode of ['schema', 'fixture', 'missing', 'forged', 'contradiction', 'corrupt']) {
    await saved(page, 'fresh');
    await page.evaluate(([key, fresh, mode]) => {
      const c = structuredClone(fresh);
      if (mode === 'schema') c.schemaVersion = 3;
      if (mode === 'fixture') c.fixtureVersion = 3;
      if (mode === 'missing') delete c.state.graphPractice;
      if (mode === 'forged') c.state.graphPractice.transferPassed = true;
      if (mode === 'contradiction') c.state.graphPractice.selectedCommit = '43'.repeat(20);
      localStorage.setItem(key, mode === 'corrupt' ? '{broken' : JSON.stringify(c));
    }, [key, fresh, mode]);
    await page.reload(); await expect(page.getByText('Checkpoint Git/CI cũ/hỏng đã bị loại bỏ an toàn.', { exact: true })).toBeVisible(); await saved(page, 'fresh');
  }
  for (const mode of ['getter', 'methods']) {
    const context = await browser.newContext();
    await context.addInitScript(mode => {
      if (mode === 'getter') Object.defineProperty(window, 'localStorage', { get() { throw Error('denied'); } });
      else for (const method of ['getItem', 'setItem', 'removeItem']) Storage.prototype[method] = () => { throw Error('denied'); };
    }, mode);
    const p = await context.newPage(); errors(p, runtime); await p.goto('/');
    await expect(p.getByText('Không thể persist checkpoint Git/CI; practice vẫn chạy ephemeral.', { exact: true })).toBeVisible();
    await collect(p); await fillReason(p); await lock(p); await recover(p); await expect(region(p, 'explanation')).toBeVisible();
    await p.reload(); await expect(lab(p)).toBeVisible(); await expect(region(p, 'repair')).toHaveCount(0);
    await context.close();
  }
  expect(runtime).toEqual([]);
});


test('foundations lesson bridges raw evidence into graph predicates without granting assessment credit', async ({ page }) => {
  const runtime = []; errors(page, runtime);
  await page.goto('/');
  const lesson = page.getByRole('region', { name: 'Git foundations lesson', exact: true });
  await expect(lesson).toBeVisible();
  await expect(lesson).toContainText('TEACHING ONLY · KHÔNG TÍNH ĐIỂM');
  await saved(page, 'fresh');

  for (const clue of [S.head, S.integration, 'pr-head-omits-required-base']) {
    await expect(lesson).not.toContainText(clue);
  }

  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state, key);

  await page.getByRole('button', { name: '2 · Ref', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Git ref concept', exact: true })).toContainText('Ref là tên có thể di chuyển');
  await page.getByRole('button', { name: '3 · Direct parent', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Git direct parent concept', exact: true })).toContainText('đúng một cạnh');
  await page.getByRole('button', { name: '4 · Ancestry', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Git ancestry concept', exact: true })).toContainText('cách nhiều cạnh');

  await page.getByRole('combobox', { name: 'Git foundations snapshot answer', exact: true }).selectOption('commit');
  await page.getByRole('combobox', { name: 'Git foundations ref answer', exact: true }).selectOption('moves');
  await page.getByRole('combobox', { name: 'Git foundations direct parent answer', exact: true }).selectOption('one-edge');
  await page.getByRole('combobox', { name: 'Git foundations ancestry answer', exact: true }).selectOption('multi-edge');
  const check = page.getByRole('button', { name: 'Check foundations readiness', exact: true });
  await check.click();
  const readinessStatus = page.locator('.foundationStatus');
  await expect(readinessStatus).toContainText('Sẵn sàng vào graph diagnostic lab');

  const bridge = page.getByRole('region', { name: 'Git evidence reading bridge', exact: true });
  await expect(bridge).toBeVisible();
  await expect(bridge).toContainText('EVIDENCE BRIDGE · TEACHING ONLY');
  await expect(bridge.getByRole('article')).toHaveCount(3);
  for (const clue of [S.head, S.integration, 'pr-head-omits-required-base']) {
    await expect(bridge).not.toContainText(clue);
  }

  const handoff = page.getByRole('link', { name: 'Vào graph diagnostic lab →', exact: true });
  await expect(handoff).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Git evidence bridge consumed commit', exact: true }).selectOption('base');
  await page.getByRole('combobox', { name: 'Git evidence bridge ordered parents', exact: true }).selectOption('topic-base');
  await page.getByRole('combobox', { name: 'Git evidence bridge ancestry', exact: true }).selectOption('no');
  const bridgeCheck = page.getByRole('button', { name: 'Check evidence predicates', exact: true });
  await bridgeCheck.click();
  await expect(bridge.getByRole('status')).toContainText('Còn predicate chưa khớp raw evidence');
  await expect(handoff).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Git evidence bridge consumed commit', exact: true }).selectOption('integration');
  await page.getByRole('combobox', { name: 'Git evidence bridge ordered parents', exact: true }).selectOption('base-topic');
  await page.getByRole('combobox', { name: 'Git evidence bridge ancestry', exact: true }).selectOption('yes');
  await bridgeCheck.click();
  await expect(bridge.getByRole('status')).toContainText('Đủ ba predicate');
  await expect(bridge.getByRole('status')).toContainText('parent[0]');
  await expect(handoff).toBeVisible();

  const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state, key);
  expect(after).toEqual(before);

  await handoff.click();
  await expect(lab(page)).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await bridgeCheck.focus(); await expect(bridgeCheck).toBeFocused();
  expect(await bridgeCheck.evaluate(el => {
    const s = getComputedStyle(el);
    return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  })).toBe(true);
  expect(runtime).toEqual([]);
});

