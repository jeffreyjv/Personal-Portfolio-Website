import { useRef } from "react";
import { motion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import { RevealText } from "./RevealText";
import { Monogram } from "./Monogram";
import experienceData from "@/data/experience.json";
import { formatRange } from "@/lib/format";
import { usePortfolioUI } from "@/context/portfolio-ui";
import { useSectionScroll } from "@/hooks/use-section-scroll";

const experience = experienceData.items;

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
    <section ref={sectionRef} id="about" className="section-page section-tint">
      <motion.div className="section-shell" style={{ y, scale }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: label + heading + bio */}
          <div className="flex flex-col space-y-5">
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
            <ScrollReveal delay={100}>
              <p className="text-lg leading-relaxed text-foreground">
                Hi there! I'm{" "}
                <span className="font-semibold text-primary">Jeffrey Vincent</span>, a Senior
                Software Engineer with over{" "}
                <span className="font-semibold">3 years of experience</span> across Cloud
                Engineering, DevSecOps, and full-stack web development.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <p className="text-base leading-relaxed text-muted">
                I studied Computer Science (with a minor in Statistics & Information Systems) at
                the University of North Carolina at Chapel Hill. I love creating elegant
                solutions to complex problems and am always learning new tech.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <p className="text-base leading-relaxed text-muted">
                Outside of work you'll find me traveling or behind a camera lens — videography
                is my creative outlet.
              </p>
            </ScrollReveal>
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
                  href="/JeffreyVincent-Resume.pdf"
                  download="JeffreyVincent-Resume.pdf"
                  className="apple-btn-secondary"
                >
                  Download Resume
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: experience cards — plain div so both columns share the same top edge */}
          <div className="flex flex-col gap-4">
            {experience.map((item, i) => {
              const range = formatRange(item.startDate, item.endDate, item.current);
              return (
                <ScrollReveal key={item.id} delay={100 + i * 80}>
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow duration-300">
                    {item.logo ? (
                      <img
                        src={`/${item.logo}`}
                        alt={item.company}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-xl object-contain flex-shrink-0 bg-surface p-1"
                      />
                    ) : (
                      <Monogram
                        name={item.company}
                        className="w-10 h-10 rounded-xl flex-shrink-0"
                        textClassName="text-xs"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.role}</p>
                      <p className="text-xs text-primary font-medium mb-1">
                        {item.company}
                        {range && (
                          <span className="text-muted font-normal"> · {range}</span>
                        )}
                      </p>
                      <p className="text-sm text-muted leading-snug">{item.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
