import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useHasFinePointer, useIsDesktop } from "@/hooks/use-media-query";

/**
 * The page's background — one layer, one composition, for the whole document.
 *
 * It replaces both `StarBackground` and the hero-only `HeroAurora`, and that
 * merge is the point. Section-scoped backgrounds each clipped to their own
 * `<section>` is what made the page read as a stack of separate slabs: the
 * aurora arrived at the hero, was masked off at its bottom edge, and a different
 * one started again inside About. Nothing carried through, so every boundary was
 * a boundary in the background too.
 *
 * Being `fixed` is what makes it continuous. The blobs never scroll away and
 * never restart — the *content* travels past a background that is always there.
 * What changes as you scroll is how it's arranged:
 *
 * - **Depth.** Each blob gets its own scroll-driven travel (-90 to -420px over
 *   the document). Unequal rates are the whole trick — it's what reads as
 *   distance, and it means the composition is never twice the same.
 * - **Hue.** The wash interpolates blue → violet → teal → blue across the
 *   document, so the room's light changes as you move through it. Motion parses
 *   literal `hsla()` fine; it's `hsl(var(--token))` it can't interpolate.
 * - **Intensity.** Loudest at the hero, where nothing is being read, easing to a
 *   calmer level for the body. It never reaches zero — the moment it does, the
 *   background stops being continuous and the sections go back to being slabs.
 *
 * `-z-10`, not `z-0`: several sections are `position: static`, and against a
 * `z-0` fixed layer those paint *underneath* it. That was survivable at
 * StarBackground's 0.06 alphas and would not be at these.
 *
 * The usual rules hold — transform/opacity only (these are `blur-3xl` surfaces
 * the size of the viewport), non-harmonic durations so the drift never re-syncs
 * into a collective pulse, and a desktop + reduced-motion gate. Off, the
 * composition still renders; it just holds still.
 */

// Vivid rather than tinted — the accent hues near full chroma. Anchored across
// the viewport's whole height, not just its corners, so no stretch of the page
// scrolls through a dead zone. Durations 17/21/27/33/41 are mutually prime-ish
// on purpose.
const BLOBS = [
  {
    className: "-top-40 -left-32 w-[52rem] h-[52rem]",
    color: "hsl(211 100% 55%)",
    duration: 17,
    scrollY: -140,
    x: [0, 160, -80, 0],
    y: [0, -70, 70, 0],
  },
  {
    className: "-top-32 -right-32 w-[48rem] h-[48rem]",
    color: "hsl(280 90% 62%)",
    duration: 21,
    scrollY: -320,
    x: [0, -170, 90, 0],
    y: [0, 90, -50, 0],
  },
  {
    className: "top-1/3 -left-56 w-[44rem] h-[44rem]",
    color: "hsl(174 75% 52%)",
    duration: 41,
    scrollY: -240,
    x: [0, 140, -90, 0],
    y: [0, 100, -70, 0],
  },
  {
    className: "-bottom-56 left-[8%] w-[46rem] h-[46rem]",
    color: "hsl(190 95% 55%)",
    duration: 27,
    scrollY: -90,
    x: [0, 130, -140, 0],
    y: [0, -80, 50, 0],
  },
  {
    className: "-bottom-40 -right-24 w-[42rem] h-[42rem]",
    color: "hsl(330 92% 62%)",
    duration: 33,
    scrollY: -420,
    x: [0, -110, 130, 0],
    y: [0, 60, -80, 0],
  },
];

// Ambient colour per stretch of the page — cool blue through the hero, violet
// across the middle, teal by the projects, settling back to blue at contact.
// This is the slowest-moving thing on the site and the one that ties the whole
// scroll together: it's a single element whose colour is a function of scroll
// position, so there is no point at which it can restart.
const WASH_STOPS = [0, 0.25, 0.5, 0.75, 1];
const WASH_COLORS = [
  "hsla(211, 100%, 60%, 0.05)",
  "hsla(211, 100%, 60%, 0.09)",
  "hsla(280, 80%, 65%, 0.10)",
  "hsla(190, 80%, 60%, 0.09)",
  "hsla(211, 100%, 60%, 0.06)",
];

const SWEEP_MASK =
  "radial-gradient(circle at center, transparent 6%, #000 26%, transparent 60%)";

