// The handful of things you do to an item, written once so the Now page, the
// lists and the detail sheet all behave the same.

import { frontOfQueue, thisMonth } from './catalogue.js';
import { atIsJustCount, currentProgress, currentTotal } from './progress.js';

export function actions(shelf, items) {
  const backOfQueue = (cat) =>
    Math.max(0, ...items.filter((i) => i.cat === cat && i.status === 'next' && i.order != null).map((i) => i.order)) + 1;

  const setStatus = (item, status) => {
    const fields = { status };
    if (status === 'done') fields.finished = item.finished ?? thisMonth();
    if (status === 'active') fields.started = item.started ?? thisMonth();
    if (status === 'next') fields.order = item.status === 'next' && item.order != null ? item.order : backOfQueue(item.cat);
    else fields.order = undefined;
    shelf.patch(item.id, fields);
  };

  return {
    setStatus,
    start: (item) => setStatus(item, 'active'),
    finish: (item) => setStatus(item, 'done'),
    queueFirst: (item) => shelf.patch(item.id, { status: 'next', order: frontOfQueue(items, item.cat) }),
    bump: (item, by = 1) => {
      // A count kept only as text ("pg 215 / 350") becomes real numbers on the
      // first step, and the text goes if it said nothing else.
      const total = currentTotal(item);
      const raw = Math.max(0, currentProgress(item) + by);
      const fields = { progress: total ? Math.min(raw, total) : raw };
      if (!item.total && total) fields.total = total;
      if (item.progress == null && atIsJustCount(item.at)) fields.at = undefined;
      shelf.patch(item.id, fields);
    },
    set: (item, fields) => shelf.patch(item.id, fields),
    /** Back to exactly what the data files say, or gone if it was added here. */
    reset: (item) => shelf.put(item.id, null),
  };
}
