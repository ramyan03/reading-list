import { category, shelfLabel, tierLabel } from '../data/categories.js';
import { monthText, progressText } from '../lib/catalogue.js';
import Poster from './Poster.jsx';

/**
 * One item as a line of text: the shape shared by the Now page and every
 * non-book list. Like the book grid, state is carried by brightness rather than
 * badges: finished things recede, the one in progress gets the accent.
 */
export default function ItemLine({ item, onOpen, kicker, rank, children }) {
  const cat = category(item.cat);
  const meta = [];
  const progress = progressText(item, cat?.unit);

  if (item.status === 'done' || item.status === 'dropped') {
    if (item.myScore != null) meta.push(`${item.myScore}/10`);
    if (item.finished) meta.push(monthText(item.finished));
    if (item.status === 'dropped') meta.push('dropped');
  } else {
    if (progress) meta.push(progress);
    if (item.author) meta.push(item.author);
    if (item.shelf) meta.push(shelfLabel(item.shelf));
    if (item.tier && item.status !== 'active') meta.push(tierLabel(item.tier));
    if (item.hrs) meta.push(`~${item.hrs}h`);
    if (item.suggested) meta.push('suggested');
  }

  return (
    <article className={`line is-${item.status}`}>
      <button type="button" className="line-hit" onClick={() => onOpen(item)}>
        {rank != null && <span className="line-rank">{rank}</span>}
        <Poster item={item} size="S" className="is-thumb" showTitle={false} />
        <span className="line-main">
          {kicker && <span className="line-kicker">{kicker}</span>}
          <span className="line-title">{item.title}</span>
          {meta.length > 0 && <span className="line-meta">{meta.join(' · ')}</span>}
        </span>
      </button>
      {children && <div className="line-actions">{children}</div>}
    </article>
  );
}
