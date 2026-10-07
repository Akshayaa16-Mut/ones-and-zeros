import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { startChamber, completeChamber } from "../../lib/chamberProgress";

import "./Chamber1.css";



const reports = [

  {

    id: 1,

    title: "THE MISSING BLUEPRINT",

    category: "ARCHIVE EVIDENCE",

    date: "JULY 09, 2035",

    body: "Engineers working inside the eastern archive discovered that a blueprint had disappeared from a locked cabinet. The security log showed three entries: 08:10 — Cabinet inspected. 08:25 — Archivist entered the room. 08:40 — Cabinet found open. The archivist claimed that the cabinet was already open when he arrived. However, the inspection record clearly states that the cabinet was sealed at 08:10.",

    question:

      "Was the archivist's statement consistent with the recorded evidence?",

    answer: "0",

  },



  {

    id: 2,

    title: "THE MIDNIGHT DELIVERY",

    category: "SECURITY REPORT",

    date: "JULY 10, 2035",

    body: "A sealed package was scheduled to arrive at 23:30. The receiving log records its arrival at 23:30, while the security camera shows the courier entering the facility at 23:24 and leaving at 23:37.",

    question:

      "Does the recorded evidence support that the package arrived at the scheduled time?",

    answer: "1",

  },



  {

    id: 3,

    title: "THE EMPTY OFFICE",

    category: "PERSONNEL RECORD",

    date: "JULY 11, 2035",

    body: "The access system records that Room 17 was opened at 14:05. The employee assigned to the room reported that he never entered the office that afternoon. A second record shows his access card was used at exactly 14:05.",

    question:

      "Is the employee's statement supported by the access records?",

    answer: "0",

  },



  {

    id: 4,

    title: "THE LOST PACKAGE",

    category: "DELIVERY RECORD",

    date: "JULY 12, 2035",

    body: "The delivery register lists Package 42 as received at 10:15. The recipient signed the register at 10:16. The security camera also shows the package being placed on the reception desk at 10:15.",

    question:

      "Do the records support that Package 42 was received?",

    answer: "1",

  },



  {

    id: 5,

    title: "THE BROKEN SEAL",

    category: "LABORATORY LOG",

    date: "JULY 13, 2035",

    body: "A laboratory container was marked sealed at 07:00. At 07:45, the technician reported finding it already open. No authorized opening was recorded between the two times.",

    question:

      "Is the technician's discovery consistent with the recorded evidence?",

    answer: "0",

  },



  {

    id: 6,

    title: "THE SECOND KEY",

    category: "ACCESS REPORT",

    date: "JULY 14, 2035",

    body: "The main archive door requires two keys. The first key was recorded at 16:20 and the second at 16:21. The door sensor recorded an opening at 16:22.",

    question:

      "Do the records indicate that both keys were used before the door opened?",

    answer: "1",

  },



  {

    id: 7,

    title: "THE FORGOTTEN ENTRY",

    category: "VISITOR LOG",

    date: "JULY 15, 2035",

    body: "The visitor register contains no entry for Room 4 on Tuesday. However, the access system records a visitor badge being used at Room 4 at 12:40.",

    question:

      "Does the visitor register completely agree with the access system?",

    answer: "0",

  },



  {

    id: 8,

    title: "THE SEALED ROOM",

    category: "FACILITY REPORT",

    date: "JULY 16, 2035",

    body: "Room 8 was sealed at 18:00. The monitoring system recorded no door activity between 18:00 and 19:00.",

    question:

      "Does the monitoring record support that the room remained closed?",

    answer: "1",

  },



  {

    id: 9,

    title: "THE UNKNOWN VISITOR",

    category: "SECURITY FILE",

    date: "JULY 17, 2035",

    body: "A security officer stated that nobody entered the western corridor after 20:00. Camera footage clearly records a person entering the corridor at 20:14.",

    question:

      "Is the officer's statement consistent with the camera evidence?",

    answer: "0",

  },



  {

    id: 10,

    title: "THE CLOCK ERROR",

    category: "SYSTEM REPORT",

    date: "JULY 18, 2035",

    body: "The archive clock displayed 09:00. The central server recorded the same event at 09:00. Both systems were synchronized during the inspection.",

    question:

      "Do both records agree on the recorded time?",

    answer: "1",

  },



  {

    id: 11,

    title: "THE DUPLICATE FILE",

    category: "DATA ARCHIVE",

    date: "JULY 19, 2035",

    body: "File A was created at 11:10. The archive index shows File A was also created at 11:10 by a different operator using the same file identifier.",

    question:

      "Does this evidence indicate that the archive contains a duplicate record?",

    answer: "1",

  },



  {

    id: 12,

    title: "THE SILENT ALARM",

    category: "ALARM REPORT",

    date: "JULY 20, 2035",

    body: "The alarm system was activated at 21:00. The control panel recorded no alarm event during the following hour. The technician later claimed that the alarm had triggered at 21:30.",

    question:

      "Is the technician's statement supported by the control-panel record?",

    answer: "0",

  },



  {

    id: 13,

    title: "THE RETURNED DOCUMENT",

    category: "DOCUMENT LOG",

    date: "JULY 21, 2035",

    body: "Document 19 was checked out at 13:00 and returned at 14:30. Both transactions were recorded in the document register.",

    question:

      "Does the record show that Document 19 was returned?",

    answer: "1",

  },



  {

    id: 14,

    title: "THE UNLOCKED CABINET",

    category: "STORAGE REPORT",

    date: "JULY 22, 2035",

    body: "Cabinet 6 was inspected and locked at 15:00. At 15:20, an employee claimed that he found the cabinet unlocked when he arrived. No unlocking event appears in the access log.",

    question:

      "Is the employee's statement fully supported by the access record?",

    answer: "0",

  },



  {

    id: 15,

    title: "THE FINAL RECORD",

    category: "CLASSIFIED ARCHIVE",

    date: "JULY 23, 2035",

    body: "The final archive record states that the investigation ended at 17:00. The official closing report was signed at 17:02 and contains the same investigation reference number.",

    question:

      "Do the final records support that the investigation was formally closed?",

    answer: "1",

  },

];



