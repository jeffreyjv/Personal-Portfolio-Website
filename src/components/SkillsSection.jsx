import { motion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import skillsData from "@/data/skills.json";
import { VIEWPORT, popIn, staggerContainer } from "@/lib/motion";

const skillGroups = skillsData.groups;

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-3">
            Expertise
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-16">
            Skills
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {skillGroups.map((group, i) => (
            <ScrollReveal key={group.label} delay={i * 80}>
              <div className="p-7 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-5">
                  {group.label}
                </h3>
                {/* Per-card container: each card's pills ripple when *that*
                    card enters, rather than all 20 firing at once. 40ms — small
                    items should ripple, not queue. */}
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={staggerContainer(0.04, 0.08)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                >
                  {group.items.map((skill) => (
                    <motion.span
                      key={skill}
                      variants={popIn}
                      className="px-3.5 py-1.5 rounded-full text-sm font-medium
                                 bg-surface text-foreground border border-border
                                 hover:bg-primary/10 hover:text-primary hover:border-primary/30
                                 transition-colors duration-200 cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
