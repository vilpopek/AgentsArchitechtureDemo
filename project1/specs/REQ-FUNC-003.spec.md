# Spec for REQ-FUNC-003

## Covers
REQ-FUNC-003 (v1)

## Summary
Clicking the second button ("Vaihda taustaväriä" / `#color-button`) changes the
page's background color to a new, fully random color. The color is chosen with no
fixed palette and may repeat the previous value. This handler is wired independently
of the first button's image-reveal behavior (REQ-FUNC-002) — it never touches the
image display area.

## Acceptance Criteria
- AC11: Clicking the second button changes the page background to a new color.
- AC12: The background color is chosen fully at random (no fixed palette) on each click; it may coincide with the previous color (AMB-004).
- AC13: Clicking the second button does not change the displayed image or the image placeholder state.

## Edge Cases
- Rapid repeated clicks on the second button must not throw errors or leave the UI in an inconsistent state.
- The random color pick must always produce a syntactically valid CSS color value (e.g. a well-formed 6-digit hex string).
- Clicking the first and second buttons in any order/interleaving must not cause one handler to interfere with the other's state.

## Data Shapes
- `pickRandomColor(): string` — pure function, returns a random 6-digit hex color string in the form `#rrggbb`, with no palette restriction (AMB-004).
- DOM wiring: `#color-button` click → call `pickRandomColor()` → set `document.body.style.backgroundColor` to the picked color. No shared state with, and no call into, the image-reveal handler.

## Open Questions
None outstanding — AMB-004 is approved (see `review-queue.json`).
