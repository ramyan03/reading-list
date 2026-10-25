import { category, statusLabel, tierLabel } from '../data/categories.js';
import { currentProgress, currentTotal, percent } from '../lib/progress.js';
import { Icon } from './Icons.jsx';
import Poster from './Poster.jsx';

/** Dark or light text, whichever reads on the category colour. */
export function inkOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.22 ? '#0b0f17' : '#ffffff';
}

/**
 * The big number for something on the go: the count when there is one,
 * otherwise the percentage, otherwise nothing (the free text says it).
 */
export function bigNumber(item) {
  const cat = category(item.cat);
  const total = currentTotal(item);
  const at = currentProgress(item);
  if (total) return { value: at, of: `/${total}`, unit: cat.unit };
  if (at) return { value: at, of: '', unit: cat.unit };
  const pct = percent(item);
  return pct != null ? { value: pct, of: '%', unit: null } : null;
}

/**
 * The order on-the-go cards are dealt in: most recently started first, except
 * that the lead (the big cell) goes to the newest one with a count to show,
 * since a big card with no number in it is just a large empty colour.
 */
export function leadFirst(active) {
  const lead = active.find((i) => bigNumber(i)) ?? active[0];
  return lead ? [lead, ...active.filter((i) => i !== lead)] : [];
}

/**
 * One thing on the go, as a solid card in its category's colour: what it is,
 * a large count, a thin line for how far through, and the two things you do
 * to it most (one more, finished) when unlocked. The whole card opens the
 * detail sheet; the action buttons sit above that hit area.
 */
export default function NowCard({ item, index, onOpen, act, canEdit, size = 'md' }) {
  const cat = category(item.cat);
  const ink = inkOn(cat.color);
  const num = bigNumber(item);
  const pct = percent(item);
  const kicker = [
    index != null && `(${String(index + 1).padStart(2, '0')})`,
    cat.one,
    statusLabel(item.status, item.cat),
    item.tier === 'must' && tierLabel(item.tier),
  ]
    .filter(Boolean)
    .join(' · ');
  const step = cat.unit === 'pages' ? 10 : 1;

  return (
    <article className={`now-card is-${size}`} style={{ '--cat': cat.color, '--on-cat': ink }}>
      <button type="button" className="now-hit" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
      <Poster item={item} size="M" className="now-art" showTitle={false} />
      <p className="now-kicker">{kicker}</p>
      <h3 className="now-title">{item.title}</h3>
      {item.note && <p className="now-note">{item.note}</p>}

      <div className="now-foot">
        {num ? (
          <p className="now-num">
            {num.value}
            <span>
              {num.of}
              {num.unit && ` ${num.unit}`}
            </span>
          </p>
        ) : (
          <p className="now-at">{item.at || statusLabel(item.status, item.cat)}</p>
        )}
        {canEdit && (
          <span className="now-actions">
            {cat.unit && (
              <button type="button" onClick={() => act.bump(item, step)} aria-label={`${step} more ${cat.unit} of ${item.title}`}>
                +{step}
              </button>
            )}
            <button type="button" onClick={() => { act.finish(item); onOpen(item); }} aria-label={`Finished ${item.title}`}>
              <Icon name="check" size={16} />
            </button>
          </span>
        )}
      </div>
      {pct != null && (
        <span className="now-line" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
      )}
    </article>
  );
}
