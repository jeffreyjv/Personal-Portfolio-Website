#!/usr/bin/env node
/**
 * Regenerate src/data/skills.json and src/data/experience.json from an official
 * LinkedIn data export.
 *
 *   npm run sync:linkedin -- ~/Downloads/Basic_LinkedInDataExport_2026-07-27
 *   npm run sync:linkedin -- ~/Downloads/export --dry-run
 *
 * Get the export from LinkedIn → Settings & Privacy → Data privacy →
 * "Get a copy of your data" → pick Profile, Positions, Education, Skills,
 * Certifications. The small archive usually arrives by email in ~10 minutes.
 *
 * There is no live LinkedIn API for this: the official API exposes only name,
 * photo, email and locale, and scraping the site violates the User Agreement.
 * The export is the supported path.
 *
 * This script REWRITES those two JSON files, so run it on a clean git tree and
 * review with `git diff`. Hand-written descriptions on entries that already
 * exist are preserved — see mergeExperience below.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";
import {
  GROUPS,
  OVERRIDES,
  RENAMES,
  IGNORE,
  CERTIFICATIONS_GROUP,
} from "./skill-groups.js";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const DATA_DIR = join(ROOT, "src", "data");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const strict = args.includes("--strict");
const inputArg = args.find((a) => !a.startsWith("--")) ?? "./linkedin-export";
const inputDir = resolve(process.cwd(), inputArg);

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

// ---------------------------------------------------------------- file lookup

/** Export archives vary in casing, so match case-insensitively. */
function findCsv(dir, name) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return null;
  const target = name.toLowerCase();
  const hit = readdirSync(dir).find((f) => f.toLowerCase() === target);
  return hit ? join(dir, hit) : null;
}

function parseCsv(dir, name) {
  const path = findCsv(dir, name);
  if (!path) return null; // absent is fine — caller keeps existing data
  const text = readFileSync(path, "utf8");
  // Descriptions contain commas, quotes and newlines; a hand-rolled split
  // corrupts them, so always go through a real CSV parser.
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });
  // Skills.csv is a single column, so there's genuinely no delimiter to detect.
  const real = errors.filter((e) => e.code !== "UndetectableDelimiter");
  if (real.length) {
    console.warn(c.yellow(`  ! ${name}: ${real.length} parse warning(s), continuing`));
    for (const e of real.slice(0, 3)) console.warn(c.dim(`      ${e.message}`));
  }
  return data;
}

const field = (row, ...names) => {
  for (const n of names) {
    const key = Object.keys(row).find((k) => k.trim().toLowerCase() === n.toLowerCase());
    if (key && row[key]?.trim()) return row[key].trim();
  }
  return null;
};

// -------------------------------------------------------------------- helpers

