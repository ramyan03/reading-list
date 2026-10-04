import { useEffect, useState } from 'react';
import { SHELVES, STATUSES, TIERS, category, shelfLabel, statusLabel, tierLabel } from '../data/categories.js';
import { actions } from '../lib/actions.js';
import { monthText } from '../lib/catalogue.js';

const SCORES = Array.from({ length: 21 }, (_, i) => i / 2);

/** A text field that saves on blur or Enter, not on every keystroke. */
function Field({ label, value, onSave, multiline, placeholder, type = 'text' }) {
  const [draft, setDraft] = useState(value ?? '');
  useEffect(() => setDraft(value ?? ''), [value]);
  const commit = () => {
    const v = type === 'number' ? (draft === '' ? undefined : Number(draft)) : draft.trim() || undefined;
    if (v !== (value ?? undefined)) onSave(v);
  };
  const props = {
    value: draft,
    placeholder,
    onChange: (e) => setDraft(e.target.value),
    onBlur: commit,
    'aria-label': label,
  };
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      {multiline ? (
        <textarea rows={3} {...props} />
      ) : (
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          {...props}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      )}
    </label>
  );
}

function Choice({ label, options, value, onChange, allowNone }) {
  return (
    <div className="ed-row">
      <span className="ed-label">{label}</span>
      <div className="ed-options">
        {options.map((o) => (
          <button key={o.id} type="button" className={value === o.id ? 'is-on' : ''} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
        {allowNone && value && (
          <button type="button" onClick={() => onChange(undefined)}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Personal state for one item: everything that changes as you go. Used inside
 * both the book and the media detail sheets. Without the edit key it shows the
 * same facts as plain text.
 */
export default function Editor({ item, shelf, items }) {
  const cat = category(item.cat);
  const act = actions(shelf, items);
  const isBook = item.cat === 'book';

  if (!shelf.canEdit) {
    const facts = [
      ['Status', statusLabel(item.status, item.cat)],
      ['Tier', tierLabel(item.tier)],
      ['Shelf', shelfLabel(item.shelf)],
      ['My score', item.myScore != null ? `${item.myScore}/10` : ''],
      ['Finished', monthText(item.finished)],
      ['Where I am', item.at],
      ['My note', item.mine],
    ].filter(([, v]) => v);
    return (
      <dl className="ed-facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    );
  }

  const statuses = STATUSES.map((s) => ({ ...s, label: statusLabel(s.id, item.cat) }));
  const done = item.status === 'done' || item.status === 'dropped';

  return (
    <div className="editor">
      <Choice label="Status" options={statuses} value={item.status} onChange={(s) => act.setStatus(item, s)} />

      {!isBook && <Choice label="Tier" options={TIERS} value={item.tier} onChange={(tier) => act.set(item, { tier })} allowNone />}
      {isBook && <Choice label="Copy" options={SHELVES} value={item.shelf} onChange={(s) => act.set(item, { shelf: s })} allowNone />}

      {!done && item.status !== 'active' && (
        <div className="ed-row">
          <span className="ed-label">Queue</span>
          <div className="ed-options">
            <button type="button" onClick={() => act.queueFirst(item)}>
              {item.status === 'next' ? 'Move to the front' : 'Put first in Up next'}
            </button>
          </div>
        </div>
      )}

      <div className="ed-grid">
        {cat.unit && cat.unit !== 'pages' && (
          <div className="ed-field">
            <span className="ed-label">Progress</span>
            <div className="ed-stepper">
              <button type="button" onClick={() => act.bump(item, -1)} aria-label="One less">
                −
              </button>
              <span className="ed-count">
                {item.progress ?? 0}
                {item.total ? ` / ${item.total}` : ''} {cat.unit}
              </span>
              <button type="button" onClick={() => act.bump(item, 1)} aria-label="One more">
                +
              </button>
            </div>
          </div>
        )}
        {cat.unit && cat.unit !== 'pages' && (
          <Field label={`Total ${cat.unit}`} type="number" value={item.total} onSave={(total) => act.set(item, { total })} />
        )}
        <Field label="Where I am" value={item.at} placeholder={isBook ? 'pg 120 / 350' : 'S2, ep 4'} onSave={(at) => act.set(item, { at })} />
        {!isBook && <Field label="Hours to finish" type="number" value={item.hrs} onSave={(hrs) => act.set(item, { hrs })} />}

        <label className="ed-field">
          <span className="ed-label">My score</span>
          <select
            value={item.myScore ?? ''}
            onChange={(e) => act.set(item, { myScore: e.target.value === '' ? undefined : Number(e.target.value) })}
          >
            <option value="">None</option>
            {SCORES.map((s) => (
              <option key={s} value={s}>
                {s}/10
              </option>
            ))}
          </select>
        </label>

        {done && (
          <label className="ed-field">
            <span className="ed-label">Finished</span>
            <input
              type="month"
              value={item.finished ?? ''}
              onChange={(e) => act.set(item, { finished: e.target.value || undefined })}
            />
          </label>
        )}
      </div>

      <Field label="My note" multiline value={item.mine} onSave={(mine) => act.set(item, { mine })} />

      {(item.edited || item.custom) && (
        <p className="ed-reset">
          <button
            type="button"
            onClick={() => {
              if (confirm(item.custom ? `Delete ${item.title}?` : `Undo every change to ${item.title}?`)) act.reset(item);
            }}
          >
            {item.custom ? 'Delete this item' : 'Undo my changes to this'}
          </button>
        </p>
      )}
    </div>
  );
}
