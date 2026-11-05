// Covers: REQ-FUNC-006 v1 (score-counter.spec.md)
// Score state and scoring rules: +10 per obstacle passed, each obstacle
// scored at most once, no-op while in "gameover" state, and DOM rendering of
// the score value for both the HUD and the game-over overlay.

export const SCORE_PER_OBSTACLE = 10;

/**
 * Returns true exactly once per obstacle: the first time its trailing edge
 * has fully passed the ship's fixed x-position and it has not already been
 * marked passed (AC3/AC4). Caller is responsible for setting
 * obstacle.passed = true and incrementing the score.
 */
export function checkObstaclePassed(ship, obstacle) {
  if (obstacle.passed) return false;
  return obstacle.x + obstacle.width < ship.x;
}

/**
 * Iterates active obstacles, applies checkObstaclePassed, and increments
 * state.score by SCORE_PER_OBSTACLE for each newly-passed obstacle. No-op
 * when state.status === "gameover" (AC7).
 *
 * Collision takes precedence over scoring in the same frame: callers must
 * run collision detection and apply any resulting "gameover" transition
 * BEFORE calling applyScoring for that frame (see game.js), so that a
 * collision frame never also awards points.
 */
export function applyScoring(state) {
  if (state.status === "gameover") {
    return state;
  }

  for (const obstacle of state.obstacles) {
    if (checkObstaclePassed(state.ship, obstacle)) {
      obstacle.passed = true;
      state.score += SCORE_PER_OBSTACLE;
    }
  }

  return state;
}

/**
 * Updates the on-screen score text node(s) — the always-visible HUD element
 * and (once shown) the game-over overlay's score element — to the exact
 * current score as a plain base-10 integer string.
 */
export function renderScore(score) {
  const text = String(score);

  const hudEl = document.getElementById("hud-score-value");
  if (hudEl) hudEl.textContent = text;

  const overlayEl = document.getElementById("game-over-score-value");
  if (overlayEl) overlayEl.textContent = text;
}
