// Generated cover art for items with no poster on record. Seeded by the item
// id, so a thing always gets the same picture, and coloured from its category
// so it still reads as a show or a manga at a glance. Four compositions:
// orbits, bands, blobs and ridges, each with the hue nudged per item.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A small seeded generator, so one item's shapes don't depend on another's. */
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

export default function AbstractArt({ id, color = '#5f6f8a' }) {
  const seed = hash(id);
  const r = rng(seed);
  const [h0, s0] = hexToHsl(color);
  const h = h0 + (r() - 0.5) * 40;
  const sat = Math.max(35, Math.min(80, s0));
  const deep = hsl(h, sat, 14);
  const mid = hsl(h + 18, sat, 34);
  const hot = hsl(h - 25, Math.min(90, sat + 10), 58);
  const pale = hsl(h + 40, sat - 10, 78, 0.9);
  const kind = seed % 4;
  const gid = `aa${seed.toString(36)}`;

  let shapes;
  if (kind === 0) {
    // Orbits: offset rings around a bright core.
    const cx = 25 + r() * 50;
    const cy = 30 + r() * 40;
    shapes = (
      <>
        {[70, 54, 40, 27].map((rad, i) => (
          <circle key={rad} cx={cx} cy={cy} r={rad} fill="none" stroke={i % 2 ? pale : hot} strokeOpacity={0.18 + i * 0.12} strokeWidth={1.2 + i} />
        ))}
        <circle cx={cx} cy={cy} r={11 + r() * 6} fill={hot} />
        <circle cx={cx + 30 * (r() - 0.5)} cy={cy + 40 * (r() - 0.5)} r={3 + r() * 3} fill={pale} />
      </>
    );
  } else if (kind === 1) {
    // Bands: diagonal stripes of varying weight.
    const angle = -35 + r() * 70;
    shapes = (
      <g transform={`rotate(${angle} 50 66)`}>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={-40} y={-20 + i * 26 + r() * 8} width={180} height={4 + r() * 16} fill={i % 3 === 0 ? hot : i % 3 === 1 ? mid : pale} opacity={0.35 + r() * 0.5} />
        ))}
      </g>
    );
  } else if (kind === 2) {
    // Blobs: soft overlapping discs.
    shapes = (
      <g style={{ mixBlendMode: 'screen' }}>
        {Array.from({ length: 4 }, (_, i) => (
          <circle key={i} cx={10 + r() * 80} cy={15 + r() * 100} r={22 + r() * 30} fill={[hot, mid, pale, hot][i]} opacity={0.45 + r() * 0.3} />
        ))}
      </g>
    );
  } else {
    // Ridges: layered hills under a sun.
    const layers = [0, 1, 2, 3].map((i) => {
      const base = 70 + i * 16;
      const a = base - 10 - r() * 22;
      const b = base - 6 - r() * 22;
      return `M0 ${base} C 25 ${a} 45 ${b} 60 ${base - 8} S 90 ${a + 4} 100 ${base - 4} V133 H0Z`;
    });
    shapes = (
      <>
        <circle cx={20 + r() * 60} cy={38 + r() * 18} r={12 + r() * 8} fill={hot} />
        {layers.map((d, i) => (
          <path key={i} d={d} fill={[mid, hsl(h + 10, sat, 26), hsl(h, sat, 19), deep][i]} />
        ))}
      </>
    );
  }

  return (
    <svg className="abstract-art" viewBox="0 0 100 133" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <rect width="100" height="133" fill={`url(#${gid})`} />
      {shapes}
    </svg>
  );
}
