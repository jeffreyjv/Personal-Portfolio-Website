import { ArrowRight, ExternalLink, Github } from "lucide-react";
import covid from "../assets/covid.png";
import website from "../assets/website.png";
import auxbot from "../assets/auxbot.png";
import { ScrollReveal } from "./ScrollReveal";

const projects = [
  {
    id: 1,
    title: "Personal Portfolio Website",
    description:
      "React + Tailwind CSS personal portfolio showcasing projects, skills, and experience.",
    image: website,
    tags: ["React", "Tailwind", "JavaScript"],
    demoUrl: "#",
    githubUrl: "https://github.com/jeffreyjv/Personal-Portfolio-Website",
  },
  {
    id: 2,
    title: "Covid-19 Dashboard",
    description:
      "COVID-19 information dashboard built with a React front-end and Firebase back-end.",
    image: covid,
    tags: ["React", "Firebase", "JavaScript"],
    demoUrl: "#",
    githubUrl: "https://github.com/jeffreyjv/Covid-19-Dashboard",
  },
  {
    id: 3,
    title: "Aux Bot",
    description:
      "Discord bot that streams music from YouTube with play, pause, stop, and skip controls.",
    image: auxbot,
    tags: ["Python", "Discord.py", "APIs"],
    demoUrl: "#",
    githubUrl: "https://github.com/jeffreyjv/Aux-Bot-Discord-Bot",
  },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-32 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-3">
            Work
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            Featured Projects
          </h2>
          <p className="text-base text-muted max-w-lg mb-16 leading-relaxed">
            A selection of personal and professional projects built with attention to
            detail and performance.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 100}>
              <div className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="h-48 overflow-hidden bg-surface">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6 gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-surface border border-border text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1.5">{project.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{project.description}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                    >
                      <Github size={14} />
                      Source
                    </a>
                    {project.demoUrl !== "#" && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                      >
                        <ExternalLink size={14} />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="flex justify-center mt-14">
            <a
              href="https://github.com/jeffreyjv"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-secondary"
            >
              View all on GitHub
              <ArrowRight size={14} />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
