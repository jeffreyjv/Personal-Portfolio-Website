import { motion, useReducedMotion } from "motion/react";
import { useIsDesktop } from "@/hooks/use-media-query";

/**
 * Slow-drifting blurred gradient washes — the page's ambient motion.
 *
 * This is *panel-local* motion now. The page's background is `PageAurora`, one
 * fixed layer behind the whole document — About used to carry a full-bleed
 * `AmbientOrbs` band as well, and a section-scoped aurora that arrives at one
 * seam and is masked off at the other is precisely what made About read as a
 * separate world from everything around it. `AmbientOrbs` is therefore down to
 * one caller: Contact, inside its rounded card, where the panel edge is the
 * point. Don't reintroduce a section-scoped band — it only fights the page
 * aurora it's sitting on top of.
 *
 * Callers pass positions and colors; everything about *how* it moves lives here.
 *
 * Two rules the orb arrays have to keep:
 *
 * - **Non-harmonic durations** (19 / 25 / 31 …), the same trick PageAurora
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
 *
 * `fadeEdges` is what makes that clip survivable on a full-bleed band. These
 * orbs are 600–800px and positioned to *overhang* the section (-top-32,
 * -bottom-32), so a straight clip shears the blur flat and draws a hard
 * horizontal line at the section boundary — the precise seam `section-tint`
 * exists to prevent, and it was visible at both the hero/about and about/skills
 * edges. The mask dissolves the layer over the same stops the tint uses, so the
 * wash and the surface band arrive and leave together. Off by default: Contact's
 * aurora sits inside a rounded card, where the panel edge is the point.
 */

/* Same stops as the `section-tint` utility in index.css — keep them in step. */
const EDGE_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)";

const edgeFadeStyle = {
  maskImage: EDGE_FADE,
  WebkitMaskImage: EDGE_FADE,
};

export const AmbientOrbs = ({ orbs, className = "", fadeEdges = false }) => {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const drift = !reduced && isDesktop;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      // Static mask, so it's painted once and never animates — the orbs
      // themselves still only move via transform/opacity.
      style={fadeEdges ? edgeFadeStyle : undefined}
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
  fadeEdges = false,
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
      // `inset-y-0` makes this exactly section-tall, so on a full-bleed band its
      // ends land on the section seam too. The mask is in the element's own
      // space and the motion is horizontal, so the soft ends stay put.
      style={fadeEdges ? edgeFadeStyle : undefined}
    />
  );
};
