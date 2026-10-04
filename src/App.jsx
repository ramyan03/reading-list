import { useCallback, useEffect, useMemo, useState } from 'react';
import BookDetail from './components/BookDetail.jsx';
import BooksView from './components/BooksView.jsx';
import Footer from './components/Footer.jsx';
import ItemDetail from './components/ItemDetail.jsx';
import Masthead from './components/Masthead.jsx';
import MediaView from './components/MediaView.jsx';
import Nav from './components/Nav.jsx';
import NowView from './components/NowView.jsx';
import PlanView from './components/PlanView.jsx';
import { books as rawBooks } from './data/books.js';
import { categoryByRoute } from './data/categories.js';
import { media } from './data/media.js';
import { buildCatalogue } from './lib/catalogue.js';
import { DEFAULT_WEIGHTS, scoreAll } from './lib/score.js';
import { useShelf } from './lib/shelf.js';
import { loadWeights, saveWeights } from './lib/storage.js';

/**
 * Routes live in the hash (#now, #plan, #books, #anime...) so the phone's back
 * button and home-screen bookmarks work without any server rewrites. Reviews
 * links here with ?q=<title>, which always means the books tab.
 */
function readRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash) return hash;
  try {
    if (new URLSearchParams(location.search).get('q')) return 'books';
  } catch {
    // Fall through to the default.
  }
  return 'now';
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [weights, setWeights] = useState(() => ({ ...DEFAULT_WEIGHTS, ...loadWeights({}) }));
  const [openId, setOpenId] = useState(null);
  const shelf = useShelf();

  useEffect(() => saveWeights(weights), [weights]);

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      setOpenId(null);
      scrollTo(0, 0);
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const items = useMemo(() => buildCatalogue(rawBooks, media, shelf.records), [shelf.records]);
  const books = useMemo(() => scoreAll(items.filter((i) => i.cat === 'book'), weights), [items, weights]);

  const open = useCallback((item) => setOpenId(item.id), []);
  const close = useCallback(() => setOpenId(null), []);
  const openItem = openId && (books.find((b) => b.id === openId) ?? items.find((i) => i.id === openId));

  const cat = categoryByRoute(route);
  const view =
    route === 'plan' ? (
      <PlanView items={items} onOpen={open} />
    ) : route === 'books' ? (
      <BooksView books={books} weights={weights} setWeights={setWeights} onOpen={open} shelf={shelf} />
    ) : cat ? (
      <MediaView key={cat.id} cat={cat} items={items} onOpen={open} shelf={shelf} />
    ) : (
      <NowView items={items} onOpen={open} shelf={shelf} />
    );

  return (
    <>
      <Masthead items={items} compact={route !== 'now'} />
      <Nav route={cat || route === 'plan' || route === 'books' ? route : 'now'} />
      {view}
      <Footer shelf={shelf} />

      {openItem?.cat === 'book' ? (
        <BookDetail book={openItem} weights={weights} onClose={close} shelf={shelf} items={items} />
      ) : (
        <ItemDetail item={openItem} onClose={close} shelf={shelf} items={items} />
      )}
    </>
  );
}
