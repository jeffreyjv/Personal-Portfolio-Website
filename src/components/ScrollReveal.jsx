import { motion } from "motion/react";
import { cn } from "./lib/utils";
import { EASE, DUR } from "@/lib/motion";

/**
 * Fade-up on scroll into view. Public API is unchanged from the original
 * IntersectionObserver version — `delay` is still in milliseconds — so all
 * existing call sites keep working; only the implementation moved to Motion.
 *
 * For grid/flex children prefer a `staggerContainer` + `variants` pair on the
 * parent instead: it removes this wrapper div and gives real stagger.
 */
export const ScrollReveal = ({
  children,
  className,
  delay = 0,
  threshold = 0.12,
  as = "div",
  ...rest
}) => {
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      className={cn(className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold, margin: "0px 0px -8% 0px" }}
      transition={{ duration: DUR.lg, ease: EASE, delay: delay / 1000 }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
