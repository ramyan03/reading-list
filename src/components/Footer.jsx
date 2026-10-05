import { REVIEWS_ORIGIN } from '../data/reviews.js';

const SYNC_TEXT = {
  loading: 'Loading',
  synced: 'Saved',
  saving: 'Saving',
  offline: 'Offline, changes kept on this device',
  local: 'Read only: no database connected',
};

/** Sync state, and a second way into admin mode (the first is the top bar). */
export default function Footer({ shelf, onAdmin }) {
  return (
    <footer className="foot">
      <span>Ramyan Reads</span>

      <span className="foot-sync" data-sync={shelf.sync}>
        {SYNC_TEXT[shelf.sync]}
        {shelf.canEdit && shelf.pendingCount > 0 && shelf.sync !== 'saving' && ` (${shelf.pendingCount} waiting)`}
        {shelf.error && shelf.sync === 'offline' && <span className="foot-error"> · {shelf.error}</span>}
      </span>

      <span className="foot-edit">
        <button type="button" onClick={onAdmin}>
          {shelf.canEdit ? 'Admin mode on' : 'Admin'}
        </button>
      </span>

      <span>
        <a href={REVIEWS_ORIGIN}>Ramyan Reviews &rarr;</a>
      </span>
    </footer>
  );
}
