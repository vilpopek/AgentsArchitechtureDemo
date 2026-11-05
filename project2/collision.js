// Covers: REQ-FUNC-004 v2 (core-gameplay.spec.md)
// Axis-aligned bounding-box (AABB) collision detection. Strict-overlap test:
// rectangles whose edges merely touch (zero-area overlap) do NOT count as a
// collision (AC22).

import { getObstacleRects } from "./obstacles.js";

/**
 * Strict AABB overlap test. Returns false for edge-touching rectangles.
 */
export function aabbIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Returns true if the ship's rectangle overlaps any active obstacle's
 * topRect or bottomRect (AC21, AC24). Evaluates every active obstacle each
 * frame (not just the nearest one).
 */
export function checkCollision(ship, obstacles) {
  const shipRect = { x: ship.x, y: ship.y, width: ship.width, height: ship.height };

  for (const obstacle of obstacles) {
    const { topRect, bottomRect } = getObstacleRects(obstacle);
    if (aabbIntersect(shipRect, topRect) || aabbIntersect(shipRect, bottomRect)) {
      return true;
    }
  }

  return false;
}
