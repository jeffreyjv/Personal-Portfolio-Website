/**
 * Shared motion tokens.
 *
 * Everything animated on the site pulls its easing and duration from here so the
 * whole page reads as one system. EASE is the same curve already used by the CSS
 * in index.css — new Motion animations are indistinguishable from the old ones.
 */

export const EASE = [0.16, 1, 0.3, 1];

export const DUR = { xs: 0.2, sm: 0.35, md: 0.5, lg: 0.75 };

export const SPRING = {
  // layout / shared-element transitions (filter pills, nav underline, card reflow)
  layout: { type: "spring", stiffness: 260, damping: 30, mass: 0.8 },
  // small hover lifts — snappier, settles fast
  hover: { type: "spring", stiffness: 400, damping: 28 },
  // scroll progress bar; slight lag reads as polish here
  bar: { stiffness: 140, damping: 30, restDelta: 0.001 },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.lg, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.md, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: DUR.md, ease: EASE } },
};

// Small items (skill pills, tags) — ripple rather than queue.
export const popIn = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.sm, ease: EASE } },
};

/**
 * Parent variant that staggers its children. 80ms is the default sweet spot —
 * below ~50ms a group reads as one blob, above ~120ms the last item arrives late.
 */
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

// One viewport config everywhere → identical trigger point across the page.
export const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" };
