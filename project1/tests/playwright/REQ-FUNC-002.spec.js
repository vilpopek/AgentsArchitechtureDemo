// Covers: REQ-FUNC-002
import { test, expect } from "./fixtures.js";

test.describe("REQ-FUNC-002: reveal a random nature image", () => {
  test("AC4: no image is shown before the first click", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#image-display img")).toHaveCount(0);
  });

  test("AC5 & AC7: clicking the first button shows an image in place (no reload)", async ({ page }) => {
    await page.goto("/");
    await page.locator("#reveal-button").click();
    await expect(page.locator("#image-display img")).toHaveCount(1);
  });

  test("AC6: repeated clicks keep exactly one image and vary the selection", async ({ page }) => {
    await page.goto("/");
    const srcs = new Set();
    for (let i = 0; i < 15; i++) {
      await page.locator("#reveal-button").click();
      srcs.add(await page.locator("#image-display img").getAttribute("src"));
    }
    await expect(page.locator("#image-display img")).toHaveCount(1);
    expect(srcs.size).toBeGreaterThan(1);
  });

  test("AC8: clicking the first button does not change the background color", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => document.body.style.backgroundColor);
    await page.locator("#reveal-button").click();
    const after = await page.evaluate(() => document.body.style.backgroundColor);
    expect(after).toBe(before);
  });
});
