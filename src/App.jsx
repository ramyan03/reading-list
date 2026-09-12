import { useEffect, useMemo, useState } from 'react';
import BookCard from './components/BookCard.jsx';
import BookDetail from './components/BookDetail.jsx';
import BookRow from './components/BookRow.jsx';
import Controls from './components/Controls.jsx';
import Masthead from './components/Masthead.jsx';
import WeightPanel from './components/WeightPanel.jsx';
import { books as rawBooks } from './data/books.js';
import { REVIEWS_ORIGIN } from './data/reviews.js';
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

/**
 * Reviews links back here with ?q=<title>, so arriving from a review lands on
 * that book rather than on the top of a 161 book list. Read once, on mount.
 */
function initialState() {
  try {
    const q = new URLSearchParams(location.search).get('q');
    return q ? { ...initialFilters, query: q } : initialFilters;
  } catch {
    return initialFilters;
  }
}

export default function App() {
  const [filters, setFilters] = useState(initialState);
  const [view, setView] = useState('grid');
  const [weights, setWeights] = useState(() => ({ ...DEFAULT_WEIGHTS, ...loadWeights({}) }));
  const [shelf, setShelf] = useState(loadShelf);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [openId, setOpenId] = useState(null);

  useEffect(() => saveWeights(weights), [weights]);
  useEffect(() => saveShelf(shelf), [shelf]);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  // books.js is the baseline; the shelf holds only what has been changed here.
  const books = useMemo(
    () =>
      scoreAll(
        rawBooks.map((b) => ({ ...b, status: shelf[b.id]?.status ?? b.status })),
        weights
      ),
    [shelf, weights]
  );

  const visible = useMemo(() => selectBooks(books, filters), [books, filters]);

  const setStatus = (id, status) => setShelf((s) => ({ ...s, [id]: { ...s[id], status } }));

  const readCount = books.filter((b) => b.status === 'read').length;
  const readingCount = books.filter((b) => b.status === 'next').length;
  const authorCount = new Set(books.map((b) => b.author)).size;
  const openBook = books.find((b) => b.id === openId);

  return (
    <>
      <Masthead
        total={books.length}
        read={readCount}
        reading={readingCount}
        authors={authorCount}
      />

      <Controls
        state={filters}
        update={update}
        view={view}
        setView={setView}
        count={visible.length}
        onOpenWeights={() => setWeightsOpen(true)}
      />

      <main className="catalogue">
        {visible.length === 0 ? (
          <p className="empty">
            Nothing matches.{' '}
            <button type="button" onClick={() => setFilters(initialFilters)}>
              Clear
            </button>
          </p>
        ) : view === 'grid' ? (
          <div className="grid">
            {visible.map((b) => (
              <BookCard key={b.id} book={b} onOpen={(x) => setOpenId(x.id)} />
            ))}
          </div>
        ) : (
          <div className="index">
            <div className="index-head">
              <span>#</span>
              <span>Title</span>
              <span>Genre</span>
              <span>Rating</span>
              <span>Score</span>
            </div>
            {visible.map((b, i) => (
              <BookRow key={b.id} book={b} rank={i} onOpen={(x) => setOpenId(x.id)} />
            ))}
          </div>
        )}
      </main>

      <footer className="foot">
        <span>Ramyan Reads</span>
        <span>
          <a href={REVIEWS_ORIGIN}>Ramyan Reviews &rarr;</a>
        </span>
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
      />
    </>
  );
}
