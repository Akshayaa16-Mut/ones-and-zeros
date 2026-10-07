import { useEffect, useMemo, useState } from "react";

import {
  startChamber,
  completeChamber,
} from "../../lib/chamberProgress";

import "./Chamber8.css";

/* =========================================================

   CHAMBER 08 — ESCAPE

   ONES & ZEROS

\========================================================= */

const TOTAL_TIME = 90 * 60;

/* =========================================================

   ACTUAL CHAMBER CODES

\========================================================= */

const CHAMBERS = [

  {

    id: "01",

    name: "SIGNAL",

    code: "00",

    storageKeys: [

      "onesZerosChamber1Result",

      "chamber1Code",

      "chamber1Result",

      "onesZerosChamber1Code",

    ],

  },

  {

    id: "02",

    name: "SPRING",

    code: "1",

    storageKeys: [

      "onesZerosChamber2Result",

      "chamber2Code",

      "chamber2Result",

      "onesZerosChamber2Code",

    ],

  },

  {

    id: "03",

    name: "BUBBLE",

    code: "1",

    storageKeys: [

      "onesZerosChamber3Result",

      "chamber3Code",

      "chamber3Result",

      "onesZerosChamber3Code",

    ],

  },

  {

    id: "04",

    name: "LOOP",

    code: "10",

    storageKeys: [

      "onesZerosChamber4Result",

      "chamber4Code",

      "chamber4Result",

      "onesZerosChamber4Code",

    ],

  },

  {

    id: "05",

    name: "GHOST",

    code: "110",

    storageKeys: [

      "onesZerosChamber5Result",

      "chamber5Code",

      "chamber5Result",

      "onesZerosChamber5Code",

    ],

  },

  {

    id: "06",

    name: "MIRROR",

    code: "0110",

    storageKeys: [

      "onesZerosChamber6Result",

      "chamber6Code",

      "chamber6Result",

      "onesZerosChamber6Code",

    ],

  },

  {

    id: "07",

    name: "SYNC",

    code: "1011",

    storageKeys: [

      "onesZerosChamber7Result",

      "chamber7Code",

      "chamber7Result",

      "onesZerosChamber7Code",

    ],

  },

];

/* =========================================================

   FINAL FIVE ANSWERS

   Q1 = 1

   Q2 = 1

   Q3 = 0

   Change ONLY Q4 and Q5 when you decide them.

\========================================================= */

const FINAL_ANSWERS = ["1", "1", "0", "1", "1"];

/* =========================================================

   FIVE QUESTIONS

\========================================================= */

const FINAL_QUESTIONS = [

  {

    id: 1,

    question: "Which binary state represents the FIRST signal?",

  },

  {

    id: 2,

    question: "Which binary state represents the SECOND signal?",

  },

  {

    id: 3,

    question: "Which binary state represents the THIRD signal?",

  },

  {

    id: 4,

    question: "Which binary state completes the FOURTH sequence?",

  },

  {

    id: 5,

    question: "Which binary state opens the FINAL channel?",

  },

];

/* =========================================================

   SHUFFLE

\========================================================= */

function shuffleArray(array) {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {

    const randomIndex = Math.floor(

      Math.random() * (i + 1)

    );

    [shuffled[i], shuffled[randomIndex]] = [

      shuffled[randomIndex],

      shuffled[i],

    ];

  }

  return shuffled;

}

function shuffleChambers() {

  let shuffled = shuffleArray(CHAMBERS);

  let attempts = 0;

  while (

    shuffled.every(

      (item, index) =>

        item.id === CHAMBERS[index].id

    ) &&

    attempts < 10

  ) {

    shuffled = shuffleArray(CHAMBERS);

    attempts += 1;

  }

  return shuffled;

}

/* =========================================================

   TIMER

\========================================================= */

function getRemainingTime() {

  const startTime =

    localStorage.getItem("onesZerosStartTime");

  if (!startTime) {

    return TOTAL_TIME;

  }

  const elapsed = Math.floor(

    (Date.now() - Number(startTime)) / 1000

  );

  return Math.max(

    0,

    TOTAL_TIME - elapsed

  );

}

