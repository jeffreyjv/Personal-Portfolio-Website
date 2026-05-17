import { ScrollReveal } from "./ScrollReveal";

const skillGroups = [
  {
    label: "Frontend",
    items: ["React", "Vue", "HTML / CSS", "JavaScript"],
  },
  {
    label: "Backend",
    items: ["FastAPI", "Flask", "GraphQL", "Python"],
  },
  {
    label: "Tools & DevOps",
    items: ["Git", "GitHub", "Docker", "GitLab", "VS Code"],
  },
  {
    label: "Certifications",
    items: [
      "AWS Solutions Architect",
      "Azure Fundamentals",
      "GitLab Security Specialist",
      "GitLab CI/CD Associate",
    ],
  },
];

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
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 rounded-full text-sm font-medium
                                 bg-surface text-foreground border border-border
                                 hover:bg-primary/10 hover:text-primary hover:border-primary/30
                                 transition-colors duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