const slug = (s) =>
  (s ?? "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const MONTHS = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/** "Jun 2022" → "2022-06"; "2022" → "2022"; "" → null. */
function parseLinkedInDate(value) {
  if (!value) return null;
  const text = value.trim();
  const withMonth = text.match(/^([A-Za-z]{3})[a-z]*\s+(\d{4})$/);
  if (withMonth) {
    const m = MONTHS[withMonth[1].toLowerCase()];
    return m ? `${withMonth[2]}-${m}` : withMonth[2];
  }
  const yearOnly = text.match(/^(\d{4})$/);
  return yearOnly ? yearOnly[1] : null;
}

/** First sentence, capped — LinkedIn descriptions are long bullet dumps. */
function condense(text) {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  const firstSentence = flat.match(/^(.{20,200}?[.!?])(\s|$)/);
  const out = firstSentence ? firstSentence[1] : flat;
  return out.length > 160 ? `${out.slice(0, 157).trimEnd()}…` : out;
}

const readJson = (name) => JSON.parse(readFileSync(join(DATA_DIR, name), "utf8"));

function writeJson(name, value) {
  const path = join(DATA_DIR, name);
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (dryRun) {
    console.log(c.dim(`  (dry run) would write ${path}`));
    return;
  }
  writeFileSync(path, text);
}

// --------------------------------------------------------------------- skills

function categorize(rawName) {
  const name = RENAMES[rawName] ?? rawName;
  if (IGNORE.some((re) => re.test(rawName) || re.test(name))) return { name, group: null };
  const override = OVERRIDES[rawName];
  if (override) return { name, group: override };
  for (const g of GROUPS) {
    if (g.match.some((re) => re.test(rawName) || re.test(name))) {
      return { name, group: g.id };
    }
  }
  return { name, group: undefined }; // undefined = uncategorized (vs null = ignored)
}

function buildSkills(skillRows, certRows, existing) {
  const buckets = Object.fromEntries(GROUPS.map((g) => [g.id, []]));
  const uncategorized = [];

  if (skillRows) {
    for (const row of skillRows) {
      const raw = field(row, "Name", "Skill");
      if (!raw) continue;
      const { name, group } = categorize(raw);
      if (group === null) continue; // deliberately ignored
      if (group === undefined) {
        if (!uncategorized.includes(name)) uncategorized.push(name);
        continue;
      }
      if (!buckets[group].includes(name)) buckets[group].push(name);
    }
  } else {
    // No Skills.csv — keep whatever is already on the site.
    for (const g of existing.groups) {
      if (buckets[g.id]) buckets[g.id] = [...g.items];
    }
    console.log(c.yellow("  ! Skills.csv not found — keeping existing skill groups"));
  }

  let certs;
  if (certRows) {
    certs = [];
    for (const row of certRows) {
      const name = field(row, "Name", "Certification");
      if (name && !certs.includes(name)) certs.push(name);
    }
  } else {
    certs = existing.groups.find((g) => g.id === CERTIFICATIONS_GROUP.id)?.items ?? [];
    console.log(
      c.yellow("  ! Certifications.csv not found — keeping existing certifications")
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    source: "linkedin-export",
    groups: [
      ...GROUPS.map((g) => ({ id: g.id, label: g.label, items: buckets[g.id] })),
      { ...CERTIFICATIONS_GROUP, items: certs },
    ],
    uncategorized,
  };
}

// ----------------------------------------------------------------- experience

function buildExperience(positionRows, educationRows, existing) {
  const previous = new Map(existing.items.map((i) => [i.id, i]));

  // A company we already have a logo for keeps it — a second role at the same
  // employer shouldn't lose its icon.
  const logoByCompany = new Map();
  for (const item of existing.items) {
    if (item.logo && item.company) {
      logoByCompany.set(item.company.trim().toLowerCase(), item.logo);
    }
  }

  const needsEditing = [];
  const missingLogos = new Set();

  const build = (row, kind) => {
    const role =
      kind === "work"
        ? field(row, "Title", "Position")
        : field(row, "Degree Name", "Degree");
    const company =
      kind === "work" ? field(row, "Company Name", "Company") : field(row, "School Name");
    if (!role || !company) return null;

    const id = `${slug(company)}-${slug(role)}`;
    const prior = previous.get(id);

    const startDate = parseLinkedInDate(field(row, "Started On", "Start Date"));
    const endDate = parseLinkedInDate(field(row, "Finished On", "End Date"));
    const current = kind === "work" && !endDate && Boolean(startDate);

    // Preserve hand-written copy. Without this every sync would clobber the
    // tight one-liners on the site with LinkedIn's bullet dumps.
    let description = prior?.description;
    if (!description) {
      description = condense(field(row, "Description", "Notes", "Activities") ?? "");
      if (description) needsEditing.push(id);
    }

    const logo = prior?.logo ?? logoByCompany.get(company.trim().toLowerCase()) ?? null;
    if (!logo) missingLogos.add(company);

    return {
      id,
      kind,
      role,
      company,
      location: field(row, "Location") ?? prior?.location ?? null,
      startDate: startDate ?? prior?.startDate ?? null,
      endDate: endDate ?? prior?.endDate ?? null,
      current,
      description,
      logo,
    };
  };

  const items = [
    ...(positionRows ?? []).map((r) => build(r, "work")),
    ...(educationRows ?? []).map((r) => build(r, "education")),
  ].filter(Boolean);

  if (!positionRows) console.log(c.yellow("  ! Positions.csv not found"));
  if (!educationRows) console.log(c.yellow("  ! Education.csv not found"));

  if (!items.length) {
    console.log(c.yellow("  ! No positions or education parsed — keeping existing"));
    return { data: existing, needsEditing, missingLogos };
  }

  // Current roles first, then newest start date. Undated entries sink to the
  // bottom of their group rather than jumping to the top.
  items.sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1;
    return String(b.startDate ?? "").localeCompare(String(a.startDate ?? ""));
  });

  return {
    data: {
      generatedAt: new Date().toISOString(),
      source: "linkedin-export",
      items,
    },
    needsEditing,
    missingLogos,
  };
}

