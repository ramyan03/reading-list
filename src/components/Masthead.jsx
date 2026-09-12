import { REVIEWS_ORIGIN } from '../data/reviews.js';

/**
 * Replaces the old full-screen hero.
 *
 * Reads is the utility half of the pair, and a screen of oversized type before
 * the first book is the wrong trade for something you open to look something
 * up. The name, one line, and the numbers, then the list starts. The link over
 * to Reviews sits here as a piece of masthead metadata rather than as a banner.
 */
export default function Masthead({ total, read, reading, authors }) {
  return (
    <header className="masthead">
      <h1 className="masthead-title">Ramyan Reads</h1>

      <p className="masthead-lede">
        Every book worth reading, gathered from Goodreads, /lit/, Reddit, critics, sales and
        BookTok, then ranked by a score I can tune.
      </p>

      <div className="masthead-meta">
        <span className="count">
          <b>{total}</b> books
        </span>
        <span className="count">
          <b>{authors}</b> authors
        </span>
        <span className="count">
          <b>{read}</b> finished
        </span>
        {reading > 0 && (
          <span className="count">
            <b>{reading}</b> reading now
          </span>
        )}
        <span className="count">
          <a className="masthead-link" href={REVIEWS_ORIGIN}>
            Reviews
          </a>
        </span>
      </div>
    </header>
  );
}
