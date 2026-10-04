// Weighted recommendation score.
//
// Every book is reduced to a set of signals normalised to 0-100, then combined
// as a weighted average. Weights are the personalisation: turn /lit/ up and
// BookTok down and the list re-ranks around what you actually care about.
//
// A weighted average (not a sum) means the score stays on a 0-100 scale no
// matter how the weights are set, so books stay comparable across presets.

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

/**
 * A signal is null when the book has no data for it (books added from the
 * master list never had sources or an editorial score assigned). Null drops out
 * of the average entirely, which is fairer than scoring the gap as zero.
 */
const known = (v, f) => (v == null ? null : f(v));
const has = (b, src) => known(b.sources, (s) => (s.includes(src) ? 100 : 0));

/** Map a value in [lo, hi] onto 0-100, clamped outside that band. */
const band = (value, lo, hi) => clamp(((value - lo) / (hi - lo)) * 100);

/**
 * Copies sold spans 1M to 500M, so a linear scale would put everything except
 * Don Quixote at the bottom. Log scale keeps the middle legible.
 */
const logBand = (value, lo, hi) =>
  !value ? 0 : band(Math.log(value) , Math.log(lo), Math.log(hi));

export const SIGNALS = [
  {
    id: 'editorial',
    label: 'Editorial score',
    group: 'Judgement',
    hint: 'The hand-assigned 0-100 rating already in the list',
    of: (b) => known(b.score, clamp),
  },
  {
    id: 'rating',
    label: 'Goodreads rating',
    group: 'Judgement',
    hint: 'Normalised across the 3.6-4.4 band where these books actually sit',
    of: (b) => known(b.rating, (r) => band(r, 3.6, 4.4)),
  },
  {
    id: 'breadth',
    label: 'Source breadth',
    group: 'Judgement',
    hint: 'How many of the six sources feature it at all',
    of: (b) => known(b.sources, (s) => (s.length / 6) * 100),
  },
  {
    id: 'lit',
    label: '/lit/',
    group: 'Taste',
    hint: 'Present on 4chan /lit/ charts',
    of: (b) => has(b, 'lit'),
  },
  {
    id: 'critics',
    label: 'Critics',
    group: 'Taste',
    hint: 'Present on critical best-of lists',
    of: (b) => has(b, 'critics'),
  },
  {
    id: 'reddit',
    label: 'Reddit',
    group: 'Taste',
    hint: 'Recommended across book subreddits',
    of: (b) => has(b, 'reddit'),
  },
  {
    id: 'booktok',
    label: 'BookTok',
    group: 'Taste',
    hint: 'Driven by BookTok and social',
    of: (b) => has(b, 'booktok'),
  },
  {
    id: 'sales',
    label: 'Copies sold',
    group: 'Reach',
    hint: 'Log scale from 1M to 500M',
    of: (b) => known(b.copies, (c) => logBand(c, 1, 500)),
  },
  {
    id: 'brevity',
    label: 'Brevity',
    group: 'Practical',
    hint: 'Rewards books you can actually finish. Turn negative-ish by zeroing it',
    of: (b) => known(b.words, (w) => 100 - band(w, 20000, 450000)),
  },
  {
    id: 'recency',
    label: 'Recency',
    group: 'Practical',
    hint: 'Rewards the modern end of the list',
    of: (b) => known(b.year, (y) => band(y, 1850, 2021)),
  },
];

export const SIGNAL_GROUPS = [...new Set(SIGNALS.map((s) => s.group))];

export const DEFAULT_WEIGHTS = {
  editorial: 70,
  rating: 55,
  breadth: 45,
  lit: 55,
  critics: 50,
  reddit: 25,
  booktok: 10,
  sales: 20,
  brevity: 25,
  recency: 10,
};

export const PRESETS = {
  Balanced: DEFAULT_WEIGHTS,
  // Editorial score correlates with almost everything, so it is held low here
  // on purpose: otherwise this preset just reproduces Balanced.
  Literary: {
    editorial: 25, rating: 30, breadth: 15, lit: 100, critics: 90,
    reddit: 0, booktok: 0, sales: 0, brevity: 0, recency: 0,
  },
  Popular: {
    editorial: 30, rating: 80, breadth: 60, lit: 0, critics: 20,
    reddit: 80, booktok: 70, sales: 90, brevity: 30, recency: 60,
  },
  'Quick wins': {
    editorial: 60, rating: 55, breadth: 30, lit: 30, critics: 30,
    reddit: 30, booktok: 15, sales: 20, brevity: 100, recency: 35,
  },
  Canon: {
    editorial: 90, rating: 50, breadth: 80, lit: 70, critics: 100,
    reddit: 20, booktok: 0, sales: 40, brevity: 0, recency: 0,
  },
};

/** Per-signal contributions for one book, for the breakdown UI. */
export function breakdown(book, weights) {
  return SIGNALS.map((s) => {
    const weight = weights[s.id] ?? 0;
    const value = s.of(book);
    return { ...s, weight, value, missing: value == null, contribution: (value ?? 0) * weight };
  });
}

export function weightedScore(book, weights) {
  let total = 0;
  let weightSum = 0;
  for (const s of SIGNALS) {
    const w = weights[s.id] ?? 0;
    const v = s.of(book);
    if (!w || v == null) continue;
    total += v * w;
    weightSum += w;
  }
  // Nothing weighted and known: fall back to editorial, or the bottom.
  return weightSum === 0 ? clamp(book.score ?? 0) : total / weightSum;
}

export function scoreAll(books, weights) {
  return books.map((b) => ({ ...b, weighted: weightedScore(b, weights) }));
}
