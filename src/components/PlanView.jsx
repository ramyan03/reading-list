import { category } from '../data/categories.js';
import { PLAN } from '../data/plan.js';
import Countdown from './Countdown.jsx';

/**
 * The month-by-month plan. The words are fixed in data/plan.js; each line ticks
 * itself off once every item it names is finished, and names its items as
 * links into the detail sheet.
 */
export default function PlanView({ items, onOpen }) {
  const byId = new Map(items.map((i) => [i.id, i]));

  return (
    <main className="page">
      <Countdown items={items} onOpen={onOpen} />

      {PLAN.map((year) => (
        <section key={year.period} className="block">
          <h2 className="block-title">{year.period}</h2>
          {year.months.map((m) => (
            <div key={m.label} className="month">
              <h3 className="queue-title">{m.label}</h3>
              <ul className="plan-lines">
                {m.lines.map((line, i) => {
                  const linked = line.ids.map((id) => byId.get(id)).filter(Boolean);
                  const done = linked.length > 0 && linked.every((x) => x.status === 'done');
                  const going = !done && linked.some((x) => x.status === 'active' || x.status === 'done');
                  return (
                    <li key={i} className={`plan-line${done ? ' is-done' : going ? ' is-active' : ''}`}>
                      <span className="plan-cat">{category(line.cat).label}</span>
                      <span className="plan-text">
                        {line.text}
                        {line.note && <span className="plan-note"> · {line.note}</span>}
                        {linked.length > 0 && (
                          <span className="plan-links">
                            {linked.map((x) => (
                              <button key={x.id} type="button" onClick={() => onOpen(x)} className={`is-${x.status}`}>
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
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
