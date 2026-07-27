/**
 * Vercel serverless function: public repo metadata for the Projects section.
 *
 * Written against the raw Node response API (statusCode/setHeader/end) rather
 * than Vercel's res.status().json() sugar, so the exact same handler can run
 * unmodified inside the Vite dev middleware (see vite.config.js).
 */

const USER = "jeffreyjv";
const UPSTREAM = `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed&type=owner`;

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
