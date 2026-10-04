import { DOOMSDAY } from '../data/plan.js';
import { category } from '../data/categories.js';
import ItemLine from './ItemLine.jsx';

const DAY = 24 * 60 * 60 * 1000;

/**
 * The one dated goal: Hickman read and the MCU caught up before Doomsday. On
 * the Now page it is a single line that links to the plan; on the plan it
 * expands into the checklist. Gone once the date has passed.
 */
export default function Countdown({ items, onOpen, compact }) {
  const now = new Date();
  const date = new Date(`${DOOMSDAY.date}T00:00:00`);
  const days = Math.ceil((date - now) / DAY);
  if (days < 0) return null;

  const parts = items.filter((i) => i.project === DOOMSDAY.project);
  const comics = parts.filter((i) => i.cat === 'comic');
  const screen = parts.filter((i) => i.cat !== 'comic');
  const issues = comics.reduce((n, i) => n + (i.status === 'done' ? i.total ?? 0 : i.progress ?? 0), 0);
  const totalIssues = comics.reduce((n, i) => n + (i.total ?? 0), 0);
  const seen = screen.filter((i) => i.status === 'done').length;

  const start = new Date(`${DOOMSDAY.start}T00:00:00`);
  const elapsed = Math.min(100, Math.max(0, ((now - start) / (date - start)) * 100));
  const read = totalIssues ? (issues / totalIssues) * 100 : 0;

  const summary = (
    <>
      <span className="cd-days">
        <b>{days}</b> {days === 1 ? 'day' : 'days'} to {DOOMSDAY.title}
      </span>
      <span className="cd-stat">
        Hickman <b>{issues}</b> of {totalIssues} issues
      </span>
      <span className="cd-stat">
        MCU <b>{seen}</b> of {screen.length}
      </span>
    </>
  );

  if (compact) {
    return (
      <a className="countdown is-compact" href="#plan">
        {summary}
        <span className="cd-bar" style={{ '--time': `${elapsed}%`, '--done': `${read}%` }} aria-hidden="true" />
      </a>
    );
  }

  return (
    <section className="block countdown">
      <h2 className="block-title">{DOOMSDAY.title}, Dec 18</h2>
      <p className="cd-line">{summary}</p>
      <span className="cd-bar" style={{ '--time': `${elapsed}%`, '--done': `${read}%` }} aria-hidden="true" />
      <p className="cd-legend">The rule is time gone since September; the fill is issues read. Keep the fill ahead of the rule.</p>
      <p className="block-note">{DOOMSDAY.note}</p>

      <h3 className="queue-title">Hickman, in order</h3>
      <div className="lines">
        {comics
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          .map((item, i) => (
            <ItemLine key={item.id} item={item} onOpen={onOpen} rank={i + 1} />
          ))}
      </div>

      <h3 className="queue-title">MCU before Dec 18</h3>
      <div className="lines">
        {screen.map((item) => (
          <ItemLine key={item.id} item={item} onOpen={onOpen} kicker={category(item.cat).one} />
        ))}
      </div>
    </section>
  );
}
