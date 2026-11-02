# Spec for REQ-FUNC-002

## Covers
REQ-FUNC-002 (v2)

## Summary
Clicking the first button ("Näytä luontokuva" / `#reveal-button`) picks one image at
random from the fixed six-image pool (REQ-TECH-001) and displays it in place inside
`#image-display`, without a full page reload. Before the first click, no image is
shown. The handler is independent of the second button's background-color behavior
(REQ-FUNC-003).

## Acceptance Criteria
- AC4: Before the first click of the first button, no image is shown — only an empty placeholder area (AMB-003).
- AC5: Clicking the first button displays a nature image on the page.
- AC6: Each click of the first button selects an image uniformly at random from the pool; the same image may be selected on consecutive clicks (AMB-002).
- AC7: The displayed image updates in place without a full page reload.
- AC8: Clicking the first button does not change the background color (independent of REQ-FUNC-003).

## Edge Cases
- Rapid repeated clicks must not throw errors or leave the UI in an inconsistent state.
- The random image pick must never select an index outside the 0–5 range of the pool.
- Clicking the first and second buttons in any order/interleaving must not cause one handler to interfere with the other's state.

## Data Shapes
- `Image` record: `{ id: string, name: string, src: string }`.
- `pickRandomImage(images: Image[]): Image` — pure function, returns one element of `images` chosen via `Math.random()`; throws if `images` is empty.
- DOM wiring: `#reveal-button` click → call `pickRandomImage(IMAGES)` → set `#image-display img.src/alt` to the chosen image.

## Open Questions
None outstanding — AMB-002 and AMB-003 are approved (see `review-queue.json`).
