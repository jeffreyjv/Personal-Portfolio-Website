import { useEffect, useRef, useState } from "react";
import { ArrowDown, Linkedin } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import profpic from "../assets/profpic.jpg";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";
import { useIsDesktop } from "@/hooks/use-media-query";

const ROLES = [
  "Cloud Engineer",
  "DevSecOps Engineer",
  "Full-Stack Developer",
  "AWS Solutions Architect",
];

const ROLE_INTERVAL = 2600;

export const HeroSection = () => {
  const heroRef = useRef(null);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Parallax is desktop-only: on iOS the URL bar collapses mid-scroll, which
  // resizes the viewport, re-fires useScroll measurements and causes a jump.
  const parallax = !reduced && isDesktop;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Unequal travel distances are what create the sense of depth — the "further"
  // a layer reads, the less it moves. No useSpring: with scroll-smooth a spring
  // keeps drifting after the scroll settles and looks unmoored.
  const yPhoto = useTransform(scrollYProgress, [0, 1], parallax ? [0, -40] : [0, 0]);
  const yHeadline = useTransform(scrollYProgress, [0, 1], parallax ? [0, -90] : [0, 0]);
  const ySub = useTransform(scrollYProgress, [0, 1], parallax ? [0, -140] : [0, 0]);
  const fade = useTransform(scrollYProgress, [0, 0.75], parallax ? [1, 0] : [1, 1]);
  const hintFade = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const tick = () => {
      if (document.hidden) return;
      setRoleIndex((i) => (i + 1) % ROLES.length);
    };
    const id = setInterval(tick, ROLE_INTERVAL);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <section
      ref={heroRef}
      id="hero"
      // min-h-svh, not min-h-screen: 100vh on mobile is the *tall* viewport
      // (URL bar collapsed), so the hero overflowed the screen on load and
      // changed height mid-scroll. svh is the stable small viewport.
      className="relative min-h-svh flex flex-col items-center justify-center
                 section-shell pt-12 text-center"
    >
      <motion.div
        className="flex flex-col items-center"
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="visible"
        style={{ opacity: fade }}
      >
        {/* Profile photo */}
        <motion.div variants={fadeUp} style={{ y: yPhoto }} className="mb-8">
          <div className="relative w-28 h-28 mx-auto">
            <img
              src={profpic}
              alt="Jeffrey Vincent"
              width={112}
              height={112}
              className="w-full h-full rounded-full object-cover ring-4 ring-border shadow-xl"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full ring-2 ring-background" />
          </div>
        </motion.div>

        {/* Eyebrow — cycles through roles */}
        <motion.p
          variants={fadeUp}
          style={{ y: yHeadline }}
          layout
          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4
                     flex items-center justify-center h-4 overflow-hidden"
        >
          {/* Animated copy is hidden from screen readers so it isn't re-announced
              every few seconds; the static sentence below carries the meaning. */}
          <span aria-hidden="true" className="relative inline-flex">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ROLES[roleIndex]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="whitespace-nowrap"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="sr-only">
            Cloud Engineer, DevSecOps Engineer and Full-Stack Developer
          </span>
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          style={{ y: yHeadline }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-none mb-6"
        >
          Hi, I'm <span className="text-primary">Jeffrey</span>
          <br />
          <span className="text-primary">Vincent.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp}
          style={{ y: ySub }}
          className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Building cloud-native solutions and elegant interfaces. Based in Charlotte, NC.
          Exploring the world through travel and videography on the side.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          style={{ y: ySub }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <a href="#projects" className="apple-btn-primary">
            View My Work
          </a>
          <a
            href="https://www.linkedin.com/in/jeffreyvincent-796/"
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn-secondary"
          >
            <Linkedin size={15} />
            LinkedIn
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — fades out as soon as you start scrolling */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div style={{ opacity: hintFade }} className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Scroll</span>
          <ArrowDown className="h-4 w-4 text-muted animate-bounce" />
        </motion.div>
      </motion.div>
    </section>
  );
};
