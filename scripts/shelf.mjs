// Read and edit the live shelf from the command line, the way the app does.
// The /reads-recommend and /reads-update Claude skills call this.
//
//   node scripts/shelf.mjs state            what is on the go, up next, this month's plan
//   node scripts/shelf.mjs find <words>     item ids whose title matches
//   node scripts/shelf.mjs set <id> field=value ... [--dry-run]
//
// Add --local to talk to `npm run dev` (http://localhost:5173, key "dev")
// instead of ramyan-reads.vercel.app. Writing to the live site needs EDIT_KEY,
// from READS_EDIT_KEY in the environment or EDIT_KEY in .env.local.
//
// `set` follows src/lib/actions.js: status=done stamps finished, status=active
// stamps started, status=next goes to the back of the queue. field=null drops
// that override, so the data file's value shows again.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { books } from '../src/data/books.js';
import { media } from '../src/data/media.js';
import { DOOMSDAY, PLAN } from '../src/data/plan.js';
import { CATEGORIES } from '../src/data/categories.js';
import { EDITABLE, buildCatalogue, thisMonth, upNext } from '../src/lib/catalogue.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const local = args.includes('--local');
const dryRun = args.includes('--dry-run');
const [cmd, ...rest] = args.filter((a) => !a.startsWith('--'));
const API = local ? 'http://localhost:5173/api/shelf' : 'https://ramyan-reads.vercel.app/api/shelf';

const out = (x) => console.log(JSON.stringify(x, null, 1));
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

async function records() {
  let res;
  try {
    res = await fetch(API);
  } catch {
    fail(`Could not reach ${API}${local ? ' (is npm run dev running?)' : ''}`);
  }
  if (res.status === 503) return { records: {}, synced: false };
  if (!res.ok) fail(`GET ${API} -> ${res.status}`);
  return { records: (await res.json()).records, synced: true };
}

function editKey() {
  if (local) return 'dev';
  if (process.env.READS_EDIT_KEY) return process.env.READS_EDIT_KEY;
  try {
    const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
    const m = env.match(/^EDIT_KEY=["']?(.+?)["']?\s*$/m);
    if (m) return m[1];
  } catch {}
  fail('No edit key: set READS_EDIT_KEY, or EDIT_KEY in reading-list/.env.local');
}

const slim = (i) =>
  Object.fromEntries(
    ['id', 'cat', 'title', 'author', 'status', 'progress', 'total', 'at', 'started', 'finished', 'myScore', 'tier', 'hrs', 'mine', 'note']
      .filter((k) => i[k] != null && i[k] !== '')
      .map((k) => [k, i[k]])
  );

async function state() {
  const { records: recs, synced } = await records();
  const items = buildCatalogue(books, media, recs);
  const byId = new Map(items.map((i) => [i.id, i]));
  const month = thisMonth();
  const today = new Date().toISOString().slice(0, 10);

  // This month and next from the plan, each line marked with how its items stand.
  const months = PLAN.flatMap((p) => p.months);
  const label = (ym) => new Date(`${ym}-15`).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const next = new Date(`${month}-15`);
  next.setMonth(next.getMonth() + 1);
  const wanted = [label(month), label(thisMonth(next))];
  const plan = months
    .filter((m) => wanted.includes(m.label))
    .map((m) => ({
      month: m.label,
      lines: m.lines.map((l) => ({
        ...l,
        items: (l.ids ?? []).map((id) => ({ id, status: byId.get(id)?.status ?? 'missing' })),
        ids: undefined,
      })),
    }));

  const doomsday = items.filter((i) => i.project === DOOMSDAY.project);
  out({
    today,
    synced,
    syncNote: synced ? undefined : 'Sync is not set up (/api/shelf 503): this is the baseline only, app edits are missing.',
    active: items.filter((i) => i.status === 'active').map(slim),
    upNext: Object.fromEntries(CATEGORIES.map((c) => [c.id, upNext(items, c.id, 3).map((i) => ({ ...slim(i), suggested: i.suggested }))])),
    plan,
    deadline: {
      ...DOOMSDAY,
      daysLeft: Math.ceil((new Date(DOOMSDAY.date) - new Date(today)) / 864e5),
      items: doomsday.map((i) => ({ id: i.id, title: i.title, status: i.status, progress: i.progress, total: i.total, hrs: i.hrs })),
    },
    recentlyFinished: items.filter((i) => i.status === 'done' && i.finished >= thisMonth(new Date(Date.now() - 62 * 864e5))).map(slim),
  });
}

async function find(words) {
  const { records: recs } = await records();
  const q = words.join(' ').toLowerCase();
  if (!q) fail('find needs some words');
  out(buildCatalogue(books, media, recs).filter((i) => i.title.toLowerCase().includes(q)).map(slim));
}

const parse = (v) => {
  if (v === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
};

async function set(id, pairs) {
  if (!id || !pairs.length) fail('Usage: set <id> field=value ...');
  const { records: recs, synced } = await records();
  if (!synced) fail('Sync is not set up on the site (/api/shelf returns 503), so there is nowhere to save.');
  const items = buildCatalogue(books, media, recs);
  const item = items.find((i) => i.id === id);
  if (!item) fail(`No item with id ${id}. Try: node scripts/shelf.mjs find <title words>`);

  const fields = {};
  for (const p of pairs) {
    const at = p.indexOf('=');
    if (at < 1) fail(`Expected field=value, got ${p}`);
    const k = p.slice(0, at);
    if (!EDITABLE.includes(k)) fail(`${k} is not editable. Editable: ${EDITABLE.join(', ')}`);
    fields[k] = parse(p.slice(at + 1));
  }

  // Same side effects as setStatus in src/lib/actions.js.
  if ('status' in fields && fields.status !== item.status) {
    const s = fields.status;
    if (s === 'done' && !('finished' in fields)) fields.finished = item.finished ?? thisMonth();
    if (s === 'active' && !('started' in fields)) fields.started = item.started ?? thisMonth();
    if (s === 'next' && !('order' in fields)) {
      fields.order = Math.max(0, ...items.filter((i) => i.cat === item.cat && i.status === 'next' && i.order != null).map((i) => i.order)) + 1;
    } else if (s !== 'next' && !('order' in fields)) fields.order = null;
  }
  if (item.total && typeof fields.progress === 'number') fields.progress = Math.min(Math.max(0, fields.progress), item.total);

  const rec = { ...(recs[id] ?? {}) };
  for (const [k, v] of Object.entries(fields)) {
    if (v === null) delete rec[k];
    else rec[k] = v;
  }
  const record = Object.keys(rec).length ? rec : null;

  if (dryRun) return out({ id, before: recs[id] ?? null, after: record });

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Key': editKey() },
    body: JSON.stringify({ changes: { [id]: record } }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) fail(`POST ${API} -> ${res.status} ${body.error ?? ''}`);
  out({ ok: true, id, title: item.title, saved: record });
}

if (cmd === 'state') await state();
else if (cmd === 'find') await find(rest);
else if (cmd === 'set') await set(rest[0], rest.slice(1));
else fail('Usage: node scripts/shelf.mjs state | find <words> | set <id> field=value ... [--local] [--dry-run]');
