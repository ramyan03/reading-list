import { useState } from 'react';
import { category } from '../data/categories.js';
import { PLAN } from '../data/plan.js';
import { Icon } from './Icons.jsx';
import Poster from './Poster.jsx';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const SHOWN = 4;

/**
 * "October 2026" or "Jan to Feb 2027" as a range of month numbers counted
 * from year 0, so ranges compare with plain arithmetic.
 */
function span(label) {
  const year = Number(label.match(/\d{4}/)?.[0]);
  const names = label.toLowerCase().match(/[a-z]{3,}/g)?.filter((w) => MONTHS.includes(w.slice(0, 3))) ?? [];
  const first = MONTHS.indexOf(names[0]?.slice(0, 3));
  const last = MONTHS.indexOf(names.at(-1)?.slice(0, 3));
  return { from: year * 12 + first, to: year * 12 + last };
}

const shortLabel = (label) => label.replace(/\b([A-Z][a-z]{2})[a-z]+\b/g, '$1');

/** Every plan month, each with the items its lines name, in line order. */
export function planMonths(items) {
  const byId = new Map(items.map((i) => [i.id, i]));
  return PLAN.flatMap((y) => y.months).map((m) => {
    const rows = [];
    const seen = new Set();
    for (const line of m.lines) {
      const linked = line.ids.map((id) => byId.get(id)).filter(Boolean);
      if (!linked.length) rows.push({ key: line.text, line });
      for (const item of linked) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        rows.push({ key: item.id, item, line });
      }
    }
    return { ...m, ...span(m.label), rows };
  });
}

function Row({ row, onOpen }) {
  if (!row.item) {
    const cat = category(row.line.cat);
    return (
      <li className="tl-row is-text" style={{ '--cat': cat.color }}>
        <span className="tl-icon">
          <Icon name={cat.id} size={14} />
        </span>
        <span className="tl-name">
          {row.line.text} <em>({cat.one})</em>
        </span>
      </li>
    );
  }
  const { item } = row;
  return (
    <li className={`tl-row is-${item.status}`}>
      <button type="button" onClick={() => onOpen(item)} title={row.line.note ? `${row.line.text}. ${row.line.note}` : row.line.text}>
        <Poster item={item} size="S" className="is-thumb" showTitle={false} />
        <span className="tl-name">
          {item.title} <em>({category(item.cat).one})</em>
        </span>
        {item.status === 'done' && <Icon name="check" size={14} className="tl-done" />}
      </button>
    </li>
  );
}

function Column({ month, onOpen, expanded }) {
  const [all, setAll] = useState(expanded);
  const rows = all ? month.rows : month.rows.slice(0, SHOWN);
  const done = month.rows.filter((r) => r.item?.status === 'done').length;
  return (
    <section className="tl-col">
      <header>
        <h3>{shortLabel(month.label)}</h3>
        <p>
          {month.rows.length} items{done > 0 && ` · ${done} done`}
        </p>
      </header>
      <ul>
        {rows.map((r) => (
          <Row key={r.key} row={r} onOpen={onOpen} />
        ))}
      </ul>
      {month.rows.length > SHOWN && (
        <button type="button" className="tl-more" onClick={() => setAll((a) => !a)}>
          {all ? 'Show less' : `+ ${month.rows.length - SHOWN} more`}
        </button>
      )}
    </section>
  );
}

/** The plan as written: each line in words, with the items it names as chips. */
function PlanList({ months, onOpen }) {
  return (
    <div className="pl">
      {months.map((m) => (
        <section key={m.label} className="pl-month">
          <h3>{m.label}</h3>
          <ul>
            {m.lines.map((line, i) => {
              const linked = m.rows.filter((r) => r.line === line && r.item).map((r) => r.item);
              const isDone = linked.length > 0 && linked.every((x) => x.status === 'done');
              const cat = category(line.cat);
              return (
                <li key={i} className={isDone ? 'is-done' : ''} style={{ '--cat': cat.color }}>
                  <span className="pl-cat">{cat.one}</span>
                  <span className="pl-text">
                    {line.text}
                    {line.note && <span className="pl-note"> · {line.note}</span>}
                    {linked.length > 0 && (
                      <span className="pl-chips">
                        {linked.map((x) => (
                          <button key={x.id} type="button" className={`is-${x.status}`} onClick={() => onOpen(x)}>
                            {x.title}
                          </button>
                        ))}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * The plan as a row of month columns (scrolls sideways on a phone) or as the
 * written list. "Next 6 months" counts from this month, so old months drop
 * off on their own.
 */
export default function PlanBoard({ items, onOpen, title, subtitle, defaultRange = 'six', viewAll, expanded = false }) {
  const [mode, setMode] = useState('timeline');
  const [range, setRange] = useState(defaultRange);

  const now = new Date();
  const thisMonth = now.getFullYear() * 12 + now.getMonth();
  const months = planMonths(items).filter((m) =>
    range === 'all' ? true : m.to >= thisMonth && m.from < thisMonth + 6
  );

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="section-tools">
          <div className="seg" role="group" aria-label="Layout">
            <button type="button" className={mode === 'timeline' ? 'is-on' : ''} onClick={() => setMode('timeline')}>
              Timeline
            </button>
            <button type="button" className={mode === 'list' ? 'is-on' : ''} onClick={() => setMode('list')}>
              List
            </button>
          </div>
          <label className="select">
            <span className="sr-only">Range</span>
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="six">Next 6 months</option>
              <option value="all">Whole plan</option>
            </select>
            <Icon name="chevron" size={14} />
          </label>
          {viewAll && (
            <a className="view-all" href={viewAll}>
              View all <Icon name="arrow" size={14} />
            </a>
          )}
        </div>
      </div>

      {months.length === 0 ? (
        <p className="quiet">Nothing planned for these months yet. Add months to src/data/plan.js.</p>
      ) : mode === 'timeline' ? (
        <div className="tl">
          {months.map((m) => (
            <Column key={m.label} month={m} onOpen={onOpen} expanded={expanded} />
          ))}
        </div>
      ) : (
        <PlanList months={months} onOpen={onOpen} />
      )}
    </section>
  );
}
