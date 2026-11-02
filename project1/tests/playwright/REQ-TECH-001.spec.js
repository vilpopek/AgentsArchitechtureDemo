// Covers: REQ-TECH-001
import { test, expect } from "./fixtures.js";

const ASSETS = ["forest.svg", "mountain.svg", "river.svg", "flowerfield.svg", "beach.svg", "starrysky.svg"];

test.describe("REQ-TECH-001: six distinct, locally-bundled images", () => {
  test("AC9: the image pool contains exactly six distinct images", async ({ request }) => {
    const res = await request.get("/src/images.js");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    const ids = [...body.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  test("AC10: every pool image is served locally with no network dependency", async ({ request }) => {
    for (const file of ASSETS) {
      const res = await request.get(`/src/assets/${file}`);
      expect(res.ok()).toBeTruthy();
      expect(res.headers()["content-type"]).toContain("image/svg+xml");
    }
  });
});
