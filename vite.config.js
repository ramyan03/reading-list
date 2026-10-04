import fs from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileStore, handleShelf, upstashStore } from './api/_shelf.js';

/**
 * Serves /api/shelf during `npm run dev` with the same handler Vercel runs.
 * Without Upstash credentials in .env.local it stores to .data/shelf.json, and
 * the edit key defaults to "dev".
 */
function shelfApi(env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  const store = url && token ? upstashStore(url, token) : fileStore('.data/shelf.json', fs);
  const editKey = env.EDIT_KEY || 'dev';

  return {
    name: 'shelf-api',
    configureServer(server) {
      server.middlewares.use('/api/shelf', async (req, res) => {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        let body;
        try {
          body = raw ? JSON.parse(raw) : undefined;
        } catch {
          body = undefined;
        }
        const { status, json } = await handleShelf({ method: req.method, headers: req.headers, body }, store, editKey);
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(json));
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), shelfApi(loadEnv(mode, process.cwd(), ''))],
}));
