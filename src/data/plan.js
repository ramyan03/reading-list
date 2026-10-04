// The 2026-27 plan, carried over from the old media tracker.
//
// Each line names the items it covers by id, so the plan ticks itself off as
// things are finished in the app. Edit the words here; the done state comes
// from the shelf.

export const DOOMSDAY = {
  title: 'Avengers: Doomsday',
  date: '2026-12-18',
  start: '2026-09-01',
  project: 'doomsday',
  note: 'About 33 hours of Hickman, around 2 hours a week, finished by mid-November. Then the MCU gaps.',
};

export const PLAN = [
  {
    period: '2026',
    months: [
      {
        label: 'October 2026',
        lines: [
          { cat: 'book', text: 'Finish P&P, then Norwegian Wood, then The Stranger', note: 'GO train reads',
            ids: ['pride-and-prejudice-jane-austen', 'norwegian-wood-haruki-murakami', 'the-stranger-albert-camus'] },
          { cat: 'anime', text: 'Finish FMAB by end of month', note: '~32 eps left, 3 to 4 a week',
            ids: ['anime-fullmetal-alchemist-brotherhood'] },
          { cat: 'show', text: 'Fleabag, one weekend', note: '12 eps, ~5h', ids: ['show-fleabag'] },
          { cat: 'game', text: 'SOMA: October is perfect for horror', note: '~8h, one long weekend', ids: ['game-soma'] },
          { cat: 'comic', text: 'Start the Hickman FF run', note: '~2h a week, weekends', ids: ['comic-fantastic-four-ff-hickman'] },
          { cat: 'manga', text: 'One Piece through Skypiea, start Monster', ids: ['manga-monster'] },
        ],
      },
      {
        label: 'November 2026',
        lines: [
          { cat: 'book', text: 'Of Mice and Men, then Children of Dune, then start Crime and Punishment', note: 'GO train',
            ids: ['of-mice-and-men-john-steinbeck', 'children-of-dune-frank-herbert'] },
          { cat: 'show', text: 'Finish Bojack by mid-November, Band of Brothers on alternate evenings',
            ids: ['show-bojack-horseman', 'show-band-of-brothers'] },
          { cat: 'show', text: 'Slow Horses S1 after Bojack', note: '6 eps, ~4h', ids: [] },
          { cat: 'game', text: 'Shadow of the Colossus', note: '~8h, one weekend', ids: ['game-shadow-of-the-colossus'] },
          { cat: 'comic', text: 'Finish the Hickman run by mid-November', note: 'Before Doomsday on Dec 18',
            ids: ['comic-fantastic-four-ff-hickman', 'comic-avengers-vol-5-hickman', 'comic-new-avengers-vol-3-hickman', 'comic-infinity', 'comic-secret-wars-2015'] },
          { cat: 'manga', text: 'Monster ongoing, start Dandadan', note: 'Evenings', ids: ['manga-dandadan'] },
        ],
      },
      {
        label: 'December 2026',
        lines: [
          { cat: 'book', text: 'Finish Crime and Punishment', note: 'Wraps the year strong', ids: ['crime-and-punishment-fyodor-dostoevsky'] },
          { cat: 'show', text: 'Slow Horses S2, GoT S1 if there is time', note: 'Evenings', ids: [] },
          { cat: 'game', text: 'Before Your Eyes, any evening', note: '~2h, an emotional palate cleanser', ids: ['game-before-your-eyes'] },
          { cat: 'comic', text: 'Avengers: Doomsday, Dec 18', note: 'Everything was building to this', ids: [] },
          { cat: 'manga', text: 'One Piece to the end of Water 7', note: 'Ch. ~300 to ~430', ids: [] },
        ],
      },
    ],
  },
  {
    period: '2027',
    months: [
      {
        label: 'Jan to Feb 2027',
        lines: [
          { cat: 'book', text: 'A Dance with Dragons', note: 'ASOIAF Book 5, ~20 GO days', ids: ['a-dance-with-dragons-george-r-r-martin'] },
          { cat: 'show', text: 'GoT seasons 1 to 2, finally in sync with the books', ids: [] },
          { cat: 'show', text: 'Slow Horses S3 to 4 through the winter', ids: ['show-slow-horses'] },
          { cat: 'game', text: 'Hollow Knight', note: '~30h, long winter evenings', ids: ['game-hollow-knight'] },
          { cat: 'manga', text: 'Finish Monster, One Piece Enies Lobby', ids: ['manga-monster'] },
        ],
      },
      {
        label: 'Mar to Apr 2027',
        lines: [
          { cat: 'book', text: 'The Trial, then Norwegian Wood again or start Brothers Karamazov', note: 'GO train',
            ids: ['the-trial-franz-kafka'] },
          { cat: 'show', text: 'The Wire S1', note: 'The real one, finally', ids: [] },
          { cat: 'anime', text: 'Frieren, then Vinland Saga', note: '28 + 24 eps', ids: ['anime-frieren', 'anime-vinland-saga-season-2'] },
          { cat: 'game', text: 'Disco Elysium', note: '~25h, plays like a novel', ids: ['game-disco-elysium'] },
          { cat: 'manga', text: 'Start Vagabond, Goodnight Punpun when stable', ids: ['manga-oyasumi-punpun'] },
        ],
      },
      {
        label: 'May to Jun 2027',
        lines: [
          { cat: 'book', text: 'The Brothers Karamazov', note: 'A multi-month read, start here', ids: ['the-brothers-karamazov-fyodor-dostoevsky'] },
          { cat: 'show', text: 'The Wire S2 to 3, Mr Robot alternating', ids: ['show-mr-robot'] },
          { cat: 'anime', text: 'Start Hunter x Hunter', note: '148 eps, long haul', ids: [] },
          { cat: 'game', text: 'Red Dead Redemption 2', note: '~60h, summer time for it at last', ids: ['game-red-dead-redemption-2'] },
          { cat: 'manga', text: 'Start 20th Century Boys, One Piece post-timeskip', ids: [] },
        ],
      },
    ],
  },
];
