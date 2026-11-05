// Covers: REQ-FUNC-002 v2 (core-gameplay.spec.md)
// Ship entity: fixed x at ~25% of canvas width, vertical movement via
// ArrowUp/ArrowDown at a constant speed, clamped to the play area, zero net
// velocity when both keys are held, stops responding once the game is over
// (enforced by the caller not invoking updateShip() after game-over — see game.js).

export const SHIP_X_RATIO = 0.25;
export const SHIP_WIDTH = 40;
export const SHIP_HEIGHT = 30;
export const SHIP_SPEED_PX_PER_SEC = 240;

/**
 * Creates a fresh ship entity, centered vertically, with its x fixed at
 * SHIP_X_RATIO of the play-area width (AC9).
 */
export function createShip(canvasWidth, canvasHeight) {
  const x = Math.round(canvasWidth * SHIP_X_RATIO);
  const y = Math.round((canvasHeight - SHIP_HEIGHT) / 2);
  return { x, y, width: SHIP_WIDTH, height: SHIP_HEIGHT, vy: 0 };
}

/**
 * Enforces AC13: the ship's y position is clamped to [0, playAreaHeight - shipHeight].
 */
export function clampShipY(y, shipHeight, playAreaHeight) {
  const maxY = playAreaHeight - shipHeight;
  if (y < 0) return 0;
  if (y > maxY) return maxY;
  return y;
}

/**
 * Advances the ship's vertical position for one frame based on currently
 * held keys. Net velocity is zero when both up and down are held (AC12),
 * and constant speed with no inertia when only one key is held (AC10/AC11).
 */
export function updateShip(ship, dtMs, input, playAreaHeight) {
  let vy = 0;
  if (input.up) vy -= SHIP_SPEED_PX_PER_SEC;
  if (input.down) vy += SHIP_SPEED_PX_PER_SEC;

  ship.vy = vy;
  const dtSec = dtMs / 1000;
  const nextY = ship.y + vy * dtSec;
  ship.y = clampShipY(nextY, ship.height, playAreaHeight);
  return ship;
}
