// The dusk mountain behind the home page heading. Drawn rather than a photo so
// it costs nothing to load and stays sharp at any width. The pines are placed
// by a fixed list, not randomly, so the picture is the same on every render.

const PINES = [
  // x, base y, height
  [905, 420, 120], [935, 420, 150], [962, 420, 105], [990, 420, 175], [1020, 420, 135],
  [1048, 420, 190], [1078, 420, 150], [1104, 420, 210], [1134, 420, 165], [1162, 420, 230],
  [1190, 420, 185], [868, 420, 80], [842, 420, 60],
  [280, 420, 70], [305, 420, 95], [330, 420, 62], [355, 420, 84],
];

function pine([x, y, h], i) {
  const w = h * 0.34;
  const tiers = 4;
  let d = '';
  for (let t = 0; t < tiers; t++) {
    const top = y - h + (t * h) / (tiers + 0.6);
    const bottom = top + h / 2.4;
    const half = (w / 2) * (0.45 + (t / tiers) * 0.75);
    d += `M${x} ${top}L${x + half} ${bottom}L${x - half} ${bottom}Z`;
  }
  d += `M${x - 2} ${y - h * 0.2}h4V${y}h-4Z`;
  return <path key={i} d={d} />;
}

export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 1200 420" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1424" />
          <stop offset="0.45" stopColor="#252a44" />
          <stop offset="0.72" stopColor="#6b4a4e" />
          <stop offset="0.88" stopColor="#b9714a" />
          <stop offset="1" stopColor="#d98d52" />
        </linearGradient>
        <linearGradient id="peak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#30344c" />
          <stop offset="1" stopColor="#141827" />
        </linearGradient>
        <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c6c0" />
          <stop offset="1" stopColor="#7f7184" />
        </linearGradient>
        <radialGradient id="glow" cx="0.62" cy="0.92" r="0.5">
          <stop offset="0" stopColor="#ffb36b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb36b" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="1200" height="420" fill="url(#sky)" />
      <rect width="1200" height="420" fill="url(#glow)" />

      <g filter="url(#soft)" opacity="0.7">
        <ellipse cx="520" cy="120" rx="210" ry="16" fill="#3b3550" />
        <ellipse cx="860" cy="90" rx="260" ry="18" fill="#41395a" />
        <ellipse cx="1050" cy="160" rx="200" ry="14" fill="#7a5060" />
        <ellipse cx="640" cy="215" rx="300" ry="12" fill="#9a5f55" />
        <ellipse cx="300" cy="190" rx="180" ry="10" fill="#5a4258" />
      </g>

      <path d="M0 360 C 160 330 260 345 380 325 S 600 330 700 315 S 980 335 1200 300 V420 H0Z" fill="#232338" opacity="0.8" />

      <path d="M360 420 L640 218 Q 668 200 690 199 L 724 199 Q 744 201 770 218 L1090 420Z" fill="url(#peak)" />
      <path d="M640 218 Q 668 200 690 199 L 724 199 Q 744 201 770 218 L 752 232 L 735 222 L 718 240 L 700 224 L 682 238 L 664 226 L 652 236Z" fill="url(#snow)" opacity="0.9" />

      <path d="M0 400 C 220 372 420 392 600 380 S 960 372 1200 390 V420 H0Z" fill="#0f1220" />
      <g fill="#0a0d18">{PINES.map(pine)}</g>
    </svg>
  );
}
