// Covers: REQ-FUNC-003
import { test, expect } from "./fixtures.js";

const COLOR_PATTERN = /^(#[0-9a-f]{6}|rgb\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}\s*\))$/i;

test.describe("REQ-FUNC-003: random background color", () => {
  test("AC11: clicking the second button changes the background color to a non-empty value", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => document.body.style.backgroundColor);
    expect(before).toBe("");
    await page.locator("#color-button").click();
    const after = await page.evaluate(() => document.body.style.backgroundColor);
    expect(after).not.toBe("");
  });

  test("AC12: the picked color is a syntactically valid CSS color value and may vary across clicks", async ({ page }) => {
    await page.goto("/");
    const colors = new Set();
    for (let i = 0; i < 10; i++) {
      await page.locator("#color-button").click();
      const color = await page.evaluate(() => document.body.style.backgroundColor);
      expect(color).toMatch(COLOR_PATTERN);
      colors.add(color);
    }
    expect(colors.size).toBeGreaterThan(1);
  });

  test("AC13: clicking the second button does not affect the displayed image area", async ({ page }) => {
    await page.goto("/");
    await page.locator("#reveal-button").click();
    const srcBefore = await page.locator("#image-display img").getAttribute("src");
    await page.locator("#color-button").click();
    await expect(page.locator("#image-display img")).toHaveCount(1);
    expect(await page.locator("#image-display img").getAttribute("src")).toBe(srcBefore);
  });
});
