# Spec for REQ-TECH-001, REQ-UX-001, REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-003, REQ-FUNC-004, REQ-UX-002, REQ-FUNC-005

## Covers
REQ-TECH-001 (v1), REQ-UX-001 (v2), REQ-FUNC-001 (v2), REQ-FUNC-002 (v2), REQ-FUNC-003 (v2), REQ-FUNC-004 (v2), REQ-UX-002 (v2), REQ-FUNC-005 (v2)

## Summary
A browser-only, client-side 2D side-scroller ("Avaruusaluspeli"). A pixel-art
spaceship, fixed at ~1/4 of the play area's width from the left edge, is
steered vertically with the Up/Down arrow keys while a pixel-art background
scrolls continuously at a constant, moderate speed to simulate forward flight.
Pixel-art asteroid obstacles spawn from the right edge at randomized intervals,
scroll leftward at the same speed as the background, and always leave a
passable vertical gap; there is no difficulty progression over a session.
Collision is detected via axis-aligned bounding-box (AABB) overlap between the
ship and obstacle rectangles. On collision, the game freezes instantly and a
centered "Peli loppu" overlay is shown. The only way to restart is a full
browser page reload — there is no in-game restart control. Score display and
scoring rules are specified separately in `score-counter.spec.md`
(REQ-FUNC-006), which this spec's overlay and game-loop freeze behavior must
accommodate.

## Acceptance Criteria

### Platform / loading (REQ-TECH-001)
- AC1: The game loads and is fully playable by opening the page in a standard web browser served over HTTP (e.g. via a simple static file server); no backend/API calls occur at runtime.
- AC2: No installable client, browser plugin, or extension is required to play.
- AC3: The game begins running automatically as soon as the page finishes loading — there is no separate "Start" button/control (inferred from REQ-FUNC-005: the only documented start/reset action anywhere is a page reload).

### Visual style / rendering (REQ-UX-001, REQ-FUNC-001)
- AC4: Ship, obstacles, and background are rendered using simple, low-resolution pixel-art style graphics (no photorealistic/high-fidelity art).
- AC5: Obstacles are rendered specifically as pixel-art asteroid/rock-like shapes.
- AC6: The game view is strictly two-dimensional — no 3D perspective, depth, or parallax-as-3D rendering is used (a flat 2D canvas context is sufficient).
- AC7: The background scrolls horizontally in a continuous, seamless loop for the entire session while the game is in the "playing" state.
- AC8: The background scroll speed is constant and moderate; it never accelerates or decelerates over the course of a session (AMB-001).

### Ship control (REQ-FUNC-002)
- AC9: The ship's horizontal (x) position is fixed at approximately 25% of the canvas/play-area width from the left edge, for the entire session; it never changes in response to input or time.
- AC10: Holding ArrowUp moves the ship upward (decreasing y) at a constant vertical speed; releasing ArrowUp stops the upward motion immediately (no inertia/drift).
- AC11: Holding ArrowDown moves the ship downward (increasing y) at a constant vertical speed; releasing ArrowDown stops the downward motion immediately (no inertia/drift).
- AC12: Holding ArrowUp and ArrowDown at the same time results in zero net vertical velocity — the ship holds its current y position.
- AC13: The ship's y position is clamped to the visible play area: it cannot move above y = 0 or below y = (playAreaHeight − shipHeight); at the boundary the ship stops exactly at the edge rather than being pushed outside it.
- AC14: Arrow-key input has no effect once the game has entered the game-over state (REQ-UX-002) — the ship does not move after a collision.

### Obstacles (REQ-FUNC-003)
- AC15: Obstacles spawn from the right edge of the play area (x = playAreaWidth) at randomized (non-fixed) time intervals.
- AC16: Each obstacle moves leftward at exactly the same horizontal speed as the background scroll (AC8).
- AC17: Every spawned obstacle configuration leaves at least one vertical gap large enough for the ship to pass through safely (gap height ≥ ship height + a fixed safety margin); the gap's vertical position is randomized within the play area's vertical bounds.
- AC18: Obstacle spawn-interval range, obstacle speed, and gap size are constant for the whole session; none of them change as a function of elapsed time, obstacles passed, or score (AMB-006 — no difficulty progression).
- AC19: Obstacles that have fully scrolled past the left edge of the play area are removed from the active obstacle set and no longer participate in collision checks.
- AC20: No new obstacles are spawned, and no existing obstacles move, once the game has entered the game-over state.

