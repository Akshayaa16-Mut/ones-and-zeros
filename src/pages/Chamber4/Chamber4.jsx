import React, { useCallback, useEffect, useMemo, useState } from "react";



import { useNavigate } from "react-router-dom";



import {



  startChamber,



  completeChamber,



} from "../../lib/chamberProgress";



import "./Chamber4.css";



/* =========================================================



   ONES & ZEROS



   CHAMBER 04 — LOOP



   FINAL CHAMBER ANSWER: 1110101



\========================================================= */



const INITIAL_TIME = 90 * 60;



const FINAL_BINARY = "10";



/* =========================================================



   SYMBOLS



\========================================================= */



const SYMBOLS = [



  {



    id: "circle",



    name: "CIRCLE",



    icon: "●",



  },



  {



    id: "diamond",



    name: "DIAMOND",



    icon: "◆",



  },



  {



    id: "triangle",



    name: "TRIANGLE",



    icon: "▲",



  },



  {



    id: "square",



    name: "SQUARE",



    icon: "■",



  },



  {



    id: "star",



    name: "STAR",



    icon: "★",



  },



];



/* =========================================================



   ROUNDS



\========================================================= */



const ROUNDS = [



  {



    id: 1,



    name: "PATTERN BREAK",



    difficulty: "HARD",



  },



  {



    id: 2,



    name: "GUESS THE CARDS",



    difficulty: "VERY HARD",



  },



  {



    id: 3,



    name: "LOGIC LOCK",



    difficulty: "VERY HARD",



  },



  {



    id: 4,



    name: "CONTAINER SHUFFLE",



    difficulty: "EXTREME",



  },



];



/* =========================================================



   ROUND 1



   MULTI-STEP PATTERN



\========================================================= */



const PATTERN_PUZZLES = [



  {



    id: 1,



    sequence: [



      "●",



      "◆",



      "●",



      "▲",



      "◆",



      "●",



      "▲",



      "◆",



      "?",



    ],



    options: [



      "●",



      "◆",



      "▲",



      "■",



    ],



    answer: "●",



    explanation:



      "The repeating structure is built from overlapping cycles: ● ◆ ● ▲ ◆ ● ▲ ◆ ●.",



  },



  {



    id: 2,



    sequence: [



      "1",



      "2",



      "4",



      "7",



      "11",



      "16",



      "22",



      "?",



    ],



    options: [



      "27",



      "28",



      "29",



      "30",



    ],



    answer: "29",



    explanation:



      "The differences are +1, +2, +3, +4, +5, +6, +7.",



  },



  {



    id: 3,



    sequence: [



      "●",



      "▲",



      "■",



      "●",



      "◆",



      "■",



      "▲",



      "◆",



      "?",



    ],



    options: [



      "●",



      "▲",



      "■",



      "◆",



    ],



    answer: "●",



    explanation:



      "The pattern uses paired symbol relationships and returns to the first symbol.",



  },



];



/* =========================================================



   ROUND 2



   GUESS THE CARDS



\========================================================= */



const shuffleArray = (array) => {



  const result = [...array];



  for (let i = result.length - 1; i> 0; i--) {



    const j = Math.floor(Math.random() * (i + 1));



    [result[i], result[j]] = [result[j], result[i]];



  }



  return result;



};



const createCardPuzzle = () => {



  const names = SYMBOLS.map((symbol) => symbol.name);



  const secret = shuffleArray(names);



  let player = shuffleArray(names);



  while (player.join("|") === secret.join("|")) {



    player = shuffleArray(names);



  }



  return {



    secret,



    player,



  };



};



const getSymbol = (name) => {



  return SYMBOLS.find((symbol) => symbol.name === name);



};



/* =========================================================



   ROUND 3



   LOGIC LOCK



\=========================================================



   Secret arrangement:



   Position 1 = DIAMOND



   Position 2 = CIRCLE



   Position 3 = STAR



   Position 4 = TRIANGLE



   Position 5 = SQUARE



   Clues are designed so the player must deduce it.



\========================================================= */



const LOGIC_SYMBOLS = [



  "CIRCLE",



  "DIAMOND",



  "TRIANGLE",



  "SQUARE",



  "STAR",



];



const LOGIC_CLUES = [



  "CIRCLE is immediately after DIAMOND.",



  "STAR is somewhere to the right of CIRCLE.",



  "TRIANGLE is immediately before SQUARE.",



  "DIAMOND is not in position 4 or 5.",



  "STAR is not in position 1 or 2.",



  "The TRIANGLE–SQUARE pair is to the right of STAR.",



];



/*



   Correct solution:



   DIAMOND



   CIRCLE



   STAR



   TRIANGLE



   SQUARE



*/



const LOGIC_SOLUTION = [



  "DIAMOND",



  "CIRCLE",



  "STAR",



  "TRIANGLE",



  "SQUARE",



];



/* =========================================================



   ROUND 4



   CONTAINER SHUFFLE



\=========================================================



   We begin with:



   A = CIRCLE



   B = TRIANGLE



   C = STAR



   D = DIAMOND



   E = SQUARE



   Operations:



   1. B <-> D



   2. A <-> E



   3. Move STAR two positions right



   4. Swap the container holding DIAMOND with



      the container immediately to its left



   5. Reverse positions 2-5



   Final:



   E? etc.



   We calculate using the exact operation function



   below rather than exposing the answer.



\========================================================= */



const INITIAL_CONTAINERS = [



  "CIRCLE",



  "TRIANGLE",



  "STAR",



  "DIAMOND",



  "SQUARE",



];



const applyContainerOperations = (initial) => {



  let state = [...initial];



  // 1. B <-> D



  [state[1], state[3]] = [state[3], state[1]];



  // 2. A <-> E



  [state[0], state[4]] = [state[4], state[0]];



  // 3. Move STAR two positions right



  const starIndex = state.indexOf("STAR");



  if (starIndex !== -1) {



    const [star] = state.splice(starIndex, 1);



    const newIndex = Math.min(



      starIndex + 2,



      state.length



    );



    state.splice(newIndex, 0, star);



  }



  // 4. DIAMOND swaps with container immediately left



  const diamondIndex = state.indexOf("DIAMOND");



  if (diamondIndex> 0) {



    [state[diamondIndex], state[diamondIndex - 1]] = [



      state[diamondIndex - 1],



      state[diamondIndex],



    ];



  }



  // 5. Reverse positions 2-5



  const secondToFifth = state



    .slice(1, 5)



    .reverse();



  state.splice(1, 4, ...secondToFifth);



  return state;



};



const CONTAINER_SOLUTION = applyContainerOperations(



  INITIAL_CONTAINERS



);



/* =========================================================



   HELPERS



\========================================================= */



const formatTime = (seconds) => {



  const safe = Math.max(0, seconds);



  const minutes = Math.floor(safe / 60);



  const remainingSeconds = safe % 60;



  return `${String(minutes).padStart(2, "0")}:${String(



    remainingSeconds



  ).padStart(2, "0")}`;



};



/* =========================================================



   COMPONENT



\========================================================= */



export default function Chamber4() {



  const navigate = useNavigate();



  /* =======================================================



     CHAMBER 04 PROGRESS / TIMING



  ======================================================= */



  useEffect(() => {



    startChamber(4).catch((error) => {



      console.error("Chamber 4 start error:", error);



    });



  }, []);



  /* =======================================================



     GLOBAL TIMER



  ======================================================= */



  const getRemainingTime = () => {

    const savedStart = localStorage.getItem("onesZerosStartTime");



    if (!savedStart) {

      return 0;

    }



    const startTime = Number(savedStart);



    if (!Number.isFinite(startTime) || startTime <= 0) {

      return 0;

    }



    return Math.max(

      0,

      INITIAL_TIME -

        Math.floor((Date.now() - startTime) / 1000)

    );

  };



  const [timeLeft, setTimeLeft] = useState(getRemainingTime);



  /* =======================================================

     GENERAL STATE

  ======================================================= */



  const [roundIndex, setRoundIndex] = useState(0);



  const [completedRounds, setCompletedRounds] =

    useState([]);



  const [moves, setMoves] = useState(0);



  const [mistakes, setMistakes] = useState(0);



  const [message, setMessage] = useState(

    "The system is watching. Think before you choose."

  );



  const [looping, setLooping] = useState(false);



  const [completed, setCompleted] = useState(false);



  const [gameOver, setGameOver] = useState(false);



  const currentRound = ROUNDS[roundIndex];



  /* =======================================================

     ROUND 1

  ======================================================= */



  const [patternIndex, setPatternIndex] = useState(0);



  const [patternSolved, setPatternSolved] =

    useState(false);



  const patternPuzzle =

    PATTERN_PUZZLES[patternIndex];



  /* =======================================================

     ROUND 2

  ======================================================= */



  const initialCardPuzzle = useMemo(

    () => createCardPuzzle(),

    []

  );



  const [secretCardOrder, setSecretCardOrder] =

    useState(initialCardPuzzle.secret);



  const [playerCardOrder, setPlayerCardOrder] =

    useState(initialCardPuzzle.player);



  const [draggedCardIndex, setDraggedCardIndex] =

    useState(null);



  const [selectedCardIndex, setSelectedCardIndex] =

    useState(null);



  const [cardFeedback, setCardFeedback] =

    useState("");



  const [cardAttempts, setCardAttempts] =

    useState(0);



  const [cardSolved, setCardSolved] =

    useState(false);



  /* =======================================================

     ROUND 3

  ======================================================= */



  const [logicOrder, setLogicOrder] =

    useState(() => shuffleArray(LOGIC_SYMBOLS));



  const [logicSelectedIndex, setLogicSelectedIndex] =

    useState(null);



  const [logicFeedback, setLogicFeedback] =

    useState("");



  const [logicSolved, setLogicSolved] =

    useState(false);



  /* =======================================================

     ROUND 4

  ======================================================= */



  const [containerOrder, setContainerOrder] =

    useState(INITIAL_CONTAINERS);



  const [selectedContainerIndex, setSelectedContainerIndex] =

    useState(null);



  const [containerFeedback, setContainerFeedback] =

    useState("");



  const [containerSolved, setContainerSolved] =

    useState(false);



  /* =======================================================

     TIMER

  ======================================================= */



  useEffect(() => {

    if (gameOver || completed) {

      return undefined;

    }



    const tick = () => {

      const remaining = getRemainingTime();



      setTimeLeft(remaining);



      if (remaining <= 0) {

        setGameOver(true);

      }

    };



    tick();



    const interval = window.setInterval(tick, 1000);



    return () => window.clearInterval(interval);

  }, [gameOver, completed]);



  /* =======================================================

     LOOP



  ======================================================= */



  const triggerLoop = useCallback(() => {
  setLooping(true);

  setTimeout(() => {
    setLooping(false);

    /*
      CHAMBER 04 LOOP RULE

      Any wrong answer in ANY round sends the
      player back to ROUND 01 of CHAMBER 04.

      The player does NOT leave Chamber 04.
      The global 90-minute timer continues.
    */

    // Start Chamber 04 again from Round 01
    setRoundIndex(0);

    // Clear previous round completion state
    setCompletedRounds([]);

    // -----------------------------
    // ROUND 1 RESET
    // -----------------------------
    setPatternIndex(0);
    setPatternSolved(false);

    // -----------------------------
    // ROUND 2 RESET
    // -----------------------------
    const puzzle = createCardPuzzle();

    setSecretCardOrder(puzzle.secret);
    setPlayerCardOrder(puzzle.player);

    setDraggedCardIndex(null);
    setSelectedCardIndex(null);
    setCardFeedback("");
    setCardAttempts(0);
    setCardSolved(false);

    // -----------------------------
    // ROUND 3 RESET
    // -----------------------------
    setLogicOrder(
      shuffleArray(LOGIC_SYMBOLS)
    );

    setLogicSelectedIndex(null);
    setLogicFeedback("");
    setLogicSolved(false);

    // -----------------------------
    // ROUND 4 RESET
    // -----------------------------
    setContainerOrder([
      ...INITIAL_CONTAINERS
    ]);

    setSelectedContainerIndex(null);
    setContainerFeedback("");
    setContainerSolved(false);

    // -----------------------------
    // LOOP MESSAGE
    // -----------------------------
    setMessage(
      "LOOP DETECTED — Chamber 04 has restarted from Round 01."
    );

  }, 1200);

}, []);


  /* =======================================================



     COMPLETE ROUND



  ======================================================= */



  const completeRound = useCallback(



    (roundNumber) => {



      setCompletedRounds((previous) => {



        if (previous.includes(roundNumber)) {



          return previous;



        }



        return [...previous, roundNumber];



      });



      if (roundNumber === 4) {



        /*



           FINAL CHAMBER 4 RESULT



           EXACTLY 1110101



        */



        sessionStorage.setItem(



          "onesZerosChamber4Result",



          FINAL_BINARY



        );



        sessionStorage.setItem(



          "onesZerosChamber4Completed",



          "true"



        );



        setCompleted(true);



        completeChamber({



          chamberNumber: 4,



          resultCode: FINAL_BINARY,



          score: 0,



        }).catch((error) => {



          console.error("Chamber 4 completion error:", error);



        });



        return;



      }



      setMessage(



        `ROUND ${roundNumber} COMPLETE — proceed to the next layer.`



      );



      setTimeout(() => {



        setRoundIndex(roundNumber);



      }, 700);



    },



    []



  );



  /* =======================================================



     ROUND 1 — PATTERN



  ======================================================= */



  const handlePatternAnswer = (answer) => {



    if (patternSolved) {



      return;



    }



    setMoves((value) => value + 1);



    if (answer === patternPuzzle.answer) {



      setPatternSolved(true);



      setMessage(



        "Pattern decoded. The loop continues."



      );



      completeRound(1);



      return;



    }



    setMistakes((value) => value + 1);



    setMessage(



      "Wrong deduction. The pattern is deeper than it appears."



    );



    triggerLoop();



  };



  /* =======================================================



     ROUND 2 — DRAG



  ======================================================= */



  const handleDragStart = (event, index) => {



    if (cardSolved) {



      return;



    }



    setDraggedCardIndex(index);



    event.dataTransfer.effectAllowed = "move";



    event.dataTransfer.setData(



      "text/plain",



      String(index)



    );



  };



  const handleDragOver = (event) => {



    event.preventDefault();



    event.dataTransfer.dropEffect = "move";



  };



  const handleDrop = (event, targetIndex) => {



    event.preventDefault();



    if (cardSolved) {



      return;



    }



    let sourceIndex = draggedCardIndex;



    if (sourceIndex === null) {



      const value =



        event.dataTransfer.getData("text/plain");



      if (value !== "") {



        sourceIndex = Number(value);



      }



    }



    if (



      sourceIndex === null ||



      Number.isNaN(sourceIndex)



    ) {



      return;



    }



    if (sourceIndex === targetIndex) {



      setDraggedCardIndex(null);



      return;



    }



    const updated = [...playerCardOrder];



    [updated[sourceIndex], updated[targetIndex]] = [



      updated[targetIndex],



      updated[sourceIndex],



    ];



    setPlayerCardOrder(updated);



    setSelectedCardIndex(null);



    setDraggedCardIndex(null);



    setCardFeedback("");



    setMoves((value) => value + 1);



    setMessage(



      "Arrangement changed. Submit your deduction."



    );



  };



  /* =======================================================



     ROUND 2 — CLICK SWAP



  ======================================================= */



  const handleCardClick = (index) => {



    if (cardSolved) {



      return;



    }



    if (selectedCardIndex === null) {



      setSelectedCardIndex(index);



      setMessage(



        `POSITION ${index + 1} SELECTED — select another position.`



      );



      return;



    }



    if (selectedCardIndex === index) {



      setSelectedCardIndex(null);



      setMessage("Selection cancelled.");



      return;



    }



    const updated = [...playerCardOrder];



    [updated[selectedCardIndex], updated[index]] = [



      updated[index],



      updated[selectedCardIndex],



    ];



    setPlayerCardOrder(updated);



    setSelectedCardIndex(null);



    setCardFeedback("");



    setMoves((value) => value + 1);



    setMessage("Two positions swapped.");



  };



  /* =======================================================



     ROUND 2 — SUBMIT



  ======================================================= */



  const submitCardGuess = () => {



    if (cardSolved) {



      return;



    }



    let correctPositions = 0;



    for (let i = 0; i < 5; i++) {



      if (



        playerCardOrder[i] ===



        secretCardOrder[i]



      ) {



        correctPositions++;



      }



    }



    const nextAttempt = cardAttempts + 1;



    setCardAttempts(nextAttempt);



    setMoves((value) => value + 1);



    /*



       PERFECT



    */



    if (correctPositions === 5) {



      setCardFeedback(



        "5 CORRECT — PERFECT ARRANGEMENT"



      );



      setCardSolved(true);



      setMessage(



        "Hidden arrangement decoded."



      );



      completeRound(2);



      return;



    }



    /*



       COUNT ONLY.



       NEVER reveal positions.



    */



    setCardFeedback(



      `${correctPositions} CORRECT`



    );



    setMessage(



      "Only the number of correct positions has been revealed."



    );



    /*



       Five failed guesses = LOOP



    */



    /*
   WRONG ANSWER = LOOP

   Any failed Round 2 submission immediately
   sends the player back to Round 01
   of Chamber 04.
*/
/*
   ROUND 2 — FIVE ATTEMPTS

   The player gets exactly 5 guesses.
   Guesses 1–4:
   - Stay in Round 2
   - Show the number of correct positions

   Guess 5:
   - If still wrong → LOOP
   - Return to Round 01 of Chamber 04
*/

setMistakes((value) => value + 1);

if (nextAttempt >= 6) {
  // 5th wrong guess → trigger the Chamber 04 loop
  setCardFeedback("5 FAILED GUESSES — LOOP DETECTED.");
  setSelectedCardIndex(null);

  triggerLoop();
  return;
}

// Attempts 1–4: remain in Round 2
setCardFeedback(
  `${correctPositions} CORRECT — ${6 - nextAttempt} ATTEMPTS REMAINING`
);

setSelectedCardIndex(null);

setMessage(
  `Wrong arrangement. ${6 - nextAttempt} guess${
    6 - nextAttempt === 1 ? "" : "es"
  } remaining.`
);



  };



  /* =======================================================



     NEW CARD PUZZLE



  ======================================================= */



  const createNewCardPuzzleForPlayer = () => {



    const puzzle = createCardPuzzle();



    setSecretCardOrder(puzzle.secret);



    setPlayerCardOrder(puzzle.player);



    setCardFeedback("");



    setCardAttempts(0);



    setSelectedCardIndex(null);



    setDraggedCardIndex(null);



    setCardSolved(false);



    setMessage(



      "A completely new hidden arrangement has been generated."



    );



  };



  /* =======================================================



     ROUND 3 — LOGIC LOCK



  ======================================================= */



  const handleLogicClick = (index) => {



    if (logicSolved) {



      return;



    }



    if (logicSelectedIndex === null) {



      setLogicSelectedIndex(index);



      setLogicFeedback(



        `POSITION ${index + 1} SELECTED`



      );



      return;



    }



    if (logicSelectedIndex === index) {



      setLogicSelectedIndex(null);



      setLogicFeedback("");



      return;



    }



    const updated = [...logicOrder];



    [updated[logicSelectedIndex], updated[index]] = [



      updated[index],



      updated[logicSelectedIndex],



    ];



    setLogicOrder(updated);



    setLogicSelectedIndex(null);



    setLogicFeedback(



      "Positions swapped. Continue solving the constraints."



    );



    setMoves((value) => value + 1);



  };



  const submitLogicLock = () => {



    if (logicSolved) {



      return;



    }



    const solved =



      logicOrder.every(



        (value, index) =>



          value === LOGIC_SOLUTION[index]



      );



    setMoves((value) => value + 1);



    if (solved) {



      setLogicSolved(true);



      setLogicFeedback(



        "LOCK OPEN — ALL CONSTRAINTS SATISFIED."



      );



      setMessage(



        "The five-position logic lock has been solved."



      );



      completeRound(3);



      return;



    }



    setMistakes((value) => value + 1);



    setLogicFeedback(



      "LOCK REJECTED — one or more constraints are violated."



    );



    setMessage(



      "Check the relationships between the positions."



    );



    triggerLoop();



  };



  /* =======================================================



     ROUND 4 — CONTAINER SHUFFLE



  ======================================================= */



  const handleContainerSwap = (index) => {



    if (containerSolved) {



      return;



    }



    if (selectedContainerIndex === null) {



      setSelectedContainerIndex(index);



      setContainerFeedback(



        `POSITION ${index + 1} SELECTED — SELECT ANOTHER CONTAINER`



      );



      return;



    }



    if (selectedContainerIndex === index) {



      setSelectedContainerIndex(null);



      setContainerFeedback("SELECTION CANCELLED.");



      return;



    }



    const updated = [...containerOrder];



    [updated[selectedContainerIndex], updated[index]] = [



      updated[index],



      updated[selectedContainerIndex],



    ];



    setContainerOrder(updated);



    setSelectedContainerIndex(null);



    setMoves((value) => value + 1);



    setContainerFeedback(



      `POSITIONS ${selectedContainerIndex + 1} ↔ ${index + 1} SWAPPED`



    );



  };



  /*



     Instead of letting the player simply click



     the answer, the final round requires them to



     reproduce the final container arrangement.



  */



  const submitContainerSolution = () => {



    if (containerSolved) {



      return;



    }



    const solved =



      containerOrder.every(



        (value, index) =>



          value === CONTAINER_SOLUTION[index]



      );



    setMoves((value) => value + 1);



    if (solved) {



      setContainerSolved(true);



      setContainerFeedback(



        "SYSTEM STATE MATCHED — CONTAINER LOCK OPEN."



      );



      setMessage(



        "You reconstructed the hidden sequence of movements."



      );



      completeRound(4);



      return;



    }



    setMistakes((value) => value + 1);



    setContainerFeedback(



      "WRONG STATE — reconstruct the operations carefully."



    );



    setMessage(



      "The final container state does not match."



    );



    triggerLoop();



  };



  /* =======================================================



     RESET CHAMBER



  ======================================================= */



  const restartChamber = () => {



    setRoundIndex(0);



    setCompletedRounds([]);



    setMoves(0);



    setMistakes(0);



    setMessage(



      "Chamber reset. The system has generated a new run."



    );



    setLooping(false);



    setCompleted(false);



    setGameOver(false);



    /* Round 1 */



    setPatternIndex(0);



    setPatternSolved(false);



    /* Round 2 */



    const puzzle = createCardPuzzle();



    setSecretCardOrder(puzzle.secret);



    setPlayerCardOrder(puzzle.player);



    setDraggedCardIndex(null);



    setSelectedCardIndex(null);



    setCardFeedback("");



    setCardAttempts(0);



    setCardSolved(false);



    /* Round 3 */



    setLogicOrder(



      shuffleArray(LOGIC_SYMBOLS)



    );



    setLogicSelectedIndex(null);



    setLogicFeedback("");



    setLogicSolved(false);



    /* Round 4 */



    setContainerOrder([...INITIAL_CONTAINERS]);



    setSelectedContainerIndex(null);



    setContainerFeedback("");



    setContainerSolved(false);



  };



  /* =======================================================



     ROUND PROGRESS



  ======================================================= */



  const roundProgress = `${roundIndex + 1} / ${ROUNDS.length}`;



  /* =======================================================



     RENDER



  ======================================================= */



  return (



    <div className="chamber4-page">



      {/* ===================================================



          HEADER



      =================================================== */}



      <header className="chamber4-header">



        <div className="brand">



          <span className="brand-small">



            ONES & ZEROS



          </span>



          <h1>



            CHAMBER 04



          </h1>



          <span className="chamber-name">



            LOOP



          </span>



        </div>



        <div className="timer">



          <span>



            TIME



          </span>



          <strong>



            {formatTime(timeLeft)}



          </strong>



        </div>



      </header>



      {/* ===================================================



          MAIN



      =================================================== */}



      <main className="chamber4-layout">



        {/* =================================================



            LEFT SIDEBAR



        ================================================= */}



        <aside className="chamber4-sidebar">



          <div className="side-card">



            <span className="side-label">



              CHAMBER



            </span>



            <strong>



              04 — LOOP



            </strong>



          </div>



          <div className="side-card">



            <span className="side-label">



              ROUND



            </span>



            <strong>



              {roundProgress}



            </strong>



          </div>



          <div className="side-card">



            <span className="side-label">



              MOVES



            </span>



            <strong>



              {moves}



            </strong>



          </div>



          <div className="side-card">



            <span className="side-label">



              ERRORS



            </span>



            <strong>



              {mistakes}



            </strong>



          </div>



          <div className="round-list">



            {ROUNDS.map((round, index) => (



              <div



                key={round.id}



                className={`



                  round-item



                  ${



                    index === roundIndex



                      ? "active"



                      : ""



                  }



                  ${



                    completedRounds.includes(



                      round.id



                    )



                      ? "completed"



                      : ""



                  }



                `}



             >



                <span>



                  0{round.id}



                </span>



                <div>



                  <strong>



                    {round.name}



                  </strong>



                  <small>



                    {round.difficulty}



                  </small>



                </div>



              </div>



            ))}



          </div>



        </aside>



        {/* =================================================



            MAIN GAME



        ================================================= */}



        <section className="chamber4-main">



          <div className="main-heading">



            <span>



              RECURSIVE SYSTEM / DEDUCTION LAYER



            </span>



            <h2>



              {currentRound.name}



            </h2>



            <p>



              {message}



            </p>



          </div>



          {/* =================================================



              ROUND 1



          ================================================= */}



          {currentRound.id === 1 && (



            <div className="game-panel pattern-panel">



              <div className="round-header">



                <span>



                  ROUND 01



                </span>



                <h3>



                  PATTERN BREAK



                </h3>



                <p>



                  The obvious pattern may not be the



                  actual pattern. Find the rule.



                </p>



              </div>



              <div className="pattern-sequence">



                {patternPuzzle.sequence.map(



                  (item, index) => (



                    <div



                      key={index}



                      className={



                        item === "?"



                          ? "pattern-card question"



                          : "pattern-card"



                      }



                   >



                      {item}



                    </div>



                  )



                )}



              </div>



              <div className="pattern-options">



                {patternPuzzle.options.map(



                  (option) => (



                    <button



                      key={option}



                      type="button"



                      onClick={() =>



                        handlePatternAnswer(



                          option



                        )



                      }



                      disabled={patternSolved}



                      className="pattern-option"



                   >



                      {option}



                    </button>



                  )



                )}



              </div>



              <div className="warning-box">



                <strong>



                  WARNING



                </strong>



                <span>



                  A wrong deduction can trigger the LOOP.



                </span>



              </div>



            </div>



          )}



          {/* =================================================



              ROUND 2



          ================================================= */}



          {currentRound.id === 2 && (



            <div className="game-panel card-game-panel">



              <div className="round-header">



                <span>



                  ROUND 02



                </span>



                <h3>



                  GUESS THE CARDS



                </h3>



                <p>



                  Five symbols have been secretly



                  arranged. Discover the hidden order



                  using deduction.



                </p>



              </div>



              <div className="important-rule">



                <strong>



                  CRITICAL RULE



                </strong>



                <span>



                  The system will reveal ONLY the number



                  of correct positions.



                </span>



              </div>



              <div className="card-slots five-card-slots">



                {playerCardOrder.map(



                  (name, index) => {



                    const symbol =



                      getSymbol(name);



                    const selected =



                      selectedCardIndex === index;



                    const dragging =



                      draggedCardIndex === index;



                    return (



                      <button



                        key={`${name}-${index}`}



                        type="button"



                        draggable={!cardSolved}



                        disabled={cardSolved}



                        className={`



                          guess-card



                          ${



                            selected



                              ? "selected-card"



                              : ""



                          }



                          ${



                            dragging



                              ? "dragging-card"



                              : ""



                          }



                        `}



                        onDragStart={(event) =>



                          handleDragStart(



                            event,



                            index



                          )



                        }



                        onDragOver={



                          handleDragOver



                        }



                        onDrop={(event) =>



                          handleDrop(



                            event,



                            index



                          )



                        }



                        onDragEnd={() =>



                          setDraggedCardIndex(



                            null



                          )



                        }



                        onClick={() =>



                          handleCardClick(



                            index



                          )



                        }



                     >



                        <span className="card-number">



                          POSITION {index + 1}



                        </span>



                        <span className="card-symbol">



                          {symbol?.icon}



                        </span>



                        <span className="card-name">



                          {symbol?.name}



                        </span>



                      </button>



                    );



                  }



                )}



              </div>



              {cardFeedback && (



                <div



                  className={`



                    card-feedback



                    ${



                      cardSolved



                        ? "success-feedback"



                        : ""



                    }



                  `}



               >



                  {cardFeedback}



                </div>



              )}



              <div className="card-actions">



                <button



                  type="button"



                  className="secondary-button"



                  onClick={



                    createNewCardPuzzleForPlayer



                  }



                  disabled={cardSolved}



               >



                  NEW HIDDEN ARRANGEMENT



                </button>



                <button



                  type="button"



                  className="primary-button"



                  onClick={



                    submitCardGuess



                  }



                  disabled={cardSolved}



               >



                  SUBMIT GUESS



                </button>



              </div>



              <div className="card-rules">



                <div>



                  <strong>01</strong>



                  <span>



                    Secret order is random.



                  </span>



                </div>



                <div>



                  <strong>02</strong>



                  <span>



                    Rearrange all five cards.



                  </span>



                </div>



                <div>



                  <strong>03</strong>



                  <span>



                    Submit a complete arrangement.



                  </span>



                </div>



                <div>



                  <strong>04</strong>



                  <span>



                    Only correct-position count appears.



                  </span>



                </div>



              </div>



            </div>



          )}



          {/* =================================================



              ROUND 3



          ================================================= */}



          {currentRound.id === 3 && (



            <div className="game-panel logic-panel">



              <div className="round-header">



                <span>



                  ROUND 03



                </span>



                <h3>



                  LOGIC LOCK



                </h3>



                <p>



                  Five symbols. Five positions.



                  Every clue matters.



                </p>



              </div>



              <div className="logic-clues">



                {LOGIC_CLUES.map(



                  (clue, index) => (



                    <div



                      key={clue}



                      className="logic-clue"



                   >



                      <strong>



                        {String(



                          index + 1



                        ).padStart(2, "0")}



                      </strong>



                      <span>



                        {clue}



                      </span>



                    </div>



                  )



                )}



              </div>



              <div className="logic-board">



                {logicOrder.map(



                  (name, index) => {



                    const symbol =



                      getSymbol(name);



                    const selected =



                      logicSelectedIndex ===



                      index;



                    return (



                      <button



                        key={`${name}-${index}`}



                        type="button"



                        disabled={logicSolved}



                        className={`



                          logic-card



                          ${



                            selected



                              ? "selected-card"



                              : ""



                          }



                        `}



                        onClick={() =>



                          handleLogicClick(



                            index



                          )



                        }



                     >



                        <span>



                          POSITION{" "}



                          {index + 1}



                        </span>



                        <strong>



                          {symbol?.icon}



                        </strong>



                        <small>



                          {name}



                        </small>



                      </button>



                    );



                  }



                )}



              </div>



              {logicFeedback && (



                <div



                  className={`



                    logic-feedback



                    ${



                      logicSolved



                        ? "success-feedback"



                        : ""



                    }



                  `}



               >



                  {logicFeedback}



                </div>



              )}



              <div className="logic-actions">



                <button



                  type="button"



                  className="primary-button"



                  onClick={



                    submitLogicLock



                  }



                  disabled={logicSolved}



               >



                  TEST LOGIC LOCK



                </button>



              </div>



            </div>



          )}



          {/* =================================================



              ROUND 4



          ================================================= */}



          {currentRound.id === 4 && (



            <div className="game-panel container-panel">



              <div className="round-header">



                <span>



                  ROUND 04



                </span>



                <h3>



                  CONTAINER SHUFFLE



                </h3>



                <p>



                  The system performed a sequence of



                  movements. Reconstruct the final state.



                </p>



              </div>



              <div className="container-start-state">



                <span>



                  INITIAL STATE



                </span>



                <div className="container-row">



                  {INITIAL_CONTAINERS.map(



                    (name, index) => {



                      const symbol =



                        getSymbol(name);



                      return (



                        <div



                          key={`${name}-${index}`}



                          className="container-card"



                       >



                          <small>



                            CONTAINER {String.fromCharCode(65 + index)}



                          </small>



                          <strong>



                            {symbol?.icon}



                          </strong>



                          <span>



                            {name}



                          </span>



                        </div>



                      );



                    }



                  )}



                </div>



              </div>



              <div className="operation-panel">



                <div className="operation-title">



                  OPERATION SEQUENCE



                </div>



                <div className="operations">



                  <div>



                    <b>01</b>



                    <span>B ↔ D</span>



                  </div>



                  <div>



                    <b>02</b>



                    <span>A ↔ E</span>



                  </div>



                  <div>



                    <b>03</b>



                    <span>Move STAR two positions right.</span>



                  </div>



                  <div>



                    <b>04</b>



                    <span>



                      DIAMOND swaps with the container



                      immediately to its left.



                    </span>



                  </div>



                  <div>



                    <b>05</b>



                    <span>Reverse positions 2–5.</span>



                  </div>



                </div>



              </div>



              <div className="final-state-panel">



                <div className="final-state-heading">



                  <span>RECONSTRUCT FINAL STATE</span>



                  <small>Click two containers to swap them.</small>



                </div>



                <div className="container-row">



                  {containerOrder.map(



                    (name, index) => {



                      const symbol = getSymbol(name);



                      const selected =



                        selectedContainerIndex === index;



                      return (



                        <button



                          key={`${name}-${index}`}



                          type="button"



                          className={`container-card interactive ${



                            selected ? "container-selected" : ""



                          }`}



                          disabled={containerSolved}



                          onClick={() => handleContainerSwap(index)}



                       >



                          <small>POSITION {index + 1}</small>



                          <strong>



                            {symbol?.icon}



                          </strong>



                          <span>{name}</span>



                        </button>



                      );



                    }



                  )}



                </div>



              </div>



              {containerFeedback && (



                <div



                  className={`container-feedback ${



                    containerSolved ? "success-feedback" : ""



                  }`}



               >



                  {containerFeedback}



                </div>



              )}



              <button



                type="button"



                className="primary-button"



                onClick={submitContainerSolution}



                disabled={containerSolved}



             >



                VERIFY FINAL STATE



              </button>



            </div>



          )}



        </section>



        {/* =================================================



            RIGHT PANEL



        ================================================= */}



        <aside className="chamber4-right">



          <div className="objective-card">



            <span>



              OBJECTIVE



            </span>



            <h3>



              BREAK THE LOOP.



            </h3>



            <p>



              Each round requires a different



              type of reasoning.



            </p>



          </div>



          <div className="danger-card">



            <span>



              SYSTEM WARNING



            </span>



            <strong>



              WRONG PATH



            </strong>



            <p>



              Incorrect deductions can send you



              back to an earlier layer.



            </p>



          </div>



          <div className="binary-card">



            <span>



              FINAL OUTPUT



            </span>



            <strong>



              ? ? ? ? ? ? ?



            </strong>



            <small>



              The chamber answer is hidden.



            </small>



          </div>



          <div className="symbol-preview">



            <span>



              SYMBOL SYSTEM



            </span>



            <div>



              {SYMBOLS.map(



                (symbol) => (



                  <span



                    key={symbol.id}



                    title={symbol.name}



                 >



                    {symbol.icon}



                  </span>



                )



              )}



            </div>



          </div>



          <button



            type="button"



            className="restart-button"



            onClick={



              restartChamber



            }



         >



            RESTART CHAMBER



          </button>



        </aside>



      </main>



      {/* ===================================================



          LOOP OVERLAY



      =================================================== */}



      {looping && (



        <div className="loop-overlay">



          <div className="loop-card">



            <div className="loop-symbol">



              ↻



            </div>



            <span>



              SYSTEM FAILURE



            </span>



            <h2>



              LOOP DETECTED



            </h2>



            <p>



              Returning to an earlier state...



            </p>



          </div>



        </div>



      )}



      {/* ===================================================



          TIME EXPIRED



      =================================================== */}



      {gameOver && (



        <div className="result-overlay">



          <div className="result-card">



            <span>



              TIME EXPIRED



            </span>



            <h2>



              SYSTEM LOCKED



            </h2>



            <p>



              The 90-minute game timer has ended.



            </p>



            <button



              type="button"



              onClick={() =>



                navigate("/")



              }



           >



              RETURN TO START



            </button>



          </div>



        </div>



      )}



      {/* ===================================================



          CHAMBER COMPLETE



      =================================================== */}



      {completed && (



        <div className="result-overlay">



          <div className="result-card success">



            <span>



              CHAMBER 04 COMPLETE



            </span>



            <h2>



              LOOP BROKEN



            </h2>



            <p>



              All four reasoning layers have been



              solved.



            </p>



            <div className="result-binary">



              {FINAL_BINARY}



            </div>



            <span className="binary-label">



              CHAMBER 04 BINARY



            </span>



            <p className="final-result-note">



              Keep this sequence. It will be required



              later.



            </p>



            <button



              type="button"



              onClick={() =>



                navigate("/chamber-05")



              }



           >



              ENTER CHAMBER 05 →



            </button>



          </div>



        </div>



      )}



    </div>



  );



}