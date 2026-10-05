import { useMemo, useState } from 'react';
import { category } from '../data/categories.js';
import { selectBooks } from '../lib/select.js';
import { actions } from '../lib/actions.js';
import AddItem from './AddItem.jsx';
import BookRow from './BookRow.jsx';
import CategoryHero from './CategoryHero.jsx';
import Controls from './Controls.jsx';
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

/** The original Reads: every book, ranked by the tunable weighted score. */
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
        <CategoryHero cat={category('book')} mine={books} onOpen={onOpen} act={act} canEdit={shelf.canEdit} />
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
