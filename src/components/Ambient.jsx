import { motion, useReducedMotion } from "motion/react";
import { useIsDesktop } from "@/hooks/use-media-query";

/**
 * Slow-drifting blurred gradient washes — the page's ambient motion.
 *
 * Extracted from ContactSection so About and Contact drift with the same
 * vocabulary rather than each inventing one. Callers pass positions and colors;
 * everything about *how* it moves lives here.
 *
 * Two rules the orb arrays have to keep:
 *
 * - **Non-harmonic durations** (19 / 25 / 31 …), the same trick StarBackground
 *   uses. Round multiples re-sync into one visible pulse every few cycles.
 * - **Only transform and opacity are animated.** These are 400px `blur-3xl`
 *   surfaces; animating anything that repaints them is the most expensive thing
 *   that could happen on the page.
 *
 * Gated to desktop + no-reduced-motion for that same reason — off, the orbs
 * still render, they just hold still. They're part of the composition, not a
 * decoration that should vanish.
 *
 * The wrapper clips its own overflow so a bleeding orb can't paint over the
 * neighbouring section. That clip deliberately lives *here* and not on the
 * host `<section>`: About's left column is `position: sticky`, and an
 * `overflow: hidden` ancestor would silently make it a scroll container and
 * kill the stick (same trap as Home.jsx's `overflow-x-clip`).
 */
export const AmbientOrbs = ({ orbs, className = "" }) => {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const drift = !reduced && isDesktop;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          style={{
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            opacity: orb.opacity ?? 0.22,
          }}
          animate={drift ? { x: orb.x, y: orb.y, scale: [1, 1.08, 0.96, 1] } : undefined}
          transition={
            drift
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

/**
 * One wide highlight that crosses its container and leaves.
 *
 * The orbs are *felt* rather than seen — they drift 100px over half a minute,
 * which is below the threshold at which you'd catch them moving. This is the
 * counterpart with an actual legible edge, and it's the only directional motion
 * on the page. One per section, max: two crossing bands read as a loading
 * skeleton.
 *
 * `x` is a percentage of the sheen's own width, so it clears its container at
 * both ends at any viewport, and it's transform-only — the gradient never
 * repaints. Linear on purpose: an ease that decelerates into the edge makes the
 * edge the subject, and the point is that it passes through.
 */
export const AmbientSheen = ({
  className = "w-1/2",
  tint = "via-primary/[0.07]",
  duration = 13,
  repeatDelay = 5,
}) => {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Nothing to fall back to — a sheen that doesn't move is just a bright smear,
  // so unlike the orbs this one doesn't render at all when motion is off.
  if (reduced || !isDesktop) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 -z-10 -skew-x-12
                  bg-gradient-to-r from-transparent to-transparent ${tint} ${className}`}
      initial={{ x: "-160%" }}
      animate={{ x: "260%" }}
      transition={{ duration, repeat: Infinity, ease: "linear", repeatDelay }}
    />
  );
};
