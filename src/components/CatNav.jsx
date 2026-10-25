import { CATEGORIES } from '../data/categories.js';

/**
 * The categories as a row of large words under the top bar on the backlog and
 * category pages, the current one bright with a bar in its own colour beneath.
 * Words rather than chips: the row reads as navigation, not as a set of
 * filters, and there is no outline around each one to clutter it.
 */
export default function CatNav({ route }) {
  const tabs = [{ route: 'backlog', label: 'All', color: 'var(--fg-bright)' }, ...CATEGORIES];
  return (
    <nav className="cattabs" aria-label="Categories">
      <div className="cattabs-inner">
        {tabs.map((t) => (
          <a
            key={t.route}
            href={`#${t.route}`}
            className={route === t.route ? 'is-on' : ''}
            aria-current={route === t.route ? 'page' : undefined}
            style={{ '--cat': t.color }}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
