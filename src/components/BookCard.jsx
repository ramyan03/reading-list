import { coverUrl } from '../data/covers.js';
import { genreLabel } from '../data/taxonomy.js';
import { useReveal } from '../hooks/useReveal.js';

export default function BookCard({ book, rank, onOpen, onToggleFavourite }) {
  const [ref, shown] = useReveal();
  const src = coverUrl(book.coverId, 'M');

  return (
    <article
      ref={ref}
      className={`card${shown ? ' is-shown' : ''} s-${book.status}`}
      style={{ '--delay': `${(rank % 12) * 40}ms` }}
    >
      <button type="button" className="card-hit" onClick={() => onOpen(book)} data-cursor>
        <span className="sr-only">{`Open ${book.title}`}</span>
      </button>

      <div className="card-cover">
        {src ? (
          <img src={src} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="card-cover-fallback">
            <span>{book.title}</span>
          </div>
        )}
        <span className="card-rank">{String(rank + 1).padStart(2, '0')}</span>
        <span className="card-score">{book.weighted.toFixed(0)}</span>
      </div>

      <div className="card-meta">
        <h3 className="card-title">{book.title}</h3>
        <p className="card-author">{book.author}</p>
        <p className="card-genre">{genreLabel(book.genre)}</p>
      </div>

      <button
        type="button"
        className={`card-fav${book.favourite ? ' is-on' : ''}`}
        onClick={() => onToggleFavourite(book.id)}
        aria-label={book.favourite ? 'Remove from favourites' : 'Add to favourites'}
        aria-pressed={!!book.favourite}
      >
        ★
      </button>
    </article>
  );
}
