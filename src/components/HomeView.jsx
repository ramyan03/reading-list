import { CATEGORIES, category, statusLabel } from '../data/categories.js';
import { actions } from '../lib/actions.js';
import { monthText, progressText } from '../lib/catalogue.js';
import { percent } from '../lib/progress.js';
import BacklogBoard, { isBacklog } from './BacklogBoard.jsx';
import Countdown from './Countdown.jsx';
import HeroArt from './HeroArt.jsx';
import { Icon } from './Icons.jsx';
import PlanBoard from './PlanBoard.jsx';
import Poster, { artFor } from './Poster.jsx';

const RECENT = 6;

const catOrder = (a, b) => CATEGORIES.findIndex((c) => c.id === a.cat) - CATEGORIES.findIndex((c) => c.id === b.cat);

/** One card per medium, sized by its backlog, with a few of its own posters as the art. */
function Mood({ items }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>What are you in the mood for?</h2>
      </div>
      <div className="mood">
        {CATEGORIES.map((cat) => {
          const mine = items.filter((i) => i.cat === cat.id);
          const waiting = mine.filter(isBacklog);
          const art = [...waiting, ...mine.filter((i) => i.status === 'done')]
            .map((i) => artFor(i, 'M'))
            .filter(Boolean)
            .slice(0, 3);
          return (
            <a key={cat.id} href={`#${cat.route}`} className="mood-card" style={{ '--cat': cat.color }}>
              <span className="mood-art" aria-hidden="true">
                {art.map((src) => (
                  <img key={src} src={src} alt="" loading="lazy" />
                ))}
              </span>
              <Icon name={cat.id} size={30} strokeWidth={1.6} className="mood-icon" />
              <span className="mood-label">{cat.label}</span>
              <span className="mood-count">{waiting.length} in backlog</span>
              <Icon name="arrow" size={16} className="mood-arrow" />
            </a>
          );
        })}
      </div>
    </section>
  );
}

function MediaCard({ item, onOpen, act, canEdit }) {
  const cat = category(item.cat);
  const done = item.status === 'done';
  const pct = done ? 100 : percent(item);
  const detail = done
    ? [item.myScore != null && `${item.myScore}/10`, item.finished && monthText(item.finished)].filter(Boolean).join(' · ')
    : progressText(item, cat.unit) || (pct != null ? `${pct}%` : '');

  return (
    <article className={`card is-${item.status}`} style={{ '--cat': cat.color }}>
      <button type="button" className="card-hit" onClick={() => onOpen(item)}>
        <Poster item={item} size="M" className="card-art" />
        <span className="card-kicker">{cat.one}</span>
        <span className="card-title">{item.title}</span>
        <span className="card-detail">{detail || ' '}</span>
        <span className="card-bar" aria-hidden="true">
          <span style={{ width: `${pct ?? 0}%` }} />
        </span>
      </button>
      <footer className="card-foot">
        <span className="card-status">
          <Icon name={done ? 'check' : 'clock'} size={13} />
          {done ? 'Finished' : statusLabel(item.status, item.cat)}
        </span>
        {canEdit && !done && (
          <span className="card-actions">
            {cat.unit && cat.unit !== 'pages' && (
              <button type="button" onClick={() => act.bump(item)} aria-label={`One more ${cat.unit.replace(/s$/, '')} of ${item.title}`}>
                +1
              </button>
            )}
            <button type="button" onClick={() => { act.finish(item); onOpen(item); }} aria-label={`Finished ${item.title}`}>
              <Icon name="check" size={14} />
            </button>
          </span>
        )}
      </footer>
    </article>
  );
}

/**
 * The front page, laid out like a streaming service home: the moods, what is
 * on the go, the next six months, and the whole backlog folded up at the end.
 */
export default function HomeView({ items, onOpen, shelf }) {
  const act = actions(shelf, items);
  const active = items.filter((i) => i.status === 'active').sort(catOrder);
  const recent = items
    .filter((i) => i.status === 'done' && i.finished)
    .sort((a, b) => b.finished.localeCompare(a.finished))
    .slice(0, RECENT);

  return (
    <main className="home">
      <section className="hero">
        <HeroArt />
        <div className="hero-inner">
          <p className="hero-kicker">Read / Watch / Play / Explore</p>
          <h1>
            Welcome to my
            <br />
            media backlog
          </h1>
          <p className="hero-lede">
            Books, anime, manga, shows, films, games and comics.
            <br />
            Everything I want to experience, all in one place.
          </p>
          <Countdown items={items} onOpen={onOpen} compact />
        </div>
        <p className="hero-quote">
          "A little bit of everything,
          <br />a lot to look forward to."
        </p>
      </section>

      <div className="home-body">
        <Mood items={items} />

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Current &amp; Recent</h2>
              <p>What I'm reading, watching, playing or have just finished.</p>
            </div>
            <div className="section-tools">
              <a className="view-all" href="#backlog">
                View all <Icon name="arrow" size={14} />
              </a>
            </div>
          </div>
          <div className="cards">
            {[...active, ...recent].map((item) => (
              <MediaCard key={item.id} item={item} onOpen={onOpen} act={act} canEdit={shelf.canEdit} />
            ))}
          </div>
        </section>

        <PlanBoard
          items={items}
          onOpen={onOpen}
          title="Next 6 Months"
          subtitle="The plan, month by month, with everything I want to get to."
          viewAll="#plan"
        />

        <BacklogBoard items={items} onOpen={onOpen} subtitle="Browse everything I plan to read, watch, play and experience." />
      </div>
    </main>
  );
}
