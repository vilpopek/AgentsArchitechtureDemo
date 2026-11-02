# Spec for REQ-TECH-001

## Covers
REQ-TECH-001 (v1)

## Summary
The service bundles exactly six original, locally-stored SVG nature illustrations
as the image pool used by REQ-FUNC-002. Using local, originally-created assets
(forest, mountain, river, flower field, beach, starry sky) guarantees they are
copyright-free and removes any network dependency (AMB-001).

## Acceptance Criteria
- AC9: The image pool contains exactly six distinct images.
- AC10: Every image in the pool is an originally created asset (local SVG), free of copyright restrictions and loading without any network dependency (AMB-001).

## Edge Cases
- The random image pick (REQ-FUNC-002) must never select an index outside the 0–5 range of the pool.
- Each asset file must resolve and be servable from `src/assets/` with no external URL reference.

## Data Shapes
- `Image` record: `{ id: string, name: string, src: string }` — `src` is a relative path to a local `.svg` asset.
- `IMAGES: Image[]` — exported array of exactly 6 `Image` records (`src/images.js`), each `id` distinct.

## Open Questions
None outstanding — AMB-001 is approved (see `review-queue.json`).
