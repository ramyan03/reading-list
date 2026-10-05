// The kinds of thing tracked, the words each one uses, and its colour on the
// home page cards, progress bars and kickers.

export const CATEGORIES = [
  { id: 'book', label: 'Books', one: 'Book', active: 'Reading', unit: 'pages', route: 'books', color: '#3b6fe0' },
  { id: 'show', label: 'Shows', one: 'Show', active: 'Watching', unit: 'eps', route: 'shows', color: '#7656e3' },
  { id: 'film', label: 'Films', one: 'Film', active: 'Watching', unit: null, route: 'films', color: '#5f6f8a' },
  { id: 'anime', label: 'Anime', one: 'Anime', active: 'Watching', unit: 'eps', route: 'anime', color: '#1fa394' },
  { id: 'manga', label: 'Manga', one: 'Manga', active: 'Reading', unit: 'ch', route: 'manga', color: '#e0506a' },
  { id: 'game', label: 'Games', one: 'Game', active: 'Playing', unit: null, route: 'games', color: '#e2733a' },
  { id: 'comic', label: 'Comics', one: 'Comic', active: 'Reading', unit: 'issues', route: 'comics', color: '#d9a823' },
];

export const category = (id) => CATEGORIES.find((c) => c.id === id);
export const categoryByRoute = (route) => CATEGORIES.find((c) => c.route === route);

/**
 * One status vocabulary for everything. Books used to mix ownership into it
 * (read / owned / next / to read); owning a copy is now its own field, shelf.
 */
export const STATUSES = [
  { id: 'active', label: 'In progress' },
  { id: 'next', label: 'Up next' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'paused', label: 'Paused' },
  { id: 'done', label: 'Finished' },
  { id: 'dropped', label: 'Dropped' },
];

/** "In progress" reads better as the verb the medium uses. */
export const statusLabel = (status, cat) =>
  status === 'active' ? category(cat)?.active ?? 'In progress' : STATUSES.find((s) => s.id === status)?.label ?? status;

export const TIERS = [
  { id: 'must', label: 'Must' },
  { id: 'good', label: 'Good' },
  { id: 'burner', label: 'Back burner' },
  { id: 'skip', label: 'Optional' },
];
export const tierLabel = (t) => TIERS.find((x) => x.id === t)?.label ?? '';
export const tierRank = (t) => {
  const i = TIERS.findIndex((x) => x.id === t);
  return i === -1 ? TIERS.length : i;
};

export const SHELVES = [
  { id: 'owned', label: 'Owned' },
  { id: 'gift', label: 'Gift' },
  { id: 'buy', label: 'To buy' },
];
export const shelfLabel = (s) => SHELVES.find((x) => x.id === s)?.label ?? '';
