import { useCountUp } from '../hooks/useCountUp.js';

function Stat({ value, label, suffix = '' }) {
  const n = useCountUp(value);
  return (
    <div className="stat">
      <span className="stat-value">
        {Math.round(n)}
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Hero({ total, read, authors, topBook, onExplore }) {
  return (
    <header className="hero">
      <div className="hero-mark">Personal index · est. 2026</div>

      <h1 className="hero-title">
        <span className="line l1">Reading</span>
        <span className="line l2">
          List<em>.</em>
        </span>
      </h1>

      <p className="hero-lede">
        Every book worth reading, pulled from Goodreads, /lit/, Reddit, critics, sales figures
        and BookTok, then ranked by a score you control.
      </p>

      <div className="hero-stats">
        <Stat value={total} label="books" />
        <Stat value={authors} label="authors" />
        <Stat value={read} label="read" />
        <Stat value={Math.round((read / total) * 100)} label="complete" suffix="%" />
      </div>

      {topBook && (
        <button type="button" className="hero-top" onClick={onExplore} data-cursor>
          <span className="hero-top-label">Top ranked right now</span>
          <span className="hero-top-title">{topBook.title}</span>
          <span className="hero-top-score">{topBook.weighted.toFixed(1)}</span>
        </button>
      )}

      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </header>
  );
}
