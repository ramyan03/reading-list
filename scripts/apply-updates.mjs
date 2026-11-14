// Applies CSV files in updates/ to the live shelf, as part of the Vercel build.
// This is how a Claude chat that can push to GitHub but can't reach the site
// saves progress: it commits a CSV, Vercel builds, the edits land in Upstash
// the same way the app's buttons would make them.
//
//   updates/2026-11-13.csv
//   # comments and blank lines are fine
//   id,field,value
//   anime-fullmetal-alchemist-brotherhood,status,done
//   anime-fullmetal-alchemist-brotherhood,myScore,9
//
// Rows apply in order, one field each; several rows can touch the same item.
// Field names and values follow scripts/shelf.mjs set (value null drops the
// override). Each file is applied once: its name and content hash are recorded
// in the Redis hash reads:applied, so redeploys skip it and an edited file
// applies again.
//
// It only writes on Vercel production builds. Elsewhere it does nothing, unless
// run by hand:
//
//   node scripts/apply-updates.mjs --local     apply to .data/shelf.json (npm run dev's store)
//   node scripts/apply-updates.mjs --dry-run   show what would change, write nothing
//
// It never fails the build: a bad row is reported in the build log and skipped,
// and if Upstash can't be reached the site still deploys.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fileStore, upstashStore } from '../api/_shelf.js';
import { catalogue } from '../api/_state.js';
import { buildRecord, parseValue } from './_edit.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'updates');
const args = process.argv.slice(2);
const local = args.includes('--local');
const dryRun = args.includes('--dry-run');
const lines = [];
const log = (...a) => {
  const msg = a.join(' ');
  lines.push(msg);
  console.log('[updates]', msg);
};
const APPLIED = 'reads:applied';

/** Rows of id, field, value. Quotes allowed around a value that has a comma. */
export function parseCsv(text) {
  const rows = [];
  text.split(/\r?\n/).forEach((line, n) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const m = t.match(/^([^,]+),([^,]+),(.*)$/);
    if (!m) return rows.push({ line: n + 1, error: `expected id,field,value: ${t}` });
    const [, id, field, raw] = m.map((s) => s.trim());
    if (id === 'id' && field === 'field') return; // header
    const value = /^".*"$/.test(raw) ? raw.slice(1, -1).replace(/""/g, '"') : raw;
    rows.push({ line: n + 1, id, field, value: parseValue(value) });
  });
  return rows;
}

function stores() {
  if (local) {
    const shelf = fileStore(path.join(root, '.data/shelf.json'), fs);
    const appliedPath = path.join(root, '.data/applied.json');
    const read = () => {
      try {
        return JSON.parse(fs.readFileSync(appliedPath, 'utf8'));
      } catch {
        return {};
      }
    };
    return {
      shelf,
      applied: {
        has: async (k) => k in read(),
        mark: async (k, v) => {
          fs.mkdirSync(path.dirname(appliedPath), { recursive: true });
          fs.writeFileSync(appliedPath, JSON.stringify({ ...read(), [k]: v }, null, 2));
        },
      },
    };
  }
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const call = async (cmd) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    return (await res.json()).result;
  };
  return {
    shelf: upstashStore(url, token),
    applied: {
      has: async (k) => (await call(['HEXISTS', APPLIED, k])) === 1,
      mark: async (k, v) => call(['HSET', APPLIED, k, JSON.stringify(v)]),
    },
  };
}

// Production on Vercel. VERCEL_ENV is the usual signal; the branch is a backup
// in case system variables aren't exposed to the build.
const production = process.env.VERCEL_ENV === 'production' ||
  (process.env.VERCEL === '1' && !process.env.VERCEL_ENV && process.env.VERCEL_GIT_COMMIT_REF === 'main');

/**
 * What happened, published with the site as /updates-log.json so the snapshot
 * Action (and a chat reading the snapshot branch) can see it without build
 * logs. Names of variables only, never their values.
 */
function writeLog() {
  if (local || dryRun) return;
  const out = {
    at: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    hasUpstash: Boolean((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)),
    lines,
  };
  try {
    fs.mkdirSync(path.join(root, 'public'), { recursive: true });
    fs.writeFileSync(path.join(root, 'public/updates-log.json'), JSON.stringify(out, null, 2));
  } catch {}
}

async function main() {
  if (!local && !dryRun && !production) {
    log('not a Vercel production build, skipping');
    return;
  }
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.csv')).sort() : [];
  if (!files.length) return log('nothing in updates/');

  const s = stores();
  if (!s) return log('no Upstash credentials, skipping');

  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const key = `${file}:${createHash('sha256').update(text).digest('hex').slice(0, 12)}`;
    if (!dryRun && (await s.applied.has(key))) {
      log(`${file}: already applied`);
      continue;
    }

    // Fresh records for each file, so a later file sees an earlier one's edits.
    const recs = await s.shelf.all();
    const changes = {};
    const results = [];
    for (const row of parseCsv(text)) {
      if (row.error) {
        results.push(`line ${row.line}: skipped, ${row.error}`);
        continue;
      }
      // A record set to null is cleared: leave it out, as the store would.
      const current = Object.fromEntries(Object.entries({ ...recs, ...changes }).filter(([, r]) => r !== null));
      try {
        const items = catalogue(current);
        changes[row.id] = buildRecord(items, current, row.id, { [row.field]: row.value });
        results.push(`line ${row.line}: ${row.id} ${row.field}=${row.value}`);
      } catch (err) {
        results.push(`line ${row.line}: skipped, ${err.message}`);
      }
    }

    results.forEach((r) => log(`${file} ${r}`));
    if (dryRun) {
      log(`${file}: dry run, would save`, JSON.stringify(changes));
      continue;
    }
    const ids = Object.keys(changes);
    for (let i = 0; i < ids.length; i += 100) {
      await s.shelf.apply(Object.fromEntries(ids.slice(i, i + 100).map((id) => [id, changes[id]])));
    }
    await s.applied.mark(key, { at: new Date().toISOString(), results });
    log(`${file}: saved ${ids.length} item(s)`);
  }
}

main()
  .catch((err) => {
    // Never block a deploy over this; the next build retries the file.
    log(`failed, the site still deploys: ${err.message}`);
  })
  .finally(writeLog);
