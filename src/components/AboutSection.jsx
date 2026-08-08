import { useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import { RevealText } from "./RevealText";
import { AmbientSheen } from "./Ambient";
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
    // This section deliberately owns no background of its own any more. It used
    // to carry a full-bleed `AmbientOrbs` band clipped to its own edges, and
    // that — not the section spacing — is what made About read as a separate
    // world: the aurora arrived at its top edge and was masked off at its
    // bottom, so both seams were visible in the background itself. `PageAurora`
    // now runs continuously behind every section, and `section-tint` is
    // translucent so it shows through this one rather than covering it.
    //
    // `relative` is still needed for the sticky column's containing block, and
    // the sheen still has something to be absolute against.
    <section
      ref={sectionRef}
      id="about"
      className="relative isolate section-page section-tint"
    >
      {/* The one piece of local motion kept: a single highlight crossing the
          band. It's directional where the page aurora is ambient, and unlike the
          orbs it has no edges of its own to give the section away. */}
      <AmbientSheen
        className="w-2/5"
        tint="via-primary/[0.09]"
        duration={9}
        repeatDelay={4}
        fadeEdges
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
