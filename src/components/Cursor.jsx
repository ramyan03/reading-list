import { useEffect, useRef } from 'react';

/**
 * Dot plus a lagging ring. The ring is driven by rAF rather than a CSS
 * transition so it keeps easing while the pointer is still.
 * Disabled entirely for touch/coarse pointers and reduced motion.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    document.body.classList.add('has-custom-cursor');

    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const ring = { ...target };
    let raf = 0;
    let hovering = false;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const over = e.target instanceof Element && e.target.closest('a, button, [data-cursor]');
      if (!!over !== hovering) {
        hovering = !!over;
        ringRef.current?.classList.toggle('is-hover', hovering);
      }
    };

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.15;
      ring.y += (target.y - ring.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
