import { statusLabel } from '../data/categories.js';
import { queueCmp } from '../lib/catalogue.js';
import NowCard, { inkOn, leadFirst } from './NowCard.jsx';
import Poster from './Poster.jsx';
import Rail from './Rail.jsx';

/**
 * The top of a category page: the name, large and in the category's colour,
 * its numbers, then whatever is on the go as the same solid cards as the home
 * page. With nothing on the go the front of the queue stands in, so the page
 * still opens on something to do.
 */
export default function CategoryHero({ cat, mine, onOpen, act, canEdit }) {
  const n = (s) => mine.filter((i) => i.status === s).length;
  const scored = mine.filter((i) => i.myScore != null);
  const avg = scored.length ? (scored.reduce((t, i) => t + i.myScore, 0) / scored.length).toFixed(1) : null;
  const stats = [
    [statusLabel('active', cat.id), n('active')],
    ['Up next', n('next')],
    ['Backlog', n('backlog') + n('paused')],
    ['Finished', n('done')],
    avg && ['Avg score', avg],
  ].filter(Boolean);

  const active = leadFirst(mine.filter((i) => i.status === 'active').sort((a, b) => (b.started ?? '').localeCompare(a.started ?? '') || queueCmp(a, b)));
  const queued = mine.filter((i) => i.status === 'next').sort(queueCmp).slice(0, 4);

  return (
    <section className="rd-page chero2" style={{ '--cat': cat.color, '--on-cat': inkOn(cat.color) }}>
      <h1 className="chero2-title">{cat.label}</h1>
      <dl className="rd-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dd>{value}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>

      {active.length > 0 ? (
        <div className="rd-now is-cat">
          {active.map((item, i) => (
            <NowCard key={item.id} item={item} index={i} size={i === 0 ? 'lg' : 'md'} onOpen={onOpen} act={act} canEdit={canEdit} />
          ))}
        </div>
      ) : (
        queued.length > 0 && (
          <div className="chero2-queue">
            <p className="rd-eyebrow">Nothing on the go · up next</p>
            <Rail>
              {queued.map((item) => (
                <button key={item.id} type="button" className="pile-tile" onClick={() => onOpen(item)}>
                  <Poster item={item} size="M" />
                  <span className="pile-title">{item.title}</span>
                  <span className="pile-meta">{[item.hrs && `~${item.hrs}h`, item.note].filter(Boolean).join(' · ') || 'Up next'}</span>
                </button>
              ))}
            </Rail>
          </div>
        )
      )}
    </section>
  );
}
