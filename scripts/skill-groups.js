/**
 * How LinkedIn skill names map onto the site's skill groups.
 *
 * This file is meant to be edited. When `npm run sync:linkedin` reports an
 * uncategorized skill, either add a pattern below or add it to IGNORE.
 *
 * Resolution order: IGNORE → OVERRIDES → first GROUPS match → uncategorized.
 * Certifications never come through here — they're read from Certifications.csv
 * straight into the fixed fourth group.
 */

export const GROUPS = [
  {
    id: "frontend",
    label: "Frontend",
    match: [
      /^react/i, /vue/i, /^html/i, /^css/i, /javascript/i, /typescript/i,
      /tailwind/i, /next\.?js/i, /svelte/i, /front[- ]?end/i, /web design/i,
    ],
  },
  {
    id: "backend",
    label: "Backend",
    match: [
      /fastapi/i, /flask/i, /django/i, /graphql/i, /^python/i, /node/i,
      /^java$/i, /sql/i, /postgres/i, /mongo/i, /rest/i, /^api/i,
      /back[- ]?end/i, /microservice/i,
    ],
  },
  {
    id: "tools",
    label: "Tools & DevOps",
    match: [
      /git(hub|lab)?/i, /docker/i, /kubernetes/i, /terraform/i, /ansible/i,
      /aws/i, /amazon web services/i, /azure/i, /gcp/i, /google cloud/i,
      /ci\/?cd/i, /jenkins/i, /vs ?code/i, /linux/i, /bash/i, /shell/i,
      /devops/i, /devsecops/i, /splunk/i, /datadog/i, /grafana/i,
    ],
  },
];

/** Exact LinkedIn names that beat the regexes above. */
export const OVERRIDES = {
  "Amazon Web Services (AWS)": "tools",
  "Cascading Style Sheets (CSS)": "frontend",
  "HTML5": "frontend",
};

/** Display renames — LinkedIn's official names are often verbose. */
export const RENAMES = {
  "Amazon Web Services (AWS)": "AWS",
  "Cascading Style Sheets (CSS)": "HTML / CSS",
  "HyperText Markup Language (HTML)": "HTML / CSS",
  "Microsoft Azure": "Azure",
  "Visual Studio Code": "VS Code",
};

/** Soft skills — this is a technical portfolio, they'd only dilute the list. */
export const IGNORE = [
  /^teamwork$/i, /^communication$/i, /^leadership$/i, /^problem solving$/i,
  /^time management$/i, /^public speaking$/i, /^customer service$/i,
  /^microsoft office$/i, /^powerpoint$/i, /^microsoft word$/i, /^microsoft excel$/i,
];

export const CERTIFICATIONS_GROUP = { id: "certifications", label: "Certifications" };
