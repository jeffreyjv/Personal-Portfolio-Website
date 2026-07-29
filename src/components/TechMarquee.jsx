import { motion, useReducedMotion } from "motion/react";
import skillsData from "@/data/skills.json";

/**
 * Slow full-bleed strip of the stack, sitting between Skills and Projects as a
 * breather between two dense sections.
 *
 * Built from the existing skills data rather than its own list, so it stays
 * current on its own. Certifications are excluded — they're full sentences
 * ("AWS Certified Solutions Architect – Associate"), which makes for a terrible
 * marquee chip.
 *
 * The whole band is aria-hidden: every word in it is already announced by the
 * Skills section directly above, and repeating them adds nothing but noise.
 */
const ITEMS = skillsData.groups
  .filter((group) => group.id !== "certifications")
  .flatMap((group) => group.items);

const EDGE_FADE = "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)";

const chipClass =
  "shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium " +
  "bg-card text-muted border border-border";

// `pe-3` rather than a gap on the parent is load-bearing. The loop translates
// the track by exactly -50%, which only lands on the second copy's first chip if
// every chip carries its own trailing space — a parent `gap` omits it after the
// last chip of each copy, leaving a half-gap stutter at every wrap.
const Track = () => (
  <ul className="flex shrink-0 pe-3">
    {ITEMS.map((item) => (
      <li key={item} className={`${chipClass} me-3`}>
        {item}
      </li>
    ))}
  </ul>
);

export const TechMarquee = () => {
  const reduced = useReducedMotion();

  // An infinite loop is exactly what reduced-motion is asking to be spared, and
  // MotionConfig doesn't cover repeating animations — this has to opt out itself.
  if (reduced) {
    return (
      <div
        aria-hidden="true"
        className="section-y section-shell [--section-y:clamp(2rem,4vw,3.5rem)]"
      >
        <ul className="flex flex-wrap justify-center gap-3">
          {ITEMS.map((item) => (
            <li key={item} className={chipClass}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      // section-y, not section-page: this is a band, not a page, so it must not
      // pick up the full-viewport min-height. Scaled down locally, because the
      // page-level rhythm is far too much air around a single row of chips.
      className="section-y overflow-hidden [--section-y:clamp(2rem,4vw,3.5rem)]"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <motion.div
        className="flex w-max"
        // Two identical copies, translated by half the track — the moment copy
        // one leaves, copy two is pixel-for-pixel where it started, so the reset
        // is invisible and no seam ever passes through.
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <Track />
        <Track />
      </motion.div>
    </div>
  );
};
