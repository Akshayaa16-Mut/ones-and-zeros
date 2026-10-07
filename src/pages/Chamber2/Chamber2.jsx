import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  startChamber,

  completeChamber,

} from "../../lib/chamberProgress";

import "./Chamber2.css";



/* =========================================================

   ONES & ZEROS

   CHAMBER 02 — SPRING

   THE THREE-PATH MAZE

========================================================= */



const MAZE = [

  "###############################",

  "#.....#.........#.............#",

  "#####.#####.###.#########.###.#",

  "#...#.......#.#...........#...#",

  "#.###########.#############.###",

  "#.....#...........#.......#.#.#",

  "###.###.###.#####.#.#.#####.#.#",

  "#...#...#.#.#...#.#.#.......#.#",

  "#.#.#.###.#.#.###.#.#########.#",

  "#.#.#.....#.#.....#.....#.....#",

  "#.#######.#.###.#######.#####.#",

  "#.#.....#.#...#.#.....#.....#.#",

  "#.#.###.#.###.###.###.#####.#.#",

  "#.#...#...#.#.......#.....#...#",

  "#.###.#####.###########.#.###.#",

  "#...#.#.......#.#.......#.#...#",

  "#.#.#.#.#####.#.#.#########.###",

  "#.#.....#.......#.............#",

  "###############################",

];



const CHARACTERS = {

  A: {

    name: "Character A",

    color: "red",

    start: { x: 1, y: 1 },

    goal: { x: 29, y: 17 },

    icon: "🧑🏻",

  },



  B: {

    name: "Character B",

    color: "blue",

    start: { x: 29, y: 1 },

    goal: { x: 15, y: 17 },

    icon: "🧑🏻‍💻",

  },



  C: {

    name: "Character C",

    color: "green",

    start: { x: 1, y: 17 },

    goal: { x: 29, y: 9 },

    icon: "🧝🏻",

  },

};



const INITIAL_POSITIONS = {

  A: { ...CHARACTERS.A.start },

  B: { ...CHARACTERS.B.start },

  C: { ...CHARACTERS.C.start },

};



/* =========================================================

   KEYS

========================================================= */



const KEYS = [

  {

    x: 5,

    y: 1,

    id: "key-1",

  },

  {

    x: 25,

    y: 1,

    id: "key-2",

  },

  {

    x: 1,

    y: 15,

    id: "key-3",

  },

];



/* =========================================================

   LOCKED GATES

========================================================= */



const GATES = [

  {

    x: 7,

    y: 1,

    id: "gate-1",

    key: "key-1",

  },

  {

    x: 23,

    y: 1,

    id: "gate-2",

    key: "key-2",

  },

  {

    x: 3,

    y: 15,

    id: "gate-3",

    key: "key-3",

  },

];



/* =========================================================

   SWITCHES

========================================================= */



const SWITCHES = [

  {

    x: 13,

    y: 3,

    id: "switch-A",

    label: "A",

  },

  {

    x: 19,

    y: 7,

    id: "switch-B",

    label: "B",

  },

  {

    x: 25,

    y: 13,

    id: "switch-C",

    label: "C",

  },

];



/* =========================================================

   TRAPS

========================================================= */



const TRAPS = [

  {

    x: 9,

    y: 5,

    id: "trap-1",

    type: "thorn",

  },



  {

    x: 17,

    y: 5,

    id: "trap-2",

    type: "pit",

  },



  {

    x: 21,

    y: 9,

    id: "trap-3",

    type: "switch",

    requiredSwitch: "switch-B",

  },



  {

    x: 5,

    y: 13,

    id: "trap-4",

    type: "water",

  },



  {

    x: 23,

    y: 15,

    id: "trap-5",

    type: "lock",

  },



  {

    x: 13,

    y: 17,

    id: "trap-6",

    type: "symbol",

  },

];



const TRAP_SEQUENCES = {

  thorn: ["→", "↑", "←", "↓"],

  pit: ["A", "D", "W", "S"],

  water: ["🌸", "🪷", "🍃", "🌷"],

  symbol: ["🌙", "◆", "🌸", "🌀"],

};



const WATER_OPTIONS = ["🌿", "🌷", "🪷", "🌼", "🍃", "🌸"];

const SYMBOL_OPTIONS = ["✦", "🍃", "🌀", "🌸", "◆", "🌙"];



const PETALS = Array.from({ length: 34 }, (_, index) => ({

  id: index,

  left: `${(index * 29) % 101}%`,

  delay: `${-((index * 1.7) % 13)}s`,

  duration: `${8 + (index % 7)}s`,

  drift: `${-90 + ((index * 37) % 180)}px`,

  size: `${10 + (index % 5) * 3}px`,

  rotate: `${(index * 47) % 360}deg`,

}));



/* =========================================================

   ONE-WAY PATHS

   Disabled: the original one-way cells made Character B and C

   mathematically unreachable from their goals.

   ========================================================= */

const ONE_WAY = [];



/* =========================================================

   HELPER FUNCTIONS

========================================================= */



function isInside(x, y) {

  return (

    y >= 0 &&

    y < MAZE.length &&

    x >= 0 &&

    x < MAZE[0].length

  );

}



function isWalkable(x, y) {

  return (

    isInside(x, y) &&

    MAZE[y][x] === "."

  );

}



