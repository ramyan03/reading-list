import { coverUrl } from '../data/covers.js';
import { hasReview } from '../data/reviews.js';

/**
 * One book in the catalogue.
 *
 * Reading state is carried by weight and opacity rather than by a badge or a
 * coloured bar: finished books recede because they are done, the one being read
 * is the only place the accent is spent, and everything unread sits at its
 * natural brightness. Only the two states that need naming get a word above the
 * title, so a screen of "TO READ" labels never appears.
 */

const STATE_LABEL = { next: 'Reading', owned: 'On the shelf' };

export default function BookCard({ book, onOpen }) {
  const src = coverUrl(book.coverId, 'M');
  const label = STATE_LABEL[book.status];
  const reviewed = hasReview(book.id);

  return (
    <article className={`book is-${book.status}`}>
      <button type="button" className="book-hit" onClick={() => onOpen(book)}>
        <span className="sr-only">{`Open ${book.title}`}</span>
      </button>

      <div className="book-art">
        {src ? (
          <img src={src} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="book-art-fallback">
            <span>{book.title}</span>
          </div>
        )}
      </div>

      <div className="book-meta">
        {label && <span className="book-state">{label}</span>}

        <h2 className="book-title">{book.title}</h2>
        <p className="book-author">{book.author}</p>

        <p className="book-score">
          {book.weighted.toFixed(0)}
          {book.status === 'read' && ' · finished'}
          {reviewed && <span className="book-review-mark"> · reviewed</span>}
        </p>
      </div>
    </article>
  );
}
