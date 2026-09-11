import { genreLabel, genres, sorts, sources, statuses } from '../data/taxonomy.js';

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="filter-row">
      <span className="row-label">{label}</span>
      <button
        type="button"
        className={`pill${value === 'all' ? ' active' : ''}`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`pill${value === o.id ? ' active' : ''}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Controls({ state, update, onSort }) {
  return (
    <div className="controls">
      <input
        type="search"
        placeholder="Search title or author…"
        value={state.query}
        onChange={(e) => update({ query: e.target.value })}
        aria-label="Search title or author"
      />

      <FilterRow
        label="Genre"
        options={genres.map((g) => ({ id: g, label: genreLabel(g) }))}
        value={state.genre}
        onChange={(genre) => update({ genre })}
      />
      <FilterRow
        label="Status"
        options={statuses}
        value={state.status}
        onChange={(status) => update({ status })}
      />
      <FilterRow
        label="Source"
        options={sources}
        value={state.source}
        onChange={(source) => update({ source })}
      />

      <div className="sort-row">
        <span className="row-label">Sort</span>
        {sorts.map((s) => {
          const active = state.sort === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`sort-btn${active ? ' active' : ''}`}
              onClick={() => onSort(s.id)}
            >
              {s.label}
              {active ? (state.sortDir === -1 ? ' ↓' : ' ↑') : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
