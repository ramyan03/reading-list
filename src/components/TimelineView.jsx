import { useMemo, useState } from 'react';
import { CATEGORIES, category } from '../data/categories.js';
import { progressText } from '../lib/catalogue.js';
import { planMonths } from './PlanBoard.jsx';

const LEDGER = { all: 'A Media Ledger', book: 'A Reading Ledger' };

const days = (n) => `${n} GO ${n === 1 ? 'day' : 'days'}`;

/** One plan line: the words from plan.js, plus word count and GO days for books. */
function Entry({ line, linked, showCat, onOpen }) {
  const single = linked.length === 1 ? linked[0] : null;
  const done = linked.length > 0 && linked.every((i) => i.status === 'done');
  const meta = [
    single?.author,
    line.words && `${line.words} words`,
    line.go != null && days(line.go),
    line.note,
  ].filter(Boolean);
  const title = <h3>{line.text}</h3>;

  return (
    <li className={done ? 'is-done' : undefined}>
      {showCat && <span className="fo-cat">{category(line.cat).one}</span>}
      {single ? (
        <button type="button" className="fo-title" onClick={() => onOpen(single)}>
          {title}
        </button>
      ) : (
        title
      )}
      {meta.length > 0 && <span className="fo-meta">{meta.join(' · ')}</span>}
      {(line.flag || done) && (
        <span className="fo-chips">
          {line.flag && <span className="fo-chip">{line.flag}</span>}
          {done && <span className="fo-chip is-quiet">Finished</span>}
        </span>
      )}
    </li>
  );
}

/**
 * The plan as an editorial page: what is on the go now, then each month from
 * this one on. Same data as #plan, filtered to one kind of thing if wanted.
 */
export default function TimelineView({ items, onOpen }) {
  const [filter, setFilter] = useState('all');

  const now = new Date();
  const thisMonth = now.getFullYear() * 12 + now.getMonth();
  const months = useMemo(() => planMonths(items).filter((m) => m.to >= thisMonth), [items, thisMonth]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const cats = CATEGORIES.filter((c) => months.some((m) => m.lines.some((l) => l.cat === c.id)));
  const keep = (cat) => filter === 'all' || cat === filter;

  const current = items
    .filter((i) => i.status === 'active' && keep(i.cat))
    .sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.cat) - CATEGORIES.findIndex((c) => c.id === b.cat));

  const shown = months
    .map((m) => {
      const lines = m.lines.filter((l) => keep(l.cat));
      return { ...m, lines, go: lines.reduce((sum, l) => sum + (l.go ?? 0), 0) };
    })
    .filter((m) => m.lines.length > 0);
  const totalGo = shown.reduce((sum, m) => sum + m.go, 0);
  const lineCount = shown.reduce((sum, m) => sum + m.lines.length, 0);
  const last = shown.at(-1)?.label.replace(/^.* to /, '');
  const one = category(filter);

  return (
    <main className="folio">
      <div className="fo-wrap">
        <header className="fo-head">
          <p className="fo-kicker">{LEDGER[filter] ?? `A ${one.one} Ledger`}</p>
          <h1>Ramyan Reads</h1>
          <hr />
          <p className="fo-sub">
            What I'm on now, and the plan{last ? ` through ${last}` : ''}. Books are measured in GO train days.
          </p>
        </header>

        <nav className="fo-filter" aria-label="Show">
          {[{ id: 'all', label: 'Everything' }, ...cats].map((c) => (
            <button key={c.id} type="button" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
        </nav>

        <section>
          <div className="fo-sec">
            <h2>{one ? `Currently ${one.active}` : 'In Progress'}</h2>
            <span>{current.length || 'Nothing'}</span>
          </div>
          {current.length === 0 ? (
            <p className="fo-empty">Nothing in progress here right now.</p>
          ) : (
            <div className="fo-now">
              {current.map((i) => {
                const note = [progressText(i, category(i.cat).unit), i.mine].filter(Boolean).join(' · ');
                return (
                  <button key={i.id} type="button" className="fo-card" onClick={() => onOpen(i)}>
                    <h3>{i.title}</h3>
                    <span className="fo-by">{i.author ?? category(i.cat).one}</span>
                    {note && <span className="fo-note">{note}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="fo-sec">
            <h2>Up Next</h2>
            <span>
              {lineCount} {lineCount === 1 ? 'entry' : 'entries'}
              {totalGo > 0 && ` · ~${days(totalGo)}`}
            </span>
          </div>
          {shown.length === 0 ? (
            <p className="fo-empty">Nothing planned here yet.</p>
          ) : (
            <div className="fo-months">
              {shown.map((m) => (
                <div key={m.label} className="fo-month">
                  <div className="fo-mlabel">
                    {m.label}
                    {m.go > 0 && <span>{days(m.go)}</span>}
                  </div>
                  <ul className="fo-list">
                    {m.lines.map((line, i) => (
                      <Entry
                        key={i}
                        line={line}
                        linked={line.ids.map((id) => byId.get(id)).filter(Boolean)}
                        showCat={filter === 'all'}
                        onOpen={onOpen}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
