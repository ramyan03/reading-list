import { useEffect, useRef } from 'react';
import { PRESETS, SIGNALS, SIGNAL_GROUPS } from '../lib/score.js';

function presetName(weights) {
  return (
    Object.entries(PRESETS).find(([, p]) =>
      SIGNALS.every((s) => (p[s.id] ?? 0) === (weights[s.id] ?? 0))
    )?.[0] ?? null
  );
}

export default function WeightPanel({ open, weights, setWeights, onClose }) {
  const panelRef = useRef(null);
  const active = presetName(weights);

  // Close on Escape, and move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const set = (id, value) => setWeights({ ...weights, [id]: value });

  return (
    <>
      <div className={`scrim${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside
        className={`weights${open ? ' is-open' : ''}`}
        aria-hidden={!open}
        aria-label="Tune the weighted score"
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="weights-head">
          <div>
            <h2>Tune the score</h2>
            <p>
              Each signal is normalised to 0–100, then averaged by weight. Set one to zero to
              ignore it entirely.
            </p>
          </div>
          <button type="button" className="weights-close" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>

        <div className="presets">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              type="button"
              className={`preset${active === name ? ' is-on' : ''}`}
              onClick={() => setWeights({ ...PRESETS[name] })}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="weights-body">
          {SIGNAL_GROUPS.map((group) => (
            <section key={group} className="weight-group">
              <h3>{group}</h3>
              {SIGNALS.filter((s) => s.group === group).map((s) => {
                const value = weights[s.id] ?? 0;
                return (
                  <div key={s.id} className={`weight${value === 0 ? ' is-off' : ''}`}>
                    <label htmlFor={`w-${s.id}`}>
                      <span className="weight-label">{s.label}</span>
                      <span className="weight-value">{value}</span>
                    </label>
                    {/* The filled portion is drawn by the wrapper, so the track
                        itself stays a plain rule and no gradient is needed. */}
                    <span className="weight-track" style={{ '--fill': `${value}%` }}>
                      <input
                        id={`w-${s.id}`}
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={value}
                        onChange={(e) => set(s.id, Number(e.target.value))}
                      />
                    </span>
                    <p className="weight-hint">{s.hint}</p>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
