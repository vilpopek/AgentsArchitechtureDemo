// Covers: REQ-TECH-001, REQ-UX-001, REQ-FUNC-002, REQ-FUNC-004, REQ-UX-002, REQ-FUNC-006 (smoke subset)
//
// SCOPE NOTE: per human decision, this flat suite replaces the previous full
// per-requirement suite as the suite that is actually executed. The old
// REQ-*.spec.js files remain on disk (left untouched) but are intentionally
// excluded from playwright.config.js's testMatch, so only these few smoke
// tests run going forward. See fixtures.js for the reused coverage fixture
// and canvas-introspection helpers.
import { test, expect, scanGameCanvas, waitForGameOver } from "./fixtures.js";

test.describe("Smoke: core game loads and responds", () => {
  test(
    "SMOKE AC1: page loads, canvas has a 2D context, HUD score is visible and starts at 0",
    { tag: ["@REQ-TECH-001", "@REQ-UX-001", "@REQ-FUNC-006", "@smoke"] },
    async ({ page }) => {
      await page.goto("/");

      const canvas = page.locator("#game-canvas");
      await expect(canvas).toBeAttached();

      const has2dContext = await page.evaluate(() => {
        const el = document.getElementById("game-canvas");
        return !!(el && el.getContext && el.getContext("2d"));
      });
      expect(has2dContext).toBe(true);

      const hud = page.locator("#hud-score-value");
      await expect(hud).toBeVisible();
      await expect(hud).toHaveText("0");

      // Regression guard: the "Peli loppu" overlay must not be visible before
      // any collision (its [hidden] attribute must actually hide it).
      await expect(page.locator("#game-over-overlay")).toBeHidden();
    }
  );

  test(
    "SMOKE AC2: pressing ArrowUp/ArrowDown changes the ship's rendered vertical position",
    { tag: ["@REQ-FUNC-002", "@smoke"] },
    async ({ page }) => {
      await page.goto("/");

      const before = await scanGameCanvas(page);
      expect(before.shipBounds).not.toBeNull();

      await page.keyboard.down("ArrowDown");
      await page.waitForTimeout(300);
      await page.keyboard.up("ArrowDown");

      const after = await scanGameCanvas(page);
      expect(after.shipBounds).not.toBeNull();
      expect(after.shipBounds.minY).toBeGreaterThan(before.shipBounds.minY);
    }
  );

  test(
    "SMOKE AC3: a collision ends the game and shows the game-over overlay with score",
    { tag: ["@REQ-FUNC-004", "@REQ-UX-002", "@REQ-FUNC-006", "@smoke"] },
    async ({ page }) => {
      await page.goto("/");

      // No dodging — a stationary ship will collide with a randomly spawned
      // obstacle within this generous bounded window (same reasoning used by
      // the retained REQ-FUNC-002/004 suites for their waitForGameOver calls).
      await waitForGameOver(page, { timeoutMs: 45000 });

      await expect(page.locator("#game-over-overlay")).toBeVisible();
      await expect(page.locator("#game-over-text")).toHaveText("Peli loppu");

      const scoreText = await page.locator("#game-over-score-value").innerText();
      expect(scoreText.trim()).toMatch(/^\d+$/);
    }
  );
});
