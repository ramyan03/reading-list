import { genreClass, genreLabel, statusSuffix } from '../data/taxonomy.js';
import { copiesStr, wordsStr, yearStr } from '../lib/format.js';

export default function BookCard({ book }) {
  const isRead = book.status === 'read';

  return (
    <article className={`book-card${isRead ? ' read' : ''}`}>
      <div className={`status-bar s-${book.status}`} />

      <div className="book-info">
        <h2 className={`book-title${isRead ? ' read-title' : ''}`}>
          {book.title}
          {statusSuffix(book.status)}
        </h2>
        <p className="book-author">
          {book.author} · {yearStr(book.year)}
        </p>
        <div className="book-tags">
          <span className={`tag ${genreClass(book.genre)}`}>{genreLabel(book.genre)}</span>
        </div>
        <p className="book-note">{book.note}</p>
        <div className="source-dots">
          {book.sources.map((s) => (
            <span key={s} className={`dot dot-${s}`} title={s} />
          ))}
        </div>
      </div>

      <div className="book-nums">
        <div className="gr-rating">★ {book.rating.toFixed(2)}</div>
        <div className="copies">{copiesStr(book.copies)}</div>
        <div className="wordcount">{wordsStr(book.words)}</div>
      </div>
    </article>
  );
}
