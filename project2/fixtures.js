// Shared Playwright fixture + test helpers for the flat project2 test suite.
// Mirrors project1's tests/playwright/fixtures.js coverage-collection pattern,
// adapted for the flat (no src/ subfolder) layout, plus a handful of
// canvas-introspection helpers shared across REQ-*.spec.js files so each test
// can assert on *observable, rendered* game state (DOM text, canvas pixels)
// without depending on internal module implementation details.
//
// The pixel colors below were read directly from the shipped render.js output
// (what the browser actually paints) so that pixel-based assertions track
// reality; they are used only to *locate* on-screen entities (ship / rock
// obstacles / background) for black-box assertions already mandated by the
// specs (pixel-art rendering, obstacle presence, ship position/movement,
// gap size, scroll speed) — not to re-implement or second-guess any game logic.
import { test as base, expect } from "@playwright/test";
import { addCoverageReport } from "monocart-reporter";

export const test = base.extend({
  autoTestFixture: [
    async ({ page }, use, testInfo) => {
      const isChromium = testInfo.project.name === "chromium";
      if (isChromium) {
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }
      await use();
      if (isChromium) {
        const coverage = await page.coverage.stopJSCoverage();
        if (coverage.length) {
          await addCoverageReport(coverage, testInfo);
        }
      }
    },
    { scope: "test", auto: true },
  ],
});

export { expect };

// ---------------------------------------------------------------------------
// Constants confirmed directly from the shipped implementation (given as
// ground truth, not reverse-engineered from logic) — used only for sizing
// bounded waits/tolerances, never to assert internal behavior directly.
// ---------------------------------------------------------------------------
export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 450,
  SHIP_X: 200,
  SHIP_WIDTH: 40,
  SHIP_HEIGHT: 30,
  SHIP_SPEED_PX_PER_SEC: 240,
  SCROLL_SPEED_PX_PER_SEC: 160,
  OBSTACLE_WIDTH: 60,
  OBSTACLE_MIN_GAP_HEIGHT: 150,
  OBSTACLE_SPAWN_MIN_MS: 1200,
  OBSTACLE_SPAWN_MAX_MS: 2200,
  SCORE_PER_OBSTACLE: 10,
};

const BACKGROUND_RGB = [5, 7, 15];
const STAR_RGB = [42, 54, 96];
const ROCK_COLORS = [
  [107, 88, 72], // base rock fill
  [77, 63, 44], // rock shading
  [133, 114, 88], // rock highlight
];
const SHIP_COLORS = [
  [199, 205, 214], // hull
  [141, 148, 160], // nose
  [63, 125, 209], // cockpit/fins
  [255, 138, 61], // engine flame
];

/** Waits (bounded, generously) for the game-over overlay to become visible. */
export async function waitForGameOver(page, { timeoutMs = 45000 } = {}) {
  await expect(page.locator("#game-over-overlay")).toBeVisible({ timeout: timeoutMs });
}

/** Full canvas snapshot as a data URL — useful for "is the canvas frozen?" checks. */
export async function getCanvasDataURL(page) {
  return page.evaluate(() => document.getElementById("game-canvas").toDataURL());
}

/**
 * Single-pass canvas scan: locates the ship's pixel bounding box (by its
 * known flat-color palette) and the leftmost/rightmost x of any rock-colored
 * (obstacle) pixel on screen, plus a total rock pixel count. One getImageData
 * call + one loop, reused by many specs instead of each re-scanning the canvas.
 */
export async function scanGameCanvas(page) {
  return page.evaluate(
    ({ rock, ship }) => {
      const canvas = document.getElementById("game-canvas");
      const ctx = canvas.getContext("2d");
      const { width, height } = canvas;
      const data = ctx.getImageData(0, 0, width, height).data;

      const close = (r, g, b, c, tol) => Math.abs(r - c[0]) <= tol && Math.abs(g - c[1]) <= tol && Math.abs(b - c[2]) <= tol;
      const matchesAny = (r, g, b, list, tol) => list.some((c) => close(r, g, b, c, tol));

      let rockMinX = Infinity;
      let rockMaxX = -Infinity;
      let rockCount = 0;
      let shipMinX = Infinity;
      let shipMaxX = -Infinity;
      let shipMinY = Infinity;
      let shipMaxY = -Infinity;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (matchesAny(r, g, b, rock, 10)) {
            rockCount++;
            if (x < rockMinX) rockMinX = x;
            if (x > rockMaxX) rockMaxX = x;
          } else if (matchesAny(r, g, b, ship, 6)) {
            if (x < shipMinX) shipMinX = x;
            if (x > shipMaxX) shipMaxX = x;
            if (y < shipMinY) shipMinY = y;
            if (y > shipMaxY) shipMaxY = y;
          }
        }
      }

      return {
        rockMinX: Number.isFinite(rockMinX) ? rockMinX : null,
        rockMaxX: Number.isFinite(rockMaxX) ? rockMaxX : null,
        rockCount,
        shipBounds: Number.isFinite(shipMinX)
          ? { minX: shipMinX, maxX: shipMaxX, minY: shipMinY, maxY: shipMaxY }
          : null,
      };
    },
    { rock: ROCK_COLORS, ship: SHIP_COLORS }
  );
}

