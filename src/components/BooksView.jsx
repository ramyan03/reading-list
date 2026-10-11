import { useMemo, useState } from 'react';
import { category } from '../data/categories.js';
import { selectBooks } from '../lib/select.js';
import { actions } from '../lib/actions.js';
import AddItem from './AddItem.jsx';
import BookRow from './BookRow.jsx';
import Controls from './Controls.jsx';
import { Icon } from './Icons.jsx';
import PosterTile from './PosterTile.jsx';
import WeightPanel from './WeightPanel.jsx';

const initialFilters = {
  query: '',
  genre: 'all',
  status: 'all',
  shelf: 'all',
  source: 'all',
  sort: 'weighted',
  sortDir: -1,
};

/**
 * Reviews links back here with ?q=<title>, so arriving from a review lands on
 * that book rather than on the top of the list. Read once, on mount.
 */
function initialState() {
  try {
    const q = new URLSearchParams(location.search).get('q');
    return q ? { ...initialFilters, query: q } : initialFilters;
  } catch {
    return initialFilters;
  }
}

/**
 * The book index (#covers): every book as a wall of covers or a ranked list,
 * by the tunable weighted score. The Books tab itself is the backlog, laid out
 * like every other category; this is the one place that shows the lot.
 */
export default function BooksView({ books, weights, setWeights, onOpen, shelf }) {
  const [filters, setFilters] = useState(initialState);
  const [view, setView] = useState('grid');
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const visible = useMemo(() => selectBooks(books, filters), [books, filters]);
  const act = actions(shelf, books);

  return (
    <>
      <div className="cat-page is-top">
        <header className="index-intro">
          <a className="view-all is-back" href="#books">
            <Icon name="arrow" size={14} /> Books
          </a>
          <h1>Every book</h1>
          <p>
            All {books.length}, from what I'm reading to what I've finished, ranked by the weighted score.
          </p>
        </header>
      </div>

      <Controls
        state={filters}
        update={update}
        view={view}
        setView={setView}
        count={visible.length}
        onOpenWeights={() => setWeightsOpen(true)}
        onAdd={shelf.canEdit ? () => setAdding((a) => !a) : null}
        adding={adding}
      >
        {adding && <AddItem cat={category('book')} shelf={shelf} onDone={() => setAdding(false)} />}
      </Controls>

      <main className="catalogue">
        {visible.length === 0 ? (
          <p className="empty">
            Nothing matches.{' '}
            <button type="button" onClick={() => setFilters(initialFilters)}>
              Clear
            </button>
          </p>
        ) : view === 'grid' ? (
          <div className="tiles">
            {visible.map((b) => (
              <PosterTile key={b.id} item={b} onOpen={onOpen} act={act} canEdit={shelf.canEdit} sub={`Score ${b.weighted.toFixed(0)}`} />
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
              <BookRow key={b.id} book={b} rank={i} onOpen={onOpen} />
            ))}
          </div>
        )}
      </main>

      <WeightPanel open={weightsOpen} weights={weights} setWeights={setWeights} onClose={() => setWeightsOpen(false)} />
    </>
  );
}
