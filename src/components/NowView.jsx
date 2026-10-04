import { CATEGORIES, category } from '../data/categories.js';
import { actions } from '../lib/actions.js';
import { upNext } from '../lib/catalogue.js';
import Countdown from './Countdown.jsx';
import ItemLine from './ItemLine.jsx';

const catOrder = (a, b) =>
  CATEGORIES.findIndex((c) => c.id === a.cat) - CATEGORIES.findIndex((c) => c.id === b.cat) || (a.order ?? 99) - (b.order ?? 99);

/**
 * The page opened most: what is on the go, what comes next in each medium, and
 * what was just finished. The quick actions are the two things done from a
 * phone mid-commute: one more episode or chapter, and "finished it".
 */
export default function NowView({ items, onOpen, shelf }) {
  const act = actions(shelf, items);
  const active = items.filter((i) => i.status === 'active').sort(catOrder);
  const recent = items
    .filter((i) => i.status === 'done' && i.finished)
    .sort((a, b) => b.finished.localeCompare(a.finished))
    .slice(0, 8);

  return (
    <main className="page">
      <Countdown items={items} onOpen={onOpen} compact />

      <section className="block">
        <h2 className="block-title">
          In progress <span>{active.length}</span>
        </h2>
        <div className="lines">
          {active.map((item) => {
            const unit = category(item.cat).unit;
            return (
              <ItemLine key={item.id} item={item} onOpen={onOpen} kicker={category(item.cat).one}>
                {shelf.canEdit && (
                  <>
                    {unit && unit !== 'pages' && (
                      <button type="button" onClick={() => act.bump(item)}>
                        +1 {unit.replace(/s$/, '')}
                      </button>
                    )}
                    <button type="button" onClick={() => { act.finish(item); onOpen(item); }}>
                      Finished
                    </button>
                  </>
                )}
              </ItemLine>
            );
          })}
        </div>
      </section>

      <section className="block">
        <h2 className="block-title">Up next</h2>
        <div className="queues">
          {CATEGORIES.map((c) => {
            const queue = upNext(items, c.id);
            if (!queue.length) return null;
            return (
              <div key={c.id} className="queue">
                <h3 className="queue-title">
                  <a href={`#${c.route}`}>{c.label}</a>
                </h3>
                <div className="lines">
                  {queue.map((item, i) => (
                    <ItemLine key={item.id} item={item} onOpen={onOpen} rank={i + 1}>
                      {shelf.canEdit && (
                        <button type="button" onClick={() => act.start(item)}>
                          Start
                        </button>
                      )}
                    </ItemLine>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="block">
          <h2 className="block-title">Recently finished</h2>
          <div className="lines">
            {recent.map((item) => (
              <ItemLine key={item.id} item={item} onOpen={onOpen} kicker={category(item.cat).one} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
