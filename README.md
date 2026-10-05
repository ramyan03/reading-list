# Ramyan Reads

Everything I am reading, watching and playing: what is in progress, what comes
next in each medium, the 2026-27 plan, and everything finished so far. Books
keep their recommendation engine, ranked by a **weighted score you tune
yourself**. Edits sync between phone and laptop.

Live at https://ramyan-reads.vercel.app. Pushing `main` deploys.

## Running it

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:5173, edit key "dev", saves to .data/shelf.json
npm run check    # data and API invariants; run after editing anything in src/data
npm run build    # production build into dist/
npm run covers   # refresh book cover art after adding books
npm run posters  # fetch posters for new non-book items (AniList, TVmaze, Wikipedia)
```

## Sections

| Route    | What it is                                                          |
| -------- | ------------------------------------------------------------------- |
| `#now`   | Home: hero with the Doomsday countdown, a card per medium, current and recent (with +1 and Finished), the next 6 months of the plan, and every backlog folded up |
| `#backlog` | Every category's queue and backlog, expanded, with totals         |
| `#plan`  | The whole plan as month columns or a written list, then the Doomsday checklist |
| `#books` | The original catalogue: covers or index, weighted score, filters    |
| `#shows` `#films` `#anime` `#manga` `#games` `#comics` | One list per medium, grouped now / next / backlog / paused / finished |

Reviews links here with `?q=<title>`, which opens the books tab on that search.

## Data, and how edits are stored

The data files are the baseline and never change at runtime:

- `src/data/books.js`: 183 books with their scoring signals
- `src/data/media.js`: 426 shows, films, anime, manga, games and comics
- `src/data/plan.js`: the monthly plan and the Doomsday goal

Every item shares one vocabulary (`src/data/categories.js`):

- `status`: `active`, `next`, `backlog`, `paused`, `done`, `dropped`
- `tier`: `must`, `good`, `burner`, `skip`
- `shelf` (books): `owned`, `gift`, `buy`
- `order`: position in the up next queue; `progress` / `total`, `at` (where I am),
  `myScore` (out of 10), `finished` (YYYY-MM), `mine` (my note), `note` (the blurb)

What gets changed in the app is stored separately as **overrides**: one record
per item id, holding only the changed fields, plus whole records for items added
in the app (`custom: true`). So a data fix never clobbers an edit, and an edit
never hides a data fix. "Undo my changes" on an item deletes its record.

The overrides live in one Upstash Redis hash behind `/api/shelf`
(`api/_shelf.js`). Reading is public (the baseline is already in the public
bundle). Writing needs `EDIT_KEY`. On each device you unlock once from the
footer and the key is remembered there.

The client (`src/lib/shelf.js`) renders the cached copy instantly, pulls fresh
on load and whenever the tab comes back into view, and queues edits made offline
in localStorage. They retry on `online`, on focus, and every 30 seconds.
**A failed save must never retry itself synchronously**: an offline `fetch`
rejects instantly and a self-retrying flush froze the page in testing.

## Setting up sync on Vercel

1. Vercel project `ramyan-reads` → Storage → Marketplace → **Upstash for Redis**
   → create (free plan) and connect it to the project. This adds
   `KV_REST_API_URL` and `KV_REST_API_TOKEN`. (A database made directly on
   upstash.com works too; use its `UPSTASH_REDIS_REST_URL` / `_TOKEN`.)
2. Settings → Environment Variables → add `EDIT_KEY`, a long random string.
3. Redeploy. Open the site, footer → Unlock to edit, paste the key.

Without a database the site still works, read only, and the footer says so.
To use the real database locally, put the same variables in `.env.local`.

## Adding things

From the app: unlock, open a tab, press **Add**. Permanent additions belong in
the data files: append to `media.js`, or to `rawBooks` in `books.js`:

```js
{ title:"…", author:"…", genre:"Russian", year:1880, rating:4.37,
  copies:12, words:364000, status:"next", sources:["gr","lit"],
  note:"…", score:96 },
```

`sources` is any of `gr`, `lit`, `reddit`, `sales`, `critics`, `booktok`;
`score` is the hand-assigned 0-100 editorial rating. Either can be `null` when
unknown, and that signal then drops out of the average instead of scoring zero
(the 22 books added from the master list in October 2026 are like this). Run
`npm run covers`, then `npm run check`.

## The weighted score

Every book is reduced to ten signals, each normalised to 0-100, then combined as
a **weighted average**, so the result stays on a 0-100 scale however the weights
are set.

| Group     | Signals                                      |
| --------- | -------------------------------------------- |
| Judgement | Editorial score, Goodreads rating, breadth    |
| Taste     | /lit/, Critics, Reddit, BookTok               |
| Reach     | Copies sold (log scale, 1M-500M)              |
| Practical | Brevity, Recency                              |

Weights live in a slide-out panel, persist per browser, and ship with five
presets. Copies sold is log-scaled, or everything but Don Quixote sits at the
bottom. Editorial correlates with nearly every other signal, so `Literary`
holds it at 25 or it just reproduces `Balanced`. The breakdown in a book's
detail reconciles to its score exactly; `npm run check` tests that.

## Design notes

A streaming-service home, dark first with a light mode (the sun/moon in the top
bar, remembered per browser). Deep blue-black ground, Inter, a periwinkle
accent, and each medium's own colour (`color` in `categories.js`) on its card,
kicker and progress bar. Tokens are at the top of `styles.css`; the home layout
is in `home.css`. The hero mountain is drawn SVG (`HeroArt.jsx`), not a photo.
Art comes from Open Library (books) and `src/data/posters.js` (everything else,
generated by `npm run posters`; set an entry to `null` to drop a wrong match).
Anything without art gets a tile in its category colour. Still no em dashes.

Traps already paid for:

- **`overflow-x` belongs on `html`, not `body`.** On `body` it makes body the
  scroll container and silently breaks `scrollIntoView`, sticky positioning and
  viewport IntersectionObservers.
- **Chrome throttles background tabs.** Browser automation sees
  `visibilityState: "hidden"`, so verify with DOM reads rather than screenshots
  and avoid long waits inside one evaluation.

## Layout

```
api/
  shelf.js            Vercel function
  _shelf.js           handler + Upstash and file stores (shared with dev)
src/
  App.jsx             routing, shelf, detail sheets
  components/         HomeView, TopBar, PlanBoard, BacklogBoard, BooksView, MediaView, Editor, ...
  lib/
    shelf.js          sync hook
    catalogue.js      baseline + overrides, queue ordering (pure)
    actions.js        start, finish, +1, queue first
    score.js          the weighted model (pure)
    select.js         filtering and sorting (pure)
  data/               books, media, plan, categories, covers, posters, reviews
scripts/
  check.mjs           invariants
  fetch-covers.mjs    Open Library cover lookup
  fetch-posters.mjs   poster lookup for everything else
```
