import { useState } from 'react';
import { CATEGORIES, tierLabel } from '../data/categories.js';
import { queueCmp } from '../lib/catalogue.js';
import { Icon, Logo } from './Icons.jsx';
import Poster from './Poster.jsx';

const PREVIEW = 8;

/** What "in the backlog" means everywhere on the home page: queued or waiting. */
export const isBacklog = (i) => i.status === 'next' || i.status === 'backlog';

function Group({ cat, list, open, onToggle, onOpen }) {
  const shown = list.slice(0, PREVIEW);
  return (
    <div className={`bk${open ? ' is-open' : ''}`} style={{ '--cat': cat.color }}>
      <div className="bk-head">
        <button type="button" className="bk-toggle" onClick={onToggle} aria-expanded={open}>
          <span className="bk-icon">
            <Icon name={cat.id} size={18} />
          </span>
          <span className="bk-label">{cat.label}</span>
          <span className="bk-count">{list.length} items</span>
        </button>
        <a className="bk-view" href={`#${cat.route}`}>
          View
        </a>
        <button type="button" className="bk-chev" onClick={onToggle} aria-label={`${open ? 'Collapse' : 'Expand'} ${cat.label}`}>
          <Icon name="chevron" size={16} />
        </button>
      </div>
      {open && (
        <ul className="bk-list">
          {shown.length === 0 && <li className="quiet">Nothing waiting.</li>}
          {shown.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onOpen(item)}>
                <Poster item={item} size="S" className="is-thumb" showTitle={false} />
                <span className="bk-title">{item.title}</span>
                <span className="bk-meta">
                  {[item.status === 'next' ? 'Up next' : tierLabel(item.tier), item.hrs && `~${item.hrs}h`].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
          {list.length > PREVIEW && (
            <li>
              <a className="bk-all" href={`#${cat.route}`}>
                All {list.length} {cat.label.toLowerCase()} <Icon name="arrow" size={14} />
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/** Every category's backlog as a collapsible row, two columns wide, with the totals beside it. */
export default function BacklogBoard({ items, onOpen, title = 'All Backlog', subtitle, startOpen = false }) {
  const [open, setOpen] = useState(() => (startOpen ? new Set(CATEGORIES.map((c) => c.id)) : new Set()));
  const allOpen = open.size === CATEGORIES.length;

  const toggle = (id) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const groups = CATEGORIES.map((cat) => ({
    cat,
    list: items.filter((i) => i.cat === cat.id && isBacklog(i)).sort(queueCmp),
  }));
  const half = Math.ceil(groups.length / 2);

  const total = items.length;
  const done = items.filter((i) => i.status === 'done').length;
  const remaining = items.filter((i) => i.status !== 'done' && i.status !== 'dropped').length;

  const column = (gs) => (
    <div className="bk-col">
      {gs.map((g) => (
        <Group key={g.cat.id} {...g} open={open.has(g.cat.id)} onToggle={() => toggle(g.cat.id)} onOpen={onOpen} />
      ))}
    </div>
  );

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="section-tools">
          <button
            type="button"
            className={`view-all${allOpen ? ' is-up' : ''}`}
            onClick={() => setOpen(allOpen ? new Set() : new Set(CATEGORIES.map((c) => c.id)))}
          >
            {allOpen ? 'Collapse all' : 'Expand all'} <Icon name="chevron" size={14} />
          </button>
        </div>
      </div>

      <div className="bk-layout">
        {column(groups.slice(0, half))}
        {column(groups.slice(half))}
        <aside className="stats">
          <p className="stats-quote">"Good media builds a better you."</p>
          <span className="stats-mark">
            <Logo size={26} />
          </span>
          <dl>
            <div>
              <dt>Total items</dt>
              <dd>{total}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>{done}</dd>
            </div>
            <div>
              <dt>Remaining</dt>
              <dd>{remaining}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