### Collision detection (REQ-FUNC-004)
- AC21: Every frame while the game is in the "playing" state, the ship's bounding rectangle is tested against every active obstacle's bounding rectangle(s) using axis-aligned bounding-box (AABB) overlap testing (not pixel-perfect/sprite-shape collision).
- AC22: AABB overlap requires strict area overlap on both axes; rectangles whose edges merely touch (zero-area overlap) do NOT count as a collision.
- AC23: The first frame in which any ship↔obstacle AABB overlap is detected immediately and synchronously transitions the game from "playing" to "gameover" (no delay/animation before the transition).
- AC24: No collision is registered, and the game remains in "playing" state, for any frame in which the ship's rectangle does not overlap any obstacle rectangle.

### Game over (REQ-UX-002)
- AC25: Upon entering the "gameover" state, the game loop stops advancing: no further background scrolling, ship movement, obstacle movement, or obstacle spawning occurs; the canvas remains visually frozen on the exact frame in which the collision occurred.
- AC26: A centered overlay becomes visible on top of the frozen game screen, displaying the exact text "Peli loppu" (verbatim, case-sensitive, no additional/alternate wording).
- AC27: The overlay text uses a simple, legible pixel-style (e.g. monospace/blocky) font, visually consistent with REQ-UX-001.
- AC28: The overlay, once shown, remains visible indefinitely; it is not dismissible by any further key press, mouse click, or timeout.

### Restart (REQ-FUNC-005)
- AC29: Reloading the browser page (navigation reload), at any point — whether mid-game or already in the "gameover" state — fully resets the game to its initial state: status = "playing", ship at its starting position, no obstacles present, overlay hidden, and (per `score-counter.spec.md`) score = 0.
- AC30: No in-game restart button, link, or key binding (e.g. "R", Enter, Space, click-to-restart) exists anywhere on the page; a full page reload is the only way to reset the game.

## Edge Cases
- Both ArrowUp and ArrowDown held simultaneously: net vertical velocity is zero (AC12) — must not throw, must not pick one key arbitrarily.
- Rapid alternating key presses (keydown/keyup churn) must not desync ship velocity (e.g. a stuck "moving" state after both keys have been released).
- Ship exactly at the top (y = 0) or bottom (y = playAreaHeight − shipHeight) boundary while the corresponding key is still held: ship must stay clamped, not oscillate or jitter.
- Obstacle AABB touching the ship's AABB edge-to-edge with zero overlapping area must NOT trigger game over (AC22).
- Multiple obstacles present on screen simultaneously: collision check must evaluate all active obstacles each frame, not just the nearest one.
- An obstacle whose gap briefly includes the ship's current y-range must allow a true pass-through with no collision, even if the ship is stationary (not actively dodging) when the gap aligns with it.
- Collision occurring in the same frame the ship is at a clamped boundary must still be detected correctly (boundary clamping must not mask overlap).
- Window losing focus / tab backgrounded mid-game: no requirement specifies pause-on-blur behavior; browser's default `requestAnimationFrame` throttling behavior is acceptable and is not itself a bug.
- Browser window resize: the play area/canvas is not required to be responsive; a fixed-size canvas is an acceptable default since no requirement specifies responsive behavior (see Open Questions).
- Reload occurring exactly at/after the moment of collision must still fully reset state (no stale "gameover" flag surviving reload — page reload implies a fresh JS context, so this is inherent, but must not be defeated by any persistence mechanism).
- No audio/sound requirement exists anywhere in the source document; the implementation must not assume sound is required for any acceptance criterion in this spec.

## Data Shapes

### Constants (concrete values are implementation defaults — see Open Questions)
- `CANVAS_WIDTH: number`, `CANVAS_HEIGHT: number` — fixed play-area pixel dimensions.
- `SHIP_X: number` — fixed ship left-edge x-coordinate, `≈ CANVAS_WIDTH * 0.25` (AC9).
- `SHIP_WIDTH: number`, `SHIP_HEIGHT: number` — ship bounding-box size.
- `SHIP_SPEED_PX_PER_SEC: number` — constant vertical speed while a key is held.
- `SCROLL_SPEED_PX_PER_SEC: number` — constant background scroll / obstacle horizontal speed (AC8, AC16 — must be the same value for both).
- `OBSTACLE_WIDTH: number`, `OBSTACLE_MIN_GAP_HEIGHT: number` (≥ `SHIP_HEIGHT` + safety margin).
- `OBSTACLE_SPAWN_MIN_MS: number`, `OBSTACLE_SPAWN_MAX_MS: number` — randomized spawn interval bounds (AC15).

### Core entities
- `Rect`: `{ x: number, y: number, width: number, height: number }`
- `Ship`: `{ x: number (fixed = SHIP_X), y: number, width: number, height: number, vy: number }`
- `Obstacle`: `{ id: string, x: number, gapY: number, gapHeight: number, width: number, passed: boolean }`
  - Derived rects: `topRect = { x, y: 0, width, height: gapY }`, `bottomRect = { x, y: gapY + gapHeight, width, height: CANVAS_HEIGHT - (gapY + gapHeight) }`
