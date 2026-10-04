// The shelf: every change made in the app, keyed by item id.
//
// The data files in src/data are the baseline and never change at runtime.
// What is stored here is only what has been edited on top of them (a status, a
// score, a note) plus any items added in the app. One Redis hash, one field per
// item, so an edit on the phone and an edit on the laptop only collide if they
// touch the same item.
//
// Reading is public: the baseline is already in the public bundle, so hiding
// the overrides would protect nothing. Writing needs EDIT_KEY.
//
// Shared by api/shelf.js (Vercel) and the dev middleware in vite.config.js, so
// the same code runs locally against a JSON file and in production against
// Upstash. Files in api/ that start with an underscore are not deployed as
// routes.

import { createHash, timingSafeEqual } from 'node:crypto';

const HASH = 'reads:shelf';
const ID = /^[a-z0-9][a-z0-9-]{0,139}$/;
const MAX_RECORD = 4000; // bytes of JSON per item
const MAX_CHANGES = 200; // per request
const MAX_ITEMS = 10000; // total stored

/** Upstash's REST API, which works from a serverless function with plain fetch. */
export function upstashStore(url, token) {
  const call = async (body, path = '') => {
    const res = await fetch(url + path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    return res.json();
  };
  return {
    async all() {
      const { result } = await call(['HGETALL', HASH]);
      const out = {};
      for (let i = 0; i < result.length; i += 2) out[result[i]] = JSON.parse(result[i + 1]);
      return out;
    },
    async size() {
      return (await call(['HLEN', HASH])).result;
    },
    async apply(changes) {
      const cmds = Object.entries(changes).map(([id, rec]) =>
        rec === null ? ['HDEL', HASH, id] : ['HSET', HASH, id, JSON.stringify(rec)]
      );
      if (cmds.length) await call(cmds, '/pipeline');
    },
  };
}

/** A JSON file, for running locally without a database. */
export function fileStore(path, fs) {
  const load = () => {
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch {
      return {};
    }
  };
  return {
    async all() {
      return load();
    },
    async size() {
      return Object.keys(load()).length;
    },
    async apply(changes) {
      const data = load();
      for (const [id, rec] of Object.entries(changes)) {
        if (rec === null) delete data[id];
        else data[id] = rec;
      }
      fs.mkdirSync(path.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    },
  };
}

const digest = (s) => createHash('sha256').update(String(s)).digest();
const keyMatches = (given, expected) =>
  typeof given === 'string' && given.length > 0 && timingSafeEqual(digest(given), digest(expected));

/**
 * Framework-free handler: takes { method, headers, body } and returns
 * { status, json }. Headers are expected lower-cased.
 */
export async function handleShelf({ method, headers, body }, store, editKey) {
  if (method === 'GET') {
    return { status: 200, json: { records: await store.all() } };
  }

  if (method !== 'POST') return { status: 405, json: { error: 'Method not allowed' } };

  if (!editKey) return { status: 503, json: { error: 'Editing is not set up: EDIT_KEY is missing' } };
  if (!keyMatches(headers['x-edit-key'], editKey)) return { status: 401, json: { error: 'Wrong key' } };

  const changes = body?.changes;
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    return { status: 400, json: { error: 'Expected { changes: { id: record | null } }' } };
  }
  const entries = Object.entries(changes);
  if (entries.length > MAX_CHANGES) return { status: 413, json: { error: 'Too many changes at once' } };

  for (const [id, rec] of entries) {
    if (!ID.test(id)) return { status: 400, json: { error: `Bad id: ${id.slice(0, 40)}` } };
    if (rec === null) continue;
    if (typeof rec !== 'object' || Array.isArray(rec)) {
      return { status: 400, json: { error: `Record for ${id} must be an object` } };
    }
    if (JSON.stringify(rec).length > MAX_RECORD) return { status: 413, json: { error: `Record for ${id} is too large` } };
  }

  if (entries.some(([, rec]) => rec !== null) && (await store.size()) + entries.length > MAX_ITEMS) {
    return { status: 507, json: { error: 'Shelf is full' } };
  }

  await store.apply(changes);
  return { status: 200, json: { ok: true, applied: entries.length } };
}
