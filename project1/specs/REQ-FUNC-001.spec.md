# Spec for REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-003, REQ-UX-001, REQ-TECH-001

## Covers
REQ-FUNC-001 (v2), REQ-FUNC-002 (v2), REQ-FUNC-003 (v1), REQ-UX-001 (v1), REQ-TECH-001 (v1)

## Summary
A single static web page shows a header titled "Testipalvelu" at the top, and
below it two buttons centered together in the viewport. Clicking the first
button picks one image at random from a fixed pool of six locally bundled,
copyright-free nature illustrations and displays it on the page. Clicking the
second button changes the page background to a new, fully random color. The
two buttons' behaviors are independent of each other.

## Acceptance Criteria
- AC1: A header element with the exact text "Testipalvelu" is visible at the top of the page on load, positioned above/outside the centered button+image area (REQ-UX-001, AMB-005).
- AC2: Two buttons are visible immediately on page load (REQ-FUNC-001).
- AC3: Both buttons are centered together, horizontally and vertically, in the viewport (REQ-FUNC-001).
- AC4: Before the first click of the first button, no image is shown — only an empty placeholder area (REQ-FUNC-002, AMB-003).
- AC5: Clicking the first button displays a nature image on the page (REQ-FUNC-002).
- AC6: Each click of the first button selects an image uniformly at random from the pool; the same image may be selected on consecutive clicks (REQ-FUNC-002, AMB-002).
- AC7: The displayed image updates in place without a full page reload (REQ-FUNC-002).
- AC8: Clicking the first button does not change the background color (REQ-FUNC-002, REQ-FUNC-003 — behaviors are independent).
- AC9: The image pool contains exactly six distinct images (REQ-TECH-001).
- AC10: Every image in the pool is an originally created asset (local SVG), so it is free of copyright restrictions and loads without any network dependency (REQ-TECH-001, AMB-001).
- AC11: Clicking the second button changes the page background to a new color (REQ-FUNC-003).
- AC12: The background color is chosen fully at random (no fixed palette) on each click of the second button; it may coincide with the previous color (REQ-FUNC-003, AMB-004).
- AC13: Clicking the second button does not change the displayed image or the image placeholder state (REQ-FUNC-003).

## Edge Cases
- Rapid repeated clicks on either button must not throw errors or leave the UI in an inconsistent state.
- The random image pick must never select an index outside the 0–5 range of the pool.
- The random color pick must always produce a syntactically valid CSS color value (e.g. a well-formed 6-digit hex string).
- Page must render correctly if JavaScript has not yet attached the click handlers (both buttons present, header present, no crash).
- Clicking the first and second buttons in any order/interleaving must not cause one handler to interfere with the other's state.

## Data Shapes
- `Image` record: `{ id: string, name: string, src: string }` — `src` is a relative path to a local `.svg` asset.
- `IMAGES: Image[]` — exported array of exactly 6 `Image` records (`src/images.js`).
- `pickRandomImage(images: Image[]): Image` — pure function, returns one element of `images` chosen via `Math.random()`; throws if `images` is empty.
- `pickRandomColor(): string` — pure function, returns a random 6-digit hex color string in the form `#rrggbb` (e.g. via `Math.random()` per channel or byte), with no palette restriction (AMB-004).
- DOM wiring (image reveal, unchanged id): `#reveal-button` (button, first button) click → call `pickRandomImage(IMAGES)` → set `#image-display img.src/alt` to the chosen image.
- DOM wiring (background color, new): `#color-button` (button, second button) click → call `pickRandomColor()` → set `document.body.style.backgroundColor` to the picked color. This handler must be wired independently from the image-reveal handler (no shared state, no call into `pickRandomImage`/image DOM update).
- Header element (new): `<h1 id="page-title">Testipalvelu</h1>` (or equivalent heading tag), rendered above/outside the centered `.page` container that holds the two buttons and image display.

## Open Questions
None outstanding — AMB-001 through AMB-005 are all resolved and approved (see `review-queue.json`). No new ambiguities identified while drafting this revision.
