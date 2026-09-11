/**
 * Continuous ticker. The track is duplicated so the loop is seamless; the copy
 * is hidden from assistive tech. Pauses on hover and under reduced motion.
 */
export default function Marquee({ items, speed = 60 }) {
  const track = (
    <div className="marquee-track">
      {items.map((item, i) => (
        <span className="marquee-item" key={i}>
          {item}
          <span className="marquee-sep" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" style={{ '--marquee-duration': `${speed}s` }}>
      {track}
      <div className="marquee-track" aria-hidden="true">
        {items.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
