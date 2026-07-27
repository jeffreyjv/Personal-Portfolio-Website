import { useState } from "react";
import { ExternalLink, Github, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { Monogram } from "./Monogram";
import { formatMonthYear } from "@/lib/format";
import { SPRING } from "@/lib/motion";

export const ProjectCard = ({ project }) => {
  const updated = formatMonthYear(project.pushedAt);

  // Covers are probed server-side, but the file can be deleted inside the API's
  // one-hour cache window. Track the *url* that failed rather than a boolean, so
  // swapping to a different src (local image → repo cover) clears itself without
  // an effect, and a dead cover degrades to the Monogram, never a broken icon.
  const [failedSrc, setFailedSrc] = useState(null);
  const cover = project.image && project.image !== failedSrc ? project.image : null;

  return (
    <motion.article
      layout
      // borderRadius must be an inline style, not a class: Motion can only
      // counter-distort a radius it owns, otherwise it warps during layout/scale.
      style={{ borderRadius: 16 }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={SPRING.layout}
      // The lift lives here rather than in a `hover:-translate-y-1` class —
      // CSS and Motion both writing `transform` makes the hover stutter.
      whileHover={{ y: -4 }}
      className="group h-full flex flex-col overflow-hidden bg-card border border-border
                 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        {cover ? (
          <img
            src={cover}
            alt={project.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailedSrc(cover)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Monogram
            name={project.title}
            className="w-full h-full border-0"
            textClassName="text-3xl"
          />
        )}

        {/* Set by mergeProjects on the most recently pushed repo — so it only
            ever appears once, and only when GitHub data actually arrived. */}
        {project.latest && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1
                       rounded-full bg-background/80 backdrop-blur-md border border-primary/30
                       text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
          >
            <Sparkles size={10} aria-hidden="true" />
            Latest
          </motion.span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex flex-wrap gap-1.5 empty:hidden">
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
          {/* Uncurated repos with no GitHub description have nothing to say
              here — render nothing rather than an empty paragraph. */}
          {project.summary && (
            <p className="text-sm text-muted leading-relaxed">{project.summary}</p>
          )}
        </div>

        {/* Live GitHub badges. Height is reserved so nothing shifts when they
            arrive; they simply don't render when the API is unavailable. */}
        <div className="min-h-[1.25rem] flex items-center gap-3 text-xs text-muted">
          {project.live && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3"
            >
              {project.language && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                  {project.language}
                </span>
              )}
              {project.stars > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={12} />
                  {project.stars}
                </span>
              )}
              {updated && <span>Updated {updated}</span>}
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <Github size={14} />
              Source
            </a>
          )}
          {project.demoUrl && (
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
    </motion.article>
  );
};
