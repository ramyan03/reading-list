import { useState } from 'react';
import { CATEGORIES, TIERS, category, tierLabel } from '../data/categories.js';
import { queueCmp } from '../lib/catalogue.js';
import Poster from './Poster.jsx';
import Rail from './Rail.jsx';

const RAIL = 24;
const GROUP_KEY = 'rl.pileGroup';

/** What "in the backlog" means everywhere: queued or waiting. */
export const isBacklog = (i) => i.status === 'next' || i.status === 'backlog';

const shortestFirst = (a, b) => (a.hrs ?? 9999) - (b.hrs ?? 9999) || queueCmp(a, b);

function loadGroup() {
  try {
    return localStorage.getItem(GROUP_KEY) === 'category' ? 'category' : 'tier';
  } catch {
    return 'tier';
  }
}

/** The pile, grouped by tier (up next first) or by category. */
function groupsFor(list, by) {
  if (by === 'category') {
    return CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      color: cat.color,
      href: `#${cat.route}`,
      list: list.filter((i) => i.cat === cat.id).sort((a, b) => (b.status === 'next') - (a.status === 'next') || queueCmp(a, b)),
    }));
  }
  const next = list.filter((i) => i.status === 'next');
  const rest = list.filter((i) => i.status !== 'next');
  return [
    { id: 'next', label: 'Up next', list: next.sort(queueCmp) },
    ...TIERS.map((t) => ({ id: t.id, label: t.label, list: rest.filter((i) => i.tier === t.id).sort(shortestFirst) })),
    { id: 'none', label: 'No tier yet', list: rest.filter((i) => !i.tier).sort(shortestFirst) },
  ];
}

function PileTile({ item, onOpen, showCat }) {
  const cat = category(item.cat);
  // Grouped by tier the tier is the heading, so say the medium; grouped by
  // medium, say where it sits in the queue instead.
  const where = showCat ? cat.one : item.status === 'next' ? 'Up next' : item.tier && tierLabel(item.tier);
  const meta = [where, item.hrs && `~${item.hrs}h`].filter(Boolean).join(' · ');
  return (
    <button type="button" className="pile-tile" style={{ '--cat': cat.color }} onClick={() => onOpen(item)}>
      <Poster item={item} size="M" />
      <span className="pile-title">{item.title}</span>
      <span className="pile-meta">{meta || cat.one}</span>
    </button>
  );
}

/**
 * Everything queued or waiting, as rails of posters. Grouped by tier by
 * default, so the musts come first whatever they are; switch to by category to
 * see each medium's own pile. The choice is remembered on this device.
 */
export default function BacklogBoard({ items, onOpen, title = 'Backlog' }) {
  const [by, setBy] = useState(loadGroup);
  const choose = (value) => {
    setBy(value);
    try {
      localStorage.setItem(GROUP_KEY, value);
    } catch {
      // Remembering is a nicety; the page works without it.
    }
  };

  const pile = items.filter(isBacklog);
  const groups = groupsFor(pile, by).filter((g) => g.list.length);

  const done = items.filter((i) => i.status === 'done').length;
  const scored = items.filter((i) => i.myScore != null);
  const avg = scored.length ? (scored.reduce((t, i) => t + i.myScore, 0) / scored.length).toFixed(1) : null;
  const stats = [
    ['waiting', pile.length],
    ['up next', pile.filter((i) => i.status === 'next').length],
    ['finished', done],
    avg && ['avg score', avg],
  ].filter(Boolean);

  return (
    <section className="rd-page pile" aria-label={title}>
      <header className="rd-head pile-head">
        <p className="rd-eyebrow">{title} · by {by}</p>
        <h1 className="rd-title">
          The <em style={{ '--em': category('show').color }}>pile</em>
        </h1>
        <div className="seg" role="group" aria-label="Group the pile">
          <button type="button" aria-pressed={by === 'tier'} onClick={() => choose('tier')}>
            By tier
          </button>
          <button type="button" aria-pressed={by === 'category'} onClick={() => choose('category')}>
            By category
          </button>
        </div>
      </header>

      <dl className="rd-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dd>{value}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>

      {groups.map((g) => (
        <section key={g.id} className="pile-group" style={g.color ? { '--cat': g.color } : undefined}>
          <div className="pile-group-head">
            <h2 className="rd-h2">
              {g.label} <span>{g.list.length}</span>
            </h2>
            {g.href && (
              <a className="rd-more" href={g.href}>
                ( All {g.label.toLowerCase()} )
              </a>
            )}
          </div>
          <Rail>
            {g.list.slice(0, RAIL).map((item) => (
              <PileTile key={item.id} item={item} onOpen={onOpen} showCat={by === 'tier'} />
            ))}
          </Rail>
        </section>
      ))}
      {groups.length === 0 && <p className="quiet">The pile is empty.</p>}
    </section>
  );
}
