// Merges Playwright (JUnit) + Robot Framework (xunit) reports into one project1/test-results.xml.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const playwrightReport = path.join(ROOT, "..", "test-results-playwright.xml");
const robotReport = path.join(ROOT, "..", "test-results-robot.xml");
const outFile = path.join(ROOT, "..", "test-results.xml");

function extractSuites(xml) {
  const suitesMatch = xml.match(/<testsuites[^>]*>([\s\S]*)<\/testsuites>/);
  if (suitesMatch) return suitesMatch[1];
  const suiteMatch = xml.match(/<testsuite[\s\S]*<\/testsuite>/);
  return suiteMatch ? suiteMatch[0] : "";
}

let inner = "";
let foundAny = false;
for (const [framework, file] of [["playwright", playwrightReport], ["robot", robotReport]]) {
  if (existsSync(file)) {
    inner += `${extractSuites(readFileSync(file, "utf8")).replace(/<testsuite name="/g, `<testsuite name="${framework}: `)}\n`;
    foundAny = true;
  } else {
    console.warn(`merge-results: missing report ${file}, run its suite first`);
  }
}

if (!foundAny) {
  console.error("merge-results: no reports found, nothing to merge");
  process.exit(1);
}

writeFileSync(
  outFile,
  `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites name="project1 (Playwright + Robot Framework)">\n${inner}</testsuites>\n`
);
console.log(`merge-results: wrote ${outFile}`);
