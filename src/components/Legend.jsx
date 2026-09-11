import { sources } from '../data/taxonomy.js';

export default function Legend() {
  return (
    <div className="legend">
      {sources.map((s) => (
        <span key={s.id} className="legend-item">
          <span className={`dot dot-${s.id}`} /> {s.label}
        </span>
      ))}
    </div>
  );
}
