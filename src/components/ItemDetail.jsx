import { useEffect } from 'react';
import { category, tierLabel } from '../data/categories.js';
import { progressText } from '../lib/catalogue.js';
import Editor from './Editor.jsx';

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

  return (
    <div className="detail-wrap" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="detail-scrim" onClick={onClose} />
      <div className="detail">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          Close
        </button>

        <p className="detail-genre">{cat.one}</p>
        <h2 className="detail-title">{item.title}</h2>
        {item.note && <p className="detail-note">{item.note}</p>}
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
