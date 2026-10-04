import { useState } from 'react';
import { TIERS } from '../data/categories.js';
import { slugify, thisMonth } from '../lib/catalogue.js';

const START = [
  { id: 'next', label: 'Up next' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'active', label: 'Started' },
  { id: 'done', label: 'Finished' },
];

/**
 * Adds something that is not in the data files. It lives only on the shelf,
 * as a whole record marked custom, so it syncs like any other edit.
 */
export default function AddItem({ cat, shelf, onDone }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('backlog');
  const [tier, setTier] = useState('good');
  const isBook = cat.id === 'book';

  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    // Suffix keeps two adds of the same title from overwriting each other.
    const id = `u-${slugify(`${cat.id}-${t}`).slice(0, 100)}-${Date.now().toString(36)}`;
    const rec = { custom: true, cat: cat.id, title: t, status };
    if (isBook) {
      rec.author = author.trim() || 'Unknown';
      rec.genre = 'Added';
      rec.sources = null;
      rec.score = null;
    } else {
      rec.tier = tier;
    }
    if (status === 'done') rec.finished = thisMonth();
    if (status === 'active') rec.started = thisMonth();
    if (status === 'next') rec.order = 99;
    shelf.put(id, rec);
    setTitle('');
    setAuthor('');
    onDone();
  };

  return (
    <form className="add" onSubmit={submit}>
      <label className="ed-field">
        <span className="ed-label">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </label>
      {isBook && (
        <label className="ed-field">
          <span className="ed-label">Author</span>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
      )}
      <div className="ed-row">
        <span className="ed-label">As</span>
        <div className="ed-options">
          {START.map((s) => (
            <button key={s.id} type="button" className={status === s.id ? 'is-on' : ''} onClick={() => setStatus(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {!isBook && (
        <div className="ed-row">
          <span className="ed-label">Tier</span>
          <div className="ed-options">
            {TIERS.map((s) => (
              <button key={s.id} type="button" className={tier === s.id ? 'is-on' : ''} onClick={() => setTier(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="add-actions">
        <button type="submit" className="button">
          Add to {cat.label.toLowerCase()}
        </button>
        <button type="button" className="button-quiet" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
