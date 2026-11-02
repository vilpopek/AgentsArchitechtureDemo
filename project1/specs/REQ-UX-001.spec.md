# Spec for REQ-UX-001

## Covers
REQ-UX-001 (v1)

## Summary
The page displays a header titled "Testipalvelu" at the top, above/outside the
centered `.page` container that holds the two buttons and image display
(REQ-FUNC-001). The label is kept verbatim in Finnish, not translated (AMB-005).

## Acceptance Criteria
- AC1: A header element with the exact text "Testipalvelu" is visible at the top of the page on load, positioned above/outside the centered button+image area (AMB-005).

## Edge Cases
- Page must render correctly if JavaScript has not yet attached the click handlers (header present, no crash).

## Data Shapes
- Header element: `<h1 id="page-title">Testipalvelu</h1>` (or equivalent heading tag), rendered above/outside the centered `.page` container.

## Open Questions
None outstanding — AMB-005 is approved (see `review-queue.json`).
