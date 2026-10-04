// The shelf: what has been changed in the app, synced through /api/shelf.
//
// A record per item id. For a baseline item it is a patch ({ status, myScore,
// ... }) laid over the data files; for an item added in the app it is the whole
// item, marked custom: true. Deleting a custom item removes its record.
//
// Three layers, so the app opens instantly and survives a dead train signal:
//   cache    the last records seen, in localStorage, rendered immediately
//   server   fetched on load and whenever the tab comes back into view
//   pending  edits not yet confirmed by the server, replayed over the top of
//            whatever the server says until it accepts them
//
// Without the edit key the shelf is read-only and nothing is queued.

import { useCallback, useEffect, useRef, useState } from 'react';

const CACHE = 'rl.records';
const PENDING = 'rl.pending';
const KEY = 'rl.editKey';
const ENDPOINT = '/api/shelf';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: the app still works, it just will not remember offline.
  }
};

const overlay = (records, pending) => {
  const out = { ...records };
  for (const [id, rec] of Object.entries(pending)) {
    if (rec === null) delete out[id];
    else out[id] = rec;
  }
  return out;
};

/**
 * sync is one of:
 *   loading   first fetch in flight
 *   synced    server and this device agree
 *   saving    edits are on their way
 *   offline   edits are queued on this device and will retry
 *   local     no server reachable at all (e.g. `vite preview`); edits stay here
 */
export function useShelf() {
  const [records, setRecords] = useState(() => overlay(read(CACHE, {}), read(PENDING, {})));
  const [editKey, setEditKey] = useState(() => read(KEY, null));
  const [sync, setSync] = useState('loading');
  const [error, setError] = useState(null);

  const server = useRef(read(CACHE, {}));
  const pending = useRef(read(PENDING, {}));
  const keyRef = useRef(editKey);
  keyRef.current = editKey;
  const flushing = useRef(false);

  const publish = useCallback(() => {
    setRecords(overlay(server.current, pending.current));
  }, []);

  const flush = useCallback(async () => {
    const key = keyRef.current;
    const batch = { ...pending.current };
    if (!key || flushing.current || Object.keys(batch).length === 0) return;
    flushing.current = true;
    setSync('saving');
    let accepted = false;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-edit-key': key },
        body: JSON.stringify({ changes: batch }),
      });
      if (res.status === 401) {
        setEditKey(null);
        write(KEY, null);
        setError('The edit key was rejected. Unlock again to keep editing.');
        setSync('offline');
        return;
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);

      // Accepted: fold into the server copy, and drop only the pending entries
      // that were not edited again while the request was out.
      for (const [id, rec] of Object.entries(batch)) {
        if (rec === null) delete server.current[id];
        else server.current[id] = rec;
        if (pending.current[id] === rec) delete pending.current[id];
      }
      write(CACHE, server.current);
      write(PENDING, pending.current);
      accepted = true;
      setError(null);
      setSync(Object.keys(pending.current).length ? 'saving' : 'synced');
    } catch (err) {
      setError(String(err.message || err));
      setSync('offline');
    } finally {
      flushing.current = false;
    }
    // Something changed while that request was out: send it too. Only after a
    // success; a failure waits for the online / visibility events instead, or
    // an offline fetch (which rejects instantly) would spin here forever.
    if (accepted && Object.keys(pending.current).length && keyRef.current) flush();
  }, []);

  const pull = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('json')) {
        setSync(res.status === 503 ? 'local' : 'offline');
        return;
      }
      const { records: fresh } = await res.json();
      server.current = fresh || {};
      write(CACHE, server.current);
      publish();
      setSync(Object.keys(pending.current).length ? 'offline' : 'synced');
      flush();
    } catch {
      setSync('offline');
    }
  }, [flush, publish]);

  useEffect(() => {
    pull();
    const onVisible = () => document.visibilityState === 'visible' && pull();
    addEventListener('online', pull);
    document.addEventListener('visibilitychange', onVisible);
    // A weak signal never fires "online", so queued edits also retry slowly.
    const retry = setInterval(() => Object.keys(pending.current).length && flush(), 30000);
    return () => {
      clearInterval(retry);
      removeEventListener('online', pull);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pull]);

  /** Set an item's whole record (null deletes it). */
  const put = useCallback(
    (id, rec) => {
      if (!keyRef.current) return;
      pending.current = { ...pending.current, [id]: rec };
      write(PENDING, pending.current);
      publish();
      flush();
    },
    [flush, publish]
  );

  /** Merge fields into an item's record. undefined values are removed. */
  const patch = useCallback(
    (id, fields) => {
      const current = overlay(server.current, pending.current)[id] || {};
      const next = { ...current, ...fields };
      for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
      put(id, next);
    },
    [put]
  );

  /** Checks the key against the server before keeping it. */
  const unlock = useCallback(
    async (key) => {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-edit-key': key },
        body: JSON.stringify({ changes: {} }),
      }).catch(() => null);
      if (!res) return 'Could not reach the server.';
      if (res.status === 401) return 'That key is wrong.';
      if (!res.ok) return (await res.json().catch(() => ({}))).error || `Server said ${res.status}.`;
      write(KEY, key);
      keyRef.current = key;
      setEditKey(key);
      setError(null);
      flush();
      return null;
    },
    [flush]
  );

  const lock = useCallback(() => {
    write(KEY, null);
    setEditKey(null);
  }, []);

  return {
    records,
    canEdit: Boolean(editKey),
    sync,
    error,
    pendingCount: Object.keys(pending.current).length,
    put,
    patch,
    unlock,
    lock,
  };
}
