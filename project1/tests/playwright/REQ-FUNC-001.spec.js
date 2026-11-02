// Covers: REQ-FUNC-001
import { test, expect } from "./fixtures.js";

test.describe("REQ-FUNC-001: two centered buttons", () => {
  test("AC2: two buttons are visible immediately on page load", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#reveal-button")).toBeVisible();
    await expect(page.locator("#color-button")).toBeVisible();
    await expect(page.locator("button")).toHaveCount(2);
  });

  test("AC3: both buttons are centered together in the viewport", async ({ page }) => {
    await page.goto("/");
    const box = await page.locator(".buttons").boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    expect(Math.abs(centerX - viewport.width / 2)).toBeLessThan(viewport.width * 0.2);
    expect(centerY).toBeGreaterThan(viewport.height * 0.2);
    expect(centerY).toBeLessThan(viewport.height * 0.9);
  });
});
