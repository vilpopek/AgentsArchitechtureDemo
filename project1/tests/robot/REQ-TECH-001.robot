*** Settings ***
Documentation       Covers: REQ-TECH-001
Resource            resources/common.resource
Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite
Test Setup          Go To    ${BASE_URL}

*** Test Cases ***
AC9 - Image pool contains exactly six distinct images
    ${content}=    Get File    ${PROJECT_ROOT}/src/images.js
    ${ids}=    Get Regexp Matches    ${content}    id: "([\\w-]+)"    1
    ${unique}=    Remove Duplicates    ${ids}
    Length Should Be    ${unique}    6

AC10 - Repeated clicks only ever reveal images from the known local pool
    @{known_files}=    Create List    forest.svg    mountain.svg    river.svg    flowerfield.svg    beach.svg    starrysky.svg
    FOR    ${i}    IN RANGE    12
        Click    \#reveal-button
        ${src}=    Get Attribute    \#image-display img    src
        ${matched}=    Evaluate    any(name in """${src}""" for name in $known_files)
        Should Be True    ${matched}
    END
