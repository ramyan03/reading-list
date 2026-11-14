// One edit to one item, worked out the way the app's buttons do it, so
// scripts/shelf.mjs (the command line) and scripts/apply-updates.mjs (CSV
// files applied at deploy) can't drift apart.
//
// Same side effects as setStatus in src/lib/actions.js: status=done stamps
// finished, status=active stamps started, status=next goes to the back of the
// queue. A value of null drops that override, so the data file's value shows
// again.

import { EDITABLE, thisMonth } from '../src/lib/catalogue.js';

/** "null" -> null, numbers -> numbers, everything else stays text. */
export const parseValue = (v) => {
  const s = String(v).trim();
  if (s === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
};

/**
 * The new stored record for `id` after setting `fields`, or null when nothing
 * is left overridden. Throws with a readable message on a bad id or field.
 */
export function buildRecord(items, recs, id, fields) {
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error(`No item with id ${id}`);
  for (const k of Object.keys(fields)) {
    if (!EDITABLE.includes(k)) throw new Error(`${k} is not editable. Editable: ${EDITABLE.join(', ')}`);
  }
  fields = { ...fields };

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
  return Object.keys(rec).length ? rec : null;
}
