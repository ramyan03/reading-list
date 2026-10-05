import { CATEGORIES } from '../data/categories.js';
import { Icon } from './Icons.jsx';

/** The categories as chips, under the top bar on the backlog and list pages. */
export default function CatNav({ route }) {
  return (
    <nav className="catnav" aria-label="Categories">
      <div className="catnav-inner">
        <a href="#backlog" className={route === 'backlog' ? 'is-on' : ''}>
          All
        </a>
        {CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.route}`} className={route === c.route ? 'is-on' : ''} style={{ '--cat': c.color }}>
            <Icon name={c.id} size={15} />
            {c.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
