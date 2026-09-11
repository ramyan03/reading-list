// localStorage helpers. Every access is wrapped because storage throws outright
// in some privacy modes rather than just returning null.

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Full, blocked or unavailable. Losing a preference is not worth breaking on.
  }
};

const WEIGHTS = 'rl.weights';
const SHELF = 'rl.shelf';

export const loadWeights = (fallback) => read(WEIGHTS, fallback);
export const saveWeights = (w) => write(WEIGHTS, w);

/**
 * Personal state, keyed by book id: { status, favourite }.
 * Only overrides are stored, so books.js stays the source of truth for the rest.
 */
export const loadShelf = () => read(SHELF, {});
export const saveShelf = (s) => write(SHELF, s);
