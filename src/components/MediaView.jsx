import { useMemo, useState } from 'react';
import { STATUSES, TIERS, statusLabel } from '../data/categories.js';
import { actions } from '../lib/actions.js';
import { MEDIA_SORTS, selectMedia } from '../lib/select.js';
import AddItem from './AddItem.jsx';
import CategoryHero from './CategoryHero.jsx';
import { Icon } from './Icons.jsx';
import PosterTile from './PosterTile.jsx';

const FINISHED_PREVIEW = 24;

function Chips({ label, options, value, onChange }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className={value === o.id ? 'is-on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
          {o.n != null && <span>{o.n}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * One medium: the hero, then everything as a poster grid. Sorted by queue the
 * grid is grouped by status, so it reads top to bottom as now, next, later,
 * done; any other sort is one flat grid.
 */
export default function MediaView({ cat, items, onOpen, shelf }) {
  const [state, setState] = useState({ query: '', status: 'open', tier: 'all', sort: 'queue' });
  const [showAllDone, setShowAllDone] = useState(false);
  const [adding, setAdding] = useState(false);
  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const act = actions(shelf, items);

  const mine = useMemo(() => items.filter((i) => i.cat === cat.id), [items, cat.id]);
  const visible = useMemo(() => selectMedia(mine, state), [mine, state]);
  const n = (s) => mine.filter((i) => i.status === s).length;

  const statusOptions = [
    { id: 'open', label: 'To do', n: mine.filter((i) => i.status !== 'done' && i.status !== 'dropped').length },
    ...STATUSES.filter((s) => n(s.id) > 0).map((s) => ({ id: s.id, label: statusLabel(s.id, cat.id), n: n(s.id) })),
    { id: 'all', label: 'All', n: mine.length },
  ];
  const hasTiers = mine.some((i) => i.tier);

  const grouped = state.sort === 'queue';
  const groups = grouped
    ? STATUSES.map((s) => ({ ...s, list: visible.filter((i) => i.status === s.id) })).filter((g) => g.list.length)
    : [{ id: 'all', list: visible }];

  return (
    <main className="cat-page">
      <CategoryHero cat={cat} mine={mine} onOpen={onOpen} act={act} canEdit={shelf.canEdit} />

      <div className="cat-tools">
        <div className="cat-tools-row">
          <label className="cat-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder={`Search ${cat.label.toLowerCase()}`}
              value={state.query}
              onChange={(e) => update({ query: e.target.value })}
              aria-label={`Search ${cat.label.toLowerCase()}`}
            />
          </label>
          <label className="select">
            <span className="sr-only">Sort</span>
            <select value={state.sort} onChange={(e) => update({ sort: e.target.value })}>
              {MEDIA_SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
            <Icon name="chevron" size={14} />
          </label>
          {hasTiers && (
            <label className="select">
              <span className="sr-only">Tier</span>
              <select value={state.tier} onChange={(e) => update({ tier: e.target.value })}>
                <option value="all">Any tier</option>
                {TIERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon name="chevron" size={14} />
            </label>
          )}
          {shelf.canEdit && (
            <button type="button" className="btn is-quiet" aria-expanded={adding} onClick={() => setAdding((a) => !a)}>
              <Icon name="plus" size={14} /> Add
            </button>
          )}
        </div>
        <Chips label="Show" options={statusOptions} value={state.status} onChange={(status) => update({ status })} />
        {adding && <AddItem cat={cat} shelf={shelf} onDone={() => setAdding(false)} />}
      </div>

      {visible.length === 0 && (
        <p className="empty">
          Nothing here.{' '}
          <button type="button" onClick={() => update({ query: '', status: 'all', tier: 'all' })}>
            Show everything
          </button>
        </p>
      )}

      {groups.map((g) => {
        const capped = g.id === 'done' && !showAllDone && g.list.length > FINISHED_PREVIEW;
        const list = capped ? g.list.slice(0, FINISHED_PREVIEW) : g.list;
        return (
          <section key={g.id} className="cat-group">
            {grouped && (
              <h2 className="cat-group-title">
                {statusLabel(g.id, cat.id)} <span>{g.list.length}</span>
              </h2>
            )}
            <div className="tiles">
              {list.map((item, i) => (
                <PosterTile
                  key={item.id}
                  item={item}
                  onOpen={onOpen}
                  act={act}
                  canEdit={shelf.canEdit}
                  rank={g.id === 'next' ? i + 1 : undefined}
                />
              ))}
            </div>
            {capped && (
              <button type="button" className="btn is-quiet cat-more" onClick={() => setShowAllDone(true)}>
                Show all {g.list.length} finished
              </button>
            )}
          </section>
        );
      })}
    </main>
  );
}
