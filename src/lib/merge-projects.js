import { getAsset } from "@/data/images";
import { dedupeTags, normalizeTopics } from "@/lib/tag-map";

export const FEATURED_TOPIC = "portfolio-featured";

/**
 * Combine curated project entries with live GitHub data.
 *
 * projects.json is the source of truth for *what appears on the page*; GitHub
 * only decorates it with stars/language/recency. So if the API is down, every
 * card still renders — the section is never empty.
 *
 * Matching prefers the numeric `githubId` (immutable, survives repo renames)
 * and falls back to `repo` ("owner/name", the part a human can actually type).
 */
export function mergeProjects(curated = [], repos = [], { max = 3 } = {}) {
  const byId = new Map(repos.map((r) => [r.id, r]));
  const byName = new Map(repos.map((r) => [r.fullName.toLowerCase(), r]));
  const used = new Set();

  const cards = [...curated]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((p) => {
      const match =
        (p.githubId && byId.get(p.githubId)) ||
        (p.repo && byName.get(p.repo.toLowerCase())) ||
        null;

      if (match) used.add(match.id);

      return {
        ...p,
        image: getAsset(p.image),
        // html_url comes from the API, so a renamed repo's link self-heals.
        githubUrl: match?.url ?? (p.repo ? `https://github.com/${p.repo}` : null),
        demoUrl: p.demoUrl || match?.homepage || null,
        stars: match?.stars ?? null,
        language: match?.language ?? null,
        pushedAt: match?.pushedAt ?? null,
        tags: dedupeTags([...(p.tags ?? []), ...normalizeTopics(match?.topics)]),
        live: Boolean(match),
        // Curated but no matching repo *while the API returned data* — renamed,
        // deleted, or made private. The card still renders; badges are hidden.
        orphaned: Boolean(p.repo) && repos.length > 0 && !match,
      };
    });

  const extras = repos
    .filter(
      (r) =>
        !used.has(r.id) &&
        r.description &&
        !r.archived &&
        // owner/owner is the GitHub profile README repo, not a project
        r.name.toLowerCase() !== r.fullName.split("/")[0].toLowerCase()
    )
    .sort(
      (a, b) =>
        Number(b.topics.includes(FEATURED_TOPIC)) -
          Number(a.topics.includes(FEATURED_TOPIC)) ||
        b.stars - a.stars ||
        new Date(b.pushedAt) - new Date(a.pushedAt)
    )
    .slice(0, max);

  return { cards, extras };
}

/** Every distinct tag across the merged cards, for the filter chip row. */
export function collectTags(cards = []) {
  return dedupeTags(cards.flatMap((c) => c.tags ?? [])).sort((a, b) =>
    a.localeCompare(b)
  );
}
