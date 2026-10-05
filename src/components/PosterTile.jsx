import { category, statusLabel, tierLabel } from '../data/categories.js';
import { monthText, progressText } from '../lib/catalogue.js';
import { percent } from '../lib/progress.js';
import { Icon } from './Icons.jsx';
import Poster from './Poster.jsx';
import QuickEdit from './QuickEdit.jsx';

/**
 * One item in a category grid: a large poster, the title in full (two lines),
 * one line of what matters for its state, and the admin controls under it
 * when unlocked.
 */
export default function PosterTile({ item, onOpen, act, canEdit, rank, sub }) {
  const cat = category(item.cat);
  const done = item.status === 'done' || item.status === 'dropped';
  const pct = item.status === 'active' ? percent(item) : null;

  const meta = done
    ? [item.finished && monthText(item.finished), item.status === 'dropped' && 'Dropped']
    : item.status === 'active'
      ? [progressText(item, cat.unit) || statusLabel('active', item.cat)]
      : [sub, item.tier && tierLabel(item.tier), item.hrs && `~${item.hrs}h`];

  return (
    <article className={`tile is-${item.status}`} style={{ '--cat': cat.color }}>
      <button type="button" className="tile-hit" onClick={() => onOpen(item)}>
        <span className="tile-art">
          <Poster item={item} size="M" />
          {item.myScore != null && (
            <span className="tile-score">
              <Icon name="star" size={11} strokeWidth={2.4} />
              {item.myScore}
            </span>
          )}
          {rank != null && <span className="tile-rank">{rank}</span>}
          {item.status === 'active' && <span className="tile-badge">{statusLabel('active', item.cat)}</span>}
          {pct != null && (
            <span className="tile-bar" aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </span>
          )}
        </span>
        <span className="tile-title">{item.title}</span>
        {item.author && <span className="tile-author">{item.author}</span>}
        <span className="tile-meta">{meta.filter(Boolean).join(' · ') || ' '}</span>
      </button>
      {canEdit && <QuickEdit item={item} act={act} />}
    </article>
  );
}
