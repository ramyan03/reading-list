// Re-checks every anime and manga poster against AniList, strictly.
// Run with: node scripts/verify-anilist.mjs
//
// fetch-posters.mjs takes AniList's single best guess, which can be a
// different work with a similar name ("Bastard" came back as "The Mean Guy").
// This asks for several results and only trusts one whose romaji, English,
// native title or a synonym is the same as ours once punctuation is stripped.
//   exact match, different poster   -> poster replaced
//   no poster yet, close match      -> poster filled (word overlap >= 0.6)
//   otherwise                       -> left alone and listed for a look
// Genres and tags from the matched entry go to src/data/genres.js, which the
// generated fallback art uses to pick a motif.

import { writeFileSync } from 'node:fs';
import { media } from '../src/data/media.js';
import { posters } from '../src/data/posters.js';
import { genres as known } from '../src/data/genres.js';

const POSTERS = new URL('../src/data/posters.js', import.meta.url);
const GENRES = new URL('../src/data/genres.js', import.meta.url);
const DELAY = 2200; // AniList allows about 30 requests a minute.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const words = (s) =>
  new Set(
    (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w && !['movie', 'the', 'no', 'season', 'wa', 'ga', 'de', 'ni', 'to', 'a'].includes(w))
  );
const overlap = (a, b) => {
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / Math.max(A.size, B.size);
};

const QUERY = `query($s:String,$t:MediaType){Page(perPage:8){media(search:$s,type:$t){
  id title{romaji english native} synonyms genres tags{name rank} coverImage{extraLarge large}}}}`;

async function search(title, type, attempt = 1) {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { s: title, t: type } }),
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt > 4) throw new Error(`${res.status}`);
    await sleep((Number(res.headers.get('retry-after')) || 0) * 1000 + 3000 * attempt);
    return search(title, type, attempt + 1);
  }
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json())?.data?.Page?.media ?? [];
}

const names = (m) => [m.title.romaji, m.title.english, m.title.native, ...(m.synonyms ?? [])].filter(Boolean);

const out = { ...posters };
const gen = { ...known };
const report = { replaced: [], filled: [], unsure: [] };

const todo = media.filter((m) => m.cat === 'anime' || m.cat === 'manga');
for (const [i, item] of todo.entries()) {
  const title = item.title.replace(/\s*\((?:anime|manga)\)\s*$/i, '');
  try {
    // Adult entries often share a name with the real work ("Bastard",
    // "Orange", "Perfect World"), so they are never candidates; and a match
    // on a work's own title beats a match on another work's synonym.
    const results = (await search(title, item.cat === 'anime' ? 'ANIME' : 'MANGA')).filter((m) => !m.genres.includes('Hentai'));
    const titled = (m) => [m.title.romaji, m.title.english, m.title.native].some((n) => n && norm(n) === norm(title));
    const exact = results.find(titled) ?? results.find((m) => names(m).some((n) => norm(n) === norm(title)));
    let pick = exact;
    if (!pick && !out[item.id]) {
      const best = results
        .map((m) => [Math.max(...names(m).map((n) => overlap(n, title))), m])
        .sort((a, b) => b[0] - a[0])[0];
      if (best && best[0] >= 0.6) pick = best[1];
    }
    if (pick) {
      const url = pick.coverImage.extraLarge || pick.coverImage.large;
      if (!out[item.id]) report.filled.push(`${item.title} -> ${pick.title.romaji}`);
      else if (exact && out[item.id] !== url && !out[item.id].includes(`/b${pick.id}-`) && !out[item.id].includes(`/bx${pick.id}-`))
        report.replaced.push(`${item.title} -> ${pick.title.romaji} (${pick.title.english ?? ''})`);
      out[item.id] = url;
      gen[item.id] = [...pick.genres, ...pick.tags.filter((t) => t.rank >= 70).slice(0, 6).map((t) => t.name)];
    } else {
      report.unsure.push(item.title);
    }
    console.log(`${String(i + 1).padStart(3)}/${todo.length} ${exact ? 'exact' : pick ? 'close' : 'none '} ${item.title}`);
  } catch (err) {
    console.log(`${String(i + 1).padStart(3)}/${todo.length} err   ${item.title}: ${err.message}`);
  }
  await sleep(DELAY);
}

const render = (map, head, name) =>
  `${head}\n\nexport const ${name} = {\n${Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, v]) => `  ${JSON.stringify(id)}: ${JSON.stringify(v)},`)
    .join('\n')}\n};\n`;

writeFileSync(
  POSTERS,
  render(
    out,
    `// Poster or cover art for every non-book item, keyed by item id. Generated by
// scripts/fetch-posters.mjs (and checked by scripts/verify-anilist.mjs) and
// committed so the app never calls those APIs at runtime. Regenerate with
// \`npm run posters\` after adding items; existing entries are left alone. Set an
// entry to null to keep a wrong match out.`,
    'posters'
  )
);
writeFileSync(
  GENRES,
  render(
    gen,
    `// Genres and strong tags per item id, from AniList and TVmaze. Only used to
// give the generated fallback art a motif that fits (see AbstractArt.jsx).`,
    'genres'
  )
);

console.log('\nREPLACED', report.replaced.length, '\n  ' + report.replaced.join('\n  '));
console.log('FILLED', report.filled.length, '\n  ' + report.filled.join('\n  '));
console.log('NO SURE MATCH', report.unsure.length, '\n  ' + report.unsure.join('\n  '));
