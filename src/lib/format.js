const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2024-01" → "Jan 2024"; "2018" → "2018". */
function formatPart(value) {
  if (!value) return null;
  const [year, month] = String(value).split("-");
  if (!month) return year;
  const idx = Number(month) - 1;
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : year;
}

/**
 * "Jan 2024 — Present" / "Aug 2018 — May 2022".
 * Returns null when there's no start date, so callers render nothing rather
 * than a half-empty range.
 */
export function formatRange(startDate, endDate, current = false) {
  const start = formatPart(startDate);
  if (!start) return null;
  const end = current ? "Present" : formatPart(endDate);
  return end ? `${start} — ${end}` : start;
}

/** Initials for the placeholder tiles used when an image or logo is missing. */
export function initials(text = "") {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* Segments that should read as acronyms rather than Title Case, so a repo slug
   like "pain-point-ai-backend" doesn't render as "Pain Point Ai Backend". */
const ACRONYMS = new Set([
  "ai", "api", "aws", "cd", "cfa", "ci", "cli", "css", "db", "html",
  "id", "ios", "js", "ml", "os", "sql", "ui", "ux",
]);

/** "pain-point-ai-backend" → "Pain Point AI Backend". Used as the display title
 *  for GitHub repos that have no curated entry in projects.json. */
export function humanizeRepoName(name = "") {
  return name
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((w) =>
      ACRONYMS.has(w.toLowerCase())
        ? w.toUpperCase()
        : w[0].toUpperCase() + w.slice(1)
    )
    .join(" ");
}

/** "2026-05-14T…" → "May 2026", for the GitHub "updated" badge. */
export function formatMonthYear(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
