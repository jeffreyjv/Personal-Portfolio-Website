import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Monogram } from "./Monogram";
import { formatRange } from "@/lib/format";
import { fadeUp, staggerContainer, SPRING, VIEWPORT, DUR, EASE } from "@/lib/motion";
import { useIsDesktop } from "@/hooks/use-media-query";
import { usePointerSpotlight } from "@/hooks/use-pointer-spotlight";

/* The rail sits in the group's left padding. Both numbers are here rather than
   inline so the track, the fill and the dots can't drift apart. */
const RAIL_INSET = "left-[7px]";
const DOT_BASE = "absolute -left-8 top-7 h-3.5 w-3.5 rounded-full border-2";

/* Fading a coloured dot in over a grey one, rather than animating the dot's own
   colour: every colour here is an `hsl(var(--token))`, and Motion can't
   interpolate a value it can't parse — it would snap instead of transition. */
const dotVariant = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.md, ease: EASE, delay: 0.12 },
  },
};

/** Grey by default; lights up to primary as its entry reveals. */
const Dot = ({ current }) => (
  <>
    <span aria-hidden="true" className={`${DOT_BASE} border-border bg-background`} />
    <motion.span
      aria-hidden="true"
      variants={dotVariant}
      className={`${DOT_BASE} border-primary ${
        current ? "bg-primary ring-4 ring-primary/15" : "bg-background"
      }`}
    />
  </>
);

/**
 * One entry. The spotlight is per-card — a single shared one would need the
 * pointer position relative to whichever card is hovered, which is the same
 * work with extra bookkeeping.
 */
const TimelineCard = ({ item }) => {
  const range = formatRange(item.startDate, item.endDate, item.current);
  const { enabled, background, handlers } = usePointerSpotlight();

  return (
    <motion.article
      {...handlers}
      // The lift is a Motion prop, not `hover:-translate-y-1`: CSS and Motion
      // both writing `transform` makes the hover stutter.
      whileHover={{ y: -3 }}
      transition={SPRING.hover}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border
                 hover:shadow-lg transition-shadow duration-300"
    >
      {enabled && (
        <motion.div
          aria-hidden="true"
          style={{ background }}
          className="absolute inset-0 pointer-events-none opacity-0
                     group-hover:opacity-100 transition-opacity duration-300"
        />
      )}

      <div className="relative flex items-start gap-4 p-6">
        {item.logo ? (
          <img
            src={`/${item.logo}`}
            alt={item.company}
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl object-contain flex-shrink-0 bg-surface p-1"
          />
        ) : (
          <Monogram
            name={item.company}
            className="w-11 h-11 rounded-xl flex-shrink-0"
            textClassName="text-xs"
          />
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
            <h4 className="font-semibold text-foreground text-base">{item.role}</h4>
            {item.current && (
              <span
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary
                           border border-primary/30 text-[10px] font-semibold
                           uppercase tracking-[0.12em]"
              >
                Present
              </span>
            )}
          </div>

          <p className="text-sm text-primary font-medium">
            {item.company}
            {range && <span className="text-muted font-normal"> · {range}</span>}
          </p>

          {item.location && (
            <p className="text-xs text-muted mt-0.5">{item.location}</p>
          )}

          <p className="text-sm text-muted leading-relaxed mt-2">
            {item.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

/**
 * One labelled group (Experience / Education) with its own rail.
 *
 * Per-group rather than one rail for the whole column so the fill restarts at
 * each label — a single unbroken line would run straight through the heading.
 */
const TimelineGroup = ({ label, items }) => {
  const railRef = useRef(null);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Same gate as use-section-scroll: MotionConfig's reducedMotion does not cover
  // scroll-linked useTransform, and iOS resizes the viewport mid-scroll which
  // makes useScroll jump.
  const on = !reduced && isDesktop;

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 85%", "end 65%"],
  });

  // Off → constant 1, so the rail simply renders already-drawn.
  const scaleY = useTransform(scrollYProgress, [0, 1], on ? [0, 1] : [1, 1]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-5">
        {label}
      </p>

      <div ref={railRef} className="relative pl-8">
        <div
          aria-hidden="true"
          className={`absolute ${RAIL_INSET} inset-y-1 w-px bg-border`}
        />
        <motion.div
          aria-hidden="true"
          style={{ scaleY, transformOrigin: "top" }}
          className={`absolute ${RAIL_INSET} inset-y-1 w-px bg-primary`}
        />

        {/* Stagger on the parent rather than a ScrollReveal per card: it's real
            stagger and it drops four wrapper divs. */}
        <motion.ol
          className="flex flex-col gap-5 md:gap-7"
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {items.map((item) => (
            <motion.li key={item.id} variants={fadeUp} className="relative">
              <Dot current={item.current} />
              <TimelineCard item={item} />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </div>
  );
};

/**
 * The About section's right column. Splits experience.json on its `kind` field —
 * work first, then education — which the old flat card stack ignored entirely.
 */
export const Timeline = ({ items }) => {
  const work = items.filter((i) => i.kind !== "education");
  const education = items.filter((i) => i.kind === "education");

  return (
    <div className="flex flex-col gap-12">
      {work.length > 0 && <TimelineGroup label="Experience" items={work} />}
      {education.length > 0 && (
        <TimelineGroup label="Education" items={education} />
      )}
    </div>
  );
};
