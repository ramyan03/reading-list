import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, category, tierLabel } from '../data/categories.js';
import { actions } from '../lib/actions.js';
import { Icon } from './Icons.jsx';
import Poster from './Poster.jsx';

const LENGTHS = [
  { id: 'any', label: 'Any length' },
  { id: 'short', label: 'Under 5h', test: (h) => h < 5 },
  { id: 'mid', label: 'Under 15h', test: (h) => h < 15 },
  { id: 'long', label: 'Long haul', test: (h) => h >= 15 },
];

const PRIORITIES = [
  { id: 'any', label: 'Anything waiting' },
  { id: 'next', label: 'Up next', test: (i) => i.status === 'next' },
  { id: 'must', label: 'Musts', test: (i) => i.tier === 'must' },
];

/** Rough hours: the item's own estimate, or for books the words at ~250 a minute. */
export const hoursOf = (i) => i.hrs ?? (i.words ? Math.max(1, Math.round(i.words / 15000)) : null);

/** Queued things count three times, musts twice, so the dice lean toward the plan. */
const weight = (i) => (i.status === 'next' ? 3 : i.tier === 'must' ? 2 : 1);

function roll(pool, avoid) {
  const choices = pool.length > 1 ? pool.filter((i) => i.id !== avoid) : pool;
  let r = Math.random() * choices.reduce((t, i) => t + weight(i), 0);
  for (const i of choices) {
    r -= weight(i);
    if (r < 0) return i;
  }
  return choices.at(-1) ?? null;
}

function Chips({ label, options, value, onChange }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={value === o.id ? 'is-on' : ''}
          style={o.color ? { '--cat': o.color } : undefined}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The dice: one thing to start, drawn from what is queued or waiting (never
 * skips, never anything already on the go), filtered by kind, length and how
 * much it matters. Weighted toward the queue, and a re-roll never repeats.
 */
export default function PickNext({ open, onClose, items, shelf, onOpen }) {
  const [filters, setFilters] = useState({ cat: 'any', length: 'any', priority: 'any' });
  const [pick, setPick] = useState(null);

  const pool = useMemo(() => {
    const length = LENGTHS.find((l) => l.id === filters.length);
    const priority = PRIORITIES.find((p) => p.id === filters.priority);
    return items.filter((i) => {
      if (i.status !== 'next' && i.status !== 'backlog') return false;
      if (i.tier === 'skip') return false;
      if (filters.cat !== 'any' && i.cat !== filters.cat) return false;
      if (priority.test && !priority.test(i)) return false;
      if (length.test) {
        const h = hoursOf(i);
        if (h == null || !length.test(h)) return false;
      }
      return true;
    });
  }, [items, filters]);

  // A fresh draw whenever the panel opens or the filters change, but not when
  // the shelf does: starting the pick takes it out of the pool, and it should stay.
  useEffect(() => {
    if (open) setPick(roll(pool, null));
  }, [open, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  // The drawn item as it is now, so a Start shows straight away.
  const item = pick && (items.find((i) => i.id === pick.id) ?? pick);
  const cat = item && category(item.cat);
  const hours = item && hoursOf(item);
  const facts = item && [cat.one, item.status === 'next' ? 'Up next' : tierLabel(item.tier), hours && `~${hours}h`, item.author].filter(Boolean);
  const started = item?.status === 'active';

  return (
    <div className="gate-wrap" role="dialog" aria-modal="true" aria-labelledby="pick-title">
      <div className="gate-scrim" onClick={onClose} />
      <div className="pick">
        <header className="pick-head">
          <h2 id="pick-title">
            <span aria-hidden="true">🎲</span> Pick my next
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="plus" size={18} className="is-x" />
          </button>
        </header>

        <div className="pick-filters">
          <Chips
            label="Kind"
            options={[{ id: 'any', label: 'Any' }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, color: c.color }))]}
            value={filters.cat}
            onChange={(cat) => set({ cat })}
          />
          <Chips label="Length" options={LENGTHS} value={filters.length} onChange={(length) => set({ length })} />
          <Chips label="Priority" options={PRIORITIES} value={filters.priority} onChange={(priority) => set({ priority })} />
        </div>

        {item ? (
          <div className="pick-card" style={{ '--cat': cat.color }} key={item.id}>
            <Poster item={item} size="M" className="pick-art" />
            <div className="pick-body">
              <p className="pick-kicker">{facts.join(' · ')}</p>
              <h3>{item.title}</h3>
              {(item.note || item.mine) && <p className="pick-note">{item.note || item.mine}</p>}
              <div className="pick-actions">
                {shelf.canEdit && (
                  <button type="button" className="btn" disabled={started} onClick={() => actions(shelf, items).start(item)}>
                    {started ? (
                      <>
                        <Icon name="check" size={14} /> Started
                      </>
                    ) : (
                      <>
                        <Icon name="play" size={13} /> Start now
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="btn is-quiet"
                  onClick={() => {
                    onClose();
                    onOpen(item);
                  }}
                >
                  Details
                </button>
                <button type="button" className="btn is-quiet" disabled={pool.length < 2} onClick={() => setPick(roll(pool, item.id))}>
                  🎲 Re-roll
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="pick-empty">Nothing waiting matches all three. Loosen a filter.</p>
        )}
        <p className="pick-pool">
          Drawing from {pool.length} {pool.length === 1 ? 'thing' : 'things'}, leaning toward your queue and musts.
        </p>
      </div>
    </div>
  );
}
