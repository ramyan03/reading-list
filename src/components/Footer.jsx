import { useState } from 'react';
import { REVIEWS_ORIGIN } from '../data/reviews.js';

const SYNC_TEXT = {
  loading: 'Loading',
  synced: 'Saved',
  saving: 'Saving',
  offline: 'Offline, changes kept on this device',
  local: 'Read only: no database connected',
};

/**
 * Sync state and the edit key. Unlocking is per device: the key is checked
 * against the server once and then remembered in this browser.
 */
export default function Footer({ shelf }) {
  const [unlocking, setUnlocking] = useState(false);
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const err = await shelf.unlock(key.trim());
    setBusy(false);
    if (err) setError(err);
    else {
      setUnlocking(false);
      setKey('');
      setError(null);
    }
  };

  return (
    <footer className="foot">
      <span>Ramyan Reads</span>

      <span className="foot-sync" data-sync={shelf.sync}>
        {SYNC_TEXT[shelf.sync]}
        {shelf.canEdit && shelf.pendingCount > 0 && shelf.sync !== 'saving' && ` (${shelf.pendingCount} waiting)`}
        {shelf.error && shelf.sync === 'offline' && <span className="foot-error"> · {shelf.error}</span>}
      </span>

      <span className="foot-edit">
        {shelf.canEdit ? (
          <button type="button" onClick={shelf.lock}>
            Lock editing
          </button>
        ) : unlocking ? (
          <form onSubmit={submit} className="unlock">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Edit key"
              aria-label="Edit key"
              autoComplete="current-password"
              autoFocus
            />
            <button type="submit" disabled={busy || !key.trim()}>
              {busy ? 'Checking' : 'Unlock'}
            </button>
            {error && <span className="foot-error">{error}</span>}
          </form>
        ) : (
          <button type="button" onClick={() => setUnlocking(true)}>
            Unlock to edit
          </button>
        )}
      </span>

      <span>
        <a href={REVIEWS_ORIGIN}>Ramyan Reviews &rarr;</a>
      </span>
    </footer>
  );
}
