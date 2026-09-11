import { genreLabel } from '../data/taxonomy.js';
import { copiesStr, wordsStr, yearStr } from '../lib/format.js';
import { useReveal } from '../hooks/useReveal.js';

export default function BookRow({ book, rank, onOpen }) {
  const [ref, shown] = useReveal();

  return (
    <article
      ref={ref}
      className={`row${shown ? ' is-shown' : ''} s-${book.status}`}
      style={{ '--delay': `${(rank % 16) * 25}ms` }}
    >
      <button type="button" className="row-hit" onClick={() => onOpen(book)} data-cursor>
        <span className="row-rank">{String(rank + 1).padStart(3, '0')}</span>

        <span className="row-main">
          <span className="row-title">
            {book.title}
            {book.favourite && <i className="row-fav">★</i>}
          </span>
          <span className="row-author">
            {book.author} · {yearStr(book.year)}
          </span>
        </span>

        <span className="row-genre">{genreLabel(book.genre)}</span>
        <span className="row-num">★ {book.rating.toFixed(2)}</span>
        <span className="row-num row-hide-sm">{copiesStr(book.copies)}</span>
        <span className="row-num row-hide-sm">{wordsStr(book.words)}</span>

        <span className="row-score">
          <span className="row-score-bar" style={{ '--pct': `${book.weighted}%` }} />
          <span className="row-score-num">{book.weighted.toFixed(1)}</span>
        </span>
      </button>
    </article>
  );
}
