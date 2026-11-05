# Spec for REQ-FUNC-006

## Covers
REQ-FUNC-006 (v1)

## Summary
A score counter tracks the player's progress: +10 points for every obstacle
the ship fully clears without colliding. The current score is visible on
screen at all times during play, is carried over onto the "Peli loppu"
game-over overlay (see `core-gameplay.spec.md`, REQ-UX-002) as the final
score, and resets to 0 on every page reload (no persistence of any kind
across reloads). This spec depends on the obstacle lifecycle, collision
detection, and game-over/freeze behavior defined in `core-gameplay.spec.md`
(REQ-FUNC-003, REQ-FUNC-004, REQ-UX-002) — it adds scoring on top of that
state machine without altering it.

## Acceptance Criteria
- AC1: The score value is initialized to `0` at the moment the game session begins (i.e. immediately on page load, per `core-gameplay.spec.md` AC3).
- AC2: The current score is rendered in a DOM element that is visible on screen continuously throughout the "playing" state, from page load until a collision occurs (and remains visible afterward — see AC7).
- AC3: Each time an obstacle's trailing (right) edge fully passes the ship's fixed x-position (`obstacle.x + obstacle.width < SHIP_X`) without that specific obstacle having caused a collision, the score increases by exactly `+10`.
- AC4: Each individual obstacle contributes to the score at most once — passing it is only ever counted a single time, regardless of how many frames it remains past the ship before being removed (see `core-gameplay.spec.md` AC19).
- AC5: The score increases on no event other than a successful obstacle pass (AC3) — specifically, it does NOT increase due to elapsed time, key presses, number of frames rendered, or any other action.
- AC6: The score never decreases during a session; there is no penalty, decay, or reset mechanism other than a full page reload (AC9).
- AC7: Once the game enters the "gameover" state (REQ-UX-002/REQ-FUNC-004), the score display stops changing and continues to show the exact value it held at the moment of collision (consistent with the frozen game loop defined in `core-gameplay.spec.md` AC25).
- AC8: The "Peli loppu" overlay (`core-gameplay.spec.md` AC26) additionally displays the same frozen final score value as part of its content, visible at the same time as the "Peli loppu" text.
- AC9: Reloading the page resets the displayed score back to `0`; no `localStorage`, `sessionStorage`, cookie, URL parameter, or any other persistence mechanism carries the score value across reloads.

## Edge Cases
- Two (or more) obstacles whose trailing edges both cross the ship's x-position within the same update/frame must each be scored independently in that frame (e.g. both score, for a total of `+20`), not merged or dropped due to single-obstacle-per-frame processing assumptions.
- If an obstacle causes a collision in the exact same frame in which it would otherwise have been counted as "passed," the collision takes precedence: that specific obstacle must NOT be scored, and the game must transition straight to game-over (per `core-gameplay.spec.md` AC23) without the trailing `+10`. Collision detection must be evaluated before/instead of the "passed" check for that obstacle within a given frame.
- Score display must render correctly at `0` with no obstacles yet passed (do not show a blank/undefined value before the first pass).
- Score must be an integer at all times; no fractional or rounded-decimal display is introduced by the +10 increments.
- Long play sessions (many obstacles passed) must not visibly overflow, wrap, or truncate the displayed score; treat the score as a plain JS number with no artificial cap (no explicit maximum is specified by the requirement).
- Rapid consecutive obstacle passes (e.g. due to a short spawn interval) must not cause missed or duplicated `+10` increments — each obstacle's `passed` flag must be checked/set exactly once.

## Data Shapes

### State
- `score: number` — plain integer counter, module/game-state-level value; part of the overall `GameState` defined in `core-gameplay.spec.md` (e.g. `GameState.score: number`).
- Reuses `Obstacle.passed: boolean` from `core-gameplay.spec.md` to guarantee each obstacle is scored at most once (AC4).

### Constants
- `SCORE_PER_OBSTACLE: number = 10` — fixed, authoritative value mandated directly by REQ-FUNC-006 (not an implementation default — must be exactly 10).

### Functions / interfaces (signatures only — no implementation logic prescribed)
- `checkObstaclePassed(ship: Ship, obstacle: Obstacle): boolean` — returns `true` exactly once per obstacle, the first update at which `obstacle.x + obstacle.width < ship.x` and `obstacle.passed === false` and the obstacle did not cause a collision in that same update (see Edge Cases ordering rule); caller is responsible for setting `obstacle.passed = true` and incrementing `score`.
- `applyScoring(state: GameState): GameState` — iterates active obstacles, applies `checkObstaclePassed`, and increments `state.score` by `SCORE_PER_OBSTACLE` per newly-passed obstacle; MUST be a no-op when `state.status === "gameover"` (consistent with `core-gameplay.spec.md` AC25/AC7 above).
- `renderScore(score: number): void` — updates the on-screen score text node(s) to reflect `score`; called for both the always-visible HUD element and (once shown) the game-over overlay's score element.

### DOM structure (extends `core-gameplay.spec.md`'s `#game-root`)
```html
<div id="game-root">
  <canvas id="game-canvas" ...></canvas>
  <div id="hud-score">
    <span id="hud-score-value">0</span>
  </div>
  <div id="game-over-overlay" hidden>
    <p id="game-over-text">Peli loppu</p>
    <p id="game-over-score">
      <span id="game-over-score-value">0</span>
    </p>
  </div>
</div>
```
- `#hud-score-value`: `textContent` MUST always equal the current `score` as a plain base-10 integer string (e.g. `"0"`, `"10"`, `"230"`), with no currency symbols, locale thousands-separators, or decimal points. Always present/visible during the "playing" state (AC2) and remains visible/unchanged after game-over (AC7).
- `#game-over-score-value`: populated with the same frozen final score value at the moment the overlay is shown (AC8); test/code agents should assert on this element's numeric text, not on any surrounding label wording (label text itself — e.g. "Score:" vs "Pisteet:" — is not mandated by the requirement; see Open Questions).

## Open Questions
- REQ-FUNC-006 and the source document specify only the numeric scoring behavior, not any label/wording for the score display (e.g. "Score:", "Pisteet:", or no label at all). This spec intentionally scopes acceptance criteria to the numeric value only (`#hud-score-value` / `#game-over-score-value`); Test Generation Agent should avoid asserting on exact surrounding label text. Flag to review-queue if the customer has specific wording preferences.
- The rule that a colliding obstacle is never also scored in the same frame (Edge Cases, 2nd bullet) is a technical tie-breaking default for determinism, not explicitly stated in REQ-FUNC-006 or the source document (which does not address this same-frame edge case at all). Flag to review-queue if the customer wants the opposite behavior (e.g. scoring and game-over both applying simultaneously).
