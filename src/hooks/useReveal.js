import { useEffect, useRef, useState } from 'react';

/**
 * Has any observer anywhere reported at least once? Chrome does not run
 * IntersectionObserver callbacks while a tab is hidden, and a page that loads
 * into a background tab would otherwise sit at opacity 0 indefinitely.
 * Once one callback lands we know the mechanism works and the safety net below
 * turns into a no-op for every card.
 */
let observerHasFired = false;

const REVEAL_FALLBACK_MS = 2500;

/**
 * Reveals an element the first time it scrolls into view. Reveals immediately
 * if the viewer prefers reduced motion or IntersectionObserver is missing, and
 * falls back to revealing unconditionally if the observer never reports.
 */
export function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        observerHasFired = true;
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    io.observe(el);

    // Only bites when the observer has stayed silent everywhere, so a working
    // page keeps its staggered reveal rather than flashing every card in.
    const fallback = setTimeout(() => {
      if (!observerHasFired) setShown(true);
    }, REVEAL_FALLBACK_MS);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return [ref, shown];
}
