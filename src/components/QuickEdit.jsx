import { category } from '../data/categories.js';
import { currentProgress, currentTotal } from '../lib/progress.js';
import { Icon } from './Icons.jsx';

const SCORES = Array.from({ length: 20 }, (_, i) => (i + 1) / 2).reverse();

/** Pages move ten at a time; episodes, chapters and issues one. */
export const stepFor = (unit) => (unit === 'pages' ? 10 : 1);

export function ProgressStepper({ item, act, size = 'sm' }) {
  const cat = category(item.cat);
  const step = stepFor(cat.unit);
  const unit = cat.unit === 'pages' ? 'pg' : cat.unit;
  const total = currentTotal(item);
  return (
    <span className={`stepper is-${size}`}>
      <button type="button" onClick={() => act.bump(item, -step)} aria-label={`${step} fewer ${cat.unit} of ${item.title}`}>
        <Icon name="minus" size={14} />
      </button>
      <span className="stepper-count">
        {currentProgress(item)}
        {total ? <small> / {total}</small> : null}
        {size !== 'sm' && unit && <small> {unit}</small>}
      </span>
      <button type="button" onClick={() => act.bump(item, step)} aria-label={`${step} more ${cat.unit} of ${item.title}`}>
        <Icon name="plus" size={14} />
      </button>
    </span>
  );
}

export function ScoreSelect({ item, act }) {
  return (
    <label className={`score-select${item.myScore != null ? ' is-set' : ''}`}>
      <Icon name="star" size={13} strokeWidth={2} />
      <select
        value={item.myScore ?? ''}
        onChange={(e) => act.set(item, { myScore: e.target.value === '' ? undefined : Number(e.target.value) })}
        aria-label={`My score for ${item.title}`}
      >
        <option value="">Rate</option>
        {SCORES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * The admin controls that sit under a poster: progress for things on the go,
 * a score for anything, and a start button for things still waiting.
 */
export default function QuickEdit({ item, act }) {
  const cat = category(item.cat);
  const active = item.status === 'active';
  const waiting = item.status === 'next' || item.status === 'backlog' || item.status === 'paused';
  return (
    <div className="quick">
      {active && cat.unit && <ProgressStepper item={item} act={act} />}
      {waiting && (
        <button type="button" className="quick-btn" onClick={() => act.start(item)}>
          <Icon name="play" size={12} /> Start
        </button>
      )}
      <ScoreSelect item={item} act={act} />
      {active && (
        <button type="button" className="quick-btn is-icon" onClick={() => act.finish(item)} aria-label={`Finished ${item.title}`} title="Finished">
          <Icon name="check" size={14} />
        </button>
      )}
    </div>
  );
}
