import { getAsset } from "@/data/images";
import { humanizeRepoName } from "@/lib/format";
import { dedupeTags, normalizeTopics } from "@/lib/tag-map";

export const FEATURED_TOPIC = "portfolio-featured";

/**
 * Repos that are never projects. Forks and private repos are already dropped
 * upstream in api/github.js; this covers the rest:
 *  - archived repos, which are finished/abandoned rather than portfolio work
 *  - owner/owner, which is the GitHub profile README, not a project
 */
function isListable(repo, owner) {
  return !repo.archived && repo.name.toLowerCase() !== owner.toLowerCase();
}

/**
 * Build the Projects grid: **every** public repo, in one flat list.
 *
 * projects.json is no longer a gate on what appears — GitHub is the list, and a
 * curated entry just enriches the repo it points at with a screenshot, a
 * hand-written summary and a nicer title. Repos with no curated entry still get
 * a card, built from their GitHub description, topics and language.
 *
 * Matching prefers the numeric `githubId` (immutable, survives repo renames)
 * and falls back to `repo` ("owner/name", the part a human can actually type).
 *
 * If the API is down `repos` is empty and this returns the curated entries
 * alone, so the section is never blank.
 */
export function mergeProjects(curated = [], repos = []) {
  const byId = new Map();
  const byName = new Map();
  for (const p of curated) {
    if (p.githubId) byId.set(p.githubId, p);
    if (p.repo) byName.set(p.repo.toLowerCase(), p);
  }

  const owner = repos[0]?.fullName.split("/")[0] ?? "";
  const usedCurated = new Set();

  const fromGitHub = repos.filter((r) => isListable(r, owner)).map((repo) => {
    const p =
      byId.get(repo.id) ?? byName.get(repo.fullName.toLowerCase()) ?? null;
    if (p) usedCurated.add(p.slug);

    return {
      slug: p?.slug ?? repo.name.toLowerCase(),
      title: p?.title ?? humanizeRepoName(repo.name),
      // A curated summary beats GitHub's description; if there's neither, the
      // card renders without one rather than showing an empty paragraph.
      summary: p?.summary ?? repo.description ?? null,
      // The repo's own .github/preview.* wins: covers are managed on GitHub so
      // adding one never means touching this codebase. A bundled image in
      // projects.json is the fallback for repos that don't ship one yet.
      image: repo.coverUrl ?? getAsset(p?.image),
      // html_url from the API, so a renamed repo's link self-heals.
      githubUrl: repo.url,
      demoUrl: p?.demoUrl || repo.homepage || null,
      stars: repo.stars,
      language: repo.language,
      pushedAt: repo.pushedAt,
      // Curated tags first, then topics. Language is the last resort so every
      // card carries at least one chip.
      tags: dedupeTags([
        ...(p?.tags ?? []),
        ...normalizeTopics(repo.topics),
        ...(p?.tags?.length || repo.topics.length ? [] : [repo.language]),
      ]).filter(Boolean),
      featured: repo.topics.includes(FEATURED_TOPIC),
      live: true,
      orphaned: false,
      order: p?.order ?? 99,
    };
  });

  // Curated entries GitHub didn't return — renamed, deleted, made private, or
  // the API is simply down. They still render; the live badges just stay empty.
  const orphans = curated
    .filter((p) => !usedCurated.has(p.slug))
    .map((p) => ({
      ...p,
      image: getAsset(p.image),
      githubUrl: p.repo ? `https://github.com/${p.repo}` : null,
      demoUrl: p.demoUrl || null,
      stars: null,
      language: null,
      pushedAt: null,
      tags: dedupeTags(p.tags ?? []),
      featured: false,
      live: false,
      orphaned: Boolean(p.repo) && repos.length > 0,
      order: p.order ?? 99,
    }));

  const cards = [...fromGitHub, ...orphans];

  // An explicit `portfolio-featured` topic pins a repo to the front; everything
  // else is most-recently-pushed first. Dateless cards (orphans) sink to the
  // bottom on their curated `order` — a stale entry shouldn't outrank real work.
  cards.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const at = a.pushedAt ? Date.parse(a.pushedAt) : NaN;
    const bt = b.pushedAt ? Date.parse(b.pushedAt) : NaN;
    if (Number.isNaN(at) && Number.isNaN(bt)) return a.order - b.order;
    if (Number.isNaN(at)) return 1;
    if (Number.isNaN(bt)) return -1;
    return bt - at;
  });

  // Badge the freshest card, but only when GitHub actually told us which it is.
  if (cards[0]?.pushedAt) cards[0].latest = true;

  return cards;
}
