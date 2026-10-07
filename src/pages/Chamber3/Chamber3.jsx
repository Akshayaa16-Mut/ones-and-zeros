import React, {



  useCallback,



  useEffect,



  useMemo,



  useState,



} from "react";







import { useNavigate } from "react-router-dom";
import {
  startChamber,
  completeChamber,
} from "../../lib/chamberProgress";







import "./Chamber3.css";







/* =========================================================



   CHAMBER 03 — BUBBLE



   =========================================================







   ROUND 1



   -------



   Normal numbers



   Visible swapping



   Easy







   ROUND 2



   -------



   Colored bubbles



   Overlapping bubbles



   Visible swapping



   Medium







   ROUND 3



   -------



   Binary numbers



   No visible swap animation



   Very Hard



   Main ONES & ZEROS connection







========================================================= */











/* =========================================================



   ROUND CONFIGURATION



========================================================= */







const ROUNDS = [



  {



    id: 1,







    name: "FIRST BUBBLE",







    difficulty: "EASY",







    count: 5,







    mistakesAllowed: Infinity,







    colors: ["purple"],







    binaryMode: false,







    animatedSwap: true,



  },







  {



    id: 2,







    name: "CROSSFLOW",







    difficulty: "MEDIUM",







    count: 7,







    mistakesAllowed: 5,







    colors: [



      "purple",



      "blue",



      "pink",



    ],







    binaryMode: false,







    animatedSwap: true,



  },







  {



    id: 3,







    name: "ONES & ZEROS",







    difficulty: "VERY HARD",







    count: 12,







    mistakesAllowed: 3,







    colors: [



      "purple",



      "blue",



      "pink",



      "green",



      "orange",



    ],







    binaryMode: true,







    animatedSwap: false,



  },



];











/* =========================================================



   BUBBLE COLORS



========================================================= */







const COLOR_MAP = {



  pink: "#d96aa6",







  purple: "#8258d6",







  blue: "#628be8",







  green: "#42c5a2",







  orange: "#ef935f",



};











/* =========================================================



   GLOBAL GAME TIMER



========================================================= */







const INITIAL_TIME = 90 * 60;











/* =========================================================



   CREATE BUBBLES



========================================================= */







const createBubbles = (round) => {



  const numbers = Array.from(



    {



      length: round.count,



    },



    (_, index) => index + 1



  );











  /*



    Fisher-Yates shuffle



  */







  for (



    let i = numbers.length - 1;



    i > 0;



    i--



  ) {



    const j = Math.floor(



      Math.random() * (i + 1)



    );







    [



      numbers[i],



      numbers[j],



    ] = [



      numbers[j],



      numbers[i],



    ];



  }











  return numbers.map(



    (number, index) => ({



      id: `round-${round.id}-bubble-${index}-${Date.now()}-${Math.random()}`,







      /*



        Internal decimal value.







        The game uses this for sorting.



      */







      number,







      /*



        Binary representation.







        Example:







        1  = 0001



        2  = 0010



        3  = 0011



        4  = 0100



        5  = 0101



        8  = 1000



        12 = 1100



      */







      binary: number



        .toString(2)



        .padStart(4, "0"),







      color:



        round.colors[



          Math.floor(



            Math.random() *



              round.colors.length



          )



        ],



    })



  );



};











/* =========================================================



   CHECK SORTED



========================================================= */







const isSorted = (bubbles) => {



  for (



    let i = 0;



    i < bubbles.length - 1;



    i++



  ) {



    if (



      bubbles[i].number >



      bubbles[i + 1].number



    ) {



      return false;



    }



  }







  return true;



};











/* =========================================================



   FORMAT TIMER



========================================================= */







const formatTime = (seconds) => {



  const safeSeconds = Math.max(



    0,



    seconds



  );







  const minutes = Math.floor(



    safeSeconds / 60



  )



    .toString()



    .padStart(2, "0");







  const secs = (



    safeSeconds % 60



  )



    .toString()



    .padStart(2, "0");







  return `${minutes}:${secs}`;



};











/* =========================================================



   GET BUBBLE SCREEN POSITION



========================================================= */







