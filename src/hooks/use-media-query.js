import { useEffect, useState } from "react";

/**
 * Reactive `matchMedia`. Used to gate expensive motion (hero parallax, orb
 * drift) to desktop, where the viewport doesn't resize mid-scroll and the
 * compositing cost isn't a battery concern.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");

/**
 * A real pointer, not a touchscreen. Gates hover-tracking effects (the timeline
 * card spotlight) — on touch there is no cursor to follow, and the pointermove
 * handler would only fire mid-tap.
 */
export const useHasFinePointer = () => useMediaQuery("(pointer: fine)");
