import { useMemo, useState } from 'react';
import { STATUSES, TIERS, statusLabel } from '../data/categories.js';
import { MEDIA_SORTS, selectMedia } from '../lib/select.js';
import AddItem from './AddItem.jsx';
import ItemLine from './ItemLine.jsx';

const FINISHED_PREVIEW = 30;

function Facet({ label, options, value, onChange }) {
  return (
    <div className="facet">
      <span className="facet-label">{label}</span>
      <div className="facet-options">
        {options.map((o) => (
          <button key={o.id} type="button" className={value === o.id ? 'is-on' : ''} onClick={() => onChange(o.id)}>
            {o.label}
            {o.n != null && <span className="facet-n"> {o.n}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * One medium. Opens on what is still to do; finished and dropped are one tap
 * away. Sorted by queue, the list is grouped by status so it reads top to
 * bottom as now, next, later, done.
 */
export default function MediaView({ cat, items, onOpen, shelf }) {
  const [state, setState] = useState({ query: '', status: 'open', tier: 'all', sort: 'queue' });
  const [showAllDone, setShowAllDone] = useState(false);
  const [adding, setAdding] = useState(false);
  const update = (patch) => setState((s) => ({ ...s, ...patch }));

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
    <>
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
                placeholder={`Search ${cat.label.toLowerCase()}`}
                value={state.query}
                onChange={(e) => update({ query: e.target.value })}
                aria-label={`Search ${cat.label.toLowerCase()}`}
              />
            </div>
            <div className="controls-actions">
              <span className="count">
                <b>{visible.length}</b> {cat.label.toLowerCase()}
              </span>
              {shelf.canEdit && (
                <button type="button" className="refine-toggle" aria-expanded={adding} onClick={() => setAdding((a) => !a)}>
                  Add
                </button>
              )}
            </div>
          </div>
          <div className="refine is-inline">
            <Facet label="Show" options={statusOptions} value={state.status} onChange={(status) => update({ status })} />
            {hasTiers && (
              <Facet
                label="Tier"
                options={[{ id: 'all', label: 'Any' }, ...TIERS]}
                value={state.tier}
                onChange={(tier) => update({ tier })}
              />
            )}
            <Facet label="Sort" options={MEDIA_SORTS} value={state.sort} onChange={(sort) => update({ sort })} />
          </div>
          {adding && <AddItem cat={cat} shelf={shelf} onDone={() => setAdding(false)} />}
        </div>
      </div>

      <main className="page">
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
            <section key={g.id} className="block">
              {grouped && (
                <h2 className="block-title">
                  {statusLabel(g.id, cat.id)} <span>{g.list.length}</span>
                </h2>
              )}
              <div className="lines">
                {list.map((item, i) => (
                  <ItemLine key={item.id} item={item} onOpen={onOpen} rank={g.id === 'next' ? i + 1 : undefined} />
                ))}
              </div>
              {capped && (
                <button type="button" className="more" onClick={() => setShowAllDone(true)}>
                  Show all {g.list.length}
                </button>
              )}
            </section>
          );
        })}
      </main>
    </>
  );
}
