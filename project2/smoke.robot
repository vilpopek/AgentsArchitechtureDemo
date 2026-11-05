*** Settings ***
Documentation       Smoke subset — per human decision, this flat suite replaces
...                 the previous full per-requirement suite as the one that is
...                 actually executed going forward. The old REQ-*.robot files
...                 remain on disk (left untouched) but are intentionally
...                 excluded from the test:robot script, so only these tests
...                 run. Reuses the shared keywords/variables from
...                 common.resource (same ${BASE_URL}, Setup/Teardown Test
...                 Suite, Get Ship Bounds helper) rather than duplicating them.
Resource            common.resource
Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite
Test Tags           SMOKE

*** Test Cases ***
SMOKE AC1: Page Loads And HUD Score Is Visible At Zero
    [Documentation]    Covers REQ-TECH-001 / REQ-UX-001 / REQ-FUNC-006 at a
    ...    smoke level: the canvas exists with a strictly-2D rendering
    ...    context and the HUD score starts at "0" and is visible.
    [Tags]    REQ-TECH-001    REQ-UX-001    REQ-FUNC-006
    Wait For Elements State    \#game-canvas    attached
    ${is_2d}=    Canvas Context Is Strictly 2D
    Should Be True    ${is_2d}
    Wait For Elements State    \#hud-score-value    visible
    ${score}=    Get Hud Score
    Should Be Equal As Strings    ${score}    0
    # Regression guard: "Peli loppu" overlay must stay hidden until a collision.
    Wait For Elements State    \#game-over-overlay    hidden    timeout=2s

SMOKE AC2: Arrow Key Moves Ship Vertically
    [Documentation]    Covers REQ-FUNC-002 at a smoke level: holding ArrowDown
    ...    moves the ship's rendered bounding box downward on the canvas.
    [Tags]    REQ-FUNC-002
    ${before}=    Get Ship Bounds
    Keyboard Key    down    ArrowDown
    Sleep    300ms
    Keyboard Key    up    ArrowDown
    ${after}=    Get Ship Bounds
    Should Be True    ${after}[minY] > ${before}[minY]
