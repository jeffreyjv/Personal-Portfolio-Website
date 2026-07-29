import { useScroll, useTransform, useReducedMotion } from "motion/react";
import { useIsDesktop } from "./use-media-query";

/**
 * Drives a section's entrance from scroll position rather than a one-shot
 * trigger.
 *
 * This is what replaces the mandatory scroll snapping that used to live on
 * `html` (see the comment in index.css). Snapping guaranteed you always came to
 * rest on a composed frame by dragging the page onto one; scrubbing gets the
 * same result by making every frame composed, without ever taking the scroll
 * away from you.
 *
 * Entry only — no exit animation. A section that fades or shrinks while you're
 * still reading it is actively hostile. The hero is the one exception, and it
 * owns that logic itself, because scrolling past the hero is proof you're done
 * with it.
 *
 * Returns motion values for the *spatial* half of the entrance only. Opacity and
 * per-item stagger stay with the `ScrollReveal`s inside the section, so no two
 * systems ever write the same property (see CLAUDE.md).
 */
export function useSectionScroll(ref) {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Desktop-only, like every other scroll-linked effect here: iOS collapses the
  // URL bar mid-scroll, which resizes the viewport, re-fires useScroll's
  // measurements and makes the value jump. Mobile keeps the ScrollReveal
  // entrances, which are trigger-based and immune to that.
  const on = !reduced && isDesktop;

  const { scrollYProgress } = useScroll({
    target: ref,
    // Height-independent on purpose: 0 when the section's top edge sits at the
    // viewport bottom, 1 when that edge has risen to 60% of the way up. A short
    // section and the much taller Projects section therefore animate in over the
    // same *physical distance*. The obvious ["start end", "end start"] instead
    // spreads the entrance across the section's whole height, which makes tall
    // sections crawl and short ones snap.
    //
    // 60% rather than "center" so the last section on the page can always
    // finish. The document stops scrolling once its end is at the viewport
    // bottom, so a final section shorter than the distance still to travel would
    // freeze part-way and sit permanently offset and undersized.
    offset: ["start end", "start 60%"],
  });

  // Hooks must run unconditionally, so the switch is in the output range rather
  // than around the call — same pattern as HeroSection's parallax.
  const y = useTransform(scrollYProgress, [0, 1], on ? [56, 0] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], on ? [0.965, 1] : [1, 1]);

  return { y, scale };
}
