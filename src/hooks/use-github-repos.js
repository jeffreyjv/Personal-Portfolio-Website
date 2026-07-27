import { useEffect, useState } from "react";

const CACHE_KEY = "gh:repos:v1";
const TTL = 5 * 60 * 1000;

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (Date.now() - at > TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // private mode / quota — caching is an optimization, not a requirement
  }
}

/**
 * Live repo metadata from /api/github.
 *
 * Returns { status: "loading" | "ready" | "error", repos, fetchedAt }. Callers
 * must treat an empty `repos` array as normal — the Projects section renders
 * entirely from local JSON and only uses this to decorate.
 *
 * The sessionStorage cache also absorbs React 19 StrictMode's double-effect in dev.
 */
export function useGitHubRepos() {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return cached
      ? { status: "ready", repos: cached.repos, fetchedAt: cached.fetchedAt }
      : { status: "loading", repos: [], fetchedAt: null };
  });

  useEffect(() => {
    if (state.status === "ready") return;

    const ac = new AbortController();

    fetch("/api/github", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        writeCache(data);
        setState({ status: "ready", repos: data.repos ?? [], fetchedAt: data.fetchedAt });
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setState({ status: "error", repos: [], fetchedAt: null });
      });

    return () => ac.abort();
    // Intentionally mount-only: refetching is handled by the cache TTL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
