import { Star } from "lucide-react";
import { motion } from "motion/react";
import { formatMonthYear } from "@/lib/format";
import { normalizeTopics } from "@/lib/tag-map";
import { SPRING, popIn } from "@/lib/motion";

/** Lighter card for repos pulled live from GitHub that aren't curated projects. */
export const RepoCard = ({ repo }) => {
  const updated = formatMonthYear(repo.pushedAt);
  const topics = normalizeTopics(repo.topics).slice(0, 3);

  return (
    <motion.a
      variants={popIn}
      whileHover={{ y: -3 }}
      transition={SPRING.hover}
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ borderRadius: 16 }}
      className="flex flex-col gap-2 p-5 bg-card border border-border
                 hover:shadow-md transition-shadow duration-300"
    >
      <p className="font-semibold text-sm text-foreground">{repo.name}</p>
      <p className="text-xs text-muted leading-relaxed flex-1 line-clamp-2">
        {repo.description}
      </p>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-surface border border-border text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted pt-1">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            {repo.language}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} />
            {repo.stars}
          </span>
        )}
        {updated && <span>{updated}</span>}
      </div>
    </motion.a>
  );
};

export const RepoCardSkeleton = () => (
  <div className="h-32 rounded-2xl bg-border/40 animate-pulse" aria-hidden="true" />
);