// ------------------------------------------------------------------- main

function main() {
  console.log(c.bold("\nLinkedIn → portfolio sync"));
  console.log(c.dim(`  source: ${inputDir}`));
  if (dryRun) console.log(c.yellow("  DRY RUN — no files will be written"));
  console.log();

  if (!existsSync(inputDir)) {
    console.error(c.red(`✖ Export directory not found: ${inputDir}`));
    console.error(
      c.dim(
        "\n  Download it from LinkedIn → Settings & Privacy → Data privacy →\n" +
          '  "Get a copy of your data" (Profile, Positions, Education, Skills,\n' +
          "  Certifications), unzip it, then pass the folder path:\n\n" +
          "    npm run sync:linkedin -- ~/Downloads/Basic_LinkedInDataExport_…\n"
      )
    );
    process.exit(1);
  }

  const skillRows = parseCsv(inputDir, "Skills.csv");
  const certRows = parseCsv(inputDir, "Certifications.csv");
  const positionRows = parseCsv(inputDir, "Positions.csv");
  const educationRows = parseCsv(inputDir, "Education.csv");

  if (!skillRows && !certRows && !positionRows && !educationRows) {
    console.error(c.red(`✖ No recognizable LinkedIn CSVs in ${inputDir}`));
    console.error(c.dim(`  Found: ${readdirSync(inputDir).join(", ") || "(empty)"}`));
    process.exit(1);
  }

  const skills = buildSkills(skillRows, certRows, readJson("skills.json"));
  const { data: experience, needsEditing, missingLogos } = buildExperience(
    positionRows,
    educationRows,
    readJson("experience.json")
  );

  writeJson("skills.json", skills);
  writeJson("experience.json", experience);

  // ---- report
  console.log(
    c.green("✔ skills.json      ") +
      skills.groups.map((g) => `${g.label} ${g.items.length}`).join(c.dim(" · "))
  );
  console.log(c.green("✔ experience.json  ") + `${experience.items.length} entries`);

  if (skills.uncategorized.length) {
    console.log(
      c.yellow(`\n⚠ ${skills.uncategorized.length} skill(s) uncategorized `) +
        c.dim("(add a pattern or an IGNORE entry in scripts/skill-groups.js)")
    );
    for (const s of skills.uncategorized) console.log(`    · ${s}`);
    console.log(c.dim("  They're saved under \"uncategorized\" so nothing is lost."));
  }

  if (needsEditing.length) {
    console.log(
      c.yellow(`\n⚠ ${needsEditing.length} description(s) taken from LinkedIn `) +
        c.dim("(needs editing — they read like résumé bullets)")
    );
    for (const id of needsEditing) console.log(`    · ${id}`);
  }

  if (missingLogos.size) {
    console.log(c.yellow(`\n⚠ No logo for ${missingLogos.size} employer(s)`));
    for (const company of missingLogos) {
      console.log(
        `    · ${company} ` +
          c.dim(`→ drop ${slug(company)}.png in public/ and set "logo" in experience.json`)
      );
    }
    console.log(c.dim("  Until then the site renders an initials tile."));
  }

  console.log(c.dim("\n  Review with: git diff src/data/\n"));

  if (strict && skills.uncategorized.length) process.exit(2);
}

main();