- `GameStatus`: `"playing" | "gameover"`
- `GameState`: `{ status: GameStatus, ship: Ship, obstacles: Obstacle[], nextSpawnAtMs: number }`

### Functions / interfaces (signatures only — no implementation logic prescribed)
- `aabbIntersect(a: Rect, b: Rect): boolean` — strict-overlap AABB test (AC22); must return `false` for edge-touching, zero-area-overlap rectangles.
- `clampShipY(y: number, shipHeight: number, playAreaHeight: number): number` — enforces AC13.
- `spawnObstacle(playAreaWidth: number, playAreaHeight: number): Obstacle` — produces a new obstacle at `x = playAreaWidth` with a randomized `gapY` such that the gap stays fully within `[0, playAreaHeight]` and `gapHeight >= OBSTACLE_MIN_GAP_HEIGHT`.
- `checkCollision(ship: Ship, obstacles: Obstacle[]): boolean` — returns `true` if the ship's rect overlaps any obstacle's `topRect` or `bottomRect` per `aabbIntersect`.
- `update(state: GameState, dtMs: number, input: { up: boolean, down: boolean }): GameState` — advances ship position, scroll offset, obstacle positions/spawning, and collision/status transition; MUST be a no-op (except possibly rendering) when `state.status === "gameover"`.
- `render(ctx: CanvasRenderingContext2D, state: GameState): void` — draws background, ship, and obstacles; does not itself own the "Peli loppu" overlay (that is DOM-based — see DOM structure below).

### DOM / Canvas structure
```html
<div id="game-root">
  <canvas id="game-canvas" width="<CANVAS_WIDTH>" height="<CANVAS_HEIGHT>"></canvas>
  <!-- HUD score element lives here too — see score-counter.spec.md -->
  <div id="game-over-overlay" hidden>
    <p id="game-over-text">Peli loppu</p>
    <!-- final-score element inside this overlay — see score-counter.spec.md -->
  </div>
</div>
```
- `#game-canvas`: the only place ship/background/obstacle pixel-art is drawn (2D `CanvasRenderingContext2D`).
- `#game-over-overlay`: plain DOM element, absolutely positioned over `#game-canvas`, centered via CSS, `hidden` attribute present by default and removed exactly once on the collision frame (AC23, AC26). Must never be re-hidden afterward (AC28).
- `#game-over-text`: textContent MUST equal exactly `"Peli loppu"` at all times once visible (AC26).
- Keyboard: `window.addEventListener("keydown"/"keyup", ...)` for `ArrowUp`/`ArrowDown`, with `event.preventDefault()` to avoid page scrolling; handlers must stop affecting ship velocity once `status === "gameover"` (AC14).

### Suggested file layout (not mandatory — Code Generation Agent may restructure)
`index.html`, `styles.css`, `src/game.js` (loop/orchestration), `src/ship.js`, `src/obstacles.js`, `src/collision.js`, `serve.js` (minimal Node static file server, no external dependencies, mirroring project1's `serve.js` pattern).

## Open Questions
- Exact numeric values for `CANVAS_WIDTH/HEIGHT`, `SHIP_WIDTH/HEIGHT`, `SHIP_SPEED_PX_PER_SEC`, `SCROLL_SPEED_PX_PER_SEC`, `OBSTACLE_WIDTH`, `OBSTACLE_MIN_GAP_HEIGHT`, and the spawn-interval min/max bounds are NOT specified anywhere in the source document or ratified ambiguity resolutions (AMB-001, AMB-002 only mandate the qualitative properties: "constant moderate speed," "randomized interval," "same speed as background," "always a passable gap"). This spec treats specific numbers as implementation defaults; Code Generation Agent may pick any values satisfying the qualitative acceptance criteria above. If the customer wants precise tuning, route to `review-queue.json` as a new ambiguity.
- Whether the game should auto-start on page load (AC3) is an inference from REQ-FUNC-005 (reload-only restart) rather than an explicit requirement — no explicit "how does the game begin" statement exists in the source document. Flagged for confirmation if a start screen/button is actually desired.
- No requirement addresses responsive/variable canvas sizing, pause-on-tab-blur, or audio — all treated as out of scope per the source document's silence; flagged here rather than assumed as hard requirements.
- Key-cancellation rule for simultaneous ArrowUp+ArrowDown (AC12: net-zero velocity) is a technical default for determinism, not stated explicitly in the source document; an alternative rule (e.g. "last key pressed wins") would also be plausible. Flag to review-queue if the customer has a preference.
