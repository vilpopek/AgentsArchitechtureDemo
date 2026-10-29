// Covers: REQ-TECH-001
// Six original, locally-bundled SVG illustrations — copyright-free, no network dependency.
// Resolved relative to this module's own URL, so the path is correct regardless of the page's location.
const assetUrl = (file) => new URL(`./assets/${file}`, import.meta.url).href;

export const IMAGES = [
  { id: "forest", name: "Metsä", src: assetUrl("forest.svg") },
  { id: "mountain", name: "Vuoristo", src: assetUrl("mountain.svg") },
  { id: "river", name: "Joki", src: assetUrl("river.svg") },
  { id: "flowerfield", name: "Kukkaniitty", src: assetUrl("flowerfield.svg") },
  { id: "beach", name: "Ranta", src: assetUrl("beach.svg") },
  { id: "starrysky", name: "Tähtitaivas", src: assetUrl("starrysky.svg") },
];
