// Covers: REQ-TECH-001, REQ-UX-001 v2, REQ-FUNC-001 v2 (core-gameplay.spec.md)
// Canvas drawing: background scroll loop, ship pixel-art sprite, asteroid-style
// pixel-art obstacle sprites. Simple 2D canvas primitives only (no external assets).
//
// NOTE: the spec's suggested layout places this at src/render.js; the dev sandbox
// used to build this project cannot create new subdirectories, so it lives at the
// project root instead (explicitly allowed: "Suggested file layout — not mandatory").

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

const STAR_TILE = 48;

function drawBackground(ctx, scrollOffset) {
  // Deep-space backdrop.
  ctx.fillStyle = "#05070f";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Scrolling star grid — simple blocky "pixel" stars, seamless loop.
  ctx.fillStyle = "#2a3660";
  const startX = -(scrollOffset % STAR_TILE);
  for (let x = startX; x < CANVAS_WIDTH + STAR_TILE; x += STAR_TILE) {
    for (let y = 10; y < CANVAS_HEIGHT; y += STAR_TILE) {
      ctx.fillRect(x, y, 3, 3);
      ctx.fillRect(x + 22, y + 18, 3, 3);
    }
  }
}

function drawShip(ctx, ship) {
  const { x, y, width, height } = ship;

  // Hull.
  ctx.fillStyle = "#c7cdd6";
  ctx.fillRect(x, y + height * 0.25, width * 0.7, height * 0.5);

  // Nose block.
  ctx.fillStyle = "#8d94a0";
  ctx.fillRect(x + width * 0.65, y + height * 0.35, width * 0.35, height * 0.3);

  // Cockpit / fins.
  ctx.fillStyle = "#3f7dd1";
  ctx.fillRect(x, y, width * 0.22, height * 0.3);
  ctx.fillRect(x, y + height * 0.7, width * 0.22, height * 0.3);

  // Engine flame.
  ctx.fillStyle = "#ff8a3d";
  ctx.fillRect(x - width * 0.18, y + height * 0.38, width * 0.18, height * 0.24);
}

function drawRockBlock(ctx, x, y, width, height) {
  if (height <= 0 || width <= 0) return;
  ctx.fillStyle = "#6b5848";
  ctx.fillRect(x, y, width, height);

  // Irregular blocky shading keeps the asteroid silhouette pixel-art styled.
  ctx.fillStyle = "#4d3f2c";
  const block = 10;
  for (let bx = 0; bx < width; bx += block) {
    for (let by = 0; by < height; by += block) {
      if ((Math.floor(bx / block) + Math.floor(by / block)) % 3 === 0) {
        ctx.fillRect(x + bx, y + by, Math.max(block - 2, 1), Math.max(block - 2, 1));
      }
    }
  }

  ctx.fillStyle = "#857258";
  for (let bx = block / 2; bx < width; bx += block * 2) {
    for (let by = block / 2; by < height; by += block * 2) {
      ctx.fillRect(x + bx, y + by, 2, 2);
    }
  }
}

function drawObstacle(ctx, obstacle) {
  const { x, width, gapY, gapHeight } = obstacle;
  drawRockBlock(ctx, x, 0, width, gapY);
  drawRockBlock(ctx, x, gapY + gapHeight, width, CANVAS_HEIGHT - (gapY + gapHeight));
}

export function render(ctx, state) {
  ctx.imageSmoothingEnabled = false;
  drawBackground(ctx, state.scrollOffset);
  for (const obstacle of state.obstacles) {
    drawObstacle(ctx, obstacle);
  }
  drawShip(ctx, state.ship);
}