function Chamber1() {

  const navigate = useNavigate();



  const [currentReport, setCurrentReport] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [sequence, setSequence] = useState([]);

  const [timeLeft, setTimeLeft] = useState(() => {
    // ONE GLOBAL GAME TIMER.
    // GameStart creates onesZerosStartTime once.
    const startTime = Number(
      localStorage.getItem("onesZerosStartTime")
    );

    if (!startTime) return 0;

    return Math.max(
      0,
      90 * 60 - Math.floor((Date.now() - startTime) / 1000)
    );
  });

  useEffect(() => {
    const updateGlobalTimer = () => {
      const startTime = Number(
        localStorage.getItem("onesZerosStartTime")
      );

      if (!startTime) {
        setTimeLeft(0);
        return;
      }

      const elapsedSeconds = Math.floor(
        (Date.now() - startTime) / 1000
      );

      setTimeLeft(
        Math.max(0, 90 * 60 - elapsedSeconds)
      );
    };

    updateGlobalTimer();

    const timer = setInterval(updateGlobalTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  const [message, setMessage] = useState("");

  const [finalCode, setFinalCode] = useState("");



  const report = reports[currentReport];



  useEffect(() => {

  startChamber(1).catch((error) => {

    console.error("Chamber 1 start error:", error);

  });

}, []);
const formatTime = (seconds) => {

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;



    return `${String(minutes).padStart(2, "0")}:${String(

      remainingSeconds

    ).padStart(2, "0")}`;

  };



  /*

    FINAL CHAMBER CODE RULE



    1. Take the complete 15-bit sequence.

    2. Count the number of 1s.

    3. Apply modulo 4.

    4. Convert the result to exactly 2 binary bits.



    Chamber 1:

    010101010110101

    Number of 1s = 8

    8 % 4 = 0

    0 = 00



    FINAL CODE = 00

  */

  const generateFinalBinaryCode = (completedSequence) => {

    const numberOfOnes = completedSequence.filter(

      (bit) => bit === "1"

    ).length;



    const twoBitValue = numberOfOnes % 4;



    return twoBitValue

      .toString(2)

      .padStart(2, "0");

  };



  const handleVerify = () => {

    if (!selectedAnswer) {

      setMessage("SELECT 0 OR 1");

      return;

    }



    if (selectedAnswer !== report.answer) {

      setMessage("INCORRECT — RECHECK THE RECORD");

      return;

    }



    const newSequence = [

      ...sequence,

      selectedAnswer,

    ];



    setSequence(newSequence);

    setMessage("CORRECT — RECORD DECODED");



    setTimeout(() => {

      if (currentReport === reports.length - 1) {

        const generatedCode =

          generateFinalBinaryCode(newSequence);



        setFinalCode(generatedCode);

        completeChamber({

  chamberNumber: 1,

  resultCode: generatedCode,

  score: 0,

}).catch((error) => {

  console.error("Chamber 1 completion error:", error);

});



        /*

          Save the complete 15-answer sequence.

        */

        localStorage.setItem(

          "chamber1Sequence",

          JSON.stringify(newSequence)

        );



        /*

          Save ONLY the final 2-bit chamber code.

          Chamber 8 will use this value.

        */

        localStorage.setItem(

          "onesZerosChamber1Result",

          generatedCode

        );



        localStorage.setItem(

          "chamber1Code",

          generatedCode

        );



        localStorage.setItem(

          "chamber1Result",

          generatedCode

        );



        /*

          IMPORTANT:

          We do NOT immediately navigate.

          The player must see and remember

          the final 2-bit code.

        */



        setMessage(

          "CHAMBER 01 COMPLETE — FINAL CODE DECODED"

        );



        return;

      }



      setCurrentReport(

        (previous) => previous + 1

      );



      setSelectedAnswer("");

      setMessage("");

    }, 700);

  };



  return (

    <div className="chamber-page">



      {/* TOP BAR */}



      <header className="top-bar">



        <div className="brand-mark">

          <span className="brand-zero">0</span>

          <span className="brand-symbol">&</span>

          <span className="brand-one">1</span>

        </div>



        <div className="chamber-name">

          CHAMBER <span>01</span>

        </div>



        <div

          className={`timer ${

            timeLeft <= 300

              ? "timer-warning"

              : ""

          }`}

        >

          {formatTime(timeLeft)}

        </div>



      </header>



      {/* MAIN AREA */}



      <main className="archive-main">



        <section className="archive-header">



          <div className="archive-kicker">

            ONES &amp; ZEROS ARCHIVE

          </div>



          <div className="archive-date">

            JULY 09 — 2035

          </div>



          <div className="classified">

            CLASSIFIED REPORT

          </div>



          <h1>THE ARCHIVE</h1>



          <p className="archive-subtitle">

            15 REPORTS. 15 ANSWERS. ONE BINARY CODE.

          </p>



          <div className="header-rule" />



        </section>



        {/* NEWSPAPER */}



        <section className="newspaper">



          <div className="paper-noise" />



          <div className="paper-top">

            <span>ARCHIVE DIVISION</span>



            <span>

              DOCUMENT{" "}

              {String(report.id).padStart(2, "0")} / 15

            </span>



            <span>EVIDENCE CLASS: A</span>

          </div>



          <div className="paper-content">



            <div className="report-meta">

              <span>{report.category}</span>

              <span>{report.date}</span>

            </div>



            <h2>{report.title}</h2>



            <div className="headline-line" />



            <div className="article-body">

              <p>{report.body}</p>

            </div>



            <div className="evidence-box">



              <span className="evidence-label">

                YOUR TASK

              </span>



              <h3>{report.question}</h3>



            </div>



          </div>



          <div className="paper-footer">

            <span>ONES &amp; ZEROS ARCHIVE</span>



            <span>

              RECORD{" "}

              {String(report.id).padStart(2, "0")}

            </span>



            <span>AUTHORIZED ACCESS ONLY</span>

          </div>



        </section>



        {/* ANSWER AREA */}



        {!finalCode && (

          <section className="decode-panel">



            <div className="decode-title">

              DECODE THE RECORD

            </div>



            <div className="decode-description">

              Determine the answer from the evidence.

              <br />

              Select only <strong>0</strong> or{" "}

              <strong>1</strong>.

            </div>



            <div className="binary-options">



              <button

                type="button"

                className={`binary-button ${

                  selectedAnswer === "0"

                    ? "selected"

                    : ""

                }`}

                onClick={() => {

                  setSelectedAnswer("0");

                  setMessage("");

                }}

              >

                0

              </button>



              <button

                type="button"

                className={`binary-button ${

                  selectedAnswer === "1"

                    ? "selected"

                    : ""

                }`}

                onClick={() => {

                  setSelectedAnswer("1");

                  setMessage("");

                }}

              >

                1

              </button>



            </div>



            <button

              type="button"

              className="verify-button"

              onClick={handleVerify}

            >

              VERIFY

              <span>→</span>

            </button>



            {message && (

              <div

                className={`answer-message ${

                  message.startsWith("CORRECT") ||

                  message.startsWith("CHAMBER")

                    ? "success"

                    : "error"

                }`}

              >

                {message}

              </div>

            )}



          </section>

        )}



        {/* DISCOVERED SEQUENCE */}



        <section className="sequence-panel">



          <div className="sequence-heading">



            <span>

              DISCOVERED SEQUENCE

            </span>



            <span>

              {sequence.length} / {reports.length}

            </span>



          </div>



          <div className="sequence-grid">



            {reports.map((item, index) => (



              <div

                key={item.id}

                className={`sequence-cell ${

                  index < sequence.length

                    ? "completed"

                    : ""

                } ${

                  index === currentReport &&

                  !finalCode

                    ? "active"

                    : ""

                }`}

              >

                {index < sequence.length

                  ? sequence[index]

                  : "—"}

              </div>



            ))}



          </div>



        </section>



        {/* FINAL BINARY CODE */}



        {finalCode && (

          <section className="final-code-card">



            <div className="final-code-top">



              <span>

                CHAMBER 01 · SIGNAL

              </span>



              <span>

                FINAL RESULT

              </span>



            </div>



            <div className="final-code-content">



              <div className="final-code-label">

                YOUR CHAMBER CODE

              </div>



              <div className="final-code-value">

                {finalCode}

              </div>



              <p>

                Remember this 2-bit code.

                <br />

                You will need it in CHAMBER 08.

              </p>



              <div className="final-code-warning">

                DO NOT LOSE THIS CODE

              </div>



              <button

                type="button"

                className="continue-button"

                onClick={() => {

                  navigate("/chamber-02");

                }}

              >

                ENTER CHAMBER 02

                <span>→</span>

              </button>



            </div>



          </section>

        )}



        {/* PROGRESS */}



        {!finalCode && (

          <div className="progress-area">



            <div className="progress-label">



              <span>

                ARCHIVE PROGRESS

              </span>



              <span>

                {String(

                  currentReport + 1

                ).padStart(2, "0")}{" "}

                / 15

              </span>



            </div>



            <div className="progress-track">



              <div

                className="progress-fill"

                style={{

                  width: `${

                    ((currentReport + 1) /

                      reports.length) *

                    100

                  }%`,

                }}

              />



            </div>



          </div>

        )}



      </main>



    </div>

  );

}



export default Chamber1;