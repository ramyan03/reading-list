import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';

/**
 * The admin password prompt. The password is the server's EDIT_KEY: it is
 * checked by /api/shelf before it is kept, and every save sends it again, so
 * hiding the edit controls is a convenience and the server is the real gate.
 * Once unlocked, this same dialog offers to lock again.
 */
export default function AdminGate({ open, onClose, shelf }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    if (!open) return;
    setKey('');
    setError(null);
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    setTimeout(() => input.current?.focus(), 30);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setBusy(true);
    const err = await shelf.unlock(key.trim());
    setBusy(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div className="gate-wrap" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="gate-scrim" onClick={onClose} />
      <div className="gate">
        <span className="gate-icon">
          <Icon name={shelf.canEdit ? 'unlock' : 'lock'} size={22} />
        </span>
        <h2 id="gate-title">{shelf.canEdit ? 'Admin mode is on' : 'Admin'}</h2>

        {shelf.canEdit ? (
          <>
            <p>
              You can change ratings, progress and status on every page. Edits save to all your devices. This browser stays
              unlocked until you lock it.
            </p>
            <div className="gate-actions">
              <button type="button" className="btn" onClick={onClose}>
                Keep editing
              </button>
              <button
                type="button"
                className="btn is-quiet"
                onClick={() => {
                  shelf.lock();
                  onClose();
                }}
              >
                Lock
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <p>Enter the admin password to edit ratings and progress.</p>
            <input
              ref={input}
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError(null);
              }}
              placeholder="Password"
              aria-label="Admin password"
              autoComplete="current-password"
            />
            {error && <p className="gate-error">{error}</p>}
            <div className="gate-actions">
              <button type="submit" className="btn" disabled={busy || !key.trim()}>
                {busy ? 'Checking...' : 'Unlock'}
              </button>
              <button type="button" className="btn is-quiet" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
