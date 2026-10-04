// Invariants worth re-running after editing the data files: `npm run check`.
// Plain Node, no test framework; exits non-zero on the first failure.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileStore, handleShelf } from '../api/_shelf.js';
import { books } from '../src/data/books.js';
import { CATEGORIES, STATUSES, TIERS } from '../src/data/categories.js';
import { media } from '../src/data/media.js';
import { PLAN } from '../src/data/plan.js';
import { buildCatalogue, upNext } from '../src/lib/catalogue.js';
import { breakdown, DEFAULT_WEIGHTS, PRESETS, weightedScore } from '../src/lib/score.js';
import { selectMedia } from '../src/lib/select.js';

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`ok  ${name}`);
};

const all = buildCatalogue(books, media, {});

await check('ids are unique across books and media', () => {
  const seen = new Set();
  for (const i of all) {
    assert.ok(!seen.has(i.id), `duplicate id ${i.id}`);
    seen.add(i.id);
  }
});

await check('every item uses the known vocabulary', () => {
  const cats = new Set(CATEGORIES.map((c) => c.id));
  const statuses = new Set(STATUSES.map((s) => s.id));
  const tiers = new Set(TIERS.map((t) => t.id));
  for (const i of all) {
    assert.ok(cats.has(i.cat), `${i.id}: cat ${i.cat}`);
    assert.ok(statuses.has(i.status), `${i.id}: status ${i.status}`);
    if (i.tier) assert.ok(tiers.has(i.tier), `${i.id}: tier ${i.tier}`);
    if (i.finished) assert.match(i.finished, /^\d{4}-\d{2}$/, `${i.id}: finished ${i.finished}`);
    if (i.myScore != null) assert.ok(i.myScore >= 0 && i.myScore <= 10, `${i.id}: myScore ${i.myScore}`);
  }
});

await check('every plan line points at real items', () => {
  const ids = new Set(all.map((i) => i.id));
  for (const y of PLAN) for (const m of y.months) for (const l of m.lines) for (const id of l.ids) {
    assert.ok(ids.has(id), `${m.label}: unknown id ${id}`);
  }
});

await check('no em dashes in the data', () => {
  for (const f of ['books.js', 'media.js', 'plan.js']) {
    const src = fs.readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8');
    assert.ok(!src.includes('—'), `${f} has an em dash`);
  }
});

await check('score breakdown shares sum to the total, books with gaps included', () => {
  for (const weights of [DEFAULT_WEIGHTS, ...Object.values(PRESETS)]) {
    for (const b of books) {
      const rows = breakdown(b, weights).filter((r) => r.weight > 0 && !r.missing);
      const sum = rows.reduce((n, r) => n + r.weight, 0);
      if (!sum) continue;
      const total = rows.reduce((n, r) => n + r.contribution, 0) / sum;
      assert.ok(Math.abs(total - weightedScore(b, weights)) < 1e-9, `${b.id}`);
      assert.ok(Number.isFinite(weightedScore(b, weights)), `${b.id} not finite`);
    }
  }
});

await check('overrides lay over the baseline; custom items appear; hidden ones go', () => {
  const id = all.find((i) => i.cat === 'anime' && i.status === 'backlog').id;
  const victim = all.find((i) => i.cat === 'game').id;
  const out = buildCatalogue(books, media, {
    [id]: { status: 'active', progress: 3, title: 'not editable' },
    [victim]: { hidden: true },
    'u-show-test-1': { custom: true, cat: 'show', title: 'Test Show', status: 'next' },
  });
  const it = out.find((i) => i.id === id);
  assert.equal(it.status, 'active');
  assert.equal(it.progress, 3);
  assert.notEqual(it.title, 'not editable');
  assert.ok(!out.some((i) => i.id === victim));
  assert.ok(out.some((i) => i.id === 'u-show-test-1' && i.title === 'Test Show'));
});

await check('up next fills from the backlog when the queue is short', () => {
  for (const c of CATEGORIES) {
    const q = upNext(all, c.id);
    assert.ok(q.length <= 3);
    const queued = q.filter((i) => !i.suggested);
    assert.ok(queued.every((i) => i.status === 'next'));
    assert.ok(q.every((i) => i.tier !== 'skip'));
  }
  assert.equal(upNext(all, 'book')[0].title, "Charlotte's Web");
});

await check('the To do filter hides finished and dropped', () => {
  const open = selectMedia(all.filter((i) => i.cat === 'anime'), { query: '', status: 'open', tier: 'all', sort: 'queue' });
  assert.ok(open.length > 0 && open.every((i) => i.status !== 'done' && i.status !== 'dropped'));
  assert.equal(open[0].status, 'active');
});

await check('API: public read, keyed write, validation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shelf-'));
  const store = fileStore(path.join(dir, 'shelf.json'), fs);
  const KEY = 'secret';
  const post = (body, key) => handleShelf({ method: 'POST', headers: key ? { 'x-edit-key': key } : {}, body }, store, KEY);

  assert.equal((await post({ changes: { a: { status: 'done' } } })).status, 401);
  assert.equal((await post({ changes: { a: { status: 'done' } } }, 'wrong')).status, 401);
  assert.equal((await handleShelf({ method: 'POST', headers: { 'x-edit-key': 'x' }, body: { changes: {} } }, store, undefined)).status, 503);
  assert.equal((await post({ changes: { 'Bad Id!': {} } }, KEY)).status, 400);
  assert.equal((await post({ changes: { a: 'string' } }, KEY)).status, 400);
  assert.equal((await post({ changes: { a: { note: 'x'.repeat(5000) } } }, KEY)).status, 413);
  assert.equal((await post({ nothing: true }, KEY)).status, 400);

  assert.equal((await post({ changes: { a: { status: 'done' }, b: { status: 'next' } } }, KEY)).status, 200);
  assert.equal((await post({ changes: { b: null } }, KEY)).status, 200);
  const got = await handleShelf({ method: 'GET', headers: {} }, store, KEY);
  assert.deepEqual(got.json.records, { a: { status: 'done' } });
  assert.equal((await handleShelf({ method: 'DELETE', headers: {} }, store, KEY)).status, 405);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n${passed} checks passed. ${books.length} books, ${media.length} other items.`);
