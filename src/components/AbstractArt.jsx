// Generated cover art for items with no poster on record. It is meant to say
// something about the thing, not just fill the box: the motif comes from the
// item's genres (src/data/genres.js, from AniList and TVmaze), its book genre,
// or words in its title, and the palette from its category colour. Seeded by
// the item id, so the same item always gets the same picture.

import { genres as GENRES } from '../data/genres.js';
import { category } from '../data/categories.js';

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

const hsl = (h, s, l, a = 1) => `hsl(${((h % 360) + 360) % 360} ${s}% ${l}% / ${a})`;

/**
 * First matching theme wins, so the order is from most to least specific.
 * Each has a hue it pulls the category colour towards.
 */
const THEMES = [
  ['horror', 350, /horror|gore|zombie|vampire|survival horror|ghost|demon|occult|dead|blood/],
  ['space', 225, /sci-?fi|space|mecha|cyberpunk|alien|robot|galaxy|star|planet|scifi|dystop|future/],
  ['romance', 335, /romance|love|rom-?com|shoujo|josei|girlfriend|boyfriend|kanojo|koi|heart|kiss|dating/],
  ['crime', 210, /crime|detective|mystery|noir|police|murder|thriller|heist|mafia|gangster|killer|cop/],
  ['war', 20, /war|military|samurai|battle|soldier|historical|history|empire|rome|sword/],
  ['fantasy', 265, /fantasy|magic|isekai|myth|dragon|wizard|witch|adventure|quest|kingdom/],
  ['action', 15, /action|sports|martial|fight|shounen|boxing|racing|hero|super|avengers|marvel|batman|spider|x-men|fantastic four|secret wars|infinity/],
  ['sea', 195, /ocean|sea|island|pirate|boat|ship|water|fish/],
  ['comedy', 45, /comedy|slice of life|school|kids|family|parody|gag|sitcom|iyashikei/],
  ['thought', 180, /philosoph|psycholog|drama|literary|classic|nonfiction|russian|japanese|tragedy/],
];

export function themeOf(item) {
  const text = [item.title, item.genre, ...(GENRES[item.id] ?? []), category(item.cat)?.label].join(' ').toLowerCase();
  for (const [name, hue, re] of THEMES) if (re.test(text)) return { name, hue };
  // Nothing in the words: fall back on what the medium usually is.
  if (item.cat === 'comic') return { name: 'action', hue: 15 };
  return { name: 'thought', hue: null };
}

function stars(r, n, top = 90) {
  return Array.from({ length: n }, (_, i) => (
    <circle key={`s${i}`} cx={r() * 100} cy={r() * top} r={0.3 + r() * 0.9} fill="#fff" opacity={0.3 + r() * 0.6} />
  ));
}

