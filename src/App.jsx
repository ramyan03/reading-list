import { useMemo, useState } from 'react';
import BookCard from './components/BookCard.jsx';
import Controls from './components/Controls.jsx';
import Legend from './components/Legend.jsx';
import { books } from './data/books.js';
import { selectBooks } from './lib/select.js';

const initialState = {
  query: '',
  genre: 'all',
  status: 'all',
  source: 'all',
  sort: 'score',
  sortDir: -1,
};

export default function App() {
  const [state, setState] = useState(initialState);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  // Clicking the active sort flips direction; a new sort starts descending.
  const onSort = (sort) =>
    setState((s) =>
      s.sort === sort ? { ...s, sortDir: s.sortDir * -1 } : { ...s, sort, sortDir: -1 }
    );

  const visible = useMemo(() => selectBooks(books, state), [state]);
  const readCount = visible.filter((b) => b.status === 'read').length;

  return (
    <>
      <header>
        <h1>Master reading list</h1>
        <p className="subtitle">
          {books.length} books · sourced from Goodreads, /lit/, Reddit, critics, sales, BookTok
        </p>
      </header>

      <Controls state={state} update={update} onSort={onSort} />
      <Legend />

      <div className="stats-bar">
        {visible.length} books · {readCount} read
      </div>

      <main>
        {visible.length === 0 ? (
          <p className="empty">No books match</p>
        ) : (
          visible.map((b) => <BookCard key={b.id} book={b} />)
        )}
      </main>
    </>
  );
}
