// Playwright config for project1 — covers REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-003, REQ-TECH-001, REQ-UX-001.
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
// monocart resolves paths from cwd, so anchor them to the project root
const projectPath = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["junit", { outputFile: "../test-results-playwright.xml" }],
    [
      "monocart-reporter",
      {
        name: "project1 Playwright coverage",
        outputFile: projectPath("test-output/playwright-report.html"),
        coverage: {
          outputDir: projectPath("test-output/coverage"),
          entryFilter: (entry) => entry.url.includes("/src/"),
          sourceFilter: (sourcePath) => sourcePath.includes("src/"),
          reports: [["console-summary"], ["lcovonly", { file: "../../coverage.lcov" }]],
        },
      },
    ],
  ],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node serve.js",
    cwd: "..",
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
