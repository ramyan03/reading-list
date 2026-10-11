import { useMemo, useState } from 'react';
import { CATEGORIES, category, statusLabel } from '../data/categories.js';
import { monthText, progressText } from '../lib/catalogue.js';
import { percent } from '../lib/progress.js';
import Countdown from './Countdown.jsx';
import { Icon } from './Icons.jsx';
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

function ItemRow({ item, showTitle, onOpen }) {
  const cat = category(item.cat);
  const pct = item.status === 'active' ? percent(item) : null;
  const where = item.status === 'done' ? null : progressText(item, cat.unit);
  const facts = [
    item.status === 'done' && item.finished && `Finished ${monthText(item.finished)}`,
    item.status === 'done' && item.myScore != null && `${item.myScore}/10`,
    item.status !== 'done' && item.hrs && `~${item.hrs}h`,
  ].filter(Boolean);

  return (
    <li>
      <button type="button" className={`pm-item is-${item.status}`} onClick={() => onOpen(item)}>
        <Poster item={item} size="S" className="is-thumb" showTitle={false} />
        <span className="pm-item-body">
          {showTitle && <span className="pm-item-title">{item.title}</span>}
          <span className="pm-item-meta">
            <span className="pm-status">
              {item.status === 'done' && <Icon name="check" size={12} />}
              {statusLabel(item.status, item.cat)}
            </span>
            {where && <span>{where}</span>}
            {facts.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </span>
          {pct != null && (
            <span className="pm-bar" aria-label={`${pct}% through`}>
              <span style={{ width: `${pct}%` }} />
            </span>
          )}
        </span>
        <Icon name="arrow" size={14} className="pm-go" />
      </button>
    </li>
  );
}

function Line({ line, linked, state, onOpen }) {
  const cat = category(line.cat);
  const single = linked.length === 1 ? linked[0] : null;
  const meta = [
    single?.author,
    line.words && line.words.replace(/^(\S+)( left)?$/, '$1 words$2'),
    line.go != null && goDays(line.go),
    line.note,
  ].filter(Boolean);

  return (
    <li className={`pm-line is-${state}`}>
      <div className="pm-line-head">
        <span className="pm-mark" aria-label={state === 'done' ? 'Done' : state === 'active' ? 'In progress' : 'To do'}>
          {state === 'done' ? <Icon name="check" size={13} /> : <span />}
        </span>
        <div>
          <h4>
            {line.text}
            {line.flag && <span className="pm-flag">{line.flag}</span>}
          </h4>
          {meta.length > 0 && <p className="pm-meta">{meta.join(' · ')}</p>}
        </div>
      </div>
      {linked.length > 0 ? (
        <ul className="pm-items">
          {linked.map((item) => (
            <ItemRow key={item.id} item={item} showTitle={!single || item.title !== line.text} onOpen={onOpen} />
          ))}
        </ul>
      ) : (
        <p className="pm-loose">
          <Icon name={cat.id} size={13} /> Not on the shelf yet
        </p>
      )}
    </li>
  );
}

function Month({ month, info, open, onToggle, onOpen, when }) {
  const pct = info.items ? Math.round((info.done / info.items) * 100) : 0;
  const id = `pm-${month.label.replace(/\W+/g, '-').toLowerCase()}`;
  const stats = [
    `${info.lineCount} ${info.lineCount === 1 ? 'line' : 'lines'}`,
    info.items > 0 && `${info.done} of ${info.items} done`,
    info.go > 0 && (info.goLeft < info.go ? `${goDays(info.goLeft)} left of ${info.go}` : goDays(info.go)),
  ].filter(Boolean);

  return (
    <section className={`pm${open ? ' is-open' : ''} is-${when}`}>
      <h2 className="pm-h">
        <button type="button" className="pm-head" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="pm-title">
            <span className="pm-name">{month.label}</span>
            {when === 'now' && <span className="pm-badge">Now</span>}
            {when === 'past' && <span className="pm-badge is-quiet">{pct === 100 ? 'Done' : 'Past'}</span>}
          </span>
          <span className="pm-stats">{stats.join(' · ')}</span>
          <span className="pm-cats">
            {info.groups.map((g) => (
              <span key={g.cat.id} style={{ '--cat': g.cat.color }} title={`${g.cat.label}: ${g.lines.length}`}>
                <Icon name={g.cat.id} size={13} />
                {g.lines.length}
              </span>
            ))}
          </span>
          <span className="pm-progress" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </span>
          <Icon name="chevron" size={18} className="pm-chevron" />
        </button>
      </h2>

      {open && (
        <div className="pm-body" id={id}>
          {info.groups.map((g) => {
            const linked = g.lines.flatMap((l) => l.linked);
            const done = linked.filter((i) => i.status === 'done').length;
            const go = sum(g.lines, (l) => l.line.go);
            return (
              <section key={g.cat.id} className="pm-cat" style={{ '--cat': g.cat.color }}>
                <h3>
                  <Icon name={g.cat.id} size={15} />
                  {g.cat.label}
                  <span>
                    {[linked.length > 0 && `${done} of ${linked.length} done`, go > 0 && goDays(go)].filter(Boolean).join(' · ')}
                  </span>
                </h3>
                <ul>
                  {g.lines.map((l, i) => (
                    <Line key={i} {...l} onOpen={onOpen} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

/**
 * The whole plan, a month to a card. This month starts open; every month
 * expands into its lines by kind, each with the items it names, where they
 * stand, and the GO train days the books should take. The words live in
 * data/plan.js; done-ness comes from the shelf, so it ticks itself off.
 */
export default function PlanView({ items, onOpen }) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const months = useMemo(() => planMonths(items).map((m) => ({ month: m, info: shape(m, byId) })), [items, byId]);

  const d = new Date();
  const now = d.getFullYear() * 12 + d.getMonth();
  const when = (m) => (m.to < now ? 'past' : m.from <= now ? 'now' : 'later');
  const firstOpen = months.find(({ month }) => when(month) !== 'past')?.month.label;

  const [open, setOpen] = useState(() => new Set(firstOpen ? [firstOpen] : []));
  const toggle = (label) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  const allOpen = months.every(({ month }) => open.has(month.label));

  const ahead = months.filter(({ month }) => when(month) !== 'past');
  const totals = {
    done: sum(ahead, (m) => m.info.done),
    items: sum(ahead, (m) => m.info.items),
    goLeft: sum(ahead, (m) => m.info.goLeft),
  };
  const first = months[0]?.month.label.replace(/^(\w+) .*?(\d{4})$/, '$1 $2');
  const last = months.at(-1)?.month.label.replace(/^.* to /, '');

  return (
    <main className="page">
      <section className="section">
        <div className="section-head">
          <div>
            <h2>The Plan</h2>
            <p>
              {first && last ? `${first} to ${last}, month by month. ` : ''}
              Tap a month to see everything in it.
            </p>
          </div>
          <div className="section-tools">
            <button
              type="button"
              className="view-all"
              onClick={() => setOpen(allOpen ? new Set() : new Set(months.map(({ month }) => month.label)))}
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
              <Icon name="chevron" size={14} className={allOpen ? 'is-flipped' : undefined} />
            </button>
          </div>
        </div>

        <div className="pm-summary">
          <span>
            <b>{totals.done}</b> of {totals.items} planned things done
          </span>
          {totals.goLeft > 0 && (
            <span>
              <b>{totals.goLeft}</b> GO days of reading ahead
            </span>
          )}
          <span>
            <b>{ahead.length}</b> {ahead.length === 1 ? 'month' : 'months'} to go
          </span>
        </div>

        {months.length === 0 ? (
          <p className="quiet">Nothing planned yet. Add months to src/data/plan.js.</p>
        ) : (
          <div className="pm-list">
            {months.map(({ month, info }) => (
              <Month
                key={month.label}
                month={month}
                info={info}
                when={when(month)}
                open={open.has(month.label)}
                onToggle={() => toggle(month.label)}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </section>
      <Countdown items={items} onOpen={onOpen} />
    </main>
  );
}
