import { genreLabel, genres, sorts, sources, statuses } from '../data/taxonomy.js';

function Chips({ label, options, value, onChange }) {
  return (
    <div className="chips">
      <span className="chips-label">{label}</span>
      <div className="chips-row">
        <button
          type="button"
          className={`chip${value === 'all' ? ' is-on' : ''}`}
          onClick={() => onChange('all')}
        >
          All
        </button>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`chip${value === o.id ? ' is-on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({ state, update, view, setView, onOpenWeights, count }) {
  const activeFilters =
    (state.genre !== 'all') + (state.status !== 'all') + (state.source !== 'all');

  return (
    <div className="filterbar">
      <div className="filterbar-main">
        <div className="search">
          <svg viewBox="0 0 24 24" className="search-icon" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            type="search"
            placeholder="Search title or author"
            value={state.query}
            onChange={(e) => update({ query: e.target.value })}
            aria-label="Search title or author"
          />
        </div>

        <div className="filterbar-actions">
          <span className="result-count">
            <b>{count}</b> {count === 1 ? 'book' : 'books'}
          </span>

          <div className="viewtoggle" role="group" aria-label="View">
            <button
              type="button"
              className={view === 'grid' ? 'is-on' : ''}
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
            >
              Grid
            </button>
            <button
              type="button"
              className={view === 'index' ? 'is-on' : ''}
              onClick={() => setView('index')}
              aria-pressed={view === 'index'}
            >
              Index
            </button>
          </div>

          <button type="button" className="weights-open" onClick={onOpenWeights} data-cursor>
            Tune score
            <span className="weights-open-dot" />
          </button>
        </div>
      </div>

      <details className="filterbar-more">
        <summary>
          Filters {activeFilters > 0 && <span className="badge">{activeFilters}</span>}
        </summary>
        <div className="filterbar-drawer">
          <Chips
            label="Genre"
            options={genres.map((g) => ({ id: g, label: genreLabel(g) }))}
            value={state.genre}
            onChange={(genre) => update({ genre })}
          />
          <Chips
            label="Shelf"
            options={statuses}
            value={state.status}
            onChange={(status) => update({ status })}
          />
          <Chips
            label="Source"
            options={sources}
            value={state.source}
            onChange={(source) => update({ source })}
          />
          <div className="chips">
            <span className="chips-label">Sort</span>
            <div className="chips-row">
              {sorts.map((s) => {
                const on = state.sort === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`chip${on ? ' is-on' : ''}`}
                    onClick={() =>
                      update(
                        on
                          ? { sortDir: state.sortDir * -1 }
                          : { sort: s.id, sortDir: -1 }
                      )
                    }
                  >
                    {s.label}
                    {on ? (state.sortDir === -1 ? ' ↓' : ' ↑') : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
