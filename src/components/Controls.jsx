import { useState } from 'react';
import { genreLabel, genres, shelves, sorts, sources, statuses } from '../data/taxonomy.js';

/**
 * Search, count and view are always visible because they are what you reach
 * for. Everything else sits behind one Refine toggle, which keeps the bar a
 * rule with a few words on it rather than a dashboard toolbar, and keeps the
 * first screen of a 161 book list mostly books.
 */

function Facet({ label, options, value, onChange }) {
  return (
    <div className="facet">
      <span className="facet-label">{label}</span>
      <div className="facet-options">
        <button
          type="button"
          className={value === 'all' ? 'is-on' : ''}
          onClick={() => onChange('all')}
        >
          All
        </button>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={value === o.id ? 'is-on' : ''}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Controls({ state, update, view, setView, count, onOpenWeights, onAdd, adding, children }) {
  const [open, setOpen] = useState(false);

  const active =
    (state.genre !== 'all' ? 1 : 0) +
    (state.status !== 'all' ? 1 : 0) +
    (state.shelf !== 'all' ? 1 : 0) +
    (state.source !== 'all' ? 1 : 0);

  return (
    <div className="controls">
      <div className="controls-inner">
        <div className="controls-row">
          <div className="search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
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

          <div className="controls-actions">
            <span className="count">
              <b>{count}</b> {count === 1 ? 'book' : 'books'}
            </span>

            <div className="viewswitch" role="group" aria-label="View">
              <button
                type="button"
                className={view === 'grid' ? 'is-on' : ''}
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
              >
                Covers
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

            <button
              type="button"
              className="refine-toggle"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              Refine
              {active > 0 && <span className="refine-count">{active}</span>}
            </button>

            <button type="button" className="refine-toggle" onClick={onOpenWeights}>
              Scoring
            </button>

            {onAdd && (
              <button type="button" className="refine-toggle" aria-expanded={adding} onClick={onAdd}>
                Add
              </button>
            )}
          </div>
        </div>

        {open && (
          <div className="refine">
            <Facet
              label="Genre"
              options={genres.map((g) => ({ id: g, label: genreLabel(g) }))}
              value={state.genre}
              onChange={(genre) => update({ genre })}
            />
            <Facet
              label="Shelf"
              options={statuses}
              value={state.status}
              onChange={(status) => update({ status })}
            />
            <Facet
              label="Copy"
              options={shelves}
              value={state.shelf}
              onChange={(shelf) => update({ shelf })}
            />
            <Facet
              label="Source"
              options={sources}
              value={state.source}
              onChange={(source) => update({ source })}
            />
            <div className="facet">
              <span className="facet-label">Sort</span>
              <div className="facet-options">
                {sorts.map((s) => {
                  const on = state.sort === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={on ? 'is-on' : ''}
                      onClick={() =>
                        update(on ? { sortDir: state.sortDir * -1 } : { sort: s.id, sortDir: -1 })
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
        )}
        {children}
      </div>
    </div>
  );
}
