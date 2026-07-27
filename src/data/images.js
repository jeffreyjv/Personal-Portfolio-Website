/**
 * ESM image imports can't live in JSON, and a hand-maintained filename→import
 * map means editing code every time a screenshot is added. This builds the map
 * from the assets directory at build time instead.
 */
const files = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
});

export const assetByName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop(), url])
);

/** Unknown or missing filename → null, so the caller can render a placeholder. */
export const getAsset = (name) => (name ? assetByName[name] ?? null : null);
