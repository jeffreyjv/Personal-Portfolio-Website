/**
 * GitHub topics are lowercase-and-hyphenated. Map the ones we care about to the
 * display casing the site already uses; anything unknown gets Title Cased.
 * Topics beginning with `portfolio-` are control flags (e.g. portfolio-featured),
 * not tags, so they never render.
 */
const DISPLAY = {
  react: "React",
  reactjs: "React",
  vue: "Vue",
  vuejs: "Vue",
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML / CSS",
  css: "HTML / CSS",
  tailwind: "Tailwind",
  tailwindcss: "Tailwind",
  vite: "Vite",
  nodejs: "Node.js",
  node: "Node.js",
  python: "Python",
  fastapi: "FastAPI",
  flask: "Flask",
  graphql: "GraphQL",
  firebase: "Firebase",
  docker: "Docker",
  kubernetes: "Kubernetes",
  terraform: "Terraform",
  aws: "AWS",
  azure: "Azure",
  gitlab: "GitLab",
  "ci-cd": "CI/CD",
  cicd: "CI/CD",
  devops: "DevOps",
  devsecops: "DevSecOps",
  api: "APIs",
  apis: "APIs",
  "discord-bot": "Discord Bot",
  discord: "Discord.py",
};

const titleCase = (s) =>
  s
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

export const isControlTopic = (topic) => topic.startsWith("portfolio-");

export function normalizeTopics(topics = []) {
  return topics
    .filter((t) => !isControlTopic(t))
    .map((t) => DISPLAY[t] ?? titleCase(t));
}

/** Case-insensitive de-dupe that keeps the first spelling seen. */
export function dedupeTags(tags = []) {
  const seen = new Map();
  for (const tag of tags) {
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (!seen.has(key)) seen.set(key, tag);
  }
  return [...seen.values()];
}
