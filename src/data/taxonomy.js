// Shared vocabulary for genres, statuses and sources.
// Genres are derived from the data so adding a book with a new genre just works;
// GENRE_ORDER only controls which ones lead the filter row.

import { books } from './books.js';

const GENRE_ORDER = [
  'Classic',
  'Literary',
  'Russian',
  'Japanese',
  'SciFi',
  'Fantasy',
  'Philosophy',
  'Nonfiction',
];

export const GENRE_LABELS = {
  SciFi: 'Sci-fi',
};

export const genres = [...new Set(books.map((b) => b.genre))].sort((a, b) => {
  const ia = GENRE_ORDER.indexOf(a);
  const ib = GENRE_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
});

export const statuses = [
  { id: 'read', label: 'Read ✓', suffix: ' ✓' },
  { id: 'owned', label: 'Owned', suffix: ' (owned)' },
  { id: 'next', label: 'Up next', suffix: ' →' },
  { id: 'todo', label: 'To read', suffix: '' },
];

export const sources = [
  { id: 'gr', label: 'Goodreads' },
  { id: 'lit', label: '/lit/' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'sales', label: 'Sales' },
  { id: 'critics', label: 'Critics' },
  { id: 'booktok', label: 'BookTok' },
];

export const sorts = [
  { id: 'score', label: 'Score' },
  { id: 'rating', label: 'GR rating' },
  { id: 'copies', label: 'Copies sold' },
  { id: 'words', label: 'Length' },
  { id: 'year', label: 'Year' },
  { id: 'title', label: 'A–Z' },
];

export const genreLabel = (g) => GENRE_LABELS[g] ?? g;
export const genreClass = (g) => `t-${g.replace(/[^a-zA-Z]/g, '')}`;
export const statusSuffix = (s) => statuses.find((x) => x.id === s)?.suffix ?? '';
