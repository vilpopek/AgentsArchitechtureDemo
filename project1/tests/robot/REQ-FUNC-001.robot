*** Settings ***
Documentation       Covers: REQ-FUNC-001
Resource            resources/common.resource
Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite
Test Setup          Go To    ${BASE_URL}

*** Test Cases ***
AC2 - Two buttons are visible immediately on page load
    Wait For Elements State    \#reveal-button    visible
    Wait For Elements State    \#color-button    visible
    ${count}=    Get Element Count    button
    Should Be Equal As Integers    ${count}    2

AC3 - Both buttons are centered together in the viewport
    ${box}=    Get Boundingbox    .buttons
    ${viewport}=    Get Viewport Size
    ${center_x}=    Evaluate    ${box}[x] + ${box}[width] / 2
    ${half_width}=    Evaluate    ${viewport}[width] / 2
    ${diff}=    Evaluate    abs(${center_x} - ${half_width})
    ${tolerance}=    Evaluate    ${viewport}[width] * 0.2
    Should Be True    ${diff} < ${tolerance}
