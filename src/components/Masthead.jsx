/**
 * Name, one line, and the numbers, then the list starts. On every page but Now
 * it shrinks to just the name, so a category list starts near the top of a
 * phone screen.
 */
export default function Masthead({ items, compact }) {
  if (compact) {
    return (
      <header className="masthead is-compact">
        <a className="masthead-title" href="#now">
          Ramyan Reads
        </a>
      </header>
    );
  }

  const count = (s) => items.filter((i) => i.status === s).length;

  return (
    <header className="masthead">
      <h1 className="masthead-title">Ramyan Reads</h1>

      <p className="masthead-lede">
        What I am reading, watching and playing, what comes next, and everything finished so far.
      </p>

      <div className="masthead-meta">
        <span className="count">
          <b>{count('active')}</b> in progress
        </span>
        <span className="count">
          <b>{count('next')}</b> up next
        </span>
        <span className="count">
          <b>{count('done')}</b> finished
        </span>
      </div>
    </header>
  );
}
