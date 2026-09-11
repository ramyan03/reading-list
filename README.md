# Reading List

A personal recommendation engine for books. 161 titles sourced from Goodreads,
/lit/, Reddit, critics, sales figures and BookTok, ranked by a **weighted score
you tune yourself**.

Not a library catalogue: it answers "what should I read next, by my standards"
rather than "what have I read".

## Running it

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run covers   # refresh cover art after adding books
```

## The weighted score

Every book is reduced to ten signals, each normalised to 0–100, then combined as
a **weighted average**. An average rather than a sum, so the result stays on a
0–100 scale no matter how the weights are set and books stay comparable between
presets.

| Group     | Signals                                      |
| --------- | -------------------------------------------- |
| Judgement | Editorial score, Goodreads rating, breadth    |
| Taste     | /lit/, Critics, Reddit, BookTok               |
| Reach     | Copies sold (log scale, 1M–500M)              |
| Practical | Brevity, Recency                              |

Weights live in a slide-out panel and persist to `localStorage`. Five presets
ship as starting points: Balanced, Literary, Popular, Quick wins, Canon.

Two things worth knowing about the model:

- **Copies sold is log-scaled.** Linear would put everything except Don Quixote
  at the bottom.
- **Editorial score correlates with nearly every other signal**, so weighting it
  highly flattens the presets into each other. `Literary` deliberately holds it
  at 25 — otherwise it just reproduces `Balanced`.

Open any book to see the full breakdown: each signal's value, its weight, and
its share of the final number. The shares sum to the score exactly.

## Your own state

Shelf status (read / owned / up next / to read) and favourites are editable in
the UI and saved to `localStorage`. `books.js` stays the baseline; only your
overrides are stored, so re-running the data never clobbers your shelf and your
shelf never hides a data fix.

This is per-browser and not backed up. Anything you want permanent belongs in
`books.js`.

## Layout

```
src/
  main.jsx              entry point
  App.jsx               state, wiring, shelf overrides
  styles.css            all styling, design tokens at the top
  components/
    Hero.jsx            oversized display type, animated stats
    Marquee.jsx         author ticker
    FilterBar.jsx       search, filters, sort, view toggle
    BookCard.jsx        grid view
    BookRow.jsx         index view
    BookDetail.jsx      overlay with the score breakdown
    WeightPanel.jsx     the sliders
    Cursor.jsx          custom cursor
  hooks/
    useReveal.js        scroll-triggered reveals
    useCountUp.js       animated numbers
  lib/
    score.js            the weighted model (pure)
    select.js           filtering and sorting (pure)
    format.js           display formatting
    storage.js          localStorage, guarded
  data/
    books.js            the list itself
    covers.js           generated, do not hand-edit
    taxonomy.js         genres, statuses, sources, sorts
scripts/
  fetch-covers.mjs      cover lookup against Open Library
```

`score.js` and `select.js` are pure and import nothing from React, so the whole
ranking model can be exercised from Node without a browser.

## Adding a book

Append to `rawBooks` in `src/data/books.js`:

```js
{ title:"…", author:"…", genre:"Russian", year:1880, rating:4.37,
  copies:12, words:364000, status:"next", sources:["gr","lit"],
  note:"…", score:96 },
```

- `status` — `read`, `owned`, `next` or `todo`
- `sources` — any of `gr`, `lit`, `reddit`, `sales`, `critics`, `booktok`
- `copies` — millions sold; `words` — approximate word count
- `score` — the hand-assigned 0–100 editorial rating

Then run `npm run covers`, which looks up only the books it has no id for and
rewrites `src/data/covers.js`. Cover ids are committed so the app never calls
Open Library at runtime.

Genres are read from the data, so a new genre becomes a filter automatically.
Add a `GENRE_ORDER` entry in `taxonomy.js` to place it in the row.

## Design notes

Dark only, deliberately. Instrument Serif for display, Space Grotesk for UI,
JetBrains Mono for anything numeric. One accent (`--accent`) carries every
interactive and emphatic state; all colour lives in tokens at the top of
`styles.css`.

Two traps already paid for, worth not reintroducing:

- **`overflow-x` belongs on `html`, not `body`.** On `body` it makes body the
  scroll container, which pins `window.scrollY` at 0 and silently breaks
  `scrollIntoView`, sticky positioning and any viewport IntersectionObserver.
- **Scroll reveals need a fallback.** Chrome does not run IntersectionObserver
  callbacks in a hidden tab, so a page loaded into a background tab would sit at
  `opacity: 0`. `useReveal` reveals unconditionally if no observer anywhere has
  reported within 2.5s.

## Deploying

Vercel needs no configuration: Vite preset, build `npm run build`, output `dist`.
