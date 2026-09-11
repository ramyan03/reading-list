import { useEffect } from 'react';
import { coverUrl } from '../data/covers.js';
import { genreLabel, sources as SOURCES, statuses } from '../data/taxonomy.js';
import { breakdown } from '../lib/score.js';
import { copiesStr, wordsStr, yearStr } from '../lib/format.js';

export default function BookDetail({ book, weights, onClose, onSetStatus, onToggleFavourite }) {
  useEffect(() => {
    if (!book) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    // Stop the list scrolling behind the overlay.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [book, onClose]);

  if (!book) return null;

  const rows = breakdown(book, weights).filter((r) => r.weight > 0);
  const weightSum = rows.reduce((n, r) => n + r.weight, 0);
  const src = coverUrl(book.coverId, 'L');

  return (
    <div className="detail-wrap" role="dialog" aria-modal="true" aria-label={book.title}>
      <div className="detail-scrim" onClick={onClose} />

      <div className="detail">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="detail-top">
          <div className="detail-cover">
            {src ? (
              <img src={src} alt="" />
            ) : (
              <div className="card-cover-fallback">
                <span>{book.title}</span>
              </div>
            )}
          </div>

          <div className="detail-head">
            <p className="detail-genre">{genreLabel(book.genre)}</p>
            <h2 className="detail-title">{book.title}</h2>
            <p className="detail-author">
              {book.author} · {yearStr(book.year)}
            </p>
            <p className="detail-note">{book.note}</p>

            <div className="detail-facts">
              <span>★ {book.rating.toFixed(2)} Goodreads</span>
              <span>{copiesStr(book.copies)}</span>
              <span>{wordsStr(book.words)}</span>
            </div>

            <div className="detail-sources">
              {SOURCES.filter((s) => book.sources.includes(s.id)).map((s) => (
                <span key={s.id} className={`src src-${s.id}`}>
                  {s.label}
                </span>
              ))}
            </div>

            <div className="detail-shelf">
              <span className="detail-shelf-label">Shelf</span>
              {statuses.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip${book.status === s.id ? ' is-on' : ''}`}
                  onClick={() => onSetStatus(book.id, s.id)}
                >
                  {s.label}
                </button>
              ))}
              <button
                type="button"
                className={`chip chip-fav${book.favourite ? ' is-on' : ''}`}
                onClick={() => onToggleFavourite(book.id)}
                aria-pressed={!!book.favourite}
              >
                ★ Favourite
              </button>
            </div>
          </div>
        </div>

        <div className="detail-score">
          <div className="detail-score-head">
            <h3>Weighted score</h3>
            <span className="detail-score-total">{book.weighted.toFixed(1)}</span>
          </div>

          <table className="breakdown">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Value</th>
                <th>Weight</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const share = (r.contribution / (weightSum * 100)) * 100;
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="bd-label">{r.label}</span>
                    </td>
                    <td className="bd-num">{r.value.toFixed(0)}</td>
                    <td className="bd-num">{r.weight}</td>
                    <td className="bd-share">
                      <span className="bd-bar" style={{ '--pct': `${share}%` }} />
                      <span className="bd-num">{share.toFixed(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="detail-formula">
            Sum of value × weight, divided by total weight ({weightSum}).
          </p>
        </div>
      </div>
    </div>
  );
}
