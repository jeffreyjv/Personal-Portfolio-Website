import { Fragment } from "react";
import { motion } from "motion/react";
import { cn } from "./lib/utils";
import { DUR, EASE, VIEWPORT, staggerContainer } from "@/lib/motion";

/**
 * Heading that reveals word by word from behind a mask.
 *
 * Each word gets an `overflow-hidden` wrapper and slides up from below it, so
 * the letters appear to be uncovered rather than to fade in. Reads considerably
 * more deliberate than fading a whole heading block, which is what the section
 * headings did before.
 *
 * Takes a plain string — it splits on spaces, so no element children. The hero's
 * <h1> deliberately doesn't use this: it has a <br> and a nested coloured span
 * that word-splitting would destroy.
 */

const wordVariant = {
  // Opacity as well as travel: MotionConfig's reducedMotion="user" drops the
  // transform, and without the fade those visitors would get no transition at
  // all rather than the cross-fade the rest of the site gives them.
  hidden: { y: "110%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: DUR.lg, ease: EASE } },
};

export const RevealText = ({
  children,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.06,
  ...rest
}) => {
  const Tag = motion[as] ?? motion.h2;
  const text = String(children);
  const words = text.split(" ");

  return (
    <Tag
      className={cn(className)}
      variants={staggerContainer(stagger, delay / 1000)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      // The split spans would otherwise be announced one word per node.
      aria-label={text}
      {...rest}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            aria-hidden="true"
            // The padding/negative-margin pair keeps descenders (g, y, p) from
            // being clipped by the mask without adding any layout height.
            className="inline-block overflow-hidden align-bottom pb-[0.15em] -mb-[0.15em]"
          >
            <motion.span variants={wordVariant} className="inline-block">
              {word}
            </motion.span>
          </span>
          {/* A real space between the inline-blocks, so the heading still wraps
              normally on narrow screens. A non-breaking space would not. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
};
