// Covers: REQ-FUNC-003 v2 (core-gameplay.spec.md)
// Obstacle spawning/movement: randomized spawn interval within fixed min/max
// bounds, movement at the same speed as the background scroll, an
// always-passable gap (gapHeight >= SHIP_HEIGHT + safety margin), and removal
// once fully off-screen to the left. No difficulty progression (AC18).

import { CANVAS_HEIGHT } from "./render.js";
import { SHIP_HEIGHT } from "./ship.js";

export const OBSTACLE_WIDTH = 60;
const GAP_SAFETY_MARGIN = 120;
export const OBSTACLE_MIN_GAP_HEIGHT = SHIP_HEIGHT + GAP_SAFETY_MARGIN; // 150
export const OBSTACLE_SPAWN_MIN_MS = 1200;
export const OBSTACLE_SPAWN_MAX_MS = 2200;
export const SCROLL_SPEED_PX_PER_SEC = 160;

let nextObstacleId = 0;

/**
 * Produces a new obstacle at x = playAreaWidth with a randomized gapY such
 * that the gap stays fully within [0, playAreaHeight] and gapHeight is
 * always >= OBSTACLE_MIN_GAP_HEIGHT (AC17).
 */
export function spawnObstacle(playAreaWidth, playAreaHeight) {
  const gapHeight = OBSTACLE_MIN_GAP_HEIGHT;
  const maxGapY = Math.max(playAreaHeight - gapHeight, 0);
  const gapY = Math.random() * maxGapY;

  return {
    id: `obstacle-${nextObstacleId++}`,
    x: playAreaWidth,
    gapY,
    gapHeight,
    width: OBSTACLE_WIDTH,
    passed: false,
  };
}

/** Randomized spawn-interval bound per AC15 — constant bounds, random draw. */
export function getRandomSpawnDelayMs() {
  return OBSTACLE_SPAWN_MIN_MS + Math.random() * (OBSTACLE_SPAWN_MAX_MS - OBSTACLE_SPAWN_MIN_MS);
}

/**
 * Moves every obstacle leftward at SCROLL_SPEED_PX_PER_SEC (same speed as the
 * background scroll — AC16) and removes any obstacle that has fully scrolled
 * past the left edge of the play area (AC19).
 */
export function updateObstacles(obstacles, dtMs) {
  const dtSec = dtMs / 1000;
  const dx = SCROLL_SPEED_PX_PER_SEC * dtSec;

  for (const obstacle of obstacles) {
    obstacle.x -= dx;
  }

  return obstacles.filter((obstacle) => obstacle.x + obstacle.width > 0);
}

/**
 * Derives the top/bottom bounding rectangles for an obstacle's rock blocks,
 * used by collision.js (AC21).
 */
export function getObstacleRects(obstacle) {
  const topRect = { x: obstacle.x, y: 0, width: obstacle.width, height: obstacle.gapY };
  const bottomY = obstacle.gapY + obstacle.gapHeight;
  const bottomRect = {
    x: obstacle.x,
    y: bottomY,
    width: obstacle.width,
    height: CANVAS_HEIGHT - bottomY,
  };
  return { topRect, bottomRect };
}