const getBubblePosition = (



  index,



  count,



  roundId



) => {







  /* =======================================================



     ROUND 1



     ======================================================= */







  if (count === 5) {



    const positions = [



      10,



      30,



      50,



      70,



      90,



    ];







    return {



      left: `${positions[index]}%`,



      top: "50%",



    };



  }











  /* =======================================================



     ROUND 2



     ======================================================= */







  if (count === 7) {



    const positions = [



      7,



      21,



      35,



      50,



      65,



      79,



      93,



    ];







    let x = positions[index];







    let y = 50;











    /*



      Small overlap groups.



    */







    if (



      index === 1 ||



      index === 2



    ) {



      x +=



        index === 1



          ? -2



          : 2;







      y = 46;



    }











    if (



      index === 4 ||



      index === 5



    ) {



      x +=



        index === 4



          ? -2



          : 2;







      y = 54;



    }











    return {



      left: `${x}%`,



      top: `${y}%`,



    };



  }











  /* =======================================================



     ROUND 3



     ======================================================= */







  const positions = [



    5,



    13,



    21,



    29,



    37,



    45,



    55,



    63,



    71,



    79,



    87,



    95,



  ];







  let x = positions[index];







  let y = 50;











  /*



    Harder overlap groups.



  */







  const overlapOffsets = {



    1: -2,



    2: 2,







    4: -2,



    5: 2,







    7: -2,



    8: 2,







    10: -2,



    11: 2,



  };











  x +=



    overlapOffsets[index] || 0;











  if (



    index === 1 ||



    index === 2 ||



    index === 7 ||



    index === 8



  ) {



    y = 45;



  }











  if (



    index === 4 ||



    index === 5 ||



    index === 10 ||



    index === 11



  ) {



    y = 55;



  }











  return {



    left: `${x}%`,



    top: `${y}%`,



  };



};











/* =========================================================



   CHECK OVERLAP



========================================================= */







const areOverlapping = (



  firstIndex,



  secondIndex,



  count,



  roundId



) => {



  const first =



    getBubblePosition(



      firstIndex,



      count,



      roundId



    );







  const second =



    getBubblePosition(



      secondIndex,



      count,



      roundId



    );











  const firstX =



    parseFloat(first.left);







  const secondX =



    parseFloat(second.left);







  const firstY =



    parseFloat(first.top);







  const secondY =



    parseFloat(second.top);











  const distance =



    Math.sqrt(



      Math.pow(



        firstX - secondX,



        2



      ) +



        Math.pow(



          firstY - secondY,



          2



        )



    );











  return distance < 7;



};











/* =========================================================



   FIND OVERLAPPING PAIRS



========================================================= */







const findOverlappingPairs = (



  bubbles,



  roundId



) => {



  const pairs = [];











  for (



    let i = 0;



    i < bubbles.length;



    i++



  ) {



    for (



      let j = i + 1;



      j < bubbles.length;



      j++



    ) {



      if (



        areOverlapping(



          i,



          j,



          bubbles.length,



          roundId



        )



      ) {



        pairs.push([



          bubbles[i].id,



          bubbles[j].id,



        ]);



      }



    }



  }











  return pairs;



};











/* =========================================================



   MAIN COMPONENT



========================================================= */







