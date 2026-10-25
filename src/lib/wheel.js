// The mouse wheel scrolls whatever sideways row the pointer is over, rather
// than the page: the poster rails, the category bar, the filter chips, the
// phone card stack. Installed once for the whole app, so any row that scrolls
// sideways gets it without wiring. When the row reaches its end the wheel goes
// back to scrolling the page, so nothing traps you.

const LINE = 16; // px per "line" for wheels that report in lines

function sidewaysScroller(from) {
  for (let el = from; el && el !== document.body; el = el.parentElement) {
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    const overflow = getComputedStyle(el).overflowX;
    if (overflow === 'auto' || overflow === 'scroll') return el;
  }
  return null;
}

function onWheel(e) {
  // A trackpad swipe or shift+wheel is already sideways; leave it alone.
  if (e.shiftKey || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const el = sidewaysScroller(e.target);
  if (!el) return;
  const delta = e.deltaMode === 1 ? e.deltaY * LINE : e.deltaY;
  const max = el.scrollWidth - el.clientWidth;
  if ((delta < 0 && el.scrollLeft <= 0) || (delta > 0 && el.scrollLeft >= max - 1)) return;
  e.preventDefault();
  el.scrollLeft += delta;
}

export function installSidewaysWheel() {
  // Not passive, so the page scroll can be cancelled while a row moves.
  addEventListener('wheel', onWheel, { passive: false });
  return () => removeEventListener('wheel', onWheel);
}
