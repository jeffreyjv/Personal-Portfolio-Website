import { motion, useReducedMotion } from "motion/react";
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

export const StarBackground = () => {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // These are 400–600px gradient layers. Animating them forces large composite
  // areas — the biggest battery/jank risk on a phone, so mobile stays static.
  const animate = !reduced && isDesktop;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
    </div>
  );
};