function Chamber3() {



  const navigate = useNavigate();

  /* =======================================================
     CHAMBER 03 PROGRESS / TIMING
  ======================================================= */

  useEffect(() => {
    startChamber(3).catch((error) => {
      console.error("Chamber 3 start error:", error);
    });
  }, []);











  /* =======================================================



     ROUND



  ======================================================= */







  const [



    roundIndex,



    setRoundIndex,



  ] = useState(0);











  const currentRound =



    ROUNDS[roundIndex];











  /* =======================================================



     BUBBLES



  ======================================================= */







  const [



    bubbles,



    setBubbles,



  ] = useState(() =>



    createBubbles(



      ROUNDS[0]



    )



  );











  /* =======================================================



     DRAG / CLICK STATE



  ======================================================= */







  const [



    draggedId,



    setDraggedId,



  ] = useState(null);











  const [



    selectedId,



    setSelectedId,



  ] = useState(null);











  /* =======================================================



     STATS



  ======================================================= */







  const [



    moves,



    setMoves,



  ] = useState(0);











  const [



    mistakes,



    setMistakes,



  ] = useState(0);











  /* =======================================================



     MESSAGE



  ======================================================= */







  const [



    message,



    setMessage,



  ] = useState(



    "Sort the bubbles from smallest to largest."



  );











  /* =======================================================



     GAME STATES



  ======================================================= */







  const [



    roundCompleted,



    setRoundCompleted,



  ] = useState(false);











  const [



    gameCompleted,



    setGameCompleted,



  ] = useState(false);











  const [



    gameOver,



    setGameOver,



  ] = useState(false);











  /* =======================================================



     RULES



  ======================================================= */







  const [



    showRules,



    setShowRules,



  ] = useState(true);











  /* =======================================================



     HINT



  ======================================================= */







  const [



    showHint,



    setShowHint,



  ] = useState(false);











  /* =======================================================



     TIMER



  ======================================================= */







  const [
    timeLeft,
    setTimeLeft,
  ] = useState(() => {
    const startTime = Number(
      localStorage.getItem(
        "onesZerosStartTime"
      )
    );

    if (
      !Number.isFinite(startTime) ||
      startTime <= 0
    ) {
      return 0;
    }

    const elapsed = Math.floor(
      (Date.now() - startTime) / 1000
    );

    return Math.max(
      0,
      INITIAL_TIME - elapsed
    );
  });











  /* =======================================================



     OVERLAPPING BUBBLES



  ======================================================= */







  const overlappingPairs =



    useMemo(



      () =>



        findOverlappingPairs(



          bubbles,



          currentRound.id



        ),



      [



        bubbles,



        currentRound.id,



      ]



    );











  /* =======================================================



     HIDDEN BUBBLES



  ======================================================= */







  const hiddenBubbleIds =



    useMemo(() => {







      /*



        Round 1 has no hidden bubbles.



      */







      if (



        currentRound.id === 1



      ) {



        return [];



      }











      const hidden =



        new Set();











      overlappingPairs.forEach(



        ([id1, id2]) => {







          const firstIndex =



            bubbles.findIndex(



              (bubble) =>



                bubble.id === id1



            );











          const secondIndex =



            bubbles.findIndex(



              (bubble) =>



                bubble.id === id2



            );











          if (



            firstIndex === -1 ||



            secondIndex === -1



          ) {



            return;



          }











          /*



            Higher index is visually



            above lower index.



          */







          if (



            firstIndex <



            secondIndex



          ) {



            hidden.add(id1);



          } else {



            hidden.add(id2);



          }



        }



      );











      return [



        ...hidden,



      ];



    }, [



      bubbles,



      overlappingPairs,



      currentRound.id,



    ]);











  /* =======================================================



     GLOBAL TIMER



  ======================================================= */







  useEffect(() => {
    if (gameCompleted) {
      return;
    }

    const updateGlobalTimer = () => {
      const startTime = Number(
        localStorage.getItem(
          "onesZerosStartTime"
        )
      );

      if (
        !Number.isFinite(startTime) ||
        startTime <= 0
      ) {
        setTimeLeft(0);
        setGameOver(true);
        return;
      }

      const elapsed = Math.floor(
        (Date.now() - startTime) / 1000
      );

      const remaining = Math.max(
        0,
        INITIAL_TIME - elapsed
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setGameOver(true);
      }
    };

    updateGlobalTimer();

    const timer = setInterval(
      updateGlobalTimer,
      1000
    );

    return () => clearInterval(timer);
  }, [gameCompleted]);












  /* =======================================================



     SAVE PROGRESS



  ======================================================= */







  useEffect(() => {







    sessionStorage.setItem(



      "onesZerosChamber3Round",



      String(



        roundIndex + 1



      )



    );











    sessionStorage.setItem(



      "onesZerosChamber3Moves",



      String(moves)



    );







  }, [



    roundIndex,



    moves,



  ]);











  /* =======================================================



     DRAG START



  ======================================================= */







  const handleDragStart = (



    event,



    bubbleId



  ) => {







    if (



      gameOver ||



      roundCompleted ||



      gameCompleted



    ) {



      return;



    }











    setDraggedId(



      bubbleId



    );











    event.dataTransfer.effectAllowed =



      "move";











    event.dataTransfer.setData(



      "bubbleId",



      bubbleId



    );



  };











  /* =======================================================



     DRAG OVER



  ======================================================= */







  const handleDragOver = (



    event



  ) => {







    event.preventDefault();











    event.dataTransfer.dropEffect =



      "move";



  };











  /* =======================================================



     SWAP BUBBLES



  ======================================================= */







  const swapBubbles =



    useCallback(



      (



        firstId,



        secondId



      ) => {







        if (



          !firstId ||



          !secondId ||



          firstId === secondId



        ) {



          return;



        }











        setBubbles(



          (previous) => {







            const firstIndex =



              previous.findIndex(



                (bubble) =>



                  bubble.id ===



                  firstId



              );











            const secondIndex =



              previous.findIndex(



                (bubble) =>



                  bubble.id ===



                  secondId



              );











            if (



              firstIndex === -1 ||



              secondIndex === -1



            ) {



              return previous;



            }











            const copy = [



              ...previous,



            ];











            /*



              ACTUAL BUBBLE SORT SWAP







              The bubble objects keep



              their IDs.







              Their ARRAY POSITIONS change.







              Therefore:







              Round 1/2:



              CSS visibly moves them.







              Round 3:



              CSS transition is disabled.



            */







            [



              copy[firstIndex],



              copy[secondIndex],



            ] = [



              copy[secondIndex],



              copy[firstIndex],



            ];











            return copy;



          }



        );











        setMoves(



          (previous) =>



            previous + 1



        );











        if (



          currentRound.animatedSwap



        ) {







          setMessage(



            "Swapping bubbles..."



          );







        } else {







          /*



            Round 3



            No visual movement.



          */







          setMessage(



            "Binary order changed."



          );



        }







      },



      [



        currentRound.animatedSwap,



      ]



    );











  /* =======================================================



     DROP BUBBLE



  ======================================================= */







  const handleDrop = (



    event,



    targetId



  ) => {







    event.preventDefault();











    const sourceId =



      event.dataTransfer.getData(



        "bubbleId"



      ) || draggedId;











    if (



      !sourceId ||



      sourceId === targetId



    ) {







      setDraggedId(



        null



      );







      return;



    }











    const sourceIndex =



      bubbles.findIndex(



        (bubble) =>



          bubble.id ===



          sourceId



      );











    const targetIndex =



      bubbles.findIndex(



        (bubble) =>



          bubble.id ===



          targetId



      );











    if (



      sourceIndex === -1 ||



      targetIndex === -1



    ) {







      setDraggedId(



        null



      );







      return;



    }











    /*



      Bubble Sort only permits



      adjacent swaps.



    */







    if (



      Math.abs(



        sourceIndex -



          targetIndex



      ) !== 1



    ) {







      setMessage(



        "Only adjacent bubbles can be swapped."



      );











      setMistakes(



        (previous) =>



          previous + 1



      );











      setDraggedId(



        null



      );











      return;



    }











    swapBubbles(



      sourceId,



      targetId



    );











    setDraggedId(



      null



    );



  };











  /* =======================================================



     CLICK TO SWAP



  ======================================================= */







  const handleBubbleClick =



    (bubbleId) => {







      if (



        gameOver ||



        roundCompleted ||



        gameCompleted



      ) {



        return;



      }











      /*



        First click



      */







      if (!selectedId) {







        setSelectedId(



          bubbleId



        );











        setMessage(



          "Now select an adjacent bubble."



        );











        return;



      }











      /*



        Same bubble



      */







      if (



        selectedId ===



        bubbleId



      ) {







        setSelectedId(



          null



        );











        setMessage(



          "Selection cancelled."



        );











        return;



      }











      const firstIndex =



        bubbles.findIndex(



          (bubble) =>



            bubble.id ===



            selectedId



        );











      const secondIndex =



        bubbles.findIndex(



          (bubble) =>



            bubble.id ===



            bubbleId



        );











      /*



        Adjacent only



      */







      if (



        Math.abs(



          firstIndex -



            secondIndex



        ) !== 1



      ) {







        setMessage(



          "Bubble Sort compares adjacent bubbles only."



        );











        setMistakes(



          (previous) =>



            previous + 1



        );











        setSelectedId(



          null



        );











        return;



      }











      swapBubbles(



        selectedId,



        bubbleId



      );











      setSelectedId(



        null



      );



    };











  /* =======================================================



     HINT



  ======================================================= */







  const giveHint = () => {







    let wrongIndex = -1;











    for (



      let i = 0;



      i < bubbles.length - 1;



      i++



    ) {







      if (



        bubbles[i].number >



        bubbles[i + 1].number



      ) {







        wrongIndex =



          i;







        break;



      }



    }











    if (



      wrongIndex === -1



    ) {







      setMessage(



        "The bubbles are already sorted."



      );











      return;



    }











    setShowHint(



      true



    );











    if (



      currentRound.binaryMode



    ) {







      setMessage(



        `Compare ${bubbles[wrongIndex].binary} and ${bubbles[wrongIndex + 1].binary}.`



      );







    } else {







      setMessage(



        `Compare ${bubbles[wrongIndex].number} and ${bubbles[wrongIndex + 1].number}.`



      );



    }











    setTimeout(() => {







      setShowHint(



        false



      );







    }, 1800);



  };











  /* =======================================================



     REVEAL OVERLAP



  ======================================================= */







  const revealBubbles = () => {







    if (



      currentRound.id === 1



    ) {







      setMessage(



        "There are no hidden bubbles in Round 1."



      );











      return;



    }











    if (



      overlappingPairs.length === 0



    ) {







      setMessage(



        "No overlapping bubbles right now."



      );











      return;



    }











    /*



      Move an overlapping adjacent



      pair.







      This is intentionally limited.



    */







    setBubbles(



      (previous) => {







        const copy = [



          ...previous,



        ];











        for (



          let i = 0;



          i <



          copy.length - 1;



          i++



        ) {







          if (



            areOverlapping(



              i,



              i + 1,



              copy.length,



              currentRound.id



            )



          ) {







            [



              copy[i],



              copy[i + 1],



            ] = [



              copy[i + 1],



              copy[i],



            ];







            break;



          }



        }











        return copy;



      }



    );











    setMoves(



      (previous) =>



        previous + 1



    );











    setMessage(



      "Overlap revealed. Continue sorting."



    );



  };











  /* =======================================================



     CHECK ROUND



  ======================================================= */







  const checkRound =



    () => {







      /*



        Correct



      */







      if (



        isSorted(bubbles)



      ) {







        setRoundCompleted(



          true



        );











        setMessage(



          `Round ${currentRound.id} completed!`



        );











        return;



      }











      /*



        Find first incorrect



        adjacent pair.



      */







      const wrongIndex =



        bubbles.findIndex(



          (bubble, index) =>



            index <



              bubbles.length - 1 &&



            bubble.number >



              bubbles[



                index + 1



              ].number



        );











      if (



        wrongIndex !== -1



      ) {







        if (



          currentRound.binaryMode



        ) {







          setMessage(



            `Not sorted. Compare ${bubbles[wrongIndex].binary} and ${bubbles[wrongIndex + 1].binary}.`



          );







        } else {







          setMessage(



            `Not sorted. Compare ${bubbles[wrongIndex].number} and ${bubbles[wrongIndex + 1].number}.`



          );



        }



      }











      /*



        Check mistake limit.



      */







      if (



        currentRound.mistakesAllowed !==



          Infinity &&



        mistakes >=



          currentRound.mistakesAllowed



      ) {







        setGameOver(



          true



        );



      }



    };











  /* =======================================================



     NEXT ROUND



  ======================================================= */







  const nextRound =



    () => {







      /*



        Last round completed.



      */







      if (



        roundIndex ===



        ROUNDS.length - 1



      ) {







        sessionStorage.setItem(



          "onesZerosChamber3Result",



          "1"



        );











        sessionStorage.setItem(



          "onesZerosChamber3Completed",



          "true"



        );

        completeChamber({
          chamberNumber: 3,
          resultCode: "1",
          score: 0,
        }).catch((error) => {
          console.error("Chamber 3 completion error:", error);
        });











        setGameCompleted(



          true



        );











        return;



      }











      const nextIndex =



        roundIndex + 1;











      const nextRoundData =



        ROUNDS[nextIndex];











      setRoundIndex(



        nextIndex



      );











      setBubbles(



        createBubbles(



          nextRoundData



        )



      );











      setMoves(0);







      setMistakes(0);







      setSelectedId(



        null



      );







      setDraggedId(



        null



      );







      setRoundCompleted(



        false



      );







      setGameOver(



        false



      );







      setShowHint(



        false



      );











      if (



        nextIndex === 1



      ) {







        setMessage(



          "Medium round. Watch the overlapping bubbles."



        );







      } else {







        setMessage(



          "Decode the binary. Sort from lowest value to highest."



        );



      }



    };











  /* =======================================================



     RESET ROUND



  ======================================================= */







  const resetRound =



    () => {







      setBubbles(



        createBubbles(



          currentRound



        )



      );











      setMoves(0);







      setMistakes(0);







      setSelectedId(



        null



      );







      setDraggedId(



        null



      );







      setRoundCompleted(



        false



      );







      setGameOver(



        false



      );







      setShowHint(



        false



      );











      if (



        currentRound.binaryMode



      ) {







        setMessage(



          "Round restarted. Decode the binary and sort it."



        );







      } else {







        setMessage(



          "Round restarted. Sort carefully."



        );



      }



    };











  /* =======================================================



     NEXT CHAMBER



  ======================================================= */







  const goToNextChamber =



    () => {







      sessionStorage.setItem(



        "onesZerosChamber3Result",



        "1"



      );











      sessionStorage.setItem(



        "onesZerosChamber3Completed",



        "true"



      );











      navigate("/chamber-04");



    };











  /* =======================================================



     PROGRESS



  ======================================================= */







  const completedRounds =



    roundCompleted



      ? roundIndex + 1



      : roundIndex;











  const progress =



    Math.min(



      100,



      (completedRounds /



        ROUNDS.length) *



        100



    );











  /* =======================================================



     RENDER



  ======================================================= */







  return (



    <div className="chamber3-page">







      {/* ===================================================



          HEADER



      =================================================== */}







      <header className="bubble-header">







        <div className="header-left">







          <div className="chapter-tag">



            CHAMBER 03



          </div>











          <div>







            <h1>



              BUBBLE



            </h1>











            <p>



              Sort the bubbles.



              Reveal what is hidden.



            </p>







          </div>







        </div>











        <div className="global-timer">







          <span>



            GLOBAL TIME



          </span>











          <strong



            className={



              timeLeft < 300



                ? "danger-time"



                : ""



            }



          >



            {formatTime(



              timeLeft



            )}



          </strong>







        </div>







      </header>











      {/* ===================================================



          MAIN LAYOUT



      =================================================== */}







      <main className="bubble-layout">







        {/* =================================================



            LEFT SIDEBAR



        ================================================= */}







        <aside className="bubble-sidebar left-sidebar">







          <div className="side-card chamber-card">







            <span className="mini-label">



              CURRENT CHAMBER



            </span>











            <h2>



              03



            </h2>











            <div className="chamber-name">



              BUBBLE



            </div>







          </div>











          <div className="side-card">







            <span className="mini-label">



              ROUND



            </span>











            <div className="round-number">







              {String(



                roundIndex + 1



              ).padStart(



                2,



                "0"



              )}







              <span>



                /03



              </span>







            </div>











            <div className="difficulty">



              {



                currentRound.difficulty



              }



            </div>







          </div>











          <div className="side-card">







            <span className="mini-label">



              OBJECTIVE



            </span>











            <p>







              {currentRound.binaryMode



                ? "Decode the binary values and arrange every bubble from lowest to highest."



                : "Arrange every bubble in ascending numerical order."}







            </p>











            <div className="rule-line">







              <span>



                LOW



              </span>











              <span>



                →



              </span>











              <span>



                HIGH



              </span>







            </div>







          </div>











          <div className="side-card">







            <span className="mini-label">



              BUBBLE SORT



            </span>











            <p className="small-text">







              Only adjacent bubbles



              can exchange positions.







            </p>







          </div>











          {currentRound.binaryMode && (



            <div className="side-card">







              <span className="mini-label">



                BINARY KEY



              </span>











              <p className="small-text">







                0001 = 1



                <br />







                0010 = 2



                <br />







                0011 = 3



                <br />







                0100 = 4



                <br />







                1000 = 8







              </p>







            </div>



          )}







        </aside>











        {/* =================================================



            GAME



        ================================================= */}







        <section className="bubble-game">







          {/* TOP BAR */}







          <div className="game-topbar">







            <div>







              <span className="mini-label">







                ROUND{" "}



                {currentRound.id}







              </span>











              <h2>







                {currentRound.name}







              </h2>







            </div>











            <div className="round-stats">







              <div>







                <span>



                  MOVES



                </span>











                <strong>



                  {moves}



                </strong>







              </div>











              <div>







                <span>



                  MISTAKES



                </span>











                <strong>







                  {currentRound.mistakesAllowed ===



                  Infinity



                    ? "∞"



                    : `${mistakes}/${currentRound.mistakesAllowed}`}







                </strong>







              </div>











              <div>







                <span>



                  BUBBLES



                </span>











                <strong>



                  {bubbles.length}



                </strong>







              </div>







            </div>







          </div>











          {/* INSTRUCTION */}







          <div className="instruction-strip">







            <span className="instruction-icon">



              ↔



            </span>











            <span>



              {message}



            </span>







          </div>











          {/* BOARD */}







          <div



            className={`bubble-board round-${currentRound.id}`}



          >







            <div className="board-grid" />











            <div className="sort-direction">







              <span>



                SMALL



              </span>











              <div className="direction-line">







                <span />







                <b>



                  →



                </b>







                <span />







              </div>











              <span>



                LARGE



              </span>







            </div>











            {/* =================================================



                BUBBLES



            ================================================= */}







            {bubbles.map(



              (



                bubble,



                index



              ) => {







                const position =



                  getBubblePosition(



                    index,



                    bubbles.length,



                    currentRound.id



                  );











                const isHidden =



                  hiddenBubbleIds.includes(



                    bubble.id



                  );











                const isSelected =



                  selectedId ===



                  bubble.id;











                const isDragged =



                  draggedId ===



                  bubble.id;











                const isWrongPair =



                  index <



                    bubbles.length - 1 &&



                  bubble.number >



                    bubbles[



                      index + 1



                    ].number;











                /*



                  Round 3 gets



                  instant movement.



                */







                const instantSwap =



                  !currentRound.animatedSwap;











                return (



                  <div



                    key={



                      bubble.id



                    }











                    className={[



                      "bubble",







                      `bubble-${bubble.color}`,







                      instantSwap



                        ? "instant-swap"



                        : "",







                      isSelected



                        ? "selected"



                        : "",







                      isDragged



                        ? "dragging"



                        : "",







                      isHidden



                        ? "hidden-behind"



                        : "",







                      showHint &&



                      isWrongPair



                        ? "hint-bubble"



                        : "",



                    ].join(" ")}











                    draggable={



                      !gameOver &&



                      !roundCompleted &&



                      !gameCompleted



                    }











                    onDragStart={(



                      event



                    ) =>



                      handleDragStart(



                        event,



                        bubble.id



                      )



                    }











                    onDragOver={



                      handleDragOver



                    }











                    onDrop={(



                      event



                    ) =>



                      handleDrop(



                        event,



                        bubble.id



                      )



                    }











                    onClick={() =>



                      handleBubbleClick(



                        bubble.id



                      )



                    }











                    style={{



                      left:



                        position.left,







                      top:



                        position.top,







                      "--bubble-color":



                        COLOR_MAP[



                          bubble.color



                        ],







                      zIndex:



                        10 + index,



                    }}











                    title={



                      currentRound.binaryMode



                        ? `Binary ${bubble.binary}`



                        : `Bubble ${bubble.number}`



                    }



                  >







                    <span className="bubble-shine" />











                    {/* =========================================



                        BINARY OR NORMAL NUMBER



                    ========================================= */}







                    <span



                      className={



                        currentRound.binaryMode



                          ? "bubble-number binary-number"



                          : "bubble-number"



                      }



                    >







                      {currentRound.binaryMode



                        ? bubble.binary



                        : bubble.number}







                    </span>











                    <span className="bubble-color-dot" />







                  </div>



                );



              }



            )}







          </div>











          {/* =================================================



              CONTROLS



          ================================================= */}







          <div className="game-controls">







            {/* HINT */}







            <button



              className="control-btn secondary"







              onClick={



                giveHint



              }







              disabled={



                gameOver ||



                roundCompleted ||



                gameCompleted



              }



            >







              <span>



                ?



              </span>







              HINT







            </button>











            {/* REVEAL */}







            <button



              className="control-btn reveal"







              onClick={



                revealBubbles



              }







              disabled={



                gameOver ||



                roundCompleted ||



                gameCompleted ||



                currentRound.id ===



                  1 ||



                overlappingPairs.length ===



                  0



              }



            >







              <span>



                ◉



              </span>







              REVEAL OVERLAP







            </button>











            {/* RESET */}







            <button



              className="control-btn reset"







              onClick={



                resetRound



              }







              disabled={



                gameCompleted



              }



            >







              ↻ RESET







            </button>











            {/* CHECK */}







            <button



              className="control-btn check"







              onClick={



                checkRound



              }







              disabled={



                gameOver ||



                roundCompleted ||



                gameCompleted



              }



            >







              CHECK ORDER







              <span>



                →



              </span>







            </button>







          </div>











          {/* =================================================



              HELP



          ================================================= */}







          <div className="bubble-help">







            <div>







              <strong>



                DRAG



              </strong>











              <span>



                Move a bubble onto



                an adjacent bubble.



              </span>







            </div>











            <div>







              <strong>



                CLICK



              </strong>











              <span>



                Click two adjacent



                bubbles to swap them.



              </span>







            </div>











            <div>







              <strong>



                REMEMBER



              </strong>











              <span>







                Bubble Sort only



                compares neighbours.







              </span>







            </div>







          </div>







        </section>











        {/* =================================================



            RIGHT SIDEBAR



        ================================================= */}







        <aside className="bubble-sidebar right-sidebar">







          {/* PROGRESS */}







          <div className="side-card">







            <span className="mini-label">



              PROGRESS



            </span>











            <div className="progress-track">







              <div



                className="progress-fill"







                style={{



                  width: `${progress}%`,



                }}



              />







            </div>











            <div className="progress-text">







              {completedRounds}



              /3 COMPLETE







            </div>







          </div>











          {/* CURRENT STATE */}







          <div className="side-card">







            <span className="mini-label">



              CURRENT STATE



            </span>











            <div className="state-row">







              <span>



                OVERLAPS



              </span>











              <strong>



                {



                  overlappingPairs.length



                }



              </strong>







            </div>











            <div className="state-row">







              <span>



                HIDDEN



              </span>











              <strong>



                {



                  hiddenBubbleIds.length



                }



              </strong>







            </div>











            <div className="state-row">







              <span>



                MOVES



              </span>











              <strong>



                {moves}



              </strong>







            </div>







          </div>











          {/* FIELD NOTES */}







          <div className="side-card tips-card">







            <span className="mini-label">



              FIELD NOTES



            </span>











            <ul>







              <li>



                Compare neighbours.



              </li>











              <li>



                Swap only when



                left &gt; right.



              </li>











              <li>



                Hidden bubbles



                still count.



              </li>











              <li>



                Don't rush the



                final round.



              </li>







            </ul>







          </div>











          {/* BINARY INFORMATION */}







          {currentRound.binaryMode && (



            <div className="side-card">







              <span className="mini-label">



                DECODE



              </span>











              <p className="small-text">







                The bubble shows



                binary, but the



                actual value must



                be understood before



                sorting.







              </p>











              <div className="rule-line">







                <span>



                  0001



                </span>











                <span>



                  =



                </span>











                <span>



                  1



                </span>







              </div>







            </div>



          )}







        </aside>







      </main>











      {/* =====================================================



          RULES MODAL



      ===================================================== */}







      {showRules && (



        <div className="modal-overlay">







          <div className="rules-modal">







            <div className="modal-label">







              ONES & ZEROS



              / CHAMBER 03







            </div>











            <h2>



              BUBBLE



            </h2>











            <p className="modal-subtitle">







              Sort what you can see.



              Decode what you cannot.







            </p>











            <div className="rules-grid">







              <div>







                <span>



                  01



                </span>











                <p>



                  Sort every bubble



                  from smallest to



                  largest.



                </p>







              </div>











              <div>







                <span>



                  02



                </span>











                <p>



                  Bubble Sort works



                  by comparing



                  adjacent bubbles.



                </p>







              </div>











              <div>







                <span>



                  03



                </span>











                <p>



                  Round 2 introduces



                  overlapping bubbles.



                </p>







              </div>











              <div>







                <span>



                  04



                </span>











                <p>



                  Round 3 hides the



                  decimal values and



                  gives you binary.



                </p>







              </div>







            </div>











            <button



              className="start-btn"







              onClick={() =>



                setShowRules(



                  false



                )



              }



            >







              ENTER CHAMBER →







            </button>







          </div>







        </div>



      )}











      {/* =====================================================



          ROUND COMPLETE



      ===================================================== */}







      {roundCompleted &&



        !gameCompleted && (



          <div className="modal-overlay">







            <div className="success-modal">







              <div className="success-orb">



                ✓



              </div>











              <span className="modal-label">







                ROUND{" "}



                {currentRound.id}



                {" "}



                COMPLETE







              </span>











              <h2>



                SORTED.



              </h2>











              <p>







                Every bubble is now



                in the correct order.







              </p>











              <div className="result-stats">







                <div>







                  <span>



                    MOVES



                  </span>











                  <strong>



                    {moves}



                  </strong>







                </div>











                <div>







                  <span>



                    MISTAKES



                  </span>











                  <strong>



                    {mistakes}



                  </strong>







                </div>







              </div>











              <button



                className="start-btn"







                onClick={



                  nextRound



                }



              >







                {roundIndex ===



                2



                  ? "COMPLETE CHAMBER →"



                  : `ROUND ${



                      roundIndex + 2



                    } →`}







              </button>







            </div>







          </div>



        )}











      {/* =====================================================



          CHAMBER COMPLETE



      ===================================================== */}







      {gameCompleted && (



        <div className="modal-overlay final-overlay">







          <div className="success-modal final-modal">







            <div className="final-symbol">



              01



            </div>











            <span className="modal-label">







              CHAMBER 03 COMPLETE







            </span>











            <h2>



              BUBBLE



            </h2>











            <p>







              You successfully



              completed all three



              sorting rounds.







            </p>











            <div className="binary-result">







              <span>



                CHAMBER RESULT



              </span>











              <strong>



                1



              </strong>







            </div>











            <button



              className="start-btn"







              onClick={



                goToNextChamber



              }



            >







              ENTER CHAMBER 04 →







            </button>







          </div>







        </div>



      )}











      {/* =====================================================



          GAME OVER



      ===================================================== */}







      {gameOver &&



        !gameCompleted && (



          <div className="modal-overlay">







            <div className="gameover-modal">







              <div className="danger-symbol">



                !



              </div>











              <span className="modal-label">







                SYSTEM FAILURE







              </span>











              <h2>



                BUBBLES LOST.



              </h2>











              <p>







                {timeLeft <= 0



                  ? "The global timer has expired."



                  : "Too many incorrect moves were made."}







              </p>











              <button



                className="start-btn"







                onClick={



                  resetRound



                }



              >







                RETRY ROUND







              </button>







            </div>







          </div>



        )}







    </div>



  );



}











/* =========================================================



   EXPORT



========================================================= */







export default Chamber3;