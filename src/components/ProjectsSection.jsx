import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import { ProjectCard } from "./ProjectCard";
import { RepoCard, RepoCardSkeleton } from "./RepoCard";
import projectsData from "@/data/projects.json";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { collectTags, mergeProjects } from "@/lib/merge-projects";
import { SPRING, VIEWPORT, staggerContainer } from "@/lib/motion";
import { usePortfolioUI, ALL_TAG as ALL } from "@/context/portfolio-ui";
import { cn } from "./lib/utils";

export const ProjectsSection = () => {
  const { repos, status } = useGitHubRepos();
  // Shared so the command palette's "Show React projects" drives this too.
  const { filter, setFilter } = usePortfolioUI();

  const { cards, extras } = useMemo(() => {
    const merged = mergeProjects(projectsData.projects, repos);
    if (import.meta.env.DEV) {
      for (const c of merged.cards) {
        if (c.orphaned) {
          console.warn(
            `[projects] "${c.slug}" points at ${c.repo}, which GitHub didn't return — renamed, deleted, or now private. The card still renders from projects.json.`
          );
        }
      }
    }
    return merged;
  }, [repos]);

  const tags = useMemo(() => [ALL, ...collectTags(cards)], [cards]);

  const visible = useMemo(
    () => (filter === ALL ? cards : cards.filter((c) => c.tags.includes(filter))),
    [cards, filter]
  );

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
          <p className="text-base text-muted max-w-lg mb-10 leading-relaxed">
            A selection of personal and professional projects built with attention to
            detail and performance.
          </p>
        </ScrollReveal>

        {/* Filter chips — horizontally scrollable on mobile with a full-bleed edge */}
        <ScrollReveal delay={80}>
          <div
            role="group"
            aria-label="Filter projects by technology"
            className="flex gap-2 mb-10 overflow-x-auto md:flex-wrap md:overflow-visible
                       -mx-6 px-6 md:mx-0 md:px-0 pb-1 snap-x"
          >
            {tags.map((tag) => {
              const isActive = filter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative shrink-0 snap-start px-3.5 py-1.5 rounded-full text-sm font-medium",
                    "border transition-colors duration-200 cursor-pointer",
                    isActive
                      ? "text-primary border-transparent"
                      : "text-muted border-border hover:text-foreground"
                  )}
                >
                  {isActive && (
                    // layoutId makes the highlight slide from the old chip to the
                    // new one instead of popping — the "magic move".
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-primary/12 border border-primary/30"
                      transition={SPRING.layout}
                    />
                  )}
                  <span className="relative">{tag}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        <LayoutGroup>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {visible.length === 0 && (
          <p className="text-sm text-muted text-center py-12">
            No projects tagged “{filter}”.
          </p>
        )}

        {/* Live from GitHub — hidden entirely if the API is unreachable */}
        {status !== "error" && (extras.length > 0 || status === "loading") && (
          <div className="mt-16">
            <ScrollReveal>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-5">
                More on GitHub
              </h3>
            </ScrollReveal>

            <motion.div
              variants={staggerContainer(0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {status === "loading"
                ? Array.from({ length: 3 }, (_, i) => <RepoCardSkeleton key={i} />)
                : extras.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
            </motion.div>
          </div>
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
