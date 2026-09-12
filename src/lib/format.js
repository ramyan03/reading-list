/* Placeholder is an en dash, not an em dash: the repo has none of the latter. */
export const copiesStr = (c) => (c ? `${c}M+ sold` : '–');
export const wordsStr = (w) => (w ? `${Math.round(w / 1000)}k words` : '–');
export const yearStr = (y) => (y < 0 ? `${Math.abs(y)}BC` : String(y));
