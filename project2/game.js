// Covers: REQ-TECH-001, REQ-UX-001 v2, REQ-FUNC-001 v2, REQ-FUNC-002 v2,
// REQ-FUNC-003 v2, REQ-FUNC-004 v2, REQ-UX-002 v2, REQ-FUNC-005 v2
// (core-gameplay.spec.md), REQ-FUNC-006 v1 (score-counter.spec.md)
//
// Main game loop/orchestration. State machine ("playing"/"gameover"), wires
// keyboard input, score, collision, obstacle spawn/update, and rendering.
// Auto-starts on page load — there is no Start button and no in-game restart
// control; the only way to reset is a full browser page reload (AC29/AC30).

import { CANVAS_WIDTH, CANVAS_HEIGHT, render } from "./render.js";
import { createShip, updateShip } from "./ship.js";
import {
  spawnObstacle,
  updateObstacles,
  getRandomSpawnDelayMs,
  SCROLL_SPEED_PX_PER_SEC,
} from "./obstacles.js";
import { checkCollision } from "./collision.js";
import { applyScoring, renderScore } from "./score.js";

function createInitialState() {
  return {
    status: "playing", // "playing" | "gameover" — AC3: begins playing immediately.
    ship: createShip(CANVAS_WIDTH, CANVAS_HEIGHT),
    obstacles: [],
    nextSpawnAtMs: getRandomSpawnDelayMs(),
    score: 0,
    scrollOffset: 0,
  };
}

/**
 * Advances the game state by one frame. No-op (ship/obstacles/scroll frozen,
 * no spawning) once state.status === "gameover" (AC20, AC25).
 */
function update(state, dtMs, input) {
  if (state.status === "gameover") {
    return state;
  }

  // Background scroll + ship + obstacle movement all share the same clock.
  state.scrollOffset += SCROLL_SPEED_PX_PER_SEC * (dtMs / 1000);

  updateShip(state.ship, dtMs, input, CANVAS_HEIGHT);

  state.nextSpawnAtMs -= dtMs;
  if (state.nextSpawnAtMs <= 0) {
    state.obstacles.push(spawnObstacle(CANVAS_WIDTH, CANVAS_HEIGHT));
    state.nextSpawnAtMs = getRandomSpawnDelayMs();
  }

  state.obstacles = updateObstacles(state.obstacles, dtMs);

  // Collision is evaluated BEFORE scoring so a collision frame never also
  // awards the trailing +10 for the same (or any other) obstacle that frame.
  if (checkCollision(state.ship, state.obstacles)) {
    state.status = "gameover";
  }

  applyScoring(state); // No-op automatically when status is now "gameover".

  return state;
}

function setupKeyboardInput(state) {
  const input = { up: false, down: false };

  window.addEventListener("keydown", (event) => {
    if (state.status === "gameover") return;
    if (event.key === "ArrowUp") {
      input.up = true;
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      input.down = true;
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") {
      input.up = false;
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      input.down = false;
      event.preventDefault();
    }
  });

  return input;
}

function showGameOverOverlay(score) {
  const overlay = document.getElementById("game-over-overlay");
  if (overlay) {
    overlay.removeAttribute("hidden"); // Shown exactly once, never re-hidden (AC28).
  }
  renderScore(score);
}

function startGame() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const state = createInitialState();
  const input = setupKeyboardInput(state);

  renderScore(state.score);
  render(ctx, state);

  let lastTimestamp = null;

  function loop(timestamp) {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }
    const dtMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    update(state, dtMs, input);
    render(ctx, state);
    renderScore(state.score);

    if (state.status === "gameover") {
      showGameOverOverlay(state.score);
      return; // Stop the loop entirely — the canvas stays frozen (AC25).
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// Auto-start as soon as the page finishes loading (AC3) — no Start button.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startGame);
} else {
  startGame();
}
