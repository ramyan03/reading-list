// Filtering + sorting. Pure, so it runs under Node.

import { queueCmp } from './catalogue.js';

const comparators = {
  weighted: (a, b) => a.weighted - b.weighted,
  score: (a, b) => (a.score ?? -1) - (b.score ?? -1),
  rating: (a, b) => a.rating - b.rating,
  copies: (a, b) => (a.copies || 0) - (b.copies || 0),
  words: (a, b) => (a.words || 0) - (b.words || 0),
  year: (a, b) => a.year - b.year,
  title: (a, b) => a.title.localeCompare(b.title),
};

export function selectBooks(books, { query, genre, status, source, shelf, sort, sortDir }) {
  const q = query.trim().toLowerCase();

  const filtered = books.filter((b) => {
    if (genre !== 'all' && b.genre !== genre) return false;
    if (status !== 'all' && b.status !== status) return false;
    if (shelf !== 'all' && b.shelf !== shelf) return false;
    if (source !== 'all' && !b.sources?.includes(source)) return false;
    if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    return true;
  });

  const cmp = comparators[sort] ?? comparators.weighted;
  return filtered.sort((a, b) => cmp(a, b) * sortDir);
}

// ---------------------------------------------------------------- other media

const STATUS_ORDER = ['active', 'next', 'paused', 'backlog', 'done', 'dropped'];

const mediaComparators = {
  queue: (a, b) => {
    const s = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (s) return s;
    if (a.status === 'done') return (b.finished ?? '').localeCompare(a.finished ?? '') || (b.myScore ?? -1) - (a.myScore ?? -1);
    return queueCmp(a, b);
  },
  score: (a, b) => (b.myScore ?? -1) - (a.myScore ?? -1) || a.title.localeCompare(b.title),
  recent: (a, b) => (b.finished ?? '').localeCompare(a.finished ?? '') || a.title.localeCompare(b.title),
  hours: (a, b) => (a.hrs ?? 9999) - (b.hrs ?? 9999) || a.title.localeCompare(b.title),
  title: (a, b) => a.title.localeCompare(b.title),
};

export const MEDIA_SORTS = [
  { id: 'queue', label: 'Queue' },
  { id: 'score', label: 'My score' },
  { id: 'recent', label: 'Recent' },
  { id: 'hours', label: 'Shortest' },
  { id: 'title', label: 'A–Z' },
];

export function selectMedia(items, { query, status, tier, sort }) {
  const q = query.trim().toLowerCase();
  return items
    .filter((i) => {
      if (status === 'open' && (i.status === 'done' || i.status === 'dropped')) return false;
      if (status !== 'all' && status !== 'open' && i.status !== status) return false;
      if (tier !== 'all' && i.tier !== tier) return false;
      if (q && !i.title.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort(mediaComparators[sort] ?? mediaComparators.queue);
}
