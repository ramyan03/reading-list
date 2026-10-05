// Line icons, drawn on a 24 grid with the current text colour, so one set
// works on the coloured category cards and on the plain surfaces.

const PATHS = {
  book: 'M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5zM12 6v13.5',
  show: 'M4 8h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM8 3l4 5 4-5',
  film: 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM8 4v16M16 4v16M4 9h4M4 15h4M16 9h4M16 15h4',
  anime: 'M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z',
  manga: 'M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM9 7h6M9 11h6M9 15h3',
  game: 'M7 8h10a5 5 0 015 5v1a3 3 0 01-5.3 1.9L15 14H9l-1.7 1.9A3 3 0 012 14v-1a5 5 0 015-5zM8 10.5v3M6.5 12h3M15.5 11.5h.01M17.5 13h.01',
  comic: 'M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H10l-5 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1zM8 8.5h8M8 11.5h5',
  search: 'M11 4a7 7 0 110 14 7 7 0 010-14zM20 20l-4-4',
  sun: 'M12 8a4 4 0 110 8 4 4 0 010-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  clock: 'M12 3a9 9 0 110 18 9 9 0 010-18zM12 7v5l3 2',
  more: 'M12 5h.01M12 12h.01M12 19h.01',
  minus: 'M5 12h14',
  lock: 'M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1zM8 11V7a4 4 0 018 0v4',
  unlock: 'M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1zM8 11V7a4 4 0 017.6-1.7',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  play: 'M8 5.5v13l10.5-6.5z',
};

export function Icon({ name, size = 20, className, strokeWidth = 1.75 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The mark: a peak with a snow line, as in the tab icon. */
export function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.5 20.5L9.5 6l4.2 7.4 2.3-3.4 6.5 10.5z" fill="currentColor" opacity="0.92" />
      <path d="M9.5 6l2.4 4.3-1.3-.8-1.1 1.4-1-1.2-1.1.6z" fill="var(--bg, #0b0f17)" opacity="0.55" />
    </svg>
  );
}
