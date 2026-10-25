import { category } from '../data/categories.js';

/**
 * Where the pictures and numbers come from. Every cover is looked up from a
 * free public source by scripts/fetch-posters.mjs and fetch-covers.mjs and
 * shown from that source's own servers; none are copied into this site.
 */
const SOURCES = [
  {
    group: 'Covers and posters',
    rows: [
      {
        name: 'Open Library',
        href: 'https://openlibrary.org',
        what: 'Book covers',
        terms: 'Covers API, free to use with a link back',
      },
      {
        name: 'AniList',
        href: 'https://anilist.co',
        what: 'Anime and manga posters',
        terms: 'Public API, free for non-commercial use',
      },
      {
        name: 'TVmaze',
        href: 'https://www.tvmaze.com',
        what: 'Show posters',
        terms: 'Data and images licensed CC BY-SA',
        license: 'https://creativecommons.org/licenses/by-sa/4.0/',
      },
      {
        name: 'Wikipedia and Wikimedia Commons',
        href: 'https://en.wikipedia.org',
        what: 'Game and comic covers',
        terms: "Each image keeps the licence on its own file page; most covers there are non-free and used for identification",
      },
    ],
  },
  {
    group: 'Numbers',
    rows: [
      { name: 'Goodreads', href: 'https://www.goodreads.com', what: 'Book ratings', terms: 'Average ratings, copied by hand' },
      { name: 'IMDb', href: 'https://www.imdb.com/chart/toptv/', what: 'Top 250 TV ranks', terms: 'Rank only, copied by hand' },
      { name: 'MyAnimeList', href: 'https://myanimelist.net', what: 'My anime and manga history', terms: 'Exported from my own list' },
    ],
  },
  {
    group: 'Type',
    rows: [
      {
        name: 'Instrument Sans and Instrument Serif',
        href: 'https://fonts.google.com/specimen/Instrument+Sans',
        what: 'Headings and body text',
        terms: 'SIL Open Font License, served by Google Fonts',
        license: 'https://openfontlicense.org',
      },
      {
        name: 'Inter',
        href: 'https://rsms.me/inter/',
        what: 'Small print and numbers',
        terms: 'SIL Open Font License, served by Google Fonts',
        license: 'https://openfontlicense.org',
      },
    ],
  },
];

export default function CreditsView() {
  return (
    <main className="rd-page credits">
      <header className="rd-head">
        <p className="rd-eyebrow">Sources</p>
        <h1 className="rd-title">
          The <em style={{ '--em': category('book').color }}>credits</em>
        </h1>
      </header>

      <p className="credits-lede">
        Ramyan Reads is a personal, non-commercial list. All covers, posters and artwork belong to their publishers,
        studios and artists. They are shown here only to identify each title, loaded straight from the sources below.
        If you own an image and want it taken down, it will be.
      </p>

      {SOURCES.map(({ group, rows }) => (
        <section key={group} className="credits-group" aria-label={group}>
          <h2 className="rd-h2">{group}</h2>
          <ul>
            {rows.map((r) => (
              <li key={r.name}>
                <a href={r.href} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
                <span className="credits-what">{r.what}</span>
                <span className="credits-terms">
                  {r.terms}
                  {r.license && (
                    <>
                      {' '}
                      (
                      <a href={r.license} target="_blank" rel="noreferrer">
                        licence
                      </a>
                      )
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="credits-lede">Items with no cover get generated abstract art, made on this site.</p>
    </main>
  );
}