export const PageAurora = () => {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const finePointer = useHasFinePointer();

  const drift = !reduced && isDesktop;
  const track = drift && finePointer;

  const { scrollYProgress } = useScroll();

  // Hero loud, body calm — but never off. The step is spent over the first 15%
  // of the document so it lands as the hero leaves rather than part-way through
  // whatever you're reading next.
  const intensity = useTransform(scrollYProgress, [0, 0.15, 1], drift ? [1, 0.7, 0.7] : [0.7, 0.7, 0.7]);
  const wash = useTransform(scrollYProgress, WASH_STOPS, WASH_COLORS);
  // The conic sweep is a hero device — it converges on the middle of the
  // viewport, which is exactly where body copy sits further down. It thins out
  // rather than vanishing, so it doesn't read as something switching off.
  const sweepOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.25]);

  // Pointer parallax. Position lives in motion values and is written by a
  // listener, never React state — state here would re-render the page on every
  // mousemove. The spring turns a jittery cursor into a layer that *follows*.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 20, mass: 1 });
  const sy = useSpring(py, { stiffness: 40, damping: 20, mass: 1 });
  // -1..1 → a shallow 30px of travel. Any more and the layer separates from the
  // page instead of sitting behind it.
  const pointerX = useTransform(sx, [-1, 1], [-30, 30]);
  const pointerY = useTransform(sy, [-1, 1], [-20, 20]);

  useEffect(() => {
    if (!track) return;
    const onMove = (e) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [track, px, py]);

  return (
    <motion.div
      aria-hidden="true"
      // One knob for the whole layer on small screens. The blobs are anchored to
      // the edges of the viewport, so on a phone each covers a quarter of the
      // screen instead of sitting off in the periphery — the same alphas that
      // read as ambient on a 27" display read as a coloured overlay at 375px.
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden
                 opacity-75 md:opacity-100"
    >
      <motion.div className="absolute inset-0" style={{ opacity: intensity }}>
        <motion.div className="absolute inset-0" style={{ backgroundColor: wash }} />

        <motion.div
          className="absolute inset-0"
          style={track ? { x: pointerX, y: pointerY } : undefined}
        >
          {BLOBS.map((blob, i) => (
            <ScrollBlob key={i} blob={blob} progress={scrollYProgress} drift={drift} />
          ))}
        </motion.div>

        {/* Slow rotating light sweep. A conic gradient is a single painted layer,
            so spinning it is pure transform — cheap even at this size. */}
        {drift && (
          <motion.div
            // Two nested elements again, and for the same reason as the blobs:
            // this one's opacity is scroll-driven, the inner one's is a
            // light/dark class. On one element the style would silently win.
            className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2
                       -translate-y-1/2 blur-3xl"
            style={{ opacity: sweepOpacity }}
          >
            <motion.div
              className="h-full w-full opacity-[0.10] dark:opacity-[0.16]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, hsl(211 100% 60%) 45deg, transparent 110deg, transparent 220deg, hsl(280 90% 65%) 280deg, transparent 340deg)",
                // Transparent core, not just a soft outer edge: every ray in a
                // conic gradient converges on the centre, and that pinpoint sat
                // directly behind the headline as a visible vanishing point.
                maskImage: SWEEP_MASK,
                WebkitMaskImage: SWEEP_MASK,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * One blob. Split out because each needs its own `useTransform` off the shared
 * scroll progress, and hooks can't be called in a loop body inline.
 *
 * Two motions on two elements, deliberately: the outer div owns the scroll-driven
 * travel, the inner one owns the idle drift. On a single element the `animate`
 * loop and the scroll transform would both be writing `y`, and the variant system
 * wins — the parallax would silently do nothing.
 */
const ScrollBlob = ({ blob, progress, drift }) => {
  const y = useTransform(progress, [0, 1], drift ? [0, blob.scrollY] : [0, 0]);

  return (
    <motion.div className={`absolute ${blob.className}`} style={{ y }}>
      <motion.div
        // Opacity is a class, not a style prop, so light and dark can differ:
        // `screen` onto pure black reads far brighter than `multiply` onto white,
        // so dark mode gets its own value. Motion only ever writes transforms
        // here, so there's no collision.
        className="h-full w-full rounded-full blur-3xl mix-blend-multiply
                   dark:mix-blend-screen opacity-60 dark:opacity-65"
        style={{
          background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
        }}
        animate={drift ? { x: blob.x, y: blob.y, scale: [1, 1.12, 0.94, 1] } : undefined}
        transition={
          drift
            ? {
                duration: blob.duration,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.33, 0.66, 1],
              }
            : undefined
        }
      />
    </motion.div>
  );
};
