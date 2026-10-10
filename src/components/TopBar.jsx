import { useEffect, useMemo, useRef, useState } from 'react';
import { category, statusLabel } from '../data/categories.js';
import { Icon, Logo } from './Icons.jsx';
import Poster from './Poster.jsx';

const LINKS = [
  { route: 'now', label: 'Home' },
  { route: 'backlog', label: 'Backlog' },
  { route: 'plan', label: 'Plan' },
  { route: 'timeline', label: 'Timeline' },
];

const THEME = 'rl.theme';

function currentTheme() {
  try {
    const saved = localStorage.getItem(THEME);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Fall through to the system setting.
  }
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Sticky bar: the name, the three sections, a search over everything, and the
 * theme switch. Search opens the detail sheet directly, so finding a thing and
 * logging an episode of it is two taps from any page.
 */
export default function TopBar({ route, items, onOpen, shelf, onAdmin }) {
  const [theme, setTheme] = useState(currentTheme);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(0);
  const input = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f6f9' : '#0b0f17');
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem(THEME, next);
    } catch {
      // Not remembered, but it still switches.
    }
  };

  // "/" jumps to search from anywhere, as on most sites with one box.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      input.current?.focus();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    const scored = [];
    for (const item of items) {
      const title = norm(item.title);
      const at = title.indexOf(q);
      const byAuthor = item.author && norm(item.author).includes(q);
      if (at === -1 && !byAuthor) continue;
      scored.push([at === 0 ? 0 : at > 0 ? 1 : 2, item]);
    }
    return scored
      .sort((a, b) => a[0] - b[0] || a[1].title.length - b[1].title.length)
      .slice(0, 8)
      .map(([, item]) => item);
  }, [items, query]);

  const pick = (item) => {
    onOpen(item);
    setQuery('');
    input.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      pick(results[cursor]);
    } else if (e.key === 'Escape') {
      setQuery('');
      input.current?.blur();
    }
  };

  const open = focused && query.trim();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#now">
          <Logo />
          <span>Ramyan</span>
        </a>

        <nav className="topnav" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.route} href={`#${l.route}`} className={route === l.route ? 'is-on' : ''} aria-current={route === l.route ? 'page' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className={`finder${open ? ' is-open' : ''}`}>
          <Icon name="search" size={16} />
          <input
            ref={input}
            type="search"
            placeholder="Search anything..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={onKeyDown}
            aria-label="Search everything"
            role="combobox"
            aria-expanded={Boolean(open)}
            aria-controls="finder-results"
          />
          {open && (
            <ul className="finder-results" id="finder-results" role="listbox">
              {results.length === 0 && <li className="finder-empty">Nothing matches "{query.trim()}"</li>}
              {results.map((item, i) => (
                <li key={item.id} role="option" aria-selected={i === cursor}>
                  <button
                    type="button"
                    className={i === cursor ? 'is-cursor' : ''}
                    onMouseEnter={() => setCursor(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(item)}
                  >
                    <Poster item={item} size="S" className="is-thumb" showTitle={false} />
                    <span className="finder-text">
                      <span className="finder-title">{item.title}</span>
                      <span className="finder-meta">
                        {category(item.cat).one} · {statusLabel(item.status, item.cat)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          className={`admin-button${shelf.canEdit ? ' is-on' : ''}`}
          onClick={onAdmin}
          aria-label={shelf.canEdit ? 'Admin mode on' : 'Admin sign in'}
          title={shelf.canEdit ? 'Admin mode on' : 'Admin'}
        >
          <Icon name={shelf.canEdit ? 'unlock' : 'lock'} size={16} />
          <span>{shelf.canEdit ? 'Editing' : 'Admin'}</span>
        </button>

        <button type="button" className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
        </button>
      </div>
    </header>
  );
}
