// Playwright config for project2 (flat layout — no tests/ subfolder, see
// README note from the orchestrator).
//
// SCOPE NOTE (human decision, supersedes the previous full per-requirement
// test suite): only the few smoke.spec.js tests are executed going forward.
// The old REQ-*.spec.js files remain on disk (left untouched, not deleted)
// but are intentionally excluded from testMatch below so they are no longer
// reachable by the test run configuration.
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
// monocart resolves outputFile/outputDir relative to cwd, so anchor them to
// this project's root regardless of where `playwright test` is invoked from.
const projectPath = (p) => fileURLToPath(new URL(`./${p}`, import.meta.url));

export default defineConfig({
  testDir: ".",
  testMatch: "smoke.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["junit", { outputFile: "./test-results-playwright.xml" }],
    [
      "monocart-reporter",
      {
        name: "project2 Playwright coverage",
        outputFile: projectPath("test-output/playwright-report.html"),
        coverage: {
          outputDir: projectPath("test-output/coverage"),
          entryFilter: (entry) => /\/(game|ship|obstacles|collision|score|render)\.js(\?.*)?$/.test(entry.url),
          sourceFilter: (sourcePath) => /(^|[\\/])(game|ship|obstacles|collision|score|render)\.js$/.test(sourcePath),
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
    cwd: ".",
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
