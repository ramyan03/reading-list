// Filtering + sorting for the book list. Pure, so it is easy to test later.

const comparators = {
  score: (a, b) => a.score - b.score,
  rating: (a, b) => a.rating - b.rating,
  copies: (a, b) => (a.copies || 0) - (b.copies || 0),
  words: (a, b) => (a.words || 0) - (b.words || 0),
  year: (a, b) => a.year - b.year,
  title: (a, b) => a.title.localeCompare(b.title),
};

export function selectBooks(books, { query, genre, status, source, sort, sortDir }) {
  const q = query.trim().toLowerCase();

  const filtered = books.filter((b) => {
    if (genre !== 'all' && b.genre !== genre) return false;
    if (status !== 'all' && b.status !== status) return false;
    if (source !== 'all' && !b.sources.includes(source)) return false;
    if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    return true;
  });

  const cmp = comparators[sort] ?? comparators.score;
  return filtered.sort((a, b) => cmp(a, b) * sortDir);
}
