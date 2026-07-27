/**
 * Vercel serverless function: public repo metadata for the Projects section.
 *
 * Written against the raw Node response API (statusCode/setHeader/end) rather
 * than Vercel's res.status().json() sugar, so the exact same handler can run
 * unmodified inside the Vite dev middleware (see vite.config.js).
 */

const USER = "jeffreyjv";
const UPSTREAM = `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed&type=owner`;

/**
 * Card covers are owned by each repo, not by this codebase: drop an image at
 * one of these paths and the site picks it up on the next cache refresh. First
 * match wins, so png is the documented default and the rest are conveniences.
 *
 * The `HEAD` ref resolves to whatever the repo's default branch is, so this
 * works for main/master/trunk without asking the API for `default_branch`.
 *
 * raw.githubusercontent.com is a plain CDN — these probes do NOT count against
 * the API rate limit, and all repos are probed concurrently (~130ms total).
 */
const COVER_PATHS = [".github/preview.png", ".github/preview.webp", ".github/preview.jpg"];

/** Whole-phase budget. Covers are a nice-to-have; never let them slow the
 *  response down or fail it. On timeout every repo simply reports no cover. */
const COVER_BUDGET_MS = 4000;

const rawUrl = (fullName, path) =>
  `https://raw.githubusercontent.com/${fullName}/HEAD/${path}`;

async function findCover(fullName) {
  for (const path of COVER_PATHS) {
    const url = rawUrl(fullName, path);
    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return url;
    } catch {
      // Network blip or timeout on one candidate — try the next.
    }
  }
  return null;
}

async function findCovers(repos) {
  const fallback = repos.map(() => null);
  try {
    return await Promise.race([
      Promise.all(repos.map((r) => findCover(r.fullName))),
      new Promise((resolve) => setTimeout(() => resolve(fallback), COVER_BUDGET_MS)),
    ]);
  } catch {
    return fallback;
  }
}

function send(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

const pick = (r) => ({
  id: r.id,
  name: r.name,
  fullName: r.full_name,
  url: r.html_url,
  description: r.description,
  homepage: r.homepage || null,
  language: r.language,
  stars: r.stargazers_count,
  forks: r.forks_count,
  topics: r.topics ?? [],
  pushedAt: r.pushed_at,
  archived: r.archived,
  // Filled in by findCovers() below, once we know which repos ship one.
  coverUrl: null,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { error: "method_not_allowed" }, "no-store");
  }

  const token = process.env.GITHUB_TOKEN;

  try {
    const upstream = await fetch(UPSTREAM, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "jeffreyjv-portfolio",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!upstream.ok) {
      // Short cache on failure so a transient blip doesn't stick at the edge.
      return send(
        res,
        502,
        {
          error: "github_upstream",
          status: upstream.status,
          rateLimitRemaining: upstream.headers.get("x-ratelimit-remaining"),
        },
        "public, s-maxage=60"
      );
    }

    const raw = await upstream.json();
    const repos = raw.filter((r) => !r.fork && !r.private).map(pick);

    const covers = await findCovers(repos);
    repos.forEach((r, i) => {
      r.coverUrl = covers[i];
    });

    // s-maxage: the CDN serves from edge for an hour, so GitHub sees ~1 req/hr
    // per region. stale-while-revalidate: for a day past expiry visitors get an
    // instant stale response while the function refreshes behind them, so a
    // GitHub outage is invisible and nobody ever waits on the upstream call.
    return send(
      res,
      200,
      { fetchedAt: new Date().toISOString(), user: USER, repos },
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  } catch {
    return send(res, 502, { error: "github_unreachable" }, "public, s-maxage=30");
  }
}
