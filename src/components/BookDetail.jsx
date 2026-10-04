import { useEffect } from 'react';
import { coverUrl } from '../data/covers.js';
import { reviewUrl } from '../data/reviews.js';
import { genreLabel, sources as SOURCES } from '../data/taxonomy.js';
import { breakdown } from '../lib/score.js';
import { copiesStr, wordsStr, yearStr } from '../lib/format.js';
import Editor from './Editor.jsx';

export default function BookDetail({ book, weights, onClose, shelf, items }) {
  useEffect(() => {
    if (!book) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [book, onClose]);

  if (!book) return null;

  const rows = breakdown(book, weights).filter((r) => r.weight > 0);
  // Signals with no data drop out of the average, so out of the total too.
  const weightSum = rows.filter((r) => !r.missing).reduce((n, r) => n + r.weight, 0);
  const anyMissing = rows.some((r) => r.missing);
  const src = coverUrl(book.coverId, 'L');
  const review = reviewUrl(book.id);

  return (
    <div className="detail-wrap" role="dialog" aria-modal="true" aria-label={book.title}>
      <div className="detail-scrim" onClick={onClose} />

      <div className="detail">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          Close
        </button>

        <div className="detail-top">
          <div className="detail-art">
            {src ? (
              <img src={src} alt="" />
            ) : (
              <div className="book-art-fallback">
                <span>{book.title}</span>
              </div>
            )}
          </div>

          <div className="detail-head">
            <p className="detail-genre">{genreLabel(book.genre)}</p>
            <h2 className="detail-title">{book.title}</h2>
            <p className="detail-author">
              {book.author}
              {book.year != null && ` · ${yearStr(book.year)}`}
            </p>

            {book.note && <p className="detail-note">{book.note}</p>}

            <div className="detail-facts">
              {book.rating != null && <span>{book.rating.toFixed(2)} on Goodreads</span>}
              <span>{copiesStr(book.copies)}</span>
              <span>{wordsStr(book.words)}</span>
            </div>

            <div className="detail-sources">
              {SOURCES.filter((s) => book.sources?.includes(s.id)).map((s) => (
                <span key={s.id}>{s.label}</span>
              ))}
            </div>

            {/*
              Metadata, not a call to action: one line in the same register as
              the source list above it. It only exists for books that actually
              have a review, so it never reads as an advert for the other site.
            */}
            {review && (
              <p className="detail-review">
                <a href={review}>Read my review &rarr;</a>
              </p>
            )}

            <Editor item={book} shelf={shelf} items={items} />
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
                if (r.missing) {
                  return (
                    <tr key={r.id} className="is-missing">
                      <td>{r.label}</td>
                      <td className="bd-num">–</td>
                      <td className="bd-num">{r.weight}</td>
                      <td className="bd-num">no data</td>
                    </tr>
                  );
                }
                const share = (r.contribution / (weightSum * 100)) * 100;
                return (
                  <tr key={r.id}>
                    <td>{r.label}</td>
                    <td className="bd-num">{r.value.toFixed(0)}</td>
                    <td className="bd-num">{r.weight}</td>
                    <td>
                      <span className="bd-share">
                        <span className="bd-bar" style={{ '--pct': `${share}%` }} />
                        <span className="bd-num">{share.toFixed(1)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="detail-formula">
            Value times weight, divided by total weight ({weightSum}).
            {anyMissing && ' Signals with no data for this book are left out.'}
          </p>
        </div>
      </div>
    </div>
  );
}
