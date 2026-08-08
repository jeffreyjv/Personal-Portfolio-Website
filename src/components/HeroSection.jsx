import { useEffect, useRef, useState } from "react";
import { ArrowDown, Linkedin, Youtube } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import profpic from "../assets/profpic.jpg";
import { EASE, SPRING, fadeUp, staggerContainer } from "@/lib/motion";
import { useIsDesktop } from "@/hooks/use-media-query";
import { profile } from "@/data/profile";
import { usePortfolioUI } from "@/context/portfolio-ui";

const ROLES = [
  "Senior Software Engineer",
  "Cloud Engineer",
  "Full-Stack Developer",
  "AWS Solutions Architect",
];

const ROLE_INTERVAL = 2600;

// Same four hues as PageAurora, in the same order — the halo reads as the
// background condensed into a ring rather than as a second colour scheme.
const HALO_GRADIENT =
  "conic-gradient(from 0deg, hsl(211 100% 55%), hsl(280 90% 62%), hsl(330 92% 62%), hsl(190 95% 55%), hsl(211 100% 55%))";

const HALO_SPIN = { duration: 14, repeat: Infinity, ease: "linear" };

export const HeroSection = () => {
  const heroRef = useRef(null);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  // See AboutSection — in-page jumps route through goToSection, not the href.
  const { goToSection } = usePortfolioUI();

  // Parallax is desktop-only: on iOS the URL bar collapses mid-scroll, which
  // resizes the viewport, re-fires useScroll measurements and causes a jump.
  const parallax = !reduced && isDesktop;

  // The halo is a single ~240px layer, an order of magnitude cheaper than the
  // viewport-sized aurora blobs — so unlike those it isn't desktop-gated, only
  // reduced-motion-gated. MotionConfig doesn't cover infinite loops.
  const haloSpin = !reduced;

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

  // The hero pulls back and defocuses as it leaves rather than just sliding off.
  // It's the one place on the page with an exit animation — scrolling past the
  // hero is proof you're finished with it, whereas fading a section you might
  // still be reading would be hostile. Animated blur() is the most expensive
  // effect on the page, which is another reason it's confined to this one
  // element and to desktop.
  const blurPx = useTransform(scrollYProgress, [0, 0.8], parallax ? [0, 10] : [0, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const heroScale = useTransform(scrollYProgress, [0, 1], parallax ? [1, 0.94] : [1, 1]);

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
      // The hero is the one section that still fills the screen — that's a
      // deliberate opening statement, and it's the runway both the scroll
      // indicator and the exit parallax need. Every other section is
      // content-height; see --page-min-h in index.css. Overriding the token
      // rather than reaching for a min-h-svh class keeps section-page the only
      // thing that sizes a section.
      //
      // `section-shell` deliberately does NOT live on the section — it caps
      // width at `--measure`, and the hero's background is full-bleed. It's on
      // the content wrapper below instead, which is what every other section
      // does. The background itself is `PageAurora`, mounted once in Home for
      // the whole document: the hero used to own a private aurora, and masking
      // it off at the hero's bottom edge is precisely what made the hero read as
      // a separate world from everything under it.
      className="relative section-page text-center [--page-min-h:100svh]"
    >
      {/* Two layers on purpose. The outer one owns the scroll-driven *exit*;
          the inner one owns the on-load stagger. Merged onto a single element —
          an `opacity` motion value in `style` alongside `variants`/`animate` —
          the fade is silently dropped: the variant system claims the property,
          so the hero blurred and receded on scroll but never faded out. */}
      <motion.div className="section-shell" style={{ opacity: fade, scale: heroScale, filter }}>
        <motion.div
          className="flex flex-col items-center"
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          animate="visible"
        >
          {/* Profile photo. Sized in three steps rather than one fixed value —
              at 13rem it's the anchor of the composition on a desktop, but that
              same 208px on a 375px phone leaves no room above the headline
              before the hero overflows its 100svh. */}
          <motion.div variants={fadeUp} style={{ y: yPhoto }} className="mb-8">
            <motion.div
              className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-52 md:h-52 mx-auto"
              whileHover={{ scale: 1.03 }}
              transition={SPRING.hover}
            >
              {/* Two copies of one rotating conic gradient, and it takes both:
                  blurred alone it's a vague coloured smudge, crisp alone it's a
                  sticker. The blurred copy is the light the photo is sitting in;
                  the crisp copy is the hard rim that light is coming off. Same
                  duration on each, mounted together, so they never drift apart.
                  `rotate` on a painted gradient is transform-only — the layers
                  never repaint, which is why the blur is affordable. */}
              <motion.div
                aria-hidden="true"
                className="absolute -inset-6 rounded-full blur-2xl opacity-90 dark:opacity-80"
                style={{ background: HALO_GRADIENT }}
                animate={haloSpin ? { rotate: 360 } : undefined}
                transition={HALO_SPIN}
              />
              <motion.div
                aria-hidden="true"
                // The photo's own `ring-4 ring-background` paints over the inner
                // 4px of this, so the visible rim is the 5px difference — and it
                // arrives with a hard background-coloured gap between it and the
                // face, which is what keeps the colour off his skin.
                className="absolute -inset-[9px] rounded-full"
                style={{ background: HALO_GRADIENT }}
                animate={haloSpin ? { rotate: 360 } : undefined}
                transition={HALO_SPIN}
              />
              <img
                src={profpic}
                alt="Jeffrey Vincent"
                width={208}
                height={208}
                // ring-background, not ring-border: the halo needs a hard gap
                // between it and the photo or the colour bleeds onto the face.
                className="relative w-full h-full rounded-full object-cover
                           ring-4 ring-background shadow-2xl"
              />
              <span
                className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full
                           ring-4 ring-background"
              />
            </motion.div>
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
            // Keyed to min(width, height), not width alone: at lg the old fixed
            // 8xl put two 96px lines on screen, which overflowed the hero's page
            // on a short-but-wide laptop (~1400x700). This only shrinks when
            // vertical space is the binding constraint — it still reaches the
            // full 6rem on any display tall enough to carry it.
            className="text-[clamp(2.75rem,min(9vw,10svh),6rem)] font-bold tracking-tight
                       text-foreground leading-none mb-6"
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
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                goToSection("projects");
              }}
              className="apple-btn-primary"
            >
              View My Work
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-secondary"
            >
              <Linkedin size={15} />
              LinkedIn
            </a>
            <a
              href={profile.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-secondary"
            >
              {/* Brand red on the glyph only — the label keeps text-primary so the
                  button still reads as a sibling of the LinkedIn one. */}
              <Youtube size={15} className="text-[#FF0033]" />
              YouTube
            </a>
          </motion.div>
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
