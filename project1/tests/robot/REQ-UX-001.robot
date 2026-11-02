*** Settings ***
Documentation       Covers: REQ-UX-001
Resource            resources/common.resource
Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite
Test Setup          Go To    ${BASE_URL}

*** Test Cases ***
AC1 - Header "Testipalvelu" is visible at the top of the page on load
    Wait For Elements State    \#page-title    visible
    ${text}=    Get Text    \#page-title
    Should Be Equal    ${text}    Testipalvelu
