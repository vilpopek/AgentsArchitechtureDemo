*** Settings ***
Documentation       Covers: REQ-FUNC-002
Resource            resources/common.resource
Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite
Test Setup          Go To    ${BASE_URL}

*** Test Cases ***
AC4 - No image is shown before the first click
    ${count}=    Get Element Count    \#image-display img
    Should Be Equal As Integers    ${count}    0

AC5 AND AC7 - Clicking the first button shows an image in place
    Click    \#reveal-button
    ${count}=    Get Element Count    \#image-display img
    Should Be Equal As Integers    ${count}    1

AC6 - Repeated clicks keep exactly one image and vary the selection
    @{srcs}=    Create List
    FOR    ${i}    IN RANGE    15
        Click    \#reveal-button
        ${src}=    Get Attribute    \#image-display img    src
        Append To List    ${srcs}    ${src}
    END
    ${unique}=    Remove Duplicates    ${srcs}
    ${count}=    Get Length    ${unique}
    Should Be True    ${count} > 1

AC8 - Clicking the first button does not change the background color
    ${before}=    Get Style    body    background-color
    Click    \#reveal-button
    ${after}=    Get Style    body    background-color
    Should Be Equal    ${before}    ${after}