/** The motif for each theme, drawn on a 100 x 133 canvas. */
function motif(name, r, c) {
  switch (name) {
    case 'space': {
      const cx = 30 + r() * 40;
      const cy = 45 + r() * 15;
      const rad = 16 + r() * 8;
      return (
        <>
          {stars(r, 40)}
          <circle cx={cx} cy={cy} r={rad} fill={c.hot} />
          <circle cx={cx - rad * 0.3} cy={cy - rad * 0.3} r={rad * 0.75} fill={c.pale} opacity="0.25" />
          <ellipse cx={cx} cy={cy} rx={rad * 1.9} ry={rad * 0.45} fill="none" stroke={c.pale} strokeWidth="1.6" opacity="0.8" transform={`rotate(-18 ${cx} ${cy})`} />
          <circle cx={15 + r() * 70} cy={100 + r() * 20} r={3 + r() * 3} fill={c.mid} />
        </>
      );
    }
    case 'horror': {
      return (
        <>
          <circle cx={62} cy={34} r={15} fill="#e9e3d6" opacity="0.9" />
          <circle cx={68} cy={30} r={13} fill={c.deep} />
          {Array.from({ length: 6 }, (_, i) => {
            const x = 8 + i * 17 + r() * 6;
            const len = 10 + r() * 28;
            return <path key={i} d={`M${x - 3} 0 V${len} Q${x} ${len + 7} ${x + 3} ${len} V0Z`} fill={c.blood} opacity={0.75} />;
          })}
          <path d={`M0 133 V112 L12 104 L20 112 L32 98 L44 110 L58 96 L70 108 L84 100 L100 112 V133Z`} fill="#06070c" />
        </>
      );
    }
    case 'romance': {
      const heart = (x, y, s, fill, o) => (
        <path
          key={`${x}${y}`}
          d={`M${x} ${y + s * 0.35} C ${x - s} ${y - s * 0.4} ${x - s * 0.45} ${y - s} ${x} ${y - s * 0.45} C ${x + s * 0.45} ${y - s} ${x + s} ${y - s * 0.4} ${x} ${y + s * 0.35} Z`}
          fill={fill}
          opacity={o}
        />
      );
      return (
        <g style={{ mixBlendMode: 'screen' }}>
          <circle cx={30 + r() * 15} cy={50} r={28} fill={c.hot} opacity="0.45" />
          <circle cx={60 + r() * 15} cy={62} r={30} fill={c.pale} opacity="0.35" />
          {heart(50, 52, 16, '#fff', 0.85)}
          {Array.from({ length: 5 }, () => heart(10 + r() * 80, 15 + r() * 90, 3 + r() * 4, c.pale, 0.5))}
        </g>
      );
    }
    case 'crime': {
      return (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={-20} y={8 + i * 12} width={160} height={5} fill={c.pale} opacity={0.12 + (i % 3) * 0.05} transform="rotate(-14 50 66)" />
          ))}
          <circle cx={58} cy={52} r={16} fill="none" stroke={c.hot} strokeWidth="3.5" />
          <path d="M69 64 L84 80" stroke={c.hot} strokeWidth="5" strokeLinecap="round" />
          <path d="M0 133 V118 H18 V100 H30 V112 H44 V92 H56 V114 H72 V104 H86 V120 H100 V133Z" fill="#05060b" />
        </>
      );
    }
    case 'war': {
      const sun = 30 + r() * 40;
      return (
        <>
          <circle cx={sun} cy={48} r={22} fill={c.blood} opacity="0.85" />
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M${-10 + i * 30} 133 L${12 + i * 26 + r() * 10} 40 L${18 + i * 26 + r() * 10} 40 L${8 + i * 30} 133Z`} fill="#0a0b10" opacity={0.85} />
          ))}
          <path d="M0 133 V110 Q 25 100 50 108 T 100 104 V133Z" fill="#07080d" />
        </>
      );
    }
    case 'fantasy': {
      return (
        <>
          {stars(r, 25, 70)}
          <circle cx={70} cy={30} r={11} fill={c.pale} />
          <path d="M0 133 V92 L18 70 L32 86 L50 58 L66 82 L80 66 L100 90 V133Z" fill={c.mid} opacity="0.9" />
          <path d="M36 133 V98 H40 V90 H44 V98 H50 V82 L54 76 L58 82 V98 H64 V90 H68 V98 H72 V133Z" fill="#0b0c14" />
          <path d="M0 133 V114 Q 30 106 50 116 T 100 112 V133Z" fill="#090a12" />
        </>
      );
    }
    case 'action': {
      const cx = 50 + (r() - 0.5) * 20;
      const cy = 60 + (r() - 0.5) * 20;
      return (
        <>
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2 + r() * 0.1;
            const r1 = 12 + r() * 6;
            return (
              <path
                key={i}
                d={`M${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1} L${cx + Math.cos(a - 0.05) * 110} ${cy + Math.sin(a - 0.05) * 110} L${cx + Math.cos(a + 0.05) * 110} ${cy + Math.sin(a + 0.05) * 110}Z`}
                fill={i % 2 ? c.hot : c.pale}
                opacity={0.35}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={10} fill={c.pale} />
        </>
      );
    }
    case 'sea': {
      return (
        <>
          <circle cx={50} cy={50} r={16} fill={c.hot} />
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M0 ${72 + i * 13} Q 12 ${66 + i * 13} 25 ${72 + i * 13} T 50 ${72 + i * 13} T 75 ${72 + i * 13} T 100 ${72 + i * 13} V133 H0Z`} fill={i % 2 ? c.mid : c.deep} opacity={0.75} />
          ))}
        </>
      );
    }
    case 'comedy': {
      return (
        <>
          {Array.from({ length: 16 }, (_, i) => {
            const x = r() * 100;
            const y = r() * 120;
            const fill = [c.hot, c.pale, c.mid, '#fff'][i % 4];
            return i % 3 === 0 ? (
              <rect key={i} x={x} y={y} width={5 + r() * 6} height={5 + r() * 6} rx={1.5} fill={fill} opacity={0.75} transform={`rotate(${r() * 90} ${x} ${y})`} />
            ) : (
              <circle key={i} cx={x} cy={y} r={2 + r() * 5} fill={fill} opacity={0.75} />
            );
          })}
          <path d={`M10 ${80 + r() * 20} q 10 -14 20 0 t 20 0 t 20 0 t 20 0`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </>
      );
    }
    default: {
      // Thought: drama, classics, philosophy. A quiet geometric composition.
      const cx = 30 + r() * 40;
      return (
        <>
          <circle cx={cx} cy={48} r={24} fill="none" stroke={c.pale} strokeWidth="1.4" opacity="0.7" />
          <circle cx={cx} cy={48} r={14} fill={c.hot} opacity="0.85" />
          <path d={`M${cx} 10 V100`} stroke={c.pale} strokeWidth="0.8" opacity="0.5" />
          <rect x="14" y="100" width="72" height="1.2" fill={c.pale} opacity="0.6" />
        </>
      );
    }
  }
}

export default function AbstractArt({ item }) {
  const color = category(item.cat)?.color ?? '#5f6f8a';
  const seed = hash(item.id);
  const r = rng(seed);
  const theme = themeOf(item);
  const [h0, s0] = hexToHsl(color);
  // Pull the category hue halfway towards the theme's, so a horror manga is
  // still recognisably manga-red but darker and bloodier than a rom-com.
  const h = theme.hue == null ? h0 : h0 + ((((theme.hue - h0 + 540) % 360) - 180) * 0.5) + (r() - 0.5) * 16;
  const sat = Math.max(35, Math.min(80, s0));
  const c = {
    deep: hsl(h, sat, theme.name === 'horror' || theme.name === 'crime' ? 8 : 13),
    mid: hsl(h + 14, sat, 30),
    hot: hsl(h - 20, Math.min(92, sat + 12), 60),
    pale: hsl(h + 35, sat - 10, 80),
    blood: hsl(355, 70, 38),
  };
  const gid = `aa${seed.toString(36)}`;

  return (
    <svg className="abstract-art" viewBox="0 0 100 133" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-theme-name={theme.name}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={c.mid} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
      </defs>
      <rect width="100" height="133" fill={`url(#${gid})`} />
      {motif(theme.name, r, c)}
    </svg>
  );
}
