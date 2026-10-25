import { useEffect } from 'react';
import { category, statusLabel, tierLabel } from '../data/categories.js';
import { progressText } from '../lib/catalogue.js';
import Editor from './Editor.jsx';
import { bigNumber, inkOn } from './NowCard.jsx';
import { percent } from '../lib/progress.js';
import Poster from './Poster.jsx';

/** Detail sheet for anything that is not a book. */
export default function ItemDetail({ item, onClose, shelf, items }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;
  const cat = category(item.cat);
  const facts = [
    item.tier && tierLabel(item.tier),
    item.hrs && `About ${item.hrs} hours`,
    progressText(item, cat.unit),
  ].filter(Boolean);
  const num = item.status === 'active' ? bigNumber(item) : null;
  const pct = item.status === 'active' ? percent(item) : null;

  return (
    <div className="detail-wrap" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="detail-scrim" onClick={onClose} />
      <div className="detail">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          Close
        </button>

        {/* The same solid card as the home page, so the sheet reads as that card opened up. */}
        <div className="detail-hero" style={{ '--cat': cat.color, '--on-cat': inkOn(cat.color) }}>
          <Poster item={item} size="L" className="detail-hero-art" showTitle={false} />
          <p className="now-kicker">{[cat.one, statusLabel(item.status, item.cat)].join(' · ')}</p>
          <h2 className="detail-title">{item.title}</h2>
          {num && (
            <p className="now-num">
              {num.value}
              <span>
                {num.of}
                {num.unit && ` ${num.unit}`}
              </span>
            </p>
          )}
          {item.note && <p className="detail-note">{item.note}</p>}
          {pct != null && (
            <span className="now-line" aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </span>
          )}
        </div>
        {facts.length > 0 && (
          <div className="detail-facts">
            {facts.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        )}

        <Editor item={item} shelf={shelf} items={items} />
      </div>
    </div>
  );
}
