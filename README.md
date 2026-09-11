# Master Reading List

A small web app for the master reading list — 161 books sourced from Goodreads,
/lit/, Reddit, critics, sales figures and BookTok, with search, filtering and
sorting.

Converted from a single-file `master_reading_list.html` into a Vite + React
project so the data and the UI can grow separately.

## Running it

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Layout

```
src/
  main.jsx              entry point
  App.jsx               filter state, wires everything together
  styles.css            all styling
  components/
    Controls.jsx        search box, filter pills, sort buttons
    BookCard.jsx        one book row
    Legend.jsx          source dot legend
  data/
    books.js            the list itself — edit this to add books
    taxonomy.js         genres, statuses, sources, sort options
  lib/
    select.js           filtering + sorting (pure)
    format.js           display formatting
```

## Adding a book

Append an entry to `rawBooks` in `src/data/books.js`:

```js
{ title:"…", author:"…", genre:"Russian", year:1880, rating:4.37,
  copies:12, words:364000, status:"next", sources:["gr","lit"],
  note:"…", score:96 },
```

- `status` — `read`, `owned`, `next` or `todo`
- `sources` — any of `gr`, `lit`, `reddit`, `sales`, `critics`, `booktok`
- `copies` — millions sold; `words` — approximate word count
- `score` — 0–100 aggregate used for the default sort

Genres are read out of the data, so a new genre appears as a filter pill
automatically. To give it a colour, add a `.t-<Genre>` rule in `styles.css`;
to control where it sits in the filter row, add it to `GENRE_ORDER` in
`src/data/taxonomy.js`.

Duplicate title+author pairs are dropped automatically, keeping the first.

## Deploying

Vercel picks this up with no configuration — framework preset Vite, build
command `npm run build`, output directory `dist`.
