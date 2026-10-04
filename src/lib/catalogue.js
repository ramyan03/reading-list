// Builds the one list everything else reads from: baseline data with the
// shelf laid over it. Pure, no React, so it runs under Node too.

import { tierRank } from '../data/categories.js';

/** Fields the app is allowed to change on a baseline item. */
export const EDITABLE = ['status', 'tier', 'shelf', 'hrs', 'progress', 'total', 'at', 'myScore', 'finished', 'order', 'mine', 'started'];

export function buildCatalogue(books, media, records) {
  const base = [...books.map((b) => ({ ...b, cat: 'book' })), ...media];
  const out = [];
  for (const item of base) {
    const rec = records[item.id];
    if (rec?.hidden) continue;
    out.push(rec ? { ...item, ...pick(rec), edited: true } : item);
  }
  for (const [id, rec] of Object.entries(records)) {
    if (rec.custom && rec.cat && rec.title) out.push({ ...rec, id });
  }
  return out;
}

const pick = (rec) => Object.fromEntries(EDITABLE.filter((k) => k in rec).map((k) => [k, rec[k]]));

/** Today as YYYY-MM, the resolution finished dates are kept at. */
export const thisMonth = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Ordering for "what next": explicit queue position, then tier, then shortest. */
export const queueCmp = (a, b) =>
  (a.order ?? 999) - (b.order ?? 999) ||
  tierRank(a.tier) - tierRank(b.tier) ||
  (a.hrs ?? 999) - (b.hrs ?? 999) ||
  a.title.localeCompare(b.title);

/**
 * Up to n things to start next in one category. The explicit queue comes
 * first; if it is short, the best of the backlog fills in, marked suggested.
 */
export function upNext(items, cat, n = 3) {
  const mine = items.filter((i) => i.cat === cat);
  const queued = mine.filter((i) => i.status === 'next').sort(queueCmp);
  if (queued.length >= n) return queued.slice(0, n);
  const fill = mine
    .filter((i) => i.status === 'backlog' && i.tier && i.tier !== 'skip')
    .sort(queueCmp)
    .slice(0, n - queued.length)
    .map((i) => ({ ...i, suggested: true }));
  return [...queued, ...fill];
}

/** Lowest queue position in a category, so "do this first" can go one under it. */
export const frontOfQueue = (items, cat) =>
  Math.min(0, ...items.filter((i) => i.cat === cat && i.status === 'next' && i.order != null).map((i) => i.order)) - 1;

export const progressText = (item, unit) => {
  const parts = [];
  if (item.progress != null && item.total) parts.push(`${item.progress} / ${item.total}${unit ? ` ${unit}` : ''}`);
  else if (item.progress) parts.push(`${unit === 'ch' ? 'Ch. ' : ''}${item.progress}${unit && unit !== 'ch' ? ` ${unit}` : ''}`);
  if (item.at) parts.push(item.at);
  return parts.join(' · ');
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthText = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
};

export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
