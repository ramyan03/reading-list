// Vercel function for /api/state: the shelf as it stands, read only and
// public, for anything that can fetch a URL (a claude.ai skill on the phone).
// /api/shelf is the raw edits; this is those edits applied to the data files.

import { upstashStore } from './_shelf.js';
import { shelfState } from './_state.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let records = {};
  let synced = Boolean(url && token);
  if (synced) {
    try {
      records = await upstashStore(url, token).all();
    } catch (err) {
      console.error(err);
      synced = false;
    }
  }
  res.status(200).json(shelfState(records, synced));
}
