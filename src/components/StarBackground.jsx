import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useIsDesktop } from "@/hooks/use-media-query";

// Durations are deliberately non-harmonic (26/32/38s) so the three orbs never
// re-sync into a visible collective pulse. Very slow — felt, not seen.
const ORBS = [
  {
    className: "-top-48 -left-48 w-[600px] h-[600px] opacity-30 dark:opacity-20",
    color: "hsl(211 100% 70%)",
    duration: 26,
    x: [0, 30, -18, 0],
    y: [0, -22, 14, 0],
  },
  {
    className: "top-1/3 -right-32 w-[500px] h-[500px] opacity-20 dark:opacity-10",
    color: "hsl(280 80% 70%)",
    duration: 32,
    x: [0, -26, 16, 0],
    y: [0, 20, -12, 0],
  },
  {
    className: "bottom-0 left-1/3 w-[400px] h-[400px] opacity-20 dark:opacity-10",
    color: "hsl(190 80% 65%)",
    duration: 38,
    x: [0, 22, -20, 0],
    y: [0, -16, 18, 0],
  },
];

// Ambient colour per stretch of the page — cool blue through the hero, violet
// across the middle, teal by the projects, settling back to blue at contact.
// Alphas stay at or below 0.07: this should register as the room's light
// changing, never as a coloured overlay.
const WASH_STOPS = [0, 0.25, 0.5, 0.75, 1];
const WASH_COLORS = [
  "hsla(211, 100%, 60%, 0)",
  "hsla(211, 100%, 60%, 0.06)",
  "hsla(280, 80%, 65%, 0.07)",
  "hsla(190, 80%, 60%, 0.06)",
  "hsla(211, 100%, 60%, 0.04)",
];

export const StarBackground = () => {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // These are 400–600px gradient layers. Animating them forces large composite
  // areas — the biggest battery/jank risk on a phone, so mobile stays static.
  const animate = !reduced && isDesktop;

  const { scrollYProgress } = useScroll();

  // The background trails the page instead of being nailed to it. Moving slower
  // than the content is the whole trick — it's what reads as distance, and it
  // gives free scrolling something continuous to happen against now that the
  // page no longer clicks from section to section.
  const orbY = useTransform(scrollYProgress, [0, 1], animate ? [0, -120] : [0, 0]);
  const wash = useTransform(scrollYProgress, WASH_STOPS, WASH_COLORS);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {animate && (
        <motion.div className="absolute inset-0" style={{ backgroundColor: wash }} />
      )}
      <motion.div className="absolute inset-0" style={{ y: orbY }}>
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${orb.className}`}
            style={{
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            }}
            animate={
              animate
                ? { x: orb.x, y: orb.y, scale: [1, 1.06, 0.97, 1] }
                : undefined
            }
            transition={
              animate
                ? {
                    duration: orb.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.33, 0.66, 1],
                  }
                : undefined
            }
          />
        ))}
      </motion.div>
    </div>
  );
};
