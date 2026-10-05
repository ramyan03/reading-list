/**
 * How far through, 0-100, from progress and total when both are known,
 * otherwise read out of the free text: "pg 215 / 350" or "About 20% in".
 * Null when there is nothing to go on.
 */
export function percent(item) {
  if (item.total) return Math.min(100, Math.round(((item.progress ?? 0) / item.total) * 100));
  const at = item.at ?? '';
  const frac = at.match(/(\d+)\s*\/\s*(\d+)/);
  if (frac && Number(frac[2])) return Math.min(100, Math.round((Number(frac[1]) / Number(frac[2])) * 100));
  const pc = at.match(/(\d+)\s*%/);
  return pc ? Math.min(100, Number(pc[1])) : null;
}

/** "pg 215 / 350" or "ep 4/12" in the free text, as numbers. */
export function parsedAt(item) {
  const m = (item.at ?? '').match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { progress: Number(m[1]), total: Number(m[2]) } : null;
}

/** Where a counter should start: the number if set, else what the text says. */
export const currentProgress = (item) => item.progress ?? parsedAt(item)?.progress ?? 0;
export const currentTotal = (item) => item.total ?? parsedAt(item)?.total;

/** True when the free text says nothing but the count, so the numbers can replace it. */
export const atIsJustCount = (at) => /^\s*(?:pg|p\.|page|ep|eps|ch|ch\.)?\s*\d+\s*\/\s*\d+\s*(?:pages|pg|eps|ch)?\s*$/i.test(at ?? '');
