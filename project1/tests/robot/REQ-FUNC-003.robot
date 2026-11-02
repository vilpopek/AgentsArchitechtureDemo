*** Settings ***
Documentation       Covers: REQ-FUNC-003
Resource            resources/common.resource
Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite
Test Setup          Go To    ${BASE_URL}

*** Test Cases ***
AC11 - Clicking the second button changes the background color
    ${before}=    Get Style    body    background-color
    Click    \#color-button
    ${after}=    Get Style    body    background-color
    Should Not Be Equal    ${before}    ${after}

AC12 - Repeated clicks vary the picked color
    @{colors}=    Create List
    FOR    ${i}    IN RANGE    10
        Click    \#color-button
        ${color}=    Get Style    body    background-color
        Append To List    ${colors}    ${color}
    END
    ${unique}=    Remove Duplicates    ${colors}
    ${count}=    Get Length    ${unique}
    Should Be True    ${count} > 1

AC13 - Clicking the second button does not affect the displayed image
    Click    \#reveal-button
    ${src_before}=    Get Attribute    \#image-display img    src
    Click    \#color-button
    ${count}=    Get Element Count    \#image-display img
    Should Be Equal As Integers    ${count}    1
    ${src_after}=    Get Attribute    \#image-display img    src
    Should Be Equal    ${src_before}    ${src_after}
