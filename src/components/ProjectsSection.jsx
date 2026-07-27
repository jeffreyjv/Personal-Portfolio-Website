import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import { ProjectCard } from "./ProjectCard";
import projectsData from "@/data/projects.json";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { mergeProjects } from "@/lib/merge-projects";

export const ProjectsSection = () => {
  const { repos, status } = useGitHubRepos();

  const cards = useMemo(() => mergeProjects(projectsData.projects, repos), [repos]);

  return (
    <section id="projects" className="section-y bg-surface">
      <div className="section-shell">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-3">
            Work
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            All Projects
          </h2>
          <p className="text-base text-muted max-w-lg mb-10 leading-relaxed">
            Every public repository, pulled live from GitHub and ordered by most
            recent activity.
          </p>
        </ScrollReveal>

        {/* One flat grid. Cards animate in rather than appearing fully formed:
            the curated entries render on first paint, then the rest arrive when
            the GitHub fetch resolves, and `layout` keeps that growth smooth. */}
        <LayoutGroup>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {cards.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {status === "error" && (
          <p className="text-sm text-muted text-center pt-10">
            Couldn't reach GitHub just now — showing saved projects.
          </p>
        )}

        <ScrollReveal delay={150}>
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
