*** Settings ***
Documentation       Shared keywords for the project2 Robot Framework suite (flat
...                 layout — this file lives directly in project2/, alongside
...                 game.js/serve.js, not under a tests/ subfolder).
...                 Starts/stops the static app server (node serve.js) only if
...                 nothing is already listening on ${PORT}, so suites can run
...                 standalone or against an already-running `npm run dev`.
Library             Browser
Library             Process
Library             OperatingSystem
Library             Collections
Library             String

*** Variables ***
${PORT}                      4173
${BASE_URL}                  http://localhost:${PORT}
${PROJECT_ROOT}              ${CURDIR}
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

Wait For Game Over
    [Documentation]    Bounded, generous wait for the "Peli loppu" overlay to
    ...    appear. The game has no debug hook to force a collision, so tests
    ...    that need game-over rely on natural real-time play (a stationary
    ...    or lightly-steered ship will eventually collide with a randomly
    ...    positioned obstacle gap); the timeout is sized generously to make
    ...    this practically certain rather than flaky.
    [Arguments]    ${timeout}=45s
    Wait For Elements State    \#game-over-overlay    visible    timeout=${timeout}

Get Hud Score
    ${text}=    Get Text    \#hud-score-value
    RETURN    ${text}

*** Keywords ***
# ---------------------------------------------------------------------------
# Canvas pixel introspection — colors read directly from the shipped render.js
# output (what the browser actually paints), used only to locate on-screen
# entities (ship / rock obstacles) for black-box assertions already mandated
# by the specs (pixel-art rendering, obstacle presence, ship position/gap).
# ---------------------------------------------------------------------------

Get Canvas Image Smoothing Enabled
    ${smoothing}=    Evaluate JavaScript    ${None}    () => document.getElementById('game-canvas').getContext('2d').imageSmoothingEnabled
    RETURN    ${smoothing}

Canvas Context Is Strictly 2D
    ${result}=    Evaluate JavaScript    ${None}    () => { const c = document.getElementById('game-canvas'); const has2d = c.getContext('2d') instanceof CanvasRenderingContext2D; const webglNull = c.getContext('webgl') === null; const webgl2Null = c.getContext('webgl2') === null; return has2d && webglNull && webgl2Null; }
    RETURN    ${result}

Get Rock Pixel Count
    ${count}=    Evaluate JavaScript    ${None}    () => { const c=document.getElementById('game-canvas'); const ctx=c.getContext('2d'); const d=ctx.getImageData(0,0,c.width,c.height).data; const rock=[[107,88,72],[77,63,44],[133,114,88]]; let n=0; for (let i=0;i<d.length;i+=4){ for (const rc of rock){ if (Math.abs(d[i]-rc[0])<=10 && Math.abs(d[i+1]-rc[1])<=10 && Math.abs(d[i+2]-rc[2])<=10){ n++; break; } } } return n; }
    RETURN    ${count}

Get Rock Min X
    ${x}=    Evaluate JavaScript    ${None}    () => { const c=document.getElementById('game-canvas'); const ctx=c.getContext('2d'); const d=ctx.getImageData(0,0,c.width,c.height).data; const rock=[[107,88,72],[77,63,44],[133,114,88]]; let minX=-1; for (let x=0;x<c.width && minX<0;x++){ for (let y=0;y<c.height;y++){ const i=(y*c.width+x)*4; const r=d[i],g=d[i+1],b=d[i+2]; let hit=false; for (const rc of rock){ if (Math.abs(r-rc[0])<=10 && Math.abs(g-rc[1])<=10 && Math.abs(b-rc[2])<=10){ hit=true; break; } } if (hit){ minX=x; break; } } } return minX; }
    RETURN    ${x}

Get Ship Bounds
    ${bounds}=    Evaluate JavaScript    ${None}    () => { const c=document.getElementById('game-canvas'); const ctx=c.getContext('2d'); const d=ctx.getImageData(0,0,c.width,c.height).data; const ship=[[199,205,214],[141,148,160],[63,125,209],[255,138,61]]; let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity; for (let y=0;y<c.height;y++){ for (let x=0;x<c.width;x++){ const i=(y*c.width+x)*4; const r=d[i],g=d[i+1],b=d[i+2]; for (const sc of ship){ if (Math.abs(r-sc[0])<=6 && Math.abs(g-sc[1])<=6 && Math.abs(b-sc[2])<=6){ if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; } } } } return {minX: minX, maxX: maxX, minY: minY, maxY: maxY}; }
    RETURN    ${bounds}

Get Canvas Snapshot
    ${data}=    Evaluate JavaScript    ${None}    () => document.getElementById('game-canvas').toDataURL()
    RETURN    ${data}

Rock Pixels Should Exist
    ${count}=    Get Rock Pixel Count
    Should Be True    ${count} > 0

Wait Until Obstacle Visible
    [Arguments]    ${timeout}=15s
    Wait Until Keyword Succeeds    ${timeout}    250ms    Rock Pixels Should Exist

Get Gap Center At Column
    [Arguments]    ${x}
    ${gap}=    Evaluate JavaScript    ${None}    (col) => { const c=document.getElementById('game-canvas'); const ctx=c.getContext('2d'); if (col<0 || col>=c.width) return null; const d=ctx.getImageData(col,0,1,c.height).data; const rock=[[107,88,72],[77,63,44],[133,114,88]]; const isRock=(r,g,b)=>rock.some(rc=>Math.abs(r-rc[0])<=10 && Math.abs(g-rc[1])<=10 && Math.abs(b-rc[2])<=10); let best=0,bestStart=0,cur=0,curStart=0,sawRock=false; for(let y=0;y<c.height;y++){ const i=y*4; const rk=isRock(d[i],d[i+1],d[i+2]); if(rk) sawRock=true; if(!rk){ if(cur===0) curStart=y; cur++; if(cur>best){ best=cur; bestStart=curStart; } } else { cur=0; } } if(!sawRock) return null; return {height: best, center: bestStart + best/2}; }    ${x}
    RETURN    ${gap}

Step Autopilot
    [Documentation]    One short dodge tick: steer toward the nearest
    ...    obstacle's gap center. Used only by scoring tests (REQ-FUNC-006)
    ...    that need the ship to survive multiple obstacle passes — the dodge
    ...    logic itself is not under test, only the resulting score bookkeeping.
    ...    Returns ${True} if the game is already (or just) over.
    ${overlay_visible}=    Get Element States    \#game-over-overlay    contains    visible
    IF    ${overlay_visible}
        RETURN    ${True}
    END
    ${bounds}=    Get Ship Bounds
    ${ship_center_y}=    Evaluate    (${bounds}[minY] + ${bounds}[maxY]) / 2
    ${rock_x}=    Get Rock Min X
    ${target_y}=    Set Variable    ${225}
    IF    ${rock_x} >= 0
        ${col}=    Evaluate    min(${rock_x} + 5, 799)
        ${gap}=    Get Gap Center At Column    ${col}
        IF    $gap is not None
            ${target_y}=    Set Variable    ${gap}[center]
        END
    END
    IF    ${ship_center_y} < ${target_y} - 20
        Keyboard Key    down    ArrowDown
        Sleep    90ms
        Keyboard Key    up    ArrowDown
    ELSE IF    ${ship_center_y} > ${target_y} + 20
        Keyboard Key    down    ArrowUp
        Sleep    90ms
        Keyboard Key    up    ArrowUp
    ELSE
        Sleep    90ms
    END
    ${overlay_visible}=    Get Element States    \#game-over-overlay    contains    visible
    RETURN    ${overlay_visible}
