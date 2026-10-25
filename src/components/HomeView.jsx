import { CATEGORIES, category } from '../data/categories.js';
import { actions } from '../lib/actions.js';
import { monthText, queueCmp } from '../lib/catalogue.js';
import { isBacklog } from './BacklogBoard.jsx';
import Countdown from './Countdown.jsx';
import NowCard, { leadFirst } from './NowCard.jsx';
import Poster from './Poster.jsx';
import Rail from './Rail.jsx';

const RECENT = 8;
const NEXT = 8;

const catOrder = (a, b) => CATEGORIES.findIndex((c) => c.id === a.cat) - CATEGORIES.findIndex((c) => c.id === b.cat);
const startedFirst = (a, b) => (b.started ?? '').localeCompare(a.started ?? '') || catOrder(a, b);

/**
 * The front page: what is on the go, as big solid cards, then what is next and
 * what has just been finished. On a phone the cards are a swipeable stack, one
 * at a time with the next peeking in; on a wide screen they become a bento,
 * the most recently started taking the big cell. The plan and the backlog have
 * pages of their own, so they no longer repeat here.
 */
export default function HomeView({ items, onOpen, shelf }) {
  const act = actions(shelf, items);
  const active = leadFirst(items.filter((i) => i.status === 'active').sort(startedFirst));
  const next = items.filter((i) => i.status === 'next').sort((a, b) => queueCmp(a, b) || catOrder(a, b)).slice(0, NEXT);
  const recent = items
    .filter((i) => i.status === 'done' && i.finished)
    .sort((a, b) => b.finished.localeCompare(a.finished))
    .slice(0, RECENT);

  return (
    <main className="rd-page rd-home">
      <header className="rd-head">
        <p className="rd-eyebrow">
          Currently on · {active.length} {active.length === 1 ? 'thing' : 'things'}
        </p>
        <h1 className="rd-title">
          Pick up <em style={{ '--em': category('anime').color }}>where</em> you left off
        </h1>
        <Countdown items={items} onOpen={onOpen} compact />
      </header>

      <div className="rd-board">
        <div className="rd-now" aria-label="On the go">
          {active.map((item, i) => (
            <NowCard key={item.id} item={item} index={i} size={i === 0 ? 'lg' : 'md'} onOpen={onOpen} act={act} canEdit={shelf.canEdit} />
          ))}
          {active.length === 0 && <p className="quiet">Nothing on the go. Pick something from the pile.</p>}
        </div>

        <section className="rd-next" aria-labelledby="rd-next-h">
          <h2 id="rd-next-h" className="rd-h2">
            Up next
          </h2>
          <ul>
            {next.map((item) => {
              const cat = category(item.cat);
              return (
                <li key={item.id}>
                  <button type="button" onClick={() => onOpen(item)}>
                    <Poster item={item} size="S" className="is-thumb" showTitle={false} />
                    <span>
                      <span className="rd-next-title">{item.title}</span>
                      <span className="rd-next-meta" style={{ '--cat': cat.color }}>
                        {[cat.one, item.hrs && `~${item.hrs}h`, item.note].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="rd-links">
            <a href="#plan">( The plan )</a>
            <a href="#backlog">( The pile · {items.filter(isBacklog).length} )</a>
          </p>
        </section>
      </div>

      {recent.length > 0 && (
        <section className="rd-section">
          <h2 className="rd-h2">Just finished</h2>
          <Rail>
            {recent.map((item) => (
              <button key={item.id} type="button" className="rd-done" onClick={() => onOpen(item)}>
                <Poster item={item} size="M" />
                <span className="rd-done-title">{item.title}</span>
                <span className="rd-done-meta">
                  {[item.myScore != null && `${item.myScore}/10`, monthText(item.finished)].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))}
          </Rail>
        </section>
      )}

      <nav className="rd-section rd-cats" aria-label="Categories">
        {CATEGORIES.map((cat) => {
          const mine = items.filter((i) => i.cat === cat.id);
          return (
            <a key={cat.id} href={`#${cat.route}`} style={{ '--cat': cat.color }}>
              <span className="rd-cats-name">{cat.label}</span>
              <span className="rd-cats-n">{mine.filter(isBacklog).length} waiting</span>
            </a>
          );
        })}
      </nav>
    </main>
  );
}