function samePosition(a, b) {

  return (

    a.x === b.x &&

    a.y === b.y

  );

}



function getInitialGameStart() {

  const savedStart =

    localStorage.getItem(

      "onesZerosStartTime"

    );



  if (!savedStart) {

    return 0;

  }



  const startTime = Number(savedStart);



  if (!Number.isFinite(startTime) || startTime <= 0) {

    return 0;

  }



  return startTime;

}

function formatTime(seconds) {

  const safeSeconds = Math.max(

    0,

    seconds

  );



  const minutes = Math.floor(

    safeSeconds / 60

  )

    .toString()

    .padStart(2, "0");



  const remainingSeconds = (

    safeSeconds % 60

  )

    .toString()

    .padStart(2, "0");



  return `${minutes}:${remainingSeconds}`;

}



/* =========================================================

   COMPONENT

========================================================= */



function Chamber2() {

  const navigate = useNavigate();



  /* -------------------------------------------------------

     GAME STATE

  ------------------------------------------------------- */



  const [positions, setPositions] = useState(

    INITIAL_POSITIONS

  );



  const [activeCharacter, setActiveCharacter] =

    useState("A");



  const [collectedKeys, setCollectedKeys] =

    useState([]);



  const [activatedSwitches, setActivatedSwitches] =

    useState([]);



  const [escapedTraps, setEscapedTraps] =

    useState([]);



  const [moves, setMoves] = useState(0);



  const [message, setMessage] = useState(

    "Choose a character and guide them through the maze."

  );



  const [completed, setCompleted] =

    useState(false);



  const [gameOver, setGameOver] =

    useState(false);



  /* -------------------------------------------------------

     TRAP STATE

  ------------------------------------------------------- */



  const [activeTrap, setActiveTrap] =

    useState(null);



  const [trapAttempts, setTrapAttempts] =

    useState(0);



  const trapAttemptsRef = useRef(0);



  const [pitKey, setPitKey] =

    useState("");



  const [pitTimeLeft, setPitTimeLeft] =

    useState(5);



  const [sequenceAnswer, setSequenceAnswer] =

    useState([]);



  const [sequenceVisible, setSequenceVisible] =

    useState(true);



  const [draggedSequenceIndex, setDraggedSequenceIndex] =

    useState(null);



  const [draggedOption, setDraggedOption] =

    useState(null);



  const [trapMessage, setTrapMessage] =

    useState("");



  /* -------------------------------------------------------

     GLOBAL TIMER

  ------------------------------------------------------- */



  const [gameStart] = useState(

    getInitialGameStart

  );



  const [timeLeft, setTimeLeft] =

    useState(() => {

      const elapsed = Math.floor(

        (Date.now() - gameStart) / 1000

      );



      return Math.max(

        0,

        90 * 60 - elapsed

      );

    });



  useEffect(() => {

    const timer = setInterval(() => {

      const elapsed = Math.floor(

        (Date.now() - gameStart) / 1000

      );



      const remaining = Math.max(

        0,

        90 * 60 - elapsed

      );



      setTimeLeft(remaining);



      if (remaining <= 0) {

        setGameOver(true);

        clearInterval(timer);

      }

    }, 1000);



    return () => clearInterval(timer);

  }, [gameStart]);

  useEffect(() => {

  startChamber(2).catch((error) => {

    console.error("Chamber 2 start error:", error);

  });

}, []);



  /* =======================================================

     TRAP COUNTDOWN / MEMORY WINDOW

  ======================================================= */



  useEffect(() => {

    if (!activeTrap) return;



    setSequenceVisible(true);

    setSequenceAnswer([]);



    const revealDuration = activeTrap.type === "pit" ? 1800 : 2200;

    const hideTimer = setTimeout(() => setSequenceVisible(false), revealDuration);



    if (activeTrap.type !== "pit") {

      return () => clearTimeout(hideTimer);

    }



    setPitTimeLeft(5);

    const countdown = setInterval(() => {

      setPitTimeLeft((previous) => {

        if (previous <= 1) {

          clearInterval(countdown);

          handleTrapFailure("Too slow. The floor closed beneath you.");

          return 0;

        }

        return previous - 1;

      });

    }, 1000);



    return () => {

      clearTimeout(hideTimer);

      clearInterval(countdown);

    };

  }, [activeTrap]);



  /* =======================================================

     SAVE PROGRESS

  ======================================================= */



  useEffect(() => {

    sessionStorage.setItem(

      "onesZerosChamber2Positions",

      JSON.stringify(positions)

    );



    sessionStorage.setItem(

      "onesZerosChamber2Keys",

      JSON.stringify(collectedKeys)

    );



    sessionStorage.setItem(

      "onesZerosChamber2Switches",

      JSON.stringify(activatedSwitches)

    );



    sessionStorage.setItem(

      "onesZerosChamber2Traps",

      JSON.stringify(escapedTraps)

    );

  }, [

    positions,

    collectedKeys,

    activatedSwitches,

    escapedTraps,

  ]);



  /* =======================================================

     COMPLETION CHECK

  ======================================================= */



  useEffect(() => {

    const allReached =

      samePosition(

        positions.A,

        CHARACTERS.A.goal

      ) &&

      samePosition(

        positions.B,

        CHARACTERS.B.goal

      ) &&

      samePosition(

        positions.C,

        CHARACTERS.C.goal

      );



    if (

      allReached &&

      !completed

    ) {

      setCompleted(true);

        completeChamber({

  chamberNumber: 2,

  resultCode: "1",

  score: 0,

}).catch((error) => {

  console.error("Chamber 2 completion error:", error);

});

      sessionStorage.setItem(

        "onesZerosChamber2Result",

        "1"

      );



      sessionStorage.setItem(

        "onesZerosChamber2Completed",

        "true"

      );



      setMessage(

        "ALL THREE DESTINATIONS REACHED. CHAMBER 02 CLEARED."

      );

    }

  }, [

    positions,

    completed,

  ]);



  /* =======================================================

     LOOKUP FUNCTIONS

  ======================================================= */



  const getGateAt = useCallback(

    (x, y) =>

      GATES.find(

        (gate) =>

          gate.x === x &&

          gate.y === y

      ),

    []

  );



  const getKeyAt = useCallback(

    (x, y) =>

      KEYS.find(

        (key) =>

          key.x === x &&

          key.y === y

      ),

    []

  );



  const getSwitchAt = useCallback(

    (x, y) =>

      SWITCHES.find(

        (item) =>

          item.x === x &&

          item.y === y

      ),

    []

  );



  const getTrapAt = useCallback(

    (x, y) =>

      TRAPS.find(

        (trap) =>

          trap.x === x &&

          trap.y === y

      ),

    []

  );



  const gateIsOpen = useCallback(

    (x, y) => {

      const gate = getGateAt(x, y);



      if (!gate) {

        return true;

      }



      return collectedKeys.includes(

        gate.key

      );

    },

    [

      getGateAt,

      collectedKeys,

    ]

  );



  /* =======================================================

     TRAP FAILURE / ESCAPE

  ======================================================= */



  function handleTrapFailure(reason) {

    const nextAttempts = trapAttemptsRef.current + 1;

    trapAttemptsRef.current = nextAttempts;

    setTrapAttempts(nextAttempts);

    setTrapMessage(reason || "Trap failed.");

    setSequenceAnswer([]);



    if (nextAttempts < 3 && activeTrap) {

      setSequenceVisible(true);

      const revealDuration = activeTrap.type === "pit" ? 1800 : 2200;

      window.setTimeout(() => setSequenceVisible(false), revealDuration);

      if (activeTrap.type === "pit") setPitTimeLeft(5);

    }



    if (nextAttempts >= 3) {

      const character = CHARACTERS[activeCharacter];

      setPositions((previous) => ({

        ...previous,

        [activeCharacter]: { ...character.start },

      }));

      setMessage("TOO MANY FAILED ATTEMPTS. CHARACTER RETURNED TO START.");

      closeTrap();

      trapAttemptsRef.current = 0;

      setTrapAttempts(0);

    }

  }



  function closeTrap() {

    setActiveTrap(null);

    setPitKey("");

    setSequenceAnswer([]);

    setDraggedSequenceIndex(null);

    setDraggedOption(null);

    setTrapMessage("");

    setSequenceVisible(true);

  }



  function escapeTrap() {

    if (!activeTrap) return;



    setEscapedTraps((previous) => [

      ...previous.filter((id) => id !== activeTrap.id),

      activeTrap.id,

    ]);



    closeTrap();

    setTrapAttempts(0);

    trapAttemptsRef.current = 0;

    setMessage("TRAP ESCAPED! THE PATH IS CLEAR.");

  }



  /* =======================================================

     GENERIC MEMORY SEQUENCE

  ======================================================= */



  function addSequenceItem(item) {

    if (!activeTrap || sequenceVisible) return;



    const target = TRAP_SEQUENCES[activeTrap.type] || [];

    if (sequenceAnswer.length >= target.length) return;



    setSequenceAnswer((previous) => [...previous, item]);

  }



  function removeSequenceItem(index) {

    if (sequenceVisible) return;

    setSequenceAnswer((previous) => previous.filter((_, i) => i !== index));

  }



  function moveSequenceItem(fromIndex, toIndex) {

    if (sequenceVisible || fromIndex === null || fromIndex === toIndex) return;

    setSequenceAnswer((previous) => {

      if (toIndex < 0 || toIndex >= previous.length) return previous;

      const next = [...previous];

      const [moved] = next.splice(fromIndex, 1);

      next.splice(toIndex, 0, moved);

      return next;

    });

  }



  function handleSequenceDrop(targetIndex) {

    if (draggedSequenceIndex === null) return;

    moveSequenceItem(draggedSequenceIndex, targetIndex);

    setDraggedSequenceIndex(null);

  }



  function handleOptionDrop(item, targetIndex) {

    if (sequenceVisible || !item) return;

    setSequenceAnswer((previous) => {

      if (previous.length >= (TRAP_SEQUENCES[activeTrap.type] || []).length) return previous;

      const next = [...previous];

      next.splice(targetIndex, 0, item);

      return next.slice(0, TRAP_SEQUENCES[activeTrap.type].length);

    });

    setDraggedOption(null);

  }



  function clearSequence() {

    if (sequenceVisible) return;

    setSequenceAnswer([]);

    setDraggedSequenceIndex(null);

    setDraggedOption(null);

  }



  function submitSequence() {

    if (!activeTrap || sequenceVisible) return;



    const target = TRAP_SEQUENCES[activeTrap.type] || [];

    const correct =

      sequenceAnswer.length === target.length &&

      sequenceAnswer.every((item, index) => item === target[index]);



    if (correct) {

      escapeTrap();

    } else {

      handleTrapFailure("Incorrect order. Rearrange the movable tiles and try again.");

    }

  }



  function solveSwitchTrap() {

    const required = ["switch-B", "switch-C"];

    const ready = required.every((id) => activatedSwitches.includes(id));



    if (ready) {

      escapeTrap();

    } else {

      setTrapMessage("Activate BOTH the blue and green switches, then return here.");

    }

  }



  function solveLockTrap() {

    if (collectedKeys.length >= 3) {

      escapeTrap();

    } else {

      setTrapMessage("This lock needs all 3 keys. Return to the maze and collect the missing keys.");

    }

  }



  function openTrap(trap) {

    if (escapedTraps.includes(trap.id)) return;

    setActiveTrap(trap);

    setTrapAttempts(0);

    trapAttemptsRef.current = 0;

    setTrapMessage("");

    setSequenceAnswer([]);

    setSequenceVisible(true);

    if (trap.type === "pit") setPitTimeLeft(5);

  }



  /* =======================================================

     MOVE CHARACTER

  ======================================================= */



  const moveCharacter = useCallback(

    (dx, dy) => {

      if (

        completed ||

        gameOver ||

        activeTrap

      ) {

        return;

      }



      const current =

        positions[

          activeCharacter

        ];



      const nextX =

        current.x + dx;



      const nextY =

        current.y + dy;



      if (

        !isInside(

          nextX,

          nextY

        )

      ) {

        return;

      }



      if (

        !isWalkable(

          nextX,

          nextY

        )

      ) {

        setMessage(

          "A wall blocks the path."

        );



        return;

      }



      if (

        !gateIsOpen(

          nextX,

          nextY

        )

      ) {

        setMessage(

          "LOCKED GATE — FIND THE CORRESPONDING KEY."

        );



        return;

      }



      /*

        Move character

      */



      setPositions((previous) => ({

        ...previous,



        [activeCharacter]: {

          x: nextX,

          y: nextY,

        },

      }));



      setMoves(

        (previous) =>

          previous + 1

      );



      /*

        Key

      */



      const key =

        getKeyAt(

          nextX,

          nextY

        );



      if (

        key &&

        !collectedKeys.includes(

          key.id

        )

      ) {

        setCollectedKeys(

          (previous) => [

            ...previous,

            key.id,

          ]

        );



        setMessage(

          "KEY FOUND! A LOCKED GATE CAN NOW BE OPENED."

        );

      }



      /*

        Switch

      */



      const switchItem =

        getSwitchAt(

          nextX,

          nextY

        );



      if (

        switchItem &&

        !activatedSwitches.includes(

          switchItem.id

        )

      ) {

        setActivatedSwitches(

          (previous) => [

            ...previous,

            switchItem.id,

          ]

        );



        setMessage(

          `SWITCH ${switchItem.label} ACTIVATED!`

        );

      }



      /*

        Trap

      */



      const trap =

        getTrapAt(

          nextX,

          nextY

        );



      if (

        trap &&

        !escapedTraps.includes(

          trap.id

        )

      ) {

        setTimeout(() => {

          openTrap(trap);

        }, 100);

      }

    },

    [

      activeCharacter,

      positions,

      completed,

      gameOver,

      activeTrap,

      gateIsOpen,

      getKeyAt,

      collectedKeys,

      getSwitchAt,

      activatedSwitches,

      getTrapAt,

      escapedTraps,

    ]

  );



  /* =======================================================

     KEYBOARD

  ======================================================= */



  useEffect(() => {

    const handleKeyDown = (event) => {

      const key =

        event.key.toLowerCase();



      /* PIT TRAP MEMORY INPUT */

      if (activeTrap && activeTrap.type === "pit") {

        if (["w", "a", "s", "d"].includes(key)) {

          event.preventDefault();

          addSequenceItem(key.toUpperCase());

          return;

        }

      }



      /*

        Normal movement

      */



      if (activeTrap) {

        return;

      }



      const movement = {

        arrowup: [0, -1],

        w: [0, -1],



        arrowdown: [0, 1],

        s: [0, 1],



        arrowleft: [-1, 0],

        a: [-1, 0],



        arrowright: [1, 0],

        d: [1, 0],

      };



      if (!movement[key]) {

        return;

      }



      event.preventDefault();



      const [dx, dy] =

        movement[key];



      moveCharacter(dx, dy);

    };



    window.addEventListener(

      "keydown",

      handleKeyDown

    );



    return () =>

      window.removeEventListener(

        "keydown",

        handleKeyDown

      );

  }, [

    moveCharacter,

    activeTrap,

    pitKey,

  ]);



  /* =======================================================

     RESET

  ======================================================= */



  function resetChamber() {

    setPositions(

      INITIAL_POSITIONS

    );



    setCollectedKeys([]);

    setActivatedSwitches([]);

    setEscapedTraps([]);



    setMoves(0);



    setCompleted(false);

    setGameOver(false);



    setActiveTrap(null);



    setTrapAttempts(0);



    setPitKey("");



    setSequenceAnswer([]);



    setTrapMessage("");



    sessionStorage.removeItem(

      "onesZerosChamber2Result"

    );



    sessionStorage.removeItem(

      "onesZerosChamber2Completed"

    );



    setMessage(

      "MAZE RESET. GUIDE ALL THREE CHARACTERS."

    );

  }



  /* =======================================================

     NEXT CHAMBER

  ======================================================= */



  function continueToNextChamber() {

     navigate("/chamber-03");

  }



  /* =======================================================

     MAZE CELLS

  ======================================================= */



  const mazeCells = useMemo(() => {

    return MAZE.flatMap(

      (row, y) =>

        row

          .split("")

          .map((cell, x) => ({

            x,

            y,

            type: cell,

          }))

    );

  }, []);



  function characterAt(x, y) {

    return Object.entries(

      positions

    ).find(

      ([, position]) =>

        position.x === x &&

        position.y === y

    );

  }



  function keyAt(x, y) {

    return KEYS.find(

      (item) =>

        item.x === x &&

        item.y === y

    );

  }



  function switchAt(x, y) {

    return SWITCHES.find(

      (item) =>

        item.x === x &&

        item.y === y

    );

  }



  function trapAt(x, y) {

    return TRAPS.find(

      (item) =>

        item.x === x &&

        item.y === y

    );

  }



  function gateAt(x, y) {

    return GATES.find(

      (item) =>

        item.x === x &&

        item.y === y

    );

  }



  function oneWayAt(x, y) {

    return ONE_WAY.find(

      (item) =>

        item.x === x &&

        item.y === y

    );

  }



  /* =======================================================

     TRAP TITLE

  ======================================================= */



  function getTrapTitle(type) {

    const titles = {

      thorn: "🌹 THORN TRAP",

      pit: "🕳️ PIT TRAP",

      switch: "🔘 SWITCH TRAP",

      water: "🌊 WATER TRAP",

      lock: "🔐 LOCK TRAP",

      symbol: "🌀 SYMBOL TRAP",

    };



    return titles[type];

  }



  function renderSequenceBuilder(options) {

    const targetLength = TRAP_SEQUENCES[activeTrap?.type]?.length || 0;



    return (

      <>

        <div className="sequence-board-label">YOUR ORDER — DRAG TILES TO REARRANGE</div>

        <div className="sequence-answer-board">

          {sequenceAnswer.map((item, index) => (

            <div

              key={`${item}-${index}`}

              className="sequence-tile"

              draggable={!sequenceVisible}

              onDragStart={() => setDraggedSequenceIndex(index)}

              onDragOver={(event) => event.preventDefault()}

              onDrop={() => draggedOption ? handleOptionDrop(draggedOption, index) : handleSequenceDrop(index)}

              title="Drag to reorder or drop a new tile here"

            >

              <span className="sequence-tile-index">{index + 1}</span>

              <span>{item}</span>

              {!sequenceVisible && (

                <button

                  type="button"

                  className="sequence-remove"

                  onClick={() => removeSequenceItem(index)}

                  aria-label={`Remove tile ${index + 1}`}

                >×</button>

              )}

            </div>

          ))}

          {Array.from({ length: Math.max(0, targetLength - sequenceAnswer.length) }).map((_, index) => (

            <div

              key={`empty-${index}`}

              className="sequence-slot"

              onDragOver={(event) => event.preventDefault()}

              onDrop={() => draggedOption ? handleOptionDrop(draggedOption, sequenceAnswer.length) : handleSequenceDrop(sequenceAnswer.length)}

            >

              {sequenceAnswer.length + index + 1}

            </div>

          ))}

        </div>



        <div className="sequence-board-label">DRAG A TILE FROM THE BANK INTO AN EMPTY SLOT</div>

        <div className="symbol-buttons movable-bank">

          {options.map((item, index) => (

            <button

              key={`${item}-${index}`}

              type="button"

              draggable={!sequenceVisible}

              disabled={sequenceVisible}

              onDragStart={() => setDraggedOption(item)}

              onDragEnd={() => setDraggedOption(null)}

              onClick={() => addSequenceItem(item)}

              title="Drag or click to add"

            >

              {item}

            </button>

          ))}

        </div>

        <div className="sequence-hint">Click to add • Drag tiles to reorder • × removes a tile</div>

        <div className="sequence-display">{sequenceAnswer.length ? sequenceAnswer.join("  ") : "— — — —"}</div>

      </>

    );

  }



  return (

    <main className="spring-chamber">

      <div className="falling-petals" aria-hidden="true">

        {PETALS.map((petal) => (

          <span

            key={petal.id}

            className="falling-petal"

            style={{

              "--petal-left": petal.left,

              "--petal-delay": petal.delay,

              "--petal-duration": petal.duration,

              "--petal-drift": petal.drift,

              "--petal-size": petal.size,

              "--petal-rotate": petal.rotate,

            }}

          >

            {petal.id % 3 === 0 ? "🌸" : petal.id % 3 === 1 ? "🌺" : "🍃"}

          </span>

        ))}

      </div>



      {/* =================================================

          HEADER

      ================================================= */}



      <header className="spring-header">



        <div className="brand-block">

          <div className="brand-name">

            ONES &amp; ZEROS

          </div>



          <div className="brand-subtitle">

            A PUZZLE ADVENTURE

          </div>

        </div>



        <div className="chamber-title">

          <span>🌸</span>



          <div>

            <strong>

              CHAMBER 02 — SPRING

            </strong>



            <small>

              THE THREE-PATH MAZE

            </small>

          </div>

        </div>



        <div className="timer-card">

          <span className="timer-label">

            TIME REMAINING

          </span>



          <span className="timer-value">

            ⏱ {formatTime(timeLeft)}

          </span>

        </div>



        <div className="header-objective">

          Guide all three characters

          <br />

          to their destinations.

        </div>



      </header>



      {/* =================================================

          GAME LAYOUT

      ================================================= */}



      <section className="spring-layout">



        {/* =================================================

            LEFT SIDEBAR

        ================================================= */}



        <aside className="left-sidebar">



          <section className="character-panel">



            <h3>YOUR TEAM</h3>



            {Object.entries(

              CHARACTERS

            ).map(

              ([id, character]) => (

                <button

                  key={id}

                  className={`character-card ${

                    activeCharacter === id

                      ? "active"

                      : ""

                  } character-${character.color}`}

                  onClick={() =>

                    setActiveCharacter(

                      id

                    )

                  }

                >



                  <div className="character-avatar">

                    {character.icon}

                  </div>



                  <div className="character-info">



                    <strong>

                      {character.name}

                    </strong>



                    <span>

                      START {id}

                    </span>



                    <div className="character-progress">

                      <div

                        className="progress-fill"

                        style={{

                          width:

                            samePosition(

                              positions[id],

                              character.goal

                            )

                              ? "100%"

                              : "20%",

                        }}

                      />

                    </div>



                  </div>



                  <div className="character-status">

                    {samePosition(

                      positions[id],

                      character.goal

                    )

                      ? "✓"

                      : "•"}

                  </div>



                </button>

              )

            )}



          </section>



          <section className="clue-panel">



            <h3>

              COLLECTED CLUES

            </h3>



            <div className="clue-row">

              <span>A</span>



              <strong>

                {samePosition(

                  positions.A,

                  CHARACTERS.A.goal

                )

                  ? "✓"

                  : "—"}

              </strong>

            </div>



            <div className="clue-row">

              <span>B</span>



              <strong>

                {samePosition(

                  positions.B,

                  CHARACTERS.B.goal

                )

                  ? "✓"

                  : "—"}

              </strong>

            </div>



            <div className="clue-row">

              <span>C</span>



              <strong>

                {samePosition(

                  positions.C,

                  CHARACTERS.C.goal

                )

                  ? "✓"

                  : "—"}

              </strong>

            </div>



            <p>

              “Small moves create

              big paths.”

            </p>



          </section>



          <section className="legend-panel">



            <h3>LEGEND</h3>



            <div className="legend-item">

              <span className="legend-icon path">

                •

              </span>

              Path

            </div>



            <div className="legend-item">

              <span className="legend-icon wall">

                ■

              </span>

              Wall

            </div>



            <div className="legend-item">

              <span className="legend-icon gate">

                ▥

              </span>

              Locked Gate

            </div>



            <div className="legend-item">

              <span className="legend-icon key">

                🔑

              </span>

              Key

            </div>



            <div className="legend-item">

              <span className="legend-icon switch">

                ●

              </span>

              Switch

            </div>



            <div className="legend-item">

              <span className="legend-icon trap">

                ▲

              </span>

              Trap

            </div>



          </section>



        </aside>



        {/* =================================================

            MAZE

        ================================================= */}



        <section className="maze-section">



          <div className="maze-topbar">



            <div>

              <span className="maze-status-dot" />



              ACTIVE:

              {" "}



              <strong>

                CHARACTER {activeCharacter}

              </strong>

            </div>



            <div>

              MOVES:

              {" "}



              <strong>

                {moves}

              </strong>

            </div>



            <div>

              KEYS:

              {" "}



              <strong>

                {collectedKeys.length}/3

              </strong>

            </div>



          </div>



          <div className="maze-frame">



            <div

              className="maze-board"

              style={{

                gridTemplateColumns:

                  `repeat(${MAZE[0].length}, 1fr)`,



                gridTemplateRows:

                  `repeat(${MAZE.length}, 1fr)`,

              }}

            >



              {mazeCells.map(

                (cell) => {

                  const character =

                    characterAt(

                      cell.x,

                      cell.y

                    );



                  const key =

                    keyAt(

                      cell.x,

                      cell.y

                    );



                  const switchItem =

                    switchAt(

                      cell.x,

                      cell.y

                    );



                  const trap =

                    trapAt(

                      cell.x,

                      cell.y

                    );



                  const gate =

                    gateAt(

                      cell.x,

                      cell.y

                    );



                  const oneWay =

                    oneWayAt(

                      cell.x,

                      cell.y

                    );



                  const goalA =

                    samePosition(

                      {

                        x: cell.x,

                        y: cell.y,

                      },

                      CHARACTERS.A.goal

                    );



                  const goalB =

                    samePosition(

                      {

                        x: cell.x,

                        y: cell.y,

                      },

                      CHARACTERS.B.goal

                    );



                  const goalC =

                    samePosition(

                      {

                        x: cell.x,

                        y: cell.y,

                      },

                      CHARACTERS.C.goal

                    );



                  return (

                    <div

                      key={`${cell.x}-${cell.y}`}

                      className={`maze-cell ${

                        cell.type === "#"

                          ? "wall-cell"

                          : "path-cell"

                      }`}

                    >



                      {cell.type === "." && (

                        <>



                          {goalA && (

                            <span className="goal goal-a">

                              A

                            </span>

                          )}



                          {goalB && (

                            <span className="goal goal-b">

                              B

                            </span>

                          )}



                          {goalC && (

                            <span className="goal goal-c">

                              C

                            </span>

                          )}



                          {key && (

                            <span

                              className={`maze-key ${

                                collectedKeys.includes(

                                  key.id

                                )

                                  ? "collected"

                                  : ""

                              }`}

                            >

                              🔑

                            </span>

                          )}



                          {switchItem && (

                            <span

                              className={`maze-switch ${

                                activatedSwitches.includes(

                                  switchItem.id

                                )

                                  ? "activated"

                                  : ""

                              }`}

                            >

                              ●

                            </span>

                          )}



                          {trap &&

                            !escapedTraps.includes(

                              trap.id

                            ) && (

                              <span className="maze-trap">

                                ▲

                              </span>

                            )}



                          {gate && (

                            <span

                              className={`maze-gate ${

                                gateIsOpen(

                                  cell.x,

                                  cell.y

                                )

                                  ? "open"

                                  : ""

                              }`}

                            >

                              ▥

                            </span>

                          )}



                          {oneWay && (

                            <span className="maze-oneway">

                              →

                            </span>

                          )}



                          {character && (

                            <span

                              className={`maze-character character-${

                                CHARACTERS[

                                  character[0]

                                ].color

                              } ${

                                activeCharacter ===

                                character[0]

                                  ? "selected"

                                  : ""

                              }`}

                            >

                              {

                                CHARACTERS[

                                  character[0]

                                ].icon

                              }

                            </span>

                          )}



                        </>

                      )}



                    </div>

                  );

                }

              )}



            </div>



            <div className="maze-vignette" />



          </div>



          <div className="game-message">

            <span>✦</span>

            {message}

          </div>



          <div className="movement-controls">



            <div className="control-help">



              <strong>

                CONTROL {activeCharacter}

              </strong>



              <span>

                Use <b>W A S D</b> or

                <b> Arrow Keys</b>

              </span>



            </div>



            <div className="d-pad">



              <button

                onClick={() =>

                  moveCharacter(0, -1)

                }

              >

                ↑

              </button>



              <div className="d-pad-middle">



                <button

                  onClick={() =>

                    moveCharacter(-1, 0)

                  }

                >

                  ←

                </button>



                <button

                  onClick={() =>

                    moveCharacter(1, 0)

                  }

                >

                  →

                </button>



              </div>



              <button

                onClick={() =>

                  moveCharacter(0, 1)

                }

              >

                ↓

              </button>



            </div>



          </div>



        </section>



        {/* =================================================

            RIGHT SIDEBAR

        ================================================= */}



        <aside className="right-sidebar">



          <section className="objective-panel">



            <h3>OBJECTIVE</h3>



            <p>

              Guide all three characters

              through the Spring maze.

            </p>



            <div className="objective-line">

              <span>01</span>

              Find the routes.

            </div>



            <div className="objective-line">

              <span>02</span>

              Collect the keys.

            </div>



            <div className="objective-line">

              <span>03</span>

              Overcome the traps.

            </div>



            <div className="objective-line">

              <span>04</span>

              Reach every goal.

            </div>



          </section>



          <section className="tips-panel">



            <h3>💡 TIPS</h3>



            <ul>

              <li>

                Switch characters using

                the cards.

              </li>



              <li>

                Keys open locked gates.

              </li>



              <li>

                Traps can be solved.

              </li>



              <li>

                Some traps require

                another character.

              </li>



              <li>

                Think about all three

                routes together.

              </li>

            </ul>



          </section>



          <section className="stats-panel">



            <div>

              <span>

                CHARACTERS

              </span>



              <strong>3</strong>

            </div>



            <div>

              <span>KEYS</span>



              <strong>

                {collectedKeys.length}/3

              </strong>

            </div>



            <div>

              <span>MOVES</span>



              <strong>

                {moves}

              </strong>

            </div>



          </section>



          <button

            className="restart-button"

            onClick={

              resetChamber

            }

          >

            ↻

            <span>

              RESTART

            </span>

          </button>



        </aside>



      </section>



      {/* =================================================

          TRAP MODAL

      ================================================= */}



      {activeTrap && (

        <div className="trap-overlay">

          <div className="trap-modal">

            <div className="trap-modal-flower">🌸</div>

            <p className="trap-kicker">CHAMBER 02 • SPRING HAZARD</p>

            <h2>{getTrapTitle(activeTrap.type)}</h2>



            {activeTrap.type === "thorn" && (

              <>

                <p className="trap-description">Memorize the 4-step wind pattern. It disappears before you can enter it.</p>

                <div className={`memory-sequence ${sequenceVisible ? "revealed" : "hidden"}`}>

                  {TRAP_SEQUENCES.thorn.map((item, index) => <span key={index}>{sequenceVisible ? item : "?"}</span>)}

                </div>

                {renderSequenceBuilder(["←", "↑", "→", "↓"])}

              </>

            )}



            {activeTrap.type === "pit" && (

              <>

                <p className="trap-description">A 4-key escape pattern flashes once. Memorize it, then reproduce it before the floor collapses.</p>

                <div className={`memory-sequence ${sequenceVisible ? "revealed" : "hidden"}`}>

                  {TRAP_SEQUENCES.pit.map((item, index) => <span key={index}>{sequenceVisible ? item : "?"}</span>)}

                </div>

                <div className="pit-countdown">{pitTimeLeft}s</div>

                {renderSequenceBuilder(["W", "A", "S", "D"])}

              </>

            )}



            {activeTrap.type === "switch" && (

              <>

                <p className="trap-description">This trap is linked to two remote switches. Character B must activate the blue switch and Character C must activate the green switch.</p>

                <div className="remote-switch-status">

                  <span className={activatedSwitches.includes("switch-B") ? "on" : "off"}>B {activatedSwitches.includes("switch-B") ? "✓" : "○"}</span>

                  <span className={activatedSwitches.includes("switch-C") ? "on" : "off"}>C {activatedSwitches.includes("switch-C") ? "✓" : "○"}</span>

                </div>

                <button className="trap-main-button" onClick={solveSwitchTrap}>CHECK BOTH SWITCHES</button>

                <button className="trap-secondary-button" onClick={closeTrap}>RETURN TO MAZE</button>

              </>

            )}



            {activeTrap.type === "water" && (

              <>

                <p className="trap-description">The water is rising. Memorize four flowers and leaves, then rebuild the bridge pattern from six choices.</p>

                <div className={`memory-sequence ${sequenceVisible ? "revealed" : "hidden"}`}>

                  {TRAP_SEQUENCES.water.map((item, index) => <span key={index}>{sequenceVisible ? item : "?"}</span>)}

                </div>

                {renderSequenceBuilder(WATER_OPTIONS)}

              </>

            )}



            {activeTrap.type === "lock" && (

              <>

                <p className="trap-description">This is the final mechanical lock. It will only release after every one of the three maze keys has been collected.</p>

                <div className="lock-status">🔑 {collectedKeys.length}/3</div>

                <button className="trap-main-button" onClick={solveLockTrap}>CHECK ALL 3 KEYS</button>

                <button className="trap-secondary-button" onClick={closeTrap}>RETURN TO MAZE</button>

              </>

            )}



            {activeTrap.type === "symbol" && (

              <>

                <p className="trap-description">Memorize four symbols. The sequence disappears and must be reconstructed from six possible symbols in a shuffled order.</p>

                <div className={`memory-sequence ${sequenceVisible ? "revealed" : "hidden"}`}>

                  {TRAP_SEQUENCES.symbol.map((item, index) => <span key={index}>{sequenceVisible ? item : "?"}</span>)}

                </div>

                {renderSequenceBuilder(SYMBOL_OPTIONS)}

              </>

            )}



            {(activeTrap.type === "thorn" || activeTrap.type === "pit" || activeTrap.type === "water" || activeTrap.type === "symbol") && (

              <div className="sequence-actions">

                <button className="trap-secondary-button" onClick={clearSequence}>CLEAR</button>

                <button className="trap-main-button" disabled={sequenceVisible || sequenceAnswer.length !== TRAP_SEQUENCES[activeTrap.type].length} onClick={submitSequence}>SUBMIT SEQUENCE</button>

              </div>

            )}



            {trapMessage && <div className="trap-error">⚠️ {trapMessage}</div>}

            <div className="trap-attempts">ATTEMPTS: {trapAttempts}/3</div>

          </div>

        </div>

      )}



      {/* =================================================

          COMPLETION

      ================================================= */}



      {completed && (

        <div className="completion-overlay">



          <div className="completion-card">



            <div className="completion-symbol">

              ✓

            </div>



            <p className="completion-kicker">

              CHAMBER 02

            </p>



            <h2>

              SPRING

              <br />

              CLEARED

            </h2>



            <p>

              All three characters

              reached their destinations.

            </p>



            <div className="binary-reveal">

              <span>

                CHAMBER CODE

              </span>



              <strong>1</strong>

            </div>



            <button

              onClick={

                continueToNextChamber

              }

            >

              ENTER CHAMBER 03 →

            </button>



          </div>



        </div>

      )}



      {/* =================================================

          TIME OVER

      ================================================= */}



      {gameOver &&

        !completed && (

          <div className="completion-overlay">



            <div className="completion-card failure">



              <div className="completion-symbol">

                ×

              </div>



              <p className="completion-kicker">

                TIME EXPIRED

              </p>



              <h2>

                THE SPRING

                <br />

                HAS CLOSED

              </h2>



              <p>

                Your 90-minute game timer

                has reached zero.

              </p>



              <button

                onClick={

                  resetChamber

                }

              >

                TRY AGAIN

              </button>



            </div>



          </div>

        )}



    </main>

  );

}



export default Chamber2;