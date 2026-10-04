// Vercel function for /api/shelf. All the logic is in _shelf.js.
//
// Env: EDIT_KEY, plus the Upstash REST credentials. The Vercel marketplace
// integration names them KV_REST_API_URL / KV_REST_API_TOKEN; a database made
// directly on upstash.com gives UPSTASH_REDIS_REST_URL / _TOKEN. Either works.

import { handleShelf, upstashStore } from './_shelf.js';

export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  res.setHeader('Cache-Control', 'no-store');

  if (!url || !token) {
    res.status(503).json({ error: 'No database configured' });
    return;
  }

  try {
    const { status, json } = await handleShelf(
      { method: req.method, headers: req.headers, body: req.body },
      upstashStore(url, token),
      process.env.EDIT_KEY
    );
    res.status(status).json(json);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Database unavailable' });
  }
}
