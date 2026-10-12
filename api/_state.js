// The shelf as one plain answer: baseline data with the stored edits laid over
// it, cut down to what you'd want to know before picking something up. Shared
// by /api/state (so anything that can fetch a URL can read it, e.g. a
// claude.ai skill) and scripts/shelf.mjs (the local Claude skills).

import { books } from '../src/data/books.js';
import { media } from '../src/data/media.js';
import { DOOMSDAY, PLAN } from '../src/data/plan.js';
import { CATEGORIES } from '../src/data/categories.js';
import { buildCatalogue, thisMonth, upNext } from '../src/lib/catalogue.js';

const FIELDS = ['id', 'cat', 'title', 'author', 'status', 'progress', 'total', 'at', 'started', 'finished', 'myScore', 'tier', 'hrs', 'mine', 'note'];

/** Only the fields that are set, so the JSON stays short enough to read. */
export const slim = (i) => Object.fromEntries(FIELDS.filter((k) => i[k] != null && i[k] !== '').map((k) => [k, i[k]]));

export const catalogue = (records) => buildCatalogue(books, media, records);

export function shelfState(records, synced = true, now = new Date()) {
  const items = catalogue(records);
  const byId = new Map(items.map((i) => [i.id, i]));
  // Toronto time, not the server's UTC, so an evening check is still today.
  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
  const month = today.slice(0, 7);

  // This month and next from the plan, each line marked with how its items stand.
  const label = (ym) => new Date(`${ym}-15`).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const next = new Date(`${month}-15`);
  next.setMonth(next.getMonth() + 1);
  const wanted = [label(month), label(thisMonth(next))];
  const plan = PLAN.flatMap((p) => p.months)
    .filter((m) => wanted.includes(m.label))
    .map((m) => ({
      month: m.label,
      lines: m.lines.map(({ ids, ...line }) => ({
        ...line,
        items: (ids ?? []).map((id) => ({ id, title: byId.get(id)?.title, status: byId.get(id)?.status ?? 'missing' })),
      })),
    }));

  const recentFrom = thisMonth(new Date(now.getTime() - 62 * 864e5));
  return {
    today,
    synced,
    syncNote: synced ? undefined : 'Sync is not set up: this is the baseline only, app edits are missing.',
    units: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.unit])),
    active: items.filter((i) => i.status === 'active').map(slim),
    upNext: Object.fromEntries(CATEGORIES.map((c) => [c.id, upNext(items, c.id, 3).map((i) => ({ ...slim(i), suggested: i.suggested }))])),
    plan,
    deadline: {
      ...DOOMSDAY,
      daysLeft: Math.ceil((new Date(DOOMSDAY.date) - new Date(today)) / 864e5),
      items: items
        .filter((i) => i.project === DOOMSDAY.project)
        .map((i) => ({ id: i.id, title: i.title, status: i.status, progress: i.progress, total: i.total, hrs: i.hrs })),
    },
    recentlyFinished: items.filter((i) => i.status === 'done' && i.finished >= recentFrom).map(slim),
  };
}
