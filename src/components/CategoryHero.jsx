import { statusLabel, tierLabel } from '../data/categories.js';
import { monthText, progressText, queueCmp } from '../lib/catalogue.js';
import { percent } from '../lib/progress.js';
import { Icon } from './Icons.jsx';
import Poster, { artFor } from './Poster.jsx';
import { ProgressStepper, ScoreSelect } from './QuickEdit.jsx';

/**
 * What the hero features: the thing on the go (most recently started first),
 * else the front of the queue, else the best rated finished one.
 */
export function pickFeatured(mine) {
  const active = mine.filter((i) => i.status === 'active').sort((a, b) => (b.started ?? '').localeCompare(a.started ?? '') || queueCmp(a, b));
  if (active.length) return { item: active[0], others: active.slice(1), kicker: `Now ${statusLabel('active', active[0].cat).toLowerCase()}` };
  const next = mine.filter((i) => i.status === 'next').sort(queueCmp);
  if (next.length) return { item: next[0], others: next.slice(1, 4), kicker: 'Up next', othersLabel: 'Then' };
  const best = mine.filter((i) => i.status === 'done' && i.myScore != null).sort((a, b) => b.myScore - a.myScore);
  if (best.length) return { item: best[0], others: best.slice(1, 4), kicker: 'Top rated', othersLabel: 'Also loved' };
  return null;
}

/**
 * The top of a category page: the featured item large, over a blurred copy of
 * its own poster, with the category's numbers beside it. In admin mode the
 * progress and score can be changed right here.
 */
export default function CategoryHero({ cat, mine, onOpen, act, canEdit }) {
  const featured = pickFeatured(mine);
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

  if (!featured) {
    return (
      <section className="chero is-empty" style={{ '--cat': cat.color }}>
        <div className="chero-body">
          <p className="chero-kicker">{cat.label}</p>
          <h1 className="chero-title">Nothing here yet</h1>
        </div>
      </section>
    );
  }

  const { item, others, kicker, othersLabel = 'Also on the go' } = featured;
  const src = artFor(item, 'L');
  const pct = item.status === 'active' ? percent(item) : null;
  const progress = progressText(item, cat.unit);
  const chips = [
    item.tier && tierLabel(item.tier),
    item.hrs && `~${item.hrs}h`,
    item.author,
    item.status === 'done' && item.finished && `Finished ${monthText(item.finished)}`,
  ].filter(Boolean);

  return (
    <section className="chero" style={{ '--cat': cat.color }}>
      <div className="chero-backdrop" aria-hidden="true">
        {src ? <img src={src} alt="" /> : <Poster item={item} showTitle={false} className="is-fill" />}
      </div>

      <div className="chero-inner">
        <button type="button" className="chero-poster" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`}>
          <Poster item={item} size="L" className="is-fill" />
        </button>

        <div className="chero-body">
          <p className="chero-kicker">
            <Icon name={cat.id} size={15} /> {cat.label} · {kicker}
          </p>
          <h1 className="chero-title">{item.title}</h1>
          {(item.note || item.mine) && <p className="chero-note">{item.note || item.mine}</p>}

          {chips.length > 0 && (
            <div className="chero-chips">
              {item.myScore != null && (
                <span className="is-score">
                  <Icon name="star" size={12} strokeWidth={2.4} /> {item.myScore}/10
                </span>
              )}
              {chips.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          )}

          {item.status === 'active' && (progress || pct != null) && (
            <div className="chero-progress">
              <span className="chero-bar" aria-hidden="true">
                <span style={{ width: `${pct ?? 0}%` }} />
              </span>
              <span className="chero-progress-text">
                {progress}
                {pct != null && <b> {pct}%</b>}
              </span>
            </div>
          )}

          <div className="chero-actions">
            <button type="button" className="btn" onClick={() => onOpen(item)}>
              {canEdit ? 'Edit details' : 'Details'}
            </button>
            {canEdit && item.status === 'active' && cat.unit && <ProgressStepper item={item} act={act} size="lg" />}
            {canEdit && item.status !== 'active' && item.status !== 'done' && (
              <button type="button" className="btn is-quiet" onClick={() => act.start(item)}>
                <Icon name="play" size={13} /> Start
              </button>
            )}
            {canEdit && item.status === 'active' && (
              <button type="button" className="btn is-quiet" onClick={() => act.finish(item)}>
                <Icon name="check" size={14} /> Finished
              </button>
            )}
            {canEdit && <ScoreSelect item={item} act={act} />}
          </div>

          {others.length > 0 && (
            <div className="chero-others">
              <span>{othersLabel}</span>
              {others.slice(0, 4).map((o) => (
                <button key={o.id} type="button" onClick={() => onOpen(o)}>
                  <Poster item={o} size="S" className="is-thumb" showTitle={false} />
                  {o.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <dl className="chero-stats">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dd>{value}</dd>
              <dt>{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
