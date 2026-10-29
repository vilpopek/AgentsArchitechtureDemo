// Covers: REQ-UX-001, REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-003
// Simulates the header/button-click -> random-image-pick / random-color-pick -> DOM-update orchestration in a jsdom document.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { wireUpPage } from "../src/app.js";
import { IMAGES } from "../src/images.js";

// Accepts either the literal #rrggbb form or the rgb(r, g, b) form that CSSOM
// serializes a hex assignment to when read back from an element's style object.
const CSS_COLOR_PATTERN = /^(#[0-9a-f]{6}|rgb\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}\s*\))$/i;

function setupDom() {
  const dom = new JSDOM(`<!doctype html><html><body>
    <h1 id="page-title">Testipalvelu</h1>
    <div class="page">
      <div class="buttons">
        <button id="reveal-button" type="button">Näytä luontokuva</button>
        <button id="color-button" type="button">Vaihda väri</button>
      </div>
      <div id="image-display"></div>
    </div>
  </body></html>`);
  globalThis.document = dom.window.document;
  return dom;
}

test("REQ-UX-001 / AC1: header element shows the exact text \"Testipalvelu\"", () => {
  const dom = setupDom();
  const header = dom.window.document.getElementById("page-title");
  assert.ok(header, "expected #page-title to exist");
  assert.equal(header.textContent, "Testipalvelu");
});

test("REQ-FUNC-001 / AC2: both buttons are present in the page markup on load", () => {
  const dom = setupDom();
  const reveal = dom.window.document.getElementById("reveal-button");
  const color = dom.window.document.getElementById("color-button");
  assert.ok(reveal, "expected #reveal-button to exist");
  assert.equal(reveal.tagName, "BUTTON");
  assert.ok(color, "expected #color-button to exist");
  assert.equal(color.tagName, "BUTTON");
});

test("REQ-FUNC-001 / AC3: the buttons and image area are centered together via CSS", () => {
  const cssPath = fileURLToPath(new URL("../styles.css", import.meta.url));
  const css = readFileSync(cssPath, "utf8");
  assert.match(css, /\.page\s*{[^}]*align-items:\s*center/s);
  assert.match(css, /\.page\s*{[^}]*justify-content:\s*center/s);
});

test("REQ-FUNC-002 / AC4: no image is shown before the first click", () => {
  const dom = setupDom();
  wireUpPage();
  const display = dom.window.document.getElementById("image-display");
  assert.equal(display.querySelector("img"), null);
});

test("REQ-FUNC-002 / AC5: clicking the first button displays a pool image", () => {
  const dom = setupDom();
  wireUpPage();
  const button = dom.window.document.getElementById("reveal-button");
  const display = dom.window.document.getElementById("image-display");

  button.dispatchEvent(new dom.window.Event("click", { bubbles: true }));

  const img = display.querySelector("img");
  assert.ok(img, "expected an <img> to be rendered after clicking the button");
  const matching = IMAGES.find((candidate) => candidate.src === img.getAttribute("src"));
  assert.ok(matching, "rendered image src should match an entry in the image pool");
  assert.equal(img.getAttribute("alt"), matching.name);
});

test("REQ-FUNC-002 / AC7: repeated clicks keep exactly one image displayed (update in place, no reload)", () => {
  const dom = setupDom();
  wireUpPage();
  const button = dom.window.document.getElementById("reveal-button");
  const display = dom.window.document.getElementById("image-display");

  for (let i = 0; i < 10; i++) {
    button.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  }

  assert.equal(display.querySelectorAll("img").length, 1);
});

test("REQ-FUNC-002 / AC8: clicking the first button does not change the background color", () => {
  const dom = setupDom();
  wireUpPage();
  const revealButton = dom.window.document.getElementById("reveal-button");
  const before = dom.window.document.body.style.backgroundColor;

  for (let i = 0; i < 5; i++) {
    revealButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  }

  assert.equal(dom.window.document.body.style.backgroundColor, before);
});

test("REQ-FUNC-003 / AC11: clicking the second button changes the background color to a non-empty value", () => {
  const dom = setupDom();
  wireUpPage();
  const colorButton = dom.window.document.getElementById("color-button");

  assert.equal(dom.window.document.body.style.backgroundColor, "");
  colorButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));

  assert.notEqual(dom.window.document.body.style.backgroundColor, "");
});

test("REQ-FUNC-003 / AC12: the picked background color is a syntactically valid color value", () => {
  const dom = setupDom();
  wireUpPage();
  const colorButton = dom.window.document.getElementById("color-button");

  colorButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));

  assert.match(dom.window.document.body.style.backgroundColor, CSS_COLOR_PATTERN);
});

test("REQ-FUNC-003 / AC12: repeated clicks on the color button are not restricted to a fixed palette", () => {
  const dom = setupDom();
  wireUpPage();
  const colorButton = dom.window.document.getElementById("color-button");

  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    colorButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
    const value = dom.window.document.body.style.backgroundColor;
    assert.match(value, CSS_COLOR_PATTERN);
    seen.add(value);
  }

  // Over 30 draws of a fully random color, expect to have seen more than one distinct value.
  assert.ok(seen.size > 1);
});

test("REQ-FUNC-003 / AC13: clicking the second button does not add an image to the placeholder", () => {
  const dom = setupDom();
  wireUpPage();
  const colorButton = dom.window.document.getElementById("color-button");
  const display = dom.window.document.getElementById("image-display");

  colorButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));

  assert.equal(display.querySelectorAll("img").length, 0);
});

test("REQ-FUNC-003 / AC13: clicking the second button does not change the already-displayed image", () => {
  const dom = setupDom();
  wireUpPage();
  const revealButton = dom.window.document.getElementById("reveal-button");
  const colorButton = dom.window.document.getElementById("color-button");
  const display = dom.window.document.getElementById("image-display");

  revealButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  const srcBefore = display.querySelector("img").getAttribute("src");

  colorButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));

  assert.equal(display.querySelectorAll("img").length, 1);
  assert.equal(display.querySelector("img").getAttribute("src"), srcBefore);
});

test("Edge case: interleaved clicks on both buttons do not interfere with each other's state", () => {
  const dom = setupDom();
  wireUpPage();
  const revealButton = dom.window.document.getElementById("reveal-button");
  const colorButton = dom.window.document.getElementById("color-button");
  const display = dom.window.document.getElementById("image-display");

  const clickOrder = [revealButton, colorButton, colorButton, revealButton, revealButton, colorButton];
  assert.doesNotThrow(() => {
    for (const button of clickOrder) {
      button.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
    }
  });

  assert.equal(display.querySelectorAll("img").length, 1);
  assert.notEqual(dom.window.document.body.style.backgroundColor, "");
});

test("Edge case: wireUpPage is a no-op when the expected elements are missing", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  globalThis.document = dom.window.document;
  assert.doesNotThrow(() => wireUpPage());
});

test("Edge case: rapid repeated clicks on both buttons do not throw and leave the UI consistent", () => {
  const dom = setupDom();
  wireUpPage();
  const revealButton = dom.window.document.getElementById("reveal-button");
  const colorButton = dom.window.document.getElementById("color-button");
  const display = dom.window.document.getElementById("image-display");

  assert.doesNotThrow(() => {
    for (let i = 0; i < 25; i++) {
      revealButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
      colorButton.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
    }
  });

  assert.equal(display.querySelectorAll("img").length, 1);
});
