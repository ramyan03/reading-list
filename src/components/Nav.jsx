import { CATEGORIES } from '../data/categories.js';

const TABS = [
  { route: 'now', label: 'Now' },
  { route: 'plan', label: 'Plan' },
  ...CATEGORIES.map((c) => ({ route: c.route, label: c.label })),
];

/**
 * Sticky, and scrolls sideways on a phone rather than wrapping, so it stays one
 * line tall and the list under it keeps the screen.
 */
export default function Nav({ route }) {
  return (
    <nav className="nav" aria-label="Sections">
      <div className="nav-inner">
        {TABS.map((t) => (
          <a key={t.route} href={`#${t.route}`} className={route === t.route ? 'is-on' : ''} aria-current={route === t.route ? 'page' : undefined}>
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