/**
 * Scans a single canvas column for the largest contiguous non-rock vertical
 * run ("the gap"), returning its height and vertical center, or null if the
 * column has no rock pixels at all (e.g. not currently inside any obstacle).
 */
export async function getLargestGapAtColumn(page, x) {
  return page.evaluate(
    ({ x, rock }) => {
      const canvas = document.getElementById("game-canvas");
      const ctx = canvas.getContext("2d");
      if (x < 0 || x >= canvas.width) return null;
      const data = ctx.getImageData(x, 0, 1, canvas.height).data;
      const isRock = (r, g, b) => rock.some((c) => Math.abs(r - c[0]) <= 10 && Math.abs(g - c[1]) <= 10 && Math.abs(b - c[2]) <= 10);

      let best = 0;
      let bestStart = 0;
      let current = 0;
      let currentStart = 0;
      let sawRock = false;

      for (let y = 0; y < canvas.height; y++) {
        const i = y * 4;
        const rockPixel = isRock(data[i], data[i + 1], data[i + 2]);
        if (rockPixel) sawRock = true;
        if (!rockPixel) {
          if (current === 0) currentStart = y;
          current++;
          if (current > best) {
            best = current;
            bestStart = currentStart;
          }
        } else {
          current = 0;
        }
      }

      if (!sawRock) return null;
      return { height: best, center: bestStart + best / 2 };
    },
    { x, rock: ROCK_COLORS }
  );
}

/** Stores a full-canvas pixel snapshot on `window` for later diffing. */
export async function snapshotCanvas(page) {
  await page.evaluate(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    window.__canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  });
}

/**
 * Counts pixels that changed since the last snapshotCanvas()/diffFromSnapshot()
 * call, then re-snapshots to "now" so consecutive calls measure consecutive
 * time windows. Returns null if no prior snapshot exists.
 */
export async function diffFromSnapshot(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const prev = window.__canvasSnapshot;
    if (!prev) return null;
    let diff = 0;
    for (let i = 0; i < current.length; i += 4) {
      if (Math.abs(current[i] - prev[i]) > 10 || Math.abs(current[i + 1] - prev[i + 1]) > 10 || Math.abs(current[i + 2] - prev[i + 2]) > 10) {
        diff++;
      }
    }
    window.__canvasSnapshot = current;
    return diff;
  });
}

/**
 * Performs one short "autopilot" dodge tick: looks at the nearest obstacle's
 * gap center and taps ArrowUp/ArrowDown to steer the ship toward it. Used
 * only by scoring tests (REQ-FUNC-006) that need the ship to survive multiple
 * obstacle passes to observe score increments — the dodge logic itself is not
 * under test, only the resulting score bookkeeping. Returns true if the game
 * has already (or just) ended.
 */
export async function stepAutopilot(page, { tapMs = 90 } = {}) {
  if (await page.locator("#game-over-overlay").isVisible()) return true;

  const scan = await scanGameCanvas(page);
  if (!scan.shipBounds) {
    await page.waitForTimeout(tapMs);
    return page.locator("#game-over-overlay").isVisible();
  }

  const shipCenterY = (scan.shipBounds.minY + scan.shipBounds.maxY) / 2;
  let targetY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
  if (scan.rockMinX !== null) {
    const gap = await getLargestGapAtColumn(page, Math.min(scan.rockMinX + 5, GAME_CONSTANTS.CANVAS_WIDTH - 1));
    if (gap) targetY = gap.center;
  }

  if (shipCenterY < targetY - 20) {
    await page.keyboard.down("ArrowDown");
    await page.waitForTimeout(tapMs);
    await page.keyboard.up("ArrowDown");
  } else if (shipCenterY > targetY + 20) {
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(tapMs);
    await page.keyboard.up("ArrowUp");
  } else {
    await page.waitForTimeout(tapMs);
  }

  return page.locator("#game-over-overlay").isVisible();
}

export const COLORS = { BACKGROUND_RGB, STAR_RGB, ROCK_COLORS, SHIP_COLORS };
