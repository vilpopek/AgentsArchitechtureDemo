// Shared fixture: collects per-test V8 coverage for src/*.js so monocart-reporter can emit coverage.lcov.
import { test as base, expect } from "@playwright/test";
import { addCoverageReport } from "monocart-reporter";

export const test = base.extend({
  autoTestFixture: [
    async ({ page }, use, testInfo) => {
      const isChromium = testInfo.project.name === "chromium";
      if (isChromium) {
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }
      await use();
      if (isChromium) {
        const coverage = await page.coverage.stopJSCoverage();
        if (coverage.length) {
          await addCoverageReport(coverage, testInfo);
        }
      }
    },
    { scope: "test", auto: true },
  ],
});

export { expect };