function formatTime(seconds) {

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(

    2,

    "0"

  )}:${String(remainingSeconds).padStart(

    2,

    "0"

  )}`;

}

/* =========================================================

   CHAMBER ORDER CARD

\========================================================= */

function ChamberOrderCard({

  chamber,

  index,

  selected,

  onSelect,

  onDragStart,

  onDragOver,

  onDrop,

}) {

  return (

    <article

      className={`order-card ${

        selected

          ? "order-card-selected"

          : ""

      }`}

      draggable

      onClick={() => onSelect(index)}

      onDragStart={(event) =>

        onDragStart(event, index)

      }

      onDragOver={onDragOver}

      onDrop={(event) =>

        onDrop(event, index)

      }

    >

      <div className="order-card-top">

        <span className="drag-indicator">

          ⋮⋮

        </span>

      </div>

      <div className="order-emblem">

        <div className="order-emblem-inner">

          0<span>|</span>1

        </div>

      </div>

      <h3>{chamber.name}</h3>

      <span className="order-card-label">

        CHAMBER {chamber.id}

      </span>

      <span className="order-card-action">

        {selected

          ? "SELECTED — CHOOSE ANOTHER"

          : "DRAG OR CLICK TO MOVE"}

      </span>

    </article>

  );

}

/* =========================================================

   CODE ORDER CARD

\========================================================= */

function CodeOrderCard({

  code,

  index,

  selected,

  onSelect,

  onDragStart,

  onDragOver,

  onDrop,

}) {

  return (

    <article

      className={`order-card code-order-card ${

        selected

          ? "order-card-selected"

          : ""

      }`}

      draggable

      onClick={() => onSelect(index)}

      onDragStart={(event) =>

        onDragStart(event, index)

      }

      onDragOver={onDragOver}

      onDrop={(event) =>

        onDrop(event, index)

      }

    >

      <div className="order-card-top">

        <span className="drag-indicator">

          ⋮⋮

        </span>

      </div>

      <div className="order-emblem code-emblem">

        <div className="order-emblem-inner">

          {code}

        </div>

      </div>

      <h3>{code}</h3>

      <span className="order-card-label">

        CHAMBER CODE

      </span>

      <span className="order-card-action">

        {selected

          ? "SELECTED — CHOOSE ANOTHER"

          : "DRAG OR CLICK TO MOVE"}

      </span>

    </article>

  );

}

/* =========================================================

   QUESTION CARD

\========================================================= */

function QuestionCard({

  question,

  answer,

  selected,

  onSelect,

  locked,

}) {

  return (

    <article

      className={`question-card ${

        selected

          ? "question-card-selected"

          : ""

      } ${

        locked

          ? "question-card-locked"

          : ""

      }`}

    >

      <div className="question-number">

        Q{String(question.id).padStart(2, "0")}

      </div>

      <div className="question-content">

        <span className="question-label">

          BINARY QUESTION

        </span>

        <h3>{question.question}</h3>

        <div className="binary-options">

          <button

            type="button"

            className={`binary-option ${

              answer === "0"

                ? "binary-option-selected"

                : ""

            }`}

            disabled={locked}

            onClick={() =>

              onSelect(question.id, "0")

            }

          >

            0

          </button>

          <button

            type="button"

            className={`binary-option ${

              answer === "1"

                ? "binary-option-selected"

                : ""

            }`}

            disabled={locked}

            onClick={() =>

              onSelect(question.id, "1")

            }

          >

            1

          </button>

        </div>

      </div>

      <div className="question-state">

        {answer

          ? `ANSWER: ${answer}`

          : "WAITING"}

      </div>

    </article>

  );

}

/* =========================================================

   FINAL ESCAPE LOCK

\========================================================= */

function FinalEscapeLock({

  ready,

  unlocked,

  finalCode,

  onUnlock,

  feedbackRating,

  feedbackSubmitted,

  onFeedbackChange,

  onFeedbackSubmit,

}) {

  if (unlocked) {

    return (

      <section className="final-lock final-lock-unlocked">

        <div className="final-lock-icon unlocked">

          ✓

        </div>

        <div className="final-lock-copy">

          <span className="final-lock-eyebrow">

            FINAL SYSTEM STATUS

          </span>

          <h2>ESCAPE SEQUENCE COMPLETE</h2>

          <p>

            The five binary answers are correct. The final lock has been successfully unlocked.

          </p>

          <p className="participation-message">

            <strong>THANK YOU FOR PARTICIPATING IN ONES &amp; ZEROS.</strong>

          </p>

          <p>

            We hope you enjoyed the challenge and the journey through all seven chambers.

          </p>

        </div>

        <div className="binary-display">

          {finalCode

            .split("")

            .map((bit, index) => (

              <span key={`${bit}-${index}`}>

                {bit}

              </span>

            ))}

        </div>

        <div className="final-lock-status">

          <span className="status-dot active" />

          ESCAPE SEQUENCE ACCEPTED

        </div>

        <div className="feedback-section">

          <span className="feedback-eyebrow">

            PLAYER FEEDBACK

          </span>

          <h3>HOW WAS YOUR EXPERIENCE?</h3>

          <p>Select your rating from 1 to 5 stars.</p>

          <div

            className="star-rating"

            role="group"

            aria-label="Player experience rating"

          >

            {[1, 2, 3, 4, 5].map((star) => (

              <button

                key={star}

                type="button"

                className={`star-button ${

                  feedbackRating >= star ? "star-selected" : ""

                }`}

                onClick={() => onFeedbackChange(star)}

                disabled={feedbackSubmitted}

                aria-label={`${star} star${star > 1 ? "s" : ""}`}

              >

                ★

              </button>

            ))}

          </div>

          <div className="feedback-rating-text">

            {feedbackRating > 0

              ? `${feedbackRating} / 5`

              : "SELECT A RATING"}

          </div>

          {!feedbackSubmitted ? (

            <button

              type="button"

              className="feedback-submit-button"

              disabled={feedbackRating === 0}

              onClick={onFeedbackSubmit}

            >

              SUBMIT FEEDBACK

              <span>→</span>

            </button>

          ) : (

            <div className="feedback-thank-you">

              THANK YOU FOR YOUR FEEDBACK.

            </div>

          )}

        </div>

      </section>

    );

  }

  return (

    <section

      className={`final-lock ${

        ready

          ? "final-lock-ready"

          : "final-lock-locked"

      }`}

    >

      <div

        className={`final-lock-icon ${

          ready ? "ready" : ""

        }`}

      >

        {ready ? "✓" : "0|1"}

      </div>

      <div className="final-lock-copy">

        <span className="final-lock-eyebrow">

          FINAL ESCAPE LOCK

        </span>

        <h2>

          {ready

            ? "FINAL FIVE-BIT KEY"

            : "FIVE ANSWERS. ONE FINAL LOCK."}

        </h2>

        <p>

          {ready

            ? "All five binary answers are correct. The final escape code has been generated."

            : "Complete all five binary questions correctly to activate the final escape lock."}

        </p>

      </div>

      <div className="binary-display">

        {(ready

          ? finalCode

          : "•••••"

        )

          .split("")

          .map((bit, index) => (

            <span key={`${bit}-${index}`}>

              {bit}

            </span>

          ))}

      </div>

      <div className="final-lock-status">

        <span

          className={`status-dot ${

            ready ? "active" : ""

          }`}

        />

        {ready

          ? "FINAL LOCK ARMED"

          : "WAITING FOR 5 / 5 ANSWERS"}

      </div>

      <button

        type="button"

        className="unlock-button"

        disabled={!ready}

        onClick={onUnlock}

      >

        COMPLETE ESCAPE

        <span>→</span>

      </button>

    </section>

  );

}

/* =========================================================

   MAIN CHAMBER 8

\========================================================= */

export default function Chamber8() {

  /* =======================================================

     TIMER

  ======================================================= */

  useEffect(() => {
    startChamber(8).catch((error) => {
      console.error("Chamber 8 start error:", error);
    });
  }, []);

  const [time, setTime] =

    useState(getRemainingTime);

  /* =======================================================

     STAGE 01 — CHAMBER ORDER

  ======================================================= */

  const [

    shuffledChambers,

    setShuffledChambers,

  ] = useState(shuffleChambers);

  const [

    selectedOrderIndex,

    setSelectedOrderIndex,

  ] = useState(null);

  const [

    draggedOrderIndex,

    setDraggedOrderIndex,

  ] = useState(null);

  const [

    orderVerified,

    setOrderVerified,

  ] = useState(false);

  /* =======================================================

     STAGE 02 — CODE ORDER

  ======================================================= */

  const [

    shuffledCodes,

    setShuffledCodes,

  ] = useState(() =>

    shuffleArray(

      CHAMBERS.map((chamber) => ({

        id: chamber.id,

        name: chamber.name,

        code: chamber.code,

      }))

    )

  );

  const [

    selectedCodeIndex,

    setSelectedCodeIndex,

  ] = useState(null);

  const [

    draggedCodeIndex,

    setDraggedCodeIndex,

  ] = useState(null);

  const [

    codeOrderVerified,

    setCodeOrderVerified,

  ] = useState(false);

  /* =======================================================

     STAGE 03 — QUESTIONS

  ======================================================= */

  const [

    questionAnswers,

    setQuestionAnswers,

  ] = useState({});

  const [

    questionsVerified,

    setQuestionsVerified,

  ] = useState(false);

  /* =======================================================

     FINAL LOCK

  ======================================================= */

  const [unlocked, setUnlocked] = useState(false);

  const [feedbackRating, setFeedbackRating] =

    useState(0);

  const [feedbackSubmitted, setFeedbackSubmitted] =

    useState(false);

  /* =======================================================

     MESSAGE

  ======================================================= */

  const [message, setMessage] =

    useState(

      "RECONSTRUCT THE JOURNEY TO BEGIN."

    );

  const [messageType, setMessageType] =

    useState("info");

  /* =======================================================

     TIMER

  ======================================================= */

  useEffect(() => {

    const timer = window.setInterval(() => {

      setTime(getRemainingTime());

    }, 1000);

    return () => {

      window.clearInterval(timer);

    };

  }, []);

  /* =======================================================

     FINAL FIVE-BIT CODE

  ======================================================= */

  const finalCode = useMemo(() => {

    return FINAL_ANSWERS.join("");

  }, []);

  /* =======================================================

     CHAMBER ORDER SELECT / SWAP

  ======================================================= */

  function handleOrderSelect(index) {

    if (orderVerified) return;

    if (selectedOrderIndex === null) {

      setSelectedOrderIndex(index);

      return;

    }

    if (selectedOrderIndex === index) {

      setSelectedOrderIndex(null);

      return;

    }

    setShuffledChambers((current) => {

      const next = [...current];

      [

        next[selectedOrderIndex],

        next[index],

      ] = [

        next[index],

        next[selectedOrderIndex],

      ];

      return next;

    });

    setSelectedOrderIndex(null);

    setOrderVerified(false);

    setCodeOrderVerified(false);

    setQuestionsVerified(false);

    setMessage(

      "CHAMBER POSITIONS UPDATED."

    );

    setMessageType("info");

  }

  /* =======================================================

     CHAMBER DRAG

  ======================================================= */

  function handleOrderDragStart(

    event,

    index

  ) {

    if (orderVerified) return;

    setDraggedOrderIndex(index);

    event.dataTransfer.effectAllowed =

      "move";

    event.dataTransfer.setData(

      "text/plain",

      String(index)

    );

  }

  function handleOrderDragOver(event) {

    event.preventDefault();

    event.dataTransfer.dropEffect =

      "move";

  }

  function handleOrderDrop(

    event,

    targetIndex

  ) {

    event.preventDefault();

    if (orderVerified) return;

    const sourceIndex = Number(

      event.dataTransfer.getData(

        "text/plain"

      )

    );

    if (

      Number.isNaN(sourceIndex) ||

      sourceIndex === targetIndex

    ) {

      setDraggedOrderIndex(null);

      return;

    }

    setShuffledChambers((current) => {

      const next = [...current];

      [

        next[sourceIndex],

        next[targetIndex],

      ] = [

        next[targetIndex],

        next[sourceIndex],

      ];

      return next;

    });

    setDraggedOrderIndex(null);

    setSelectedOrderIndex(null);

    setOrderVerified(false);

    setCodeOrderVerified(false);

    setQuestionsVerified(false);

  }

  /* =======================================================

     VERIFY CHAMBER ORDER

  ======================================================= */

  function verifyChamberOrder() {

    const correct =

      shuffledChambers.every(

        (chamber, index) =>

          chamber.id === CHAMBERS[index].id

      );

    if (!correct) {

      setOrderVerified(false);

      setCodeOrderVerified(false);

      setQuestionsVerified(false);

      setMessage(

        "ORDER INCORRECT — RECONSTRUCT THE CHAMBER JOURNEY."

      );

      setMessageType("error");

      return;

    }

    setOrderVerified(true);

    setMessage(

      "CHAMBER ORDER VERIFIED — CODE ARRANGEMENT UNLOCKED."

    );

    setMessageType("success");

  }

  /* =======================================================

     SHUFFLE CHAMBERS AGAIN

  ======================================================= */

  function shuffleAgain() {

    if (orderVerified) return;

    setShuffledChambers(

      shuffleChambers()

    );

    setSelectedOrderIndex(null);

    setDraggedOrderIndex(null);

    setOrderVerified(false);

    setCodeOrderVerified(false);

    setQuestionsVerified(false);

    setMessage(

      "CHAMBERS SHUFFLED — RECONSTRUCT THE JOURNEY."

    );

    setMessageType("info");

  }

  /* =======================================================

     CODE SELECT / SWAP

  ======================================================= */

  function handleCodeSelect(index) {

    if (!orderVerified || codeOrderVerified) {

      return;

    }

    if (selectedCodeIndex === null) {

      setSelectedCodeIndex(index);

      return;

    }

    if (selectedCodeIndex === index) {

      setSelectedCodeIndex(null);

      return;

    }

    setShuffledCodes((current) => {

      const next = [...current];

      [

        next[selectedCodeIndex],

        next[index],

      ] = [

        next[index],

        next[selectedCodeIndex],

      ];

      return next;

    });

    setSelectedCodeIndex(null);

    setCodeOrderVerified(false);

    setQuestionsVerified(false);

    setMessage(

      "CODE POSITIONS UPDATED."

    );

    setMessageType("info");

  }

  /* =======================================================

     CODE DRAG

  ======================================================= */

  function handleCodeDragStart(

    event,

    index

  ) {

    if (

      !orderVerified ||

      codeOrderVerified

    ) {

      return;

    }

    setDraggedCodeIndex(index);

    event.dataTransfer.effectAllowed =

      "move";

    event.dataTransfer.setData(

      "text/plain",

      String(index)

    );

  }

  function handleCodeDragOver(event) {

    event.preventDefault();

    event.dataTransfer.dropEffect =

      "move";

  }

  function handleCodeDrop(

    event,

    targetIndex

  ) {

    event.preventDefault();

    if (

      !orderVerified ||

      codeOrderVerified

    ) {

      return;

    }

    const sourceIndex = Number(

      event.dataTransfer.getData(

        "text/plain"

      )

    );

    if (

      Number.isNaN(sourceIndex) ||

      sourceIndex === targetIndex

    ) {

      setDraggedCodeIndex(null);

      return;

    }

    setShuffledCodes((current) => {

      const next = [...current];

      [

        next[sourceIndex],

        next[targetIndex],

      ] = [

        next[targetIndex],

        next[sourceIndex],

      ];

      return next;

    });

    setDraggedCodeIndex(null);

    setSelectedCodeIndex(null);

    setCodeOrderVerified(false);

    setQuestionsVerified(false);

  }

  /* =======================================================

     VERIFY CODE ORDER

  ======================================================= */

  function verifyCodeOrder() {

    if (!orderVerified) {

      setMessage(

        "COMPLETE THE CHAMBER ORDER FIRST."

      );

      setMessageType("error");

      return;

    }

    const correct =

      shuffledCodes.every(

        (item, index) =>

          item.id === CHAMBERS[index].id &&

          item.code === CHAMBERS[index].code

      );

    if (!correct) {

      setCodeOrderVerified(false);

      setQuestionsVerified(false);

      setMessage(

        "CODE ORDER INCORRECT — MATCH EACH CODE TO ITS CHAMBER."

      );

      setMessageType("error");

      return;

    }

    // Once verified, snap the cards into the exact chamber order.

    setShuffledCodes(

      CHAMBERS.map((chamber) => ({

        id: chamber.id,

        name: chamber.name,

        code: chamber.code,

      }))

    );

    setSelectedCodeIndex(null);

    setDraggedCodeIndex(null);

    setCodeOrderVerified(true);

    setMessage(

      "ALL SEVEN CODES MATCHED — FINAL QUESTIONS UNLOCKED."

    );

    setMessageType("success");

  }

  /* =======================================================

     QUESTION ANSWER

  ======================================================= */

  function handleQuestionAnswer(

    questionId,

    answer

  ) {

    if (

      !codeOrderVerified ||

      questionsVerified

    ) {

      return;

    }

    setQuestionAnswers((current) => ({

      ...current,

      [questionId]: answer,

    }));

    setQuestionsVerified(false);

    setMessage("");

  }

  /* =======================================================

     VERIFY FIVE QUESTIONS

  ======================================================= */

  function verifyQuestions() {

    if (!codeOrderVerified) {

      setMessage(

        "COMPLETE THE CODE ARRANGEMENT FIRST."

      );

      setMessageType("error");

      return;

    }

    const allAnswered =

      FINAL_QUESTIONS.every(

        (question) =>

          questionAnswers[

            question.id

          ] === "0" ||

          questionAnswers[

            question.id

          ] === "1"

      );

    if (!allAnswered) {

      setMessage(

        "ANSWER ALL FIVE BINARY QUESTIONS."

      );

      setMessageType("error");

      return;

    }

    const correct =

      FINAL_QUESTIONS.every(

        (question) =>

          questionAnswers[

            question.id

          ] ===

          FINAL_ANSWERS[

            question.id - 1

          ]

      );

    if (!correct) {

      setQuestionsVerified(false);

      setMessage(

        "FINAL ANSWERS INCORRECT — RECHECK THE FIVE BINARY QUESTIONS."

      );

      setMessageType("error");

      return;

    }

    setQuestionsVerified(true);

    setMessage(

      "5 / 5 ANSWERS CORRECT — FINAL ESCAPE LOCK ARMED."

    );

    setMessageType("success");

  }

  /* =======================================================

     FINAL UNLOCK

  ======================================================= */

  function handleUnlock() {

    if (!questionsVerified) {

      setMessage(

        "ANSWER ALL FIVE QUESTIONS FIRST."

      );

      setMessageType("error");

      return;

    }

    sessionStorage.setItem(

      "onesZerosChamber8Completed",

      "true"

    );

    sessionStorage.setItem(

      "onesZerosFinalBinary",

      finalCode

    );

    sessionStorage.setItem(

      "onesZerosGameCompleted",

      "true"

    );

    
    completeChamber({
      chamberNumber: 8,
      resultCode: finalCode,
      score: 0,
    }).catch((error) => {
      console.error("Chamber 8 completion error:", error);
    });

    setUnlocked(true);

    setMessage(

      "ESCAPE SEQUENCE ACCEPTED — SYSTEM UNLOCKED."

    );

    setMessageType("success");

  }

  /* =======================================================

     PAGE

  ======================================================= */

  return (

    <main className="chamber8-page">

      {/* =================================================

          HEADER

      ================================================= */}

      <header className="chamber8-header">

        <div className="brand">

          <div className="brand-mark">

            0|1

          </div>

          <div className="brand-text">

            <strong>

              ONES &amp; ZEROS

            </strong>

            <span>

              FINAL SYSTEM

            </span>

          </div>

        </div>

        <div className="header-chamber">

          CHAMBER 08 / ESCAPE

        </div>

        <div className="timer-box">

          <span>

            TIME REMAINING

          </span>

          <strong>

            {formatTime(time)}

          </strong>

        </div>

      </header>

      {/* =================================================

          HERO

      ================================================= */}

      <section className="escape-hero">

        <div className="hero-copy">

          <span className="hero-eyebrow">

            CHAMBER 08

          </span>

          <div className="hero-line">

            <span />

          </div>

          <h1>

            ESCAPE

          </h1>

          <h2>

            Seven chambers. Seven codes.

            One final lock.

          </h2>

          <p>

            Your journey ends here.

            Reconstruct the chamber order,

            arrange every discovered code,

            solve the five binary questions,

            and unlock the final escape.

          </p>

        </div>

        <div

          className="hero-lock"

          aria-hidden="true"

        >

          <div className="hero-ring hero-ring-outer">

            <span />

            <span />

            <span />

            <span />

          </div>

          <div className="hero-ring hero-ring-middle">

            <span />

            <span />

          </div>

          <div className="hero-core">

            <strong>

              0 <i>|</i> 1

            </strong>

          </div>

        </div>

      </section>

      {/* =================================================

          STAGE 01

      ================================================= */}

      <section className="game-section order-section">

        <div className="section-heading">

          <span className="heading-dot" />

          <span>

            01 · ARRANGE THE CHAMBERS

          </span>

        </div>

        <div className="instruction-panel">

          <div className="instruction-icon">

            01

          </div>

          <div>

            <strong>

              RECONSTRUCT THE JOURNEY

            </strong>

            <p>

              The seven chambers are

              scrambled. Arrange them in the

              exact order in which the journey

              occurred.

            </p>

          </div>

        </div>

        <div className="order-grid">

          {shuffledChambers.map(

            (chamber, index) => (

              <ChamberOrderCard

                key={chamber.id}

                chamber={chamber}

                index={index}

                selected={

                  selectedOrderIndex ===

                  index

                }

                onSelect={

                  handleOrderSelect

                }

                onDragStart={

                  handleOrderDragStart

                }

                onDragOver={

                  handleOrderDragOver

                }

                onDrop={

                  handleOrderDrop

                }

              />

            )

          )}

        </div>

        <div className="order-actions">

          <button

            type="button"

            className="primary-button"

            onClick={

              verifyChamberOrder

            }

            disabled={orderVerified}

          >

            {orderVerified

              ? "ORDER VERIFIED"

              : "CONFIRM CHAMBER ORDER"}

            <span>→</span>

          </button>

          <button

            type="button"

            className="secondary-button"

            onClick={shuffleAgain}

            disabled={orderVerified}

          >

            SHUFFLE AGAIN

          </button>

        </div>

        <div

          className={`system-message ${

            messageType === "success"

              ? "message-success"

              : messageType === "error"

              ? "message-error"

              : ""

          }`}

        >

          <span className="message-dot" />

          {message ||

            "ARRANGE THE CHAMBERS INTO THE CORRECT JOURNEY."}

        </div>

      </section>

      {/* =================================================

          STAGE 02

      ================================================= */}

      <section

        className={`game-section code-order-section ${

          !orderVerified

            ? "section-locked"

            : ""

        }`}

      >

        <div className="section-heading">

          <span className="heading-dot" />

          <span>

            02 · ARRANGE THE CHAMBER CODES

          </span>

        </div>

        <div className="instruction-panel">

          <div className="instruction-icon">

            02

          </div>

          <div>

            <strong>

              RECONSTRUCT THE DISCOVERED CODES

            </strong>

            <p>

              The chamber numbers are mixed.

              Arrange them so each code matches

              its correct chamber position.

            </p>

          </div>

        </div>

        {!orderVerified && (

          <div className="locked-panel">

            <div className="locked-panel-icon">

              0|1

            </div>

            <div>

              <strong>

                CODE ARRANGEMENT LOCKED

              </strong>

              <p>

                Correctly arrange all seven

                chambers above first.

              </p>

            </div>

          </div>

        )}

        <div

          className={`code-order-grid ${

            !orderVerified

              ? "code-order-disabled"

              : ""

          }`}

        >

          {shuffledCodes.map(

            (item, index) => (

              <CodeOrderCard

                key={`${item.id}-${index}`}

                code={item.code}

                index={index}

                selected={

                  selectedCodeIndex ===

                  index

                }

                onSelect={

                  handleCodeSelect

                }

                onDragStart={

                  handleCodeDragStart

                }

                onDragOver={

                  handleCodeDragOver

                }

                onDrop={

                  handleCodeDrop

                }

              />

            )

          )}

        </div>

        <button

          type="button"

          className="primary-button verify-codes-button"

          disabled={

            !orderVerified ||

            codeOrderVerified

          }

          onClick={

            verifyCodeOrder

          }

        >

          {codeOrderVerified

            ? "CODES VERIFIED"

            : "CONFIRM CODE ARRANGEMENT"}

          <span>→</span>

        </button>

      </section>

      {/* =================================================

          STAGE 03

      ================================================= */}

      <section

        className={`game-section questions-section ${

          !codeOrderVerified

            ? "section-locked"

            : ""

        }`}

      >

        <div className="section-heading">

          <span className="heading-dot" />

          <span>

            03 · FINAL BINARY QUESTIONS

          </span>

        </div>

        <div className="instruction-panel">

          <div className="instruction-icon">

            03

          </div>

          <div>

            <strong>

              FIVE QUESTIONS. ZERO OR ONE.

            </strong>

            <p>

              Every question has only two

              possible states. Choose the correct

              binary answer for all five.

            </p>

          </div>

        </div>

        {!codeOrderVerified && (

          <div className="locked-panel">

            <div className="locked-panel-icon">

              0|1

            </div>

            <div>

              <strong>

                FINAL QUESTIONS LOCKED

              </strong>

              <p>

                Correctly arrange all seven

                chamber codes first.

              </p>

            </div>

          </div>

        )}

        <div className="questions-grid">

          {FINAL_QUESTIONS.map(

            (question) => (

              <QuestionCard

                key={question.id}

                question={question}

                answer={

                  questionAnswers[

                    question.id

                  ] || ""

                }

                selected={Boolean(

                  questionAnswers[

                    question.id

                  ]

                )}

                locked={

                  !codeOrderVerified ||

                  questionsVerified

                }

                onSelect={

                  handleQuestionAnswer

                }

              />

            )

          )}

        </div>

        <button

          type="button"

          className="primary-button verify-questions-button"

          disabled={

            !codeOrderVerified ||

            questionsVerified

          }

          onClick={

            verifyQuestions

          }

        >

          {questionsVerified

            ? "5 / 5 ANSWERS VERIFIED"

            : "VERIFY FIVE ANSWERS"}

          <span>→</span>

        </button>

        <div

          className={`system-message ${

            messageType === "success"

              ? "message-success"

              : messageType === "error"

              ? "message-error"

              : ""

          }`}

        >

          <span className="message-dot" />

          {message ||

            "SELECT 0 OR 1 FOR EACH QUESTION."}

        </div>

      </section>

      {/* =================================================

          FINAL ESCAPE LOCK

      ================================================= */}

      <FinalEscapeLock

        ready={questionsVerified}

        unlocked={unlocked}

        finalCode={finalCode}

        onUnlock={handleUnlock}

        feedbackRating={feedbackRating}

        feedbackSubmitted={feedbackSubmitted}

        onFeedbackChange={setFeedbackRating}

        onFeedbackSubmit={() => {

          if (feedbackRating === 0) return;

          sessionStorage.setItem(

            "onesZerosFeedbackRating",

            String(feedbackRating)

          );

          setFeedbackSubmitted(true);

        }}

      />

      {/* =================================================

          FOOTER

      ================================================= */}

      <footer className="chamber8-footer">

        <span>

          ALL YOUR DISCOVERIES LED HERE.

        </span>

        <strong>

          ONES &amp; ZEROS

        </strong>

        <span>

          7 CHAMBERS · 7 CODES · 5-BIT ESCAPE

        </span>

      </footer>

    </main>

  );

}