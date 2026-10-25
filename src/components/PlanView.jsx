import { useMemo, useState } from 'react';
import { CATEGORIES, category, statusLabel } from '../data/categories.js';
import { monthText, progressText } from '../lib/catalogue.js';
import Countdown from './Countdown.jsx';
import { Icon } from './Icons.jsx';
import { inkOn } from './NowCard.jsx';
import { planMonths } from './PlanBoard.jsx';
import Poster from './Poster.jsx';

const goDays = (n) => `${n} GO ${n === 1 ? 'day' : 'days'}`;
const sum = (list, f) => list.reduce((t, x) => t + (f(x) ?? 0), 0);

/** done when everything it names is finished, active when any of it is on the go. */
function lineState(linked) {
  if (linked.length && linked.every((i) => i.status === 'done')) return 'done';
  if (linked.some((i) => i.status === 'active' || i.status === 'done')) return 'active';
  return 'todo';
}

/** One month's lines, grouped by kind, each carrying the items it names. */
function shape(month, byId) {
  const lines = month.lines.map((line) => {
    const linked = line.ids.map((id) => byId.get(id)).filter(Boolean);
    return { line, linked, state: lineState(linked) };
  });
  const groups = CATEGORIES.map((cat) => ({ cat, lines: lines.filter((l) => l.line.cat === cat.id) })).filter((g) => g.lines.length);
  const items = [...new Map(lines.flatMap((l) => l.linked).map((i) => [i.id, i])).values()];
  return {
    groups,
    lineCount: lines.length,
    items: items.length,
    done: items.filter((i) => i.status === 'done').length,
    go: sum(lines, (l) => l.line.go),
    goLeft: sum(lines, (l) => (l.state === 'done' ? 0 : l.line.go)),
  };
}

const STATE_LABEL = { done: 'Done', active: 'In progress', todo: 'To do' };

/**
 * One line of the plan as a checklist row: a box (ticked when everything it
 * names is finished), the line, what it costs, and the words on the right.
 * A line naming one item opens it; a line naming several lists them under it.
 */
function Line({ line, linked, state, onOpen }) {
  const single = linked.length === 1 ? linked[0] : null;
  const meta = [single?.author, line.go != null && goDays(line.go), line.note].filter(Boolean).join(' · ');
  const extra = single && single.status !== 'done' ? progressText(single, category(single.cat).unit) : null;
  const body = (
    <>
      <span className="plan-box" aria-label={STATE_LABEL[state]}>
        {state === 'done' && <Icon name="check" size={12} strokeWidth={3} />}
      </span>
      <span className="pv-line-text">
        <span className="pv-line-title">
          {line.text}
          {line.flag && <span className="plan-flag">{line.flag}</span>}
        </span>
        {(meta || extra) && <span className="pv-line-meta">{[meta, extra].filter(Boolean).join(' · ')}</span>}
      </span>
      {line.words && <span className="plan-words">{line.words.replace(/ left$/, '')}</span>}
    </>
  );

  return (
    <li className={`pv-line is-${state}`}>
      {single ? (
        <button type="button" onClick={() => onOpen(single)}>
          {body}
        </button>
      ) : (
        <div>{body}</div>
      )}
      {linked.length > 1 && (
        <ul className="plan-items">
          {linked.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onOpen(item)}>
                <Poster item={item} size="S" className="is-thumb" showTitle={false} />
                <span>{item.title}</span>
                <span className="pv-line-meta">
                  {item.status === 'done' ? `Finished${item.finished ? ` ${monthText(item.finished)}` : ''}` : statusLabel(item.status, item.cat)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {linked.length === 0 && <p className="plan-loose">Not on the shelf yet</p>}
    </li>
  );
}

/** A category's share of the month: books get the big checklist card, the rest a solid card each. */
function CatCard({ group, index, onOpen, big }) {
  const { cat, lines } = group;
  const linked = [...new Map(lines.flatMap((l) => l.linked).map((i) => [i.id, i])).values()];
  const done = linked.filter((i) => i.status === 'done').length;
  const go = sum(lines, (l) => (l.state === 'done' ? 0 : l.line.go));
  const pct = linked.length ? Math.round((done / linked.length) * 100) : 0;

  return (
    <section
      className={`plan-card${big ? ' is-big' : ''}`}
      style={{ '--cat': cat.color, '--on-cat': inkOn(cat.color) }}
      aria-label={cat.label}
    >
      <div className="plan-card-head">
        <div>
          <p className="now-kicker">
            ({String(index + 1).padStart(2, '0')}) {cat.label}
          </p>
          {linked.length > 0 && (
            <p className="plan-num">
              {done}
              <span>/{linked.length} done</span>
            </p>
          )}
        </div>
        {go > 0 && <p className="plan-go">{goDays(go)} left</p>}
      </div>
      {linked.length > 0 && (
        <span className="now-line" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
      )}
      <ul className="pv-lines">
        {lines.map((l, i) => (
          <Line key={i} {...l} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  );
}

/**
 * The plan, one month at a time. The months are a row of tiles across the
 * top, each with how much of it is done; picking one shows its books as one
 * big checklist and everything else as a card per medium.
 */
export default function PlanView({ items, onOpen }) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const months = useMemo(() => planMonths(items).map((m) => ({ month: m, info: shape(m, byId) })), [items, byId]);

  const d = new Date();
  const now = d.getFullYear() * 12 + d.getMonth();
  const when = (m) => (m.to < now ? 'past' : m.from <= now ? 'now' : 'later');
  const current = months.find(({ month }) => when(month) !== 'past')?.month.label ?? months.at(-1)?.month.label;
  const [picked, setPicked] = useState(current);
  const shown = months.find(({ month }) => month.label === picked) ?? months[0];

  const ahead = months.filter(({ month }) => when(month) !== 'past');
  const totals = {
    done: sum(ahead, (m) => m.info.done),
    items: sum(ahead, (m) => m.info.items),
    goLeft: sum(ahead, (m) => m.info.goLeft),
  };
  const first = months[0]?.month.label.replace(/^(\w+) .*?(\d{4})$/, '$1 $2');
  const last = months.at(-1)?.month.label.replace(/^.* to /, '');

  // Books first and big, since they are most of every month; then the rest.
  const groups = shown ? [...shown.info.groups].sort((a, b) => (b.cat.id === 'book') - (a.cat.id === 'book')) : [];
  const [lead, ...rest] = groups[0]?.cat.id === 'book' ? groups : [null, ...groups];

  return (
    <main className="rd-page plan">
      <header className="rd-head">
        <p className="rd-eyebrow">{first && last ? `${first} to ${last}` : 'Month by month'}</p>
        <h1 className="rd-title">
          The <em style={{ '--em': category('comic').color }}>plan</em>
        </h1>
      </header>

      <dl className="rd-stats">
        <div>
          <dd>
            {totals.done}
            <small>/{totals.items}</small>
          </dd>
          <dt>planned things done</dt>
        </div>
        {totals.goLeft > 0 && (
          <div>
            <dd>{totals.goLeft}</dd>
            <dt>GO days of reading ahead</dt>
          </div>
        )}
        <div>
          <dd>{ahead.length}</dd>
          <dt>{ahead.length === 1 ? 'month' : 'months'} to go</dt>
        </div>
      </dl>

      {months.length === 0 ? (
        <p className="quiet">Nothing planned yet. Add months to src/data/plan.js.</p>
      ) : (
        <>
          <div className="plan-months" role="tablist" aria-label="Month">
            {months.map(({ month, info }) => {
              const pct = info.items ? Math.round((info.done / info.items) * 100) : 0;
              const on = month.label === shown?.month.label;
              return (
                <button
                  key={month.label}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`plan-month is-${when(month)}${on ? ' is-on' : ''}`}
                  onClick={() => setPicked(month.label)}
                >
                  <span className="plan-month-name">{month.label.replace(/ \d{4}$/, '')}</span>
                  <span className="plan-month-meta">
                    {when(month) === 'now' ? 'Now · ' : ''}
                    {info.items ? `${info.done}/${info.items}` : `${info.lineCount} lines`}
                  </span>
                  <span className="plan-month-line" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                </button>
              );
            })}
          </div>

          {shown && (
            <div className="plan-grid" role="tabpanel" aria-label={shown.month.label}>
              {lead && <CatCard group={lead} index={0} onOpen={onOpen} big />}
              <div className="plan-rest">
                {rest.map((g, i) => (
                  <CatCard key={g.cat.id} group={g} index={i + (lead ? 1 : 0)} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Countdown items={items} onOpen={onOpen} />
    </main>
  );
}
