import { useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import { RevealText } from "./RevealText";
import { AmbientOrbs, AmbientSheen } from "./Ambient";
import { Timeline } from "./Timeline";
import experienceData from "@/data/experience.json";
import aboutData from "@/data/about.json";
import { profile } from "@/data/profile";
import { yearsSince } from "@/lib/format";
import { usePortfolioUI } from "@/context/portfolio-ui";
import { useSectionScroll } from "@/hooks/use-section-scroll";

const experience = experienceData.items;

/* Derived, not written down: the bio's "N years" figure comes from the earliest
   work entry, so it can never disagree with the timeline right beside it. */
const firstWorkStart = experience
  .filter((i) => i.kind !== "education")
  .map((i) => i.startDate)
  .filter(Boolean)
  .sort()[0];

const YEARS = yearsSince(firstWorkStart);

/* This section is a tall full-bleed band rather than a panel, so the washes are
   bigger, brighter and travel further than Contact's — a panel concentrates its
   aurora, a band dilutes it, and the first pass here was invisible on a wide
   display for exactly that reason. Durations stay non-harmonic against each
   other *and* against Contact's 19/25/31.

   Positions are percentages, not the section's own edges. Pinned to the edges
   they sat in the peripheral dead zone on an ultrawide, hundreds of pixels
   from the 64rem content column where you're actually looking. */
const AURORA = [
  {
    className: "-top-32 left-[4%] w-[720px] h-[720px]",
    color: "hsl(211 100% 60%)",
    duration: 23,
    x: [0, 120, -80, 0],
    y: [0, 70, -50, 0],
    opacity: 0.3,
  },
  {
    className: "top-1/4 right-[2%] w-[780px] h-[780px]",
    color: "hsl(280 80% 65%)",
    duration: 37,
    x: [0, -110, 80, 0],
    y: [0, -84, 60, 0],
    opacity: 0.26,
  },
  {
    className: "-bottom-32 left-[32%] w-[640px] h-[640px]",
    color: "hsl(174 70% 52%)",
    duration: 29,
    x: [0, 96, -104, 0],
    y: [0, -64, 46, 0],
    opacity: 0.22,
  },
];

const EMPHASIS = {
  primary: "font-semibold text-primary",
  strong: "font-semibold text-foreground",
};

export const AboutSection = () => {
  // In-page jumps go through goToSection, not the bare href: it locks scroll-spy
  // for the trip (otherwise the nav indicator strobes through every section on
  // the way) and it supplies the smooth behavior that html no longer sets.
  const { goToSection } = usePortfolioUI();

  const sectionRef = useRef(null);
  const { y, scale } = useSectionScroll(sectionRef);

  return (
    // section-tint, not bg-surface: a flat fill draws a hard line against the
    // transparent sections either side, and without snapping you park on those
    // boundaries constantly.
    //
    // `relative` so the orbs have something to be absolute against, and
    // `isolate` because section-tint paints a real background on this element:
    // without a stacking context the -z-10 orb layer would slide behind that
    // gradient and disappear entirely. Neither affects the sticky column —
    // isolation isn't a containing block, and the clipping lives inside
    // AmbientOrbs rather than on this element. See that file.
    <section
      ref={sectionRef}
      id="about"
      className="relative isolate section-page section-tint"
    >
      <AmbientOrbs orbs={AURORA} className="opacity-100 dark:opacity-80" />
      {/* Wider and quicker than Contact's — it has a whole band to cross rather
          than a 64rem panel, so the same 13s would read as a slow smear. */}
      <AmbientSheen
        className="w-2/5"
        tint="via-primary/[0.09]"
        duration={9}
        repeatDelay={4}
      />
      <motion.div className="section-shell" style={{ y, scale }}>
        {/* No `items-start` here on purpose: it collapses each column to its
            content height, which leaves the sticky column below no track to
            slide along. The stick is scoped to the column with lg:self-start. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-20">
          {/* Left: pins while the timeline scrolls past it. */}
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)] lg:self-start flex flex-col space-y-5">
            {/* One child, so the parent's space-y-5 doesn't drive a gap between
                the eyebrow and the heading it labels. */}
            <div>
              <ScrollReveal>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-3">
                  Background
                </p>
              </ScrollReveal>
              <RevealText className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                About Me
              </RevealText>
            </div>

            {/* RevealText can't carry this one — it splits on spaces, so it takes
                a plain string and these segments are styled spans. */}
            <ScrollReveal delay={100}>
              <p className="text-xl md:text-2xl leading-relaxed text-foreground">
                {aboutData.lead.map((seg, i) => {
                  const text = seg.text.replace("{years}", YEARS);
                  return seg.emphasis ? (
                    <span key={i} className={EMPHASIS[seg.emphasis]}>
                      {text}
                    </span>
                  ) : (
                    <span key={i}>{text}</span>
                  );
                })}
              </p>
            </ScrollReveal>

            {aboutData.paragraphs.map((text, i) => (
              <ScrollReveal key={i} delay={180 + i * 60}>
                <p className="text-base leading-relaxed text-muted">{text}</p>
              </ScrollReveal>
            ))}

            <ScrollReveal delay={300}>
              <div className="flex flex-wrap gap-3 pt-4">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goToSection("contact");
                  }}
                  className="apple-btn-primary"
                >
                  Get In Touch
                </a>
                <a
                  href={profile.resume}
                  download
                  className="apple-btn-secondary"
                >
                  Download Resume
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: the scrolling half of the pair. */}
          <Timeline items={experience} />
        </div>
      </motion.div>
    </section>
  );
};
