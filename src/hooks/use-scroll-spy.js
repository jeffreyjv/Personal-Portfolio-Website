import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks which section is currently being read.
 *
 * Uses one IntersectionObserver with a rootMargin "band" rather than a scroll
 * handler — it's passive, so no layout reads run on every frame.
 *
 * Returns `{ active, lockTo }`. Call `lockTo(id)` from anything that programmatically
 * scrolls (nav links, command palette) so the indicator jumps straight to the
 * destination instead of strobing through every section on the way.
 */
export function useScrollSpy(ids, { offset = 56 } = {}) {
  const [active, setActive] = useState(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    return ids.includes(hash) ? hash : ids[0];
  });

  const lockRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    // A strip from just below the fixed navbar down to 45% of the viewport —
    // roughly where a reader's eye sits. threshold 0 so tall sections register.
    const io = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: `-${offset + 8}px 0px -55% 0px`, threshold: 0 }
    );

    els.forEach((el) => io.observe(el));

    // The last section can be shorter than the band, so it would never activate.
    // Force it once the document is scrolled to the bottom.
    const onScroll = () => {
      if (lockRef.current) return;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) setActive(ids[ids.length - 1]);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids, offset]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const lockTo = useCallback((id) => {
    setActive(id);
    lockRef.current = true;
    clearTimeout(timerRef.current);

    const release = () => {
      lockRef.current = false;
    };

    // `scrollend` is the precise signal; the timeout covers browsers without it.
    timerRef.current = setTimeout(release, 900);
    window.addEventListener(
      "scrollend",
      () => {
        clearTimeout(timerRef.current);
        release();
      },
      { once: true }
    );
  }, []);

  return { active, lockTo };
}
