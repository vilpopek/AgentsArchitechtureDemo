*** Settings ***
Documentation     Shared keywords for the project1 Robot Framework suite.
...               Starts/stops the static app server (node serve.js) only if nothing
...               is already listening on ${PORT}, so suites can run standalone or
...               against an already-running `npm run dev`.
Library           Browser
Library           Process
Library           OperatingSystem
Library           Collections
Library           String

*** Variables ***
${PORT}                      4173
${BASE_URL}                  http://localhost:${PORT}
${PROJECT_ROOT}              ${CURDIR}/../../..
${SERVER_STARTED_HERE}       ${False}

*** Keywords ***
Port Is Open
    [Arguments]    ${port}
    ${open}=    Evaluate    __import__('socket').socket().connect_ex(('localhost', int(${port}))) == 0
    Should Be True    ${open}

Start Application Server
    ${already_up}=    Run Keyword And Return Status    Port Is Open    ${PORT}
    IF    not ${already_up}
        Start Process    node    serve.js    cwd=${PROJECT_ROOT}    alias=app-server
        Set Suite Variable    ${SERVER_STARTED_HERE}    ${True}
        Wait Until Keyword Succeeds    15x    1s    Port Is Open    ${PORT}
    ELSE
        Set Suite Variable    ${SERVER_STARTED_HERE}    ${False}
    END

Stop Application Server
    IF    ${SERVER_STARTED_HERE}
        Terminate Process    app-server
    END

Open Application
    New Browser    chromium    headless=True
    New Context
    New Page    ${BASE_URL}

Setup Test Suite
    Start Application Server
    Open Application

Teardown Test Suite
    Close Browser    ALL
    Stop Application Server
