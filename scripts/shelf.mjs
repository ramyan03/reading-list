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
import { catalogue, shelfState, slim } from '../api/_state.js';
import { EDITABLE, thisMonth } from '../src/lib/catalogue.js';

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

async function state() {
  const { records: recs, synced } = await records();
  out(shelfState(recs, synced));
}

async function find(words) {
  const { records: recs } = await records();
  const q = words.join(' ').toLowerCase();
  if (!q) fail('find needs some words');
  out(catalogue(recs).filter((i) => i.title.toLowerCase().includes(q)).map(slim));
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
  const items = catalogue(recs);
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
