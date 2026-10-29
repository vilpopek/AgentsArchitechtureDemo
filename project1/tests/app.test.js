// Covers: REQ-FUNC-002, REQ-FUNC-003, REQ-TECH-001
import test from "node:test";
import assert from "node:assert/strict";
import { pickRandomImage, pickRandomColor } from "../src/app.js";
import { IMAGES } from "../src/images.js";

test("REQ-TECH-001 / AC9: image pool contains exactly six distinct images", () => {
  assert.equal(IMAGES.length, 6);
  const uniqueIds = new Set(IMAGES.map((img) => img.id));
  assert.equal(uniqueIds.size, 6);
});

test("REQ-TECH-001 / AC10: every image has a local, resolvable asset URL (no external/network dependency)", () => {
  for (const image of IMAGES) {
    const url = new URL(image.src);
    assert.match(url.pathname, /\/assets\/[\w-]+\.svg$/);
  }
});

test("REQ-FUNC-002 / AC6: pickRandomImage returns a member of the given pool", () => {
  const result = pickRandomImage(IMAGES);
  assert.ok(IMAGES.includes(result));
});

test("REQ-FUNC-002 / AC6: repeated picks stay within pool bounds and allow repeats", () => {
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const result = pickRandomImage(IMAGES);
    assert.ok(IMAGES.includes(result));
    seen.add(result.id);
  }
  // Over 200 draws from a pool of 6, expect to have seen more than one distinct image.
  assert.ok(seen.size > 1);
});

test("Edge case: pickRandomImage throws on an empty pool", () => {
  assert.throws(() => pickRandomImage([]), /must not be empty/);
});

test("REQ-FUNC-003 / AC12: pickRandomColor returns a well-formed 6-digit hex color string", () => {
  const result = pickRandomColor();
  assert.match(result, /^#[0-9a-f]{6}$/i);
});

test("REQ-FUNC-003 / AC12: repeated calls to pickRandomColor are not restricted to a fixed palette", () => {
  const seen = new Set();
  for (let i = 0; i < 50; i++) {
    const result = pickRandomColor();
    assert.match(result, /^#[0-9a-f]{6}$/i);
    seen.add(result);
  }
  // Over 50 draws of a fully random color, expect to have seen more than one distinct value.
  assert.ok(seen.size > 1);
});
