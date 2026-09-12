import { genreLabel } from '../data/taxonomy.js';
import { hasReview } from '../data/reviews.js';
import { yearStr } from '../lib/format.js';

/** The dense view. Same information, one line per book, for scanning. */
export default function BookRow({ book, rank, onOpen }) {
  return (
    <article className={`row is-${book.status}`}>
      <button type="button" className="row-hit" onClick={() => onOpen(book)}>
        <span className="row-rank">{String(rank + 1).padStart(2, '0')}</span>

        <span className="row-main">
          <span className="row-title">{book.title}</span>
          <span className="row-author">
            {book.author} · {yearStr(book.year)}
            {hasReview(book.id) && ' · reviewed'}
          </span>
        </span>

        <span className="row-genre">{genreLabel(book.genre)}</span>
        <span className="row-num">{book.rating.toFixed(2)}</span>
        <span className="row-score">{book.weighted.toFixed(1)}</span>
      </button>
    </article>
  );
}
