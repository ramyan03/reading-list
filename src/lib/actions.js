// The handful of things you do to an item, written once so the Now page, the
// lists and the detail sheet all behave the same.

import { frontOfQueue, thisMonth } from './catalogue.js';

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
      const progress = Math.max(0, (item.progress ?? 0) + by);
      shelf.patch(item.id, { progress: item.total ? Math.min(progress, item.total) : progress });
    },
    set: (item, fields) => shelf.patch(item.id, fields),
    /** Back to exactly what the data files say, or gone if it was added here. */
    reset: (item) => shelf.put(item.id, null),
  };
}
