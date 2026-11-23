// The 2026-27 plan, carried over from the old media tracker.
//
// Each line names the items it covers by id, so the plan ticks itself off as
// things are finished in the app. Edit the words here; the done state comes
// from the shelf. Book lines can carry words and go (GO train days), and any
// line a flag, the small warning chip on the plan page.

export const DOOMSDAY = {
  title: 'Avengers: Doomsday',
  date: '2026-12-18',
  start: '2026-09-01',
  project: 'doomsday',
  note: 'About 33 hours of Hickman. Behind as of mid-November: ~5 hours a weekend to finish by Dec 18. Then the MCU gaps.',
};

export const PLAN = [
  {
    period: '2026',
    months: [
      {
        label: 'October 2026',
        lines: [
          { cat: 'book', text: 'Of Mice and Men', note: 'This week', words: '30k', go: 1.5, ids: ['of-mice-and-men-john-steinbeck'] },
          { cat: 'book', text: 'Red Rising', note: 'Book 1, reading with friends', words: '128k', go: 6, ids: ['red-rising-pierce-brown'] },
          { cat: 'book', text: 'And Then There Were None', note: 'Filler', words: '66k', go: 3, ids: ['and-then-there-were-none-agatha-christie'] },
          { cat: 'book', text: 'East of Eden', note: 'The anchor', words: '265k', go: 12, ids: ['east-of-eden-john-steinbeck'] },
          { cat: 'book', text: "Charlotte's Web", note: 'Home read', words: '31k', ids: ['charlotte-s-web-e-b-white'] },
          { cat: 'book', text: 'Hamlet', note: 'Home read', words: '30k', ids: ['hamlet-william-shakespeare'] },
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
          { cat: 'book', text: 'Dune Messiah, reread', note: 'Nov 12 to 14, ready for Dune 3', words: '83k', go: 4, ids: ['dune-messiah-frank-herbert'] },
          { cat: 'book', text: 'Children of Dune, from page 1', note: 'Nov 15 to 25', words: '220k', go: 11, flag: 'Before Dec 18 🪐', ids: ['children-of-dune-frank-herbert'] },
          { cat: 'book', text: 'The Communist Manifesto', note: 'Filler, any single commute', words: '18k', go: 1, ids: ['the-communist-manifesto-karl-marx'] },
          { cat: 'book', text: 'Frankenstein', note: 'Nov 26 to 29', words: '75k', go: 4, ids: ['frankenstein-mary-shelley'] },
          { cat: 'anime', text: 'Hunter x Hunter: the Chimera Ant arc', note: 'Eps 76 to 148, ~29h. FMAB done', ids: ['anime-hunter-x-hunter-2011'] },
          { cat: 'show', text: 'Finish Bojack by mid-November, Band of Brothers on alternate evenings',
            ids: ['show-bojack-horseman', 'show-band-of-brothers'] },
          { cat: 'show', text: 'Slow Horses S1 after Bojack', note: '6 eps, ~4h', ids: [] },
          { cat: 'game', text: 'Shadow of the Colossus', note: '~8h, one weekend', ids: ['game-shadow-of-the-colossus'] },
          { cat: 'comic', text: 'Hickman: finish FF, then Avengers and New Avengers', note: '~5h a weekend to make Dec 18',
            ids: ['comic-fantastic-four-ff-hickman', 'comic-avengers-vol-5-hickman', 'comic-new-avengers-vol-3-hickman', 'comic-infinity', 'comic-secret-wars-2015'] },
          { cat: 'manga', text: 'Back to One Piece at ch. 215, start Monster or Dandadan', note: 'Evenings', ids: ['manga-one-piece', 'manga-monster', 'manga-dandadan'] },
        ],
      },
      {
        label: 'December 2026',
        lines: [
          { cat: 'book', text: 'To Kill a Mockingbird', note: 'Dec 1 to 5', words: '100k', go: 5, ids: ['to-kill-a-mockingbird-harper-lee'] },
          { cat: 'book', text: 'Buffer: Dracula or Best Served Cold if there is time', note: 'Dec 5 to 17', ids: ['dracula-bram-stoker'] },
          { cat: 'anime', text: 'Finish Hunter x Hunter, then short Top 250 movies around Hickman weekends', ids: ['anime-hunter-x-hunter-2011'] },
          { cat: 'show', text: 'Slow Horses S2, GoT S1 if there is time', note: 'Evenings', ids: [] },
          { cat: 'game', text: 'GTA VI, the December game', note: 'Evenings, after the weekend comics', ids: ['game-gta-vi'] },
          { cat: 'game', text: 'GTA III Platinum over the holidays, then Vice City', note: 'PS5 Trilogy', ids: ['game-gta-iii-definitive', 'game-gta-vice-city-definitive'] },
          { cat: 'comic', text: 'Avengers: Doomsday, Dec 18', note: 'Everything was building to this', ids: [] },
          { cat: 'manga', text: 'One Piece through Skypiea', note: 'From ch. 215', ids: ['manga-one-piece'] },
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
          { cat: 'book', text: 'A Feast for Crows, then A Dance with Dragons', note: 'ASOIAF 4 and 5, ~34 GO days', ids: ['a-feast-for-crows-george-r-r-martin', 'a-dance-with-dragons-george-r-r-martin'] },
          { cat: 'anime', text: 'Frieren, then Ping Pong and Made in Abyss', note: 'After the quick Top 250 picks', ids: ['anime-frieren', 'anime-ping-pong-the-animation', 'anime-made-in-abyss'] },
          { cat: 'show', text: 'GoT seasons 1 to 2, finally in sync with the books', ids: [] },
          { cat: 'show', text: 'Slow Horses S3 to 4 through the winter', ids: ['show-slow-horses'] },
          { cat: 'game', text: 'Finish Vice City, then the San Andreas Platinum', note: '~50-70h', ids: ['game-gta-vice-city-definitive', 'game-gta-san-andreas-definitive'] },
          { cat: 'manga', text: 'Finish Monster, One Piece Enies Lobby', ids: ['manga-monster'] },
        ],
      },
      {
        label: 'Mar to Apr 2027',
        lines: [
          { cat: 'book', text: 'Crime and Punishment, One Hundred Years of Solitude, then The Trial', note: 'GO train, ~20 days',
            ids: ['crime-and-punishment-fyodor-dostoevsky', 'one-hundred-years-of-solitude-gabriel-garcia-marquez', 'the-trial-franz-kafka'] },
          { cat: 'show', text: 'The Wire S1', note: 'The real one, finally', ids: [] },
          { cat: 'anime', text: 'Mid-length series: Dungeon Meshi, Orb, Cowboy Bebop', ids: ['anime-cowboy-bebop'] },
          { cat: 'game', text: 'GTA IV on PC, then Disco Elysium or Hollow Knight', note: 'IV ~30h plus the Episodes', ids: ['game-gta-iv', 'game-disco-elysium', 'game-hollow-knight'] },
          { cat: 'manga', text: 'Start Vagabond, Goodnight Punpun when stable', ids: ['manga-oyasumi-punpun'] },
        ],
      },
      {
        label: 'May to Jun 2027',
        lines: [
          { cat: 'book', text: 'The Brothers Karamazov', note: 'A multi-month read, start here', ids: ['the-brothers-karamazov-fyodor-dostoevsky'] },
          { cat: 'show', text: 'The Wire S2 to 3, Mr Robot alternating', ids: ['show-mr-robot'] },
          { cat: 'anime', text: 'Rakugo, Mob Psycho 100, March Comes in Like a Lion', ids: [] },
          { cat: 'game', text: 'Red Dead Redemption 2', note: '~60h, summer time for it at last', ids: ['game-red-dead-redemption-2'] },
          { cat: 'manga', text: 'Start 20th Century Boys, One Piece post-timeskip', ids: [] },
        ],
      },
    ],
  },
];
