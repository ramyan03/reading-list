import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { category } from '../data/categories.js';
import { currentProgress, currentTotal } from '../lib/progress.js';
import { Icon } from './Icons.jsx';

/** Pages move ten at a time; episodes, chapters and issues one. */
export const stepFor = (unit) => (unit === 'pages' ? 10 : 1);

/** The hero's larger stepper adds a coarse jump, for catching up in one go. */
const BIG = { pages: 10, ch: 10, eps: 5 };

export function ProgressStepper({ item, act, size = 'sm' }) {
  const cat = category(item.cat);
  const big = size === 'lg' ? BIG[cat.unit] : null;
  const step = big ? 1 : stepFor(cat.unit);
  const unit = cat.unit === 'pages' ? 'pg' : cat.unit;
  const total = currentTotal(item);
  const by = (n) => (
    <button
      type="button"
      className={Math.abs(n) > 1 ? 'is-big' : undefined}
      onClick={() => act.bump(item, n)}
      aria-label={`${Math.abs(n)} ${n < 0 ? 'fewer' : 'more'} ${cat.unit} of ${item.title}`}
    >
      {Math.abs(n) > 1 || big ? `${n < 0 ? '−' : '+'}${Math.abs(n)}` : <Icon name={n < 0 ? 'minus' : 'plus'} size={14} />}
    </button>
  );
  return (
    <span className={`stepper is-${size}`}>
      {big && by(-big)}
      {by(-step)}
      <span className="stepper-count">
        {currentProgress(item)}
        {total ? <small> / {total}</small> : null}
        {size !== 'sm' && unit && <small> {unit}</small>}
      </span>
      {by(step)}
      {big && by(big)}
    </span>
  );
}

const POP_W = 214;

/**
 * The score button and its picker: 1 to 10 with a half-point step, the same
 * as the detail sheet. Drawn by us rather than a native select, whose option
 * list the browser paints in its own colours and ignores the site's theme.
 * The panel is portalled to body and fixed, so poster tiles cannot clip it.
 */
export function ScoreSelect({ item, act }) {
  const [pos, setPos] = useState(null);
  const button = useRef(null);
  const panel = useRef(null);
  const value = item.myScore;
  const whole = value != null ? Math.ceil(value) : null;
  const half = value != null && value % 1 !== 0;

  const close = useCallback((refocus) => {
    setPos(null);
    if (refocus) button.current?.focus();
  }, []);

  const toggle = () => {
    if (pos) return close();
    const r = button.current.getBoundingClientRect();
    const below = innerHeight - r.bottom > 190;
    setPos({
      left: Math.min(Math.max(8, r.left), innerWidth - POP_W - 8),
      top: below ? r.bottom + 6 : undefined,
      bottom: below ? undefined : innerHeight - r.top + 6,
    });
  };

  useEffect(() => {
    if (!pos) return;
    const onDown = (e) => {
      if (!panel.current?.contains(e.target) && !button.current?.contains(e.target)) close();
    };
    const onKey = (e) => e.key === 'Escape' && close(true);
    const onMove = () => close();
    addEventListener('pointerdown', onDown);
    addEventListener('keydown', onKey);
    addEventListener('scroll', onMove, true);
    addEventListener('resize', onMove);
    panel.current?.querySelector('[aria-pressed="true"], button')?.focus();
    return () => {
      removeEventListener('pointerdown', onDown);
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', onMove, true);
      removeEventListener('resize', onMove);
    };
  }, [pos, close]);

  const set = (myScore) => {
    act.set(item, { myScore });
    close(true);
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        className={`score-select${value != null ? ' is-set' : ''}${pos ? ' is-open' : ''}`}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={Boolean(pos)}
        aria-label={value != null ? `My score for ${item.title}: ${value}. Change` : `Rate ${item.title}`}
      >
        <Icon name="star" size={13} strokeWidth={2} />
        {value ?? 'Rate'}
      </button>
      {pos &&
        createPortal(
          <div ref={panel} className="score-pop" role="dialog" aria-label={`Score ${item.title}`} style={{ ...pos, width: POP_W }}>
            <p className="score-pop-head">
              My score <b>{value != null ? `${value}/10` : 'not rated'}</b>
            </p>
            <div className="rating">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={whole != null && n <= whole ? (n === whole && half ? 'is-half' : 'is-on') : ''}
                  onClick={() => set(n)}
                  aria-pressed={whole === n}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="score-pop-foot">
              <button type="button" className={half ? 'is-on' : ''} disabled={value == null} onClick={() => set(half ? Math.ceil(value) : Math.max(0.5, value - 0.5))}>
                ½ less
              </button>
              <button type="button" disabled={value == null} onClick={() => set(undefined)}>
                Clear
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
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
