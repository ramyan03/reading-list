import { useEffect, useMemo, useState } from 'react';
import BookCard from './components/BookCard.jsx';
import BookDetail from './components/BookDetail.jsx';
import BookRow from './components/BookRow.jsx';
import Cursor from './components/Cursor.jsx';
import FilterBar from './components/FilterBar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import WeightPanel from './components/WeightPanel.jsx';
import { books as rawBooks } from './data/books.js';
import { DEFAULT_WEIGHTS, scoreAll } from './lib/score.js';
import { selectBooks } from './lib/select.js';
import { loadShelf, loadWeights, saveShelf, saveWeights } from './lib/storage.js';

const initialFilters = {
  query: '',
  genre: 'all',
  status: 'all',
  source: 'all',
  sort: 'weighted',
  sortDir: -1,
};

export default function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState('grid');
  const [weights, setWeights] = useState(() => ({
    ...DEFAULT_WEIGHTS,
    ...loadWeights({}),
  }));
  const [shelf, setShelf] = useState(loadShelf);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [openId, setOpenId] = useState(null);

  useEffect(() => saveWeights(weights), [weights]);
  useEffect(() => saveShelf(shelf), [shelf]);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  // books.js is the baseline; the shelf holds only what you have changed.
  const books = useMemo(
    () =>
      scoreAll(
        rawBooks.map((b) => ({
          ...b,
          status: shelf[b.id]?.status ?? b.status,
          favourite: !!shelf[b.id]?.favourite,
        })),
        weights
      ),
    [shelf, weights]
  );

  const visible = useMemo(() => selectBooks(books, filters), [books, filters]);

  const setStatus = (id, status) =>
    setShelf((s) => ({ ...s, [id]: { ...s[id], status } }));

  const toggleFavourite = (id) =>
    setShelf((s) => ({ ...s, [id]: { ...s[id], favourite: !s[id]?.favourite } }));

  const readCount = books.filter((b) => b.status === 'read').length;
  const authorCount = new Set(books.map((b) => b.author)).size;
  const ranked = useMemo(() => [...books].sort((a, b) => b.weighted - a.weighted), [books]);
  const openBook = visible.find((b) => b.id === openId) ?? books.find((b) => b.id === openId);

  const scrollToList = () =>
    document.getElementById('list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <Cursor />

      <Hero
        total={books.length}
        read={readCount}
        authors={authorCount}
        topBook={ranked[0]}
        onExplore={scrollToList}
      />

      <Marquee items={ranked.slice(0, 18).map((b) => b.author)} />

      <main id="list" className="list">
        <FilterBar
          state={filters}
          update={update}
          view={view}
          setView={setView}
          count={visible.length}
          onOpenWeights={() => setWeightsOpen(true)}
        />

        {visible.length === 0 ? (
          <p className="empty">
            Nothing matches. <button type="button" onClick={() => setFilters(initialFilters)}>Clear filters</button>
          </p>
        ) : view === 'grid' ? (
          <div className="grid">
            {visible.map((b, i) => (
              <BookCard
                key={b.id}
                book={b}
                rank={i}
                onOpen={(x) => setOpenId(x.id)}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        ) : (
          <div className="index">
            <div className="index-head">
              <span>#</span>
              <span>Title</span>
              <span>Genre</span>
              <span>Rating</span>
              <span className="row-hide-sm">Sold</span>
              <span className="row-hide-sm">Length</span>
              <span>Score</span>
            </div>
            {visible.map((b, i) => (
              <BookRow key={b.id} book={b} rank={i} onOpen={(x) => setOpenId(x.id)} />
            ))}
          </div>
        )}
      </main>

      <footer className="foot">
        <span>Master reading list</span>
        <span>{books.length} books · {authorCount} authors</span>
      </footer>

      <WeightPanel
        open={weightsOpen}
        weights={weights}
        setWeights={setWeights}
        onClose={() => setWeightsOpen(false)}
      />

      <BookDetail
        book={openBook}
        weights={weights}
        onClose={() => setOpenId(null)}
        onSetStatus={setStatus}
        onToggleFavourite={toggleFavourite}
      />
    </>
  );
}
