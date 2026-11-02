// Covers: REQ-UX-001
import { test, expect } from "./fixtures.js";

test.describe("REQ-UX-001: header", () => {
  test("AC1: header 'Testipalvelu' is visible at the top of the page on load", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("#page-title");
    await expect(header).toBeVisible();
    await expect(header).toHaveText("Testipalvelu");
  });
});
