import React, { useEffect, useMemo, useState } from "react";



import { useNavigate } from "react-router-dom";

import {

  startChamber,

  completeChamber,

} from "../../lib/chamberProgress";



import "./Chamber6.css";















const TOTAL_TIME = 90 * 60;







const CHAMBER_RESULT = "0110";















const ROUND_NAMES = [







  "THE IMPOSSIBLE REFLECTION",







  "MIRROR MATRIX",







  "MIRROR // 0 | 1 WORD HUNT",







  "FALSE MIRROR",







];















const WORDS = [







  "MIRROR",







  "BINARY",







  "REFLECT",







  "ROTATE",







  "SYMMETRY",







  "MATRIX",







  "PRISM",







  "PERSPECTIVE",







];















const WORD_PLACEMENTS = [







  { word: "MIRROR", row: 2, col: 3, dr: 0, dc: 1 },







  { word: "BINARY", row: 4, col: 20, dr: 1, dc: 0 },







  { word: "REFLECT", row: 10, col: 2, dr: 0, dc: 1 },







  { word: "ROTATE", row: 14, col: 20, dr: 0, dc: -1 },







  { word: "SYMMETRY", row: 22, col: 3, dr: -1, dc: 1 },







  { word: "MATRIX", row: 17, col: 18, dr: 1, dc: 0 },







  { word: "PRISM", row: 20, col: 12, dr: 0, dc: 1 },







  { word: "PERSPECTIVE", row: 24, col: 22, dr: 0, dc: -1 },







];















const WORD_GRID_SIZE = 24;















function getWordPath({ word, row, col, dr, dc }) {







  return Array.from({ length: word.length }, (_, i) => ({







    row: row - 1 + dr * i,







    col: col - 1 + dc * i,







  }));







}















function buildWordGrid() {







  const grid = Array.from(







    { length: WORD_GRID_SIZE },







    () => Array(WORD_GRID_SIZE).fill("")







  );















  for (const placement of WORD_PLACEMENTS) {







    const path = getWordPath(placement);















    path.forEach((cell, index) => {







      if (







        cell.row < 0 ||







        cell.row >= WORD_GRID_SIZE ||







        cell.col < 0 ||







        cell.col >= WORD_GRID_SIZE







      ) {







        throw new Error(







          `${placement.word} is outside the 24 × 24 grid.`







        );







      }















      const letter = placement.word[index];







      const existing = grid[cell.row][cell.col];















      if (existing && existing !== letter) {







        throw new Error(







          `Word collision at ${cell.row + 1},${cell.col + 1}`







        );







      }















      grid[cell.row][cell.col] = letter;







    });







  }















  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";















  for (let r = 0; r < WORD_GRID_SIZE; r += 1) {







    for (let c = 0; c < WORD_GRID_SIZE; c += 1) {







      if (!grid[r][c]) {







        grid[r][c] =







          alphabet[(r * 11 + c * 7 + r * c + 5) % alphabet.length];







      }







    }







  }















  return grid;







}















const WORD_GRID = buildWordGrid();















const WORD_TARGET_PATHS = Object.fromEntries(







  WORD_PLACEMENTS.map((placement) => [







    placement.word,







    getWordPath(placement),







  ])







);















function pathKey(cell) {







  return `${cell.row}-${cell.col}`;







}















function normalizePath(path) {







  return path.map(pathKey);







}















function samePath(a, b) {







  return a.length === b.length && a.every((v, i) => v === b[i]);







}















function lineBetween(a, b) {







  const dr = b.row - a.row;







  const dc = b.col - a.col;















  const straight =







    dr === 0 ||







    dc === 0 ||







    Math.abs(dr) === Math.abs(dc);















  if (!straight) return [];















  const steps = Math.max(Math.abs(dr), Math.abs(dc));







  if (steps === 0) return [a];















  const sr = dr === 0 ? 0 : dr / steps;







  const sc = dc === 0 ? 0 : dc / steps;















  return Array.from({ length: steps + 1 }, (_, i) => ({







    row: a.row + sr * i,







    col: a.col + sc * i,







  }));







}















function formatTime(seconds) {







  const safe = Math.max(0, seconds);







  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(







    safe % 60







  ).padStart(2, "0")}`;







}















function MirrorCrystal({ small = false }) {







  return (







    <div className={`mirror-crystal ${small ? "small-crystal" : ""}`}>







      <i className="crystal-plane plane-a" />







      <i className="crystal-plane plane-b" />







      <i className="crystal-plane plane-c" />







      <i className="crystal-plane plane-d" />







      <i className="crystal-plane plane-e" />







      <i className="crystal-glint" />







    </div>







  );







}















function Stat({ icon, label, value }) {







  return (







    <div className="stat">







      <b>{icon}</b>







      <div>







        <small>{label}</small>







        <strong>{value}</strong>







      </div>







    </div>







  );







}















function GameHeader({ round, time, score, clues }) {







  return (







    <header className="game-header">







      <div className="game-brand">







        <div className="brand-mark"><span /></div>







        <div>







          <strong>ONES &amp; ZEROS</strong>







          <small>CHAMBER 06 · MIRROR</small>







        </div>







      </div>















      <Stat icon="⌛" label="TIME REMAINING" value={formatTime(time)} />







      <Stat icon="◌" label="ROUND" value={`0${round} / 04`} />







      <Stat icon="✦" label="SCORE" value={score} />







      <Stat icon="⌕" label="CLUES" value={`${clues} / 7`} />















      <div className="binary-pill">0 <span>|</span> 1</div>







    </header>







  );







}















function RoundBar({ round, title, instruction }) {







  return (







    <div className="round-bar">







      <div className="progress">







        {[1, 2, 3, 4].map((n) => (







          <React.Fragment key={n}>







            <span className={n <= round ? "filled" : ""} />







            {n < 4 && <i className={n < round ? "filled-line" : ""} />}







          </React.Fragment>







        ))}







      </div>







      <div>







        <small>ROUND 0{round} / 04</small>







        <strong>{title}</strong>







      </div>







      <p>{instruction}</p>







    </div>







  );







}















function RoundTitle({ number, title, text }) {







  return (







    <div className="round-title">







      <span>{number}</span>







      <h1>{title}</h1>







      <p>{text}</p>







    </div>







  );







}















function EntryScreen({ onEnter }) {







  return (







    <main className="entry-screen">







      <header className="entry-header">







        <div className="brand">







          <div className="brand-mark"><span /></div>







          <div>







            <strong>ONES &amp; ZEROS</strong>







            <small>PUZZLE · EXPLORE · ESCAPE</small>







          </div>







        </div>















        <div className="entry-stats">







          <div><small>TIME</small><strong>90:00</strong></div>







          <div><small>CHAMBER</small><strong>06 / 08</strong></div>







          <b>0 <span>|</span> 1</b>







        </div>







      </header>















      <section className="entry-hero">







        <div className="entry-copy">







          <div className="eyebrow">CHAMBER 06 <span /></div>







          <h1>MIRROR</h1>







          <blockquote>







            “What you see is not always<br />what exists.”







          </blockquote>







          <p>







            Look closer. Reflect. Analyze. Every angle hides a truth.







            Only one transformation is real.







          </p>















          <div className="entry-actions">







            <button onClick={onEnter}>







              ENTER CHAMBER <span>→</span>







            </button>







            <div className="principles">







              <b>0</b><i>|</i><b>1</b>







              <small>REALITY</small>







              <small>ILLUSION</small>







              <small>PERSPECTIVE</small>







            </div>







          </div>







        </div>















        <div className="entry-art">







          <div className="hero-arch" />







          <div className="hero-platform">







            <span /><span /><span />







            <MirrorCrystal />







          </div>







          <i className="art-orb art-orb-1" />







          <i className="art-orb art-orb-2" />







          <b className="spark spark-1">✦</b>







          <b className="spark spark-2">✧</b>







        </div>















        <div className="entry-note">







          <div className="hand-note">







            Same<br />Object<br />Different<br />Truth<br /><span>↙</span>







          </div>







          <div className="entry-rounds">







            <b>01</b><span>02</span><span>03</span><span>04</span>







          </div>







        </div>







      </section>















      <section className="entry-rounds-overview">







        {ROUND_NAMES.map((name, index) => (







          <div className="overview-card" key={name}>







            <strong>0{index + 1}</strong>







            <div>







              <b>{name}</b>







              <small>{index === 0 ? "START HERE" : "UNLOCKS IN ORDER"}</small>







            </div>







          </div>







        ))}







      </section>















      <footer className="entry-footer">







        <span>ONES &amp; ZEROS</span>







        <i />







        <small>CHAMBER 06 · MIRROR</small>







        <div />







        <b>REFLECTIONS REVEAL MORE THAN IMAGES.</b>







      </footer>







    </main>







  );







}















function ReflectionRound({ complete, error }) {







  const [selected, setSelected] = useState(null);







  const [rotation, setRotation] = useState(0);















  const options = [







    { id: "A", rotate: -8, flip: false },







    { id: "B", rotate: 7, flip: true },







    { id: "C", rotate: 15, flip: false },







    { id: "D", rotate: -13, flip: true },







  ];















  return (







    <div className="full-round">







      <RoundBar round={1} title="THE IMPOSSIBLE REFLECTION"







        instruction="Select the correct mirror reflection." />















      <RoundTitle number="01" title="THE IMPOSSIBLE REFLECTION"







        text="One object. Four reflections. Compare the asymmetric faces carefully." />















      <div className="reflection-board">







        <div className="original-panel">







          <label>ORIGINAL OBJECT</label>







          <div className="object-stage">







            <i className="object-orb" />







            <MirrorCrystal />







            <span className="floor-ring" />







          </div>







          <button className="circle-button" onClick={() => setRotation(v => v + 15)}>







            ↻







          </button>







        </div>















        <div className="reflection-panel">







          <div className="panel-label">







            <span>SELECT ONE</span>







            <small>COMPARE EVERY ANGLE</small>







          </div>















          <div className="reflection-options">







            {options.map(option => (







              <button key={option.id}







                className={selected === option.id ? "selected" : ""}







                onClick={() => setSelected(option.id)}>







                <b>{option.id}</b>







                <div className="option-crystal"







                  style={{







                    transform: `translate(-50%, -50%) rotate(${option.rotate + rotation}deg) ${option.flip ? "scaleX(-1)" : ""}`







                  }}>







                  <MirrorCrystal small />







                </div>







              </button>







            ))}







          </div>















          <div className="rule-box">







            <b>RULE</b>







            <p>Mirror the horizontal position. Do not invent, remove, or rotate the object.</p>







          </div>















          <button className="submit" onClick={() =>







            selected === "B"







              ? complete(90, "Reflection clue collected.")







              : error("FALSE REFLECTION — CHECK THE ASYMMETRIC FACE.")







          }>







            VERIFY REFLECTION <span>→</span>







          </button>







        </div>







      </div>







    </div>







  );







}















const MATRIX_SIZE = 16;















const MATRIX_SOURCE = Array.from({ length: MATRIX_SIZE }, (_, row) =>







  Array.from({ length: MATRIX_SIZE }, (_, col) =>







    ((row * 17 + col * 29 + row * col * 3 + 7) % 11) < 5 ? 1 : 0







  )







);















const MATRIX_ANSWER = MATRIX_SOURCE.map(row => [...row].reverse());















function MatrixGrid({ values, interactive, onToggle }) {







  return (







    <div className="matrix-grid">







      {values.flat().map((value, index) => (







        <button key={index}







          className={value ? "on" : "off"}







          disabled={!interactive}







          onClick={() => interactive && onToggle(index)}>







          {value}







        </button>







      ))}







    </div>







  );







}















function MatrixRound({ complete, error }) {







  const [values, setValues] = useState(() =>







    Array(MATRIX_SIZE * MATRIX_SIZE).fill(0)







  );















  const answer = useMemo(() => MATRIX_ANSWER.flat(), []);















  const toRows = flat =>







    Array.from({ length: MATRIX_SIZE }, (_, row) =>







      flat.slice(row * MATRIX_SIZE, (row + 1) * MATRIX_SIZE)







    );















  const toggle = index => {







    setValues(current =>







      current.map((value, i) => i === index ? (value ? 0 : 1) : value)







    );







  };















  const clear = () =>







    setValues(Array(MATRIX_SIZE * MATRIX_SIZE).fill(0));















  const verify = () => {







    if (values.every((value, index) => value === answer[index])) {







      complete(100, "16 × 16 matrix clue collected.");







    } else {







      error("MATRIX MISMATCH — REVERSE EVERY ROW FROM LEFT TO RIGHT.");







    }







  };















  return (







    <div className="full-round matrix-round">







      <RoundBar round={2} title="MIRROR MATRIX"







        instruction="Reflect the 16 × 16 binary matrix from left to right. Do not rotate it." />















      <RoundTitle number="02" title="MIRROR MATRIX"







        text="Reconstruct the exact horizontal reflection. Every row contains 16 binary cells." />















      <div className="matrix-rule-banner">







        <div>







          <b>MIRROR LEFT → RIGHT</b>







          <span>Reverse the position of every cell in each row.</span>







        </div>







        <div className="example">







          <span>1 0 0 1 0</span><b>→</b><strong>0 1 0 0 1</strong>







        </div>







        <div className="do-not"><small>DO NOT</small><b>ROTATE</b><b>CHANGE 0 ↔ 1</b></div>







      </div>















      <div className="matrix-board">







        <div className="matrix-card">







          <div className="matrix-card-head"><span>SOURCE · 16 × 16</span><small>READ ONLY</small></div>







          <MatrixGrid values={MATRIX_SOURCE} interactive={false} />







        </div>















        <div className="matrix-arrow">→</div>















        <div className="matrix-card player">







          <div className="matrix-card-head"><span>YOUR REFLECTION · 16 × 16</span><small>CLICK CELLS</small></div>







          <MatrixGrid values={toRows(values)} interactive onToggle={toggle} />







        </div>







      </div>















      <div className="matrix-bottom">







        <div><b>TIP</b><span>Reverse each row. A 1 stays a 1 and a 0 stays a 0.</span></div>







        <button className="secondary" onClick={clear}>CLEAR</button>







        <button className="submit" onClick={verify}>VERIFY MATRIX <span>→</span></button>







      </div>







    </div>







  );







}















function WordRound({ complete, error, success }) {







  const [first, setFirst] = useState(null);







  const [selected, setSelected] = useState([]);







  const [found, setFound] = useState([]);















  const cells = useMemo(







    () => WORD_GRID.flatMap((row, r) =>







      row.map((letter, c) => ({ key: `${r}-${c}`, row: r, col: c, letter }))







    ),







    []







  );















  const cellMap = useMemo(







    () => new Map(cells.map(cell => [cell.key, cell])),







    [cells]







  );















  const click = cell => {







    if (found.length === WORDS.length) return;















    if (!first) {







      setFirst(cell);







      setSelected([cell.key]);







      return;







    }















    const line = lineBetween(first, cell);















    if (!line.length) {







      error("WORDS MUST BE HORIZONTAL, VERTICAL, OR DIAGONAL.");







      setFirst(cell);







      setSelected([cell.key]);







      return;







    }















    setSelected(line.map(pathKey));







  };















  const verify = () => {







    if (selected.length < 2) {







      error("SELECT THE FIRST AND LAST LETTER OF A WORD.");







      return;







    }















    const selectedPath = selected;







    const selectedWord = selectedPath.map(key => cellMap.get(key)?.letter || "").join("");







    const reversedPath = [...selectedPath].reverse();















    const match = WORDS.find(word => {







      if (found.includes(word)) return false;







      const targetPath = normalizePath(WORD_TARGET_PATHS[word]);







      return samePath(selectedPath, targetPath) ||







        samePath(reversedPath, targetPath);







    });















    if (!match) {







      setFirst(null);







      setSelected([]);







      error(`NOT THE EXACT HIDDEN WORD — "${selectedWord || "?"}" IS NOT THE CORRECT OCCURRENCE.`);







      return;







    }















    const next = [...found, match];







    setFound(next);







    setFirst(null);







    setSelected([]);















    if (next.length === WORDS.length) {







      complete(130, "All 8 exact hidden words found. Word-hunt clue collected.");







    } else {







      success(`EXACT WORD FOUND: ${match}`);







    }







  };















  return (







    <div className="full-round word-round">







      <RoundBar round={3} title="MIRROR // 0 | 1 WORD HUNT"







        instruction="Find all 8 exact hidden words. Random matching letters do not count." />















      <RoundTitle number="03" title="MIRROR // 0 | 1 WORD HUNT"







        text="Select the first and last letter of an exact hidden word. The selected path must match the real hidden occurrence." />















      <div className="word-board-wrap">







        <div className="word-grid-panel">







          <div className="grid-label">







            <span>24 × 24 WORD FIELD</span>







            <small>FIRST LETTER → LAST LETTER</small>







          </div>















          <div className="word-grid">







            {cells.map(cell => {







              const isSelected = selected.includes(cell.key);







              const isFound = found.some(word =>







                normalizePath(WORD_TARGET_PATHS[word]).includes(cell.key)







              );















              return (







                <button key={cell.key}







                  className={`${isSelected ? "selected" : ""} ${isFound ? "found-cell" : ""}`}







                  onClick={() => click(cell)}>







                  {cell.letter}







                </button>







              );







            })}







          </div>







        </div>















        <aside className="word-side">







          <small>FIND ALL 8</small>















          <div className="targets">







            {WORDS.map(word => (







              <div key={word} className={found.includes(word) ? "found" : ""}>







                <span>{found.includes(word) ? "✓" : "○"}</span>{word}







              </div>







            ))}







          </div>















          <div className="current-selection">







            <small>CURRENT SELECTION</small>







            <strong>







              {selected.length







                ? selected.map(key => cellMap.get(key)?.letter || "").join("")







                : "— — —"}







            </strong>







          </div>















          <p className="exact-word-rule">







            <b>EXACT MATCH RULE</b>







            Select the actual hidden occurrence. A random line of letters that happens to spell a target word is rejected.







          </p>















          <button className="submit" onClick={verify}>







            VERIFY EXACT WORD <span>→</span>







          </button>







        </aside>







      </div>







    </div>







  );







}















const FALSE_OPTIONS = [







  { id: "A", rotation: 0, vertical: true, symmetric: true },







  { id: "B", rotation: 90, vertical: true, symmetric: false },







  { id: "C", rotation: 180, vertical: false, symmetric: true },







  { id: "D", rotation: 270, vertical: true, symmetric: true },







];















function FalseMirrorRound({ complete, error }) {







  const [selected, setSelected] = useState(null);















  const verify = () => {







    if (selected === "A") {







      complete(160, `Chamber result ${CHAMBER_RESULT} collected.`);







    } else {







      error("FALSE MIRROR — CHECK ALL FOUR TRANSFORMATION RULES.");







    }







  };















  return (







    <div className="full-round false-round">







      <RoundBar round={4} title="FALSE MIRROR"







        instruction="Only one object follows every transformation rule." />















      <RoundTitle number="04" title="FALSE MIRROR"







        text="Four objects look similar. Only one satisfies every rule." />















      <div className="false-rules">







        <div><b>01</b><strong>VERTICAL MIRROR</strong><span>Reflect across the vertical axis.</span></div>







        <div><b>02</b><strong>ROTATION = 0°</strong><span>The orientation must remain unchanged.</span></div>







        <div><b>03</b><strong>PRESERVE SYMMETRY</strong><span>The final object must remain symmetric.</span></div>







        <div><b>04</b><strong>NO HORIZONTAL FLIP</strong><span>Do not perform a second transformation.</span></div>







      </div>















      <div className="false-options">







        {FALSE_OPTIONS.map(option => (







          <button key={option.id}







            className={selected === option.id ? "selected" : ""}







            onClick={() => setSelected(option.id)}>







            <b>{option.id}</b>







            <div className="false-crystal"







              style={{







                transform: `translate(-50%, -50%) rotate(${option.rotation}deg) ${option.vertical ? "scaleX(-1)" : ""}`







              }}>







              <MirrorCrystal small />







            </div>







            <small>{option.rotation}° · {option.symmetric ? "SYMMETRIC" : "ASYMMETRIC"}</small>







          </button>







        ))}







      </div>















      <div className="false-bottom">







        <div>0 <span>|</span> 1 <small>PRECISION IS THE KEY</small></div>







        <button className="submit" onClick={verify}>VERIFY FINAL MIRROR <span>→</span></button>







      </div>







    </div>







  );







}















function CompleteScreen({ score, restart, onNext }) {







  return (







    <main className="complete-screen">







      <div className="complete-crystal"><MirrorCrystal /></div>







      <small>CHAMBER 06 COMPLETE</small>







      <h1>MIRROR CLEARED</h1>







      <p>All four Mirror challenges have been verified.</p>















      <div className="result">







        <span>CHAMBER RESULT</span>







        <strong>{CHAMBER_RESULT}</strong>







      </div>















      <div className="final-score">FINAL SCORE <b>{score}</b></div>







      <div className="complete-actions">



        <button onClick={restart}>RESTART CHAMBER</button>



        <button onClick={onNext}>ENTER CHAMBER 07 →</button>



      </div>







    </main>







  );







}















function ExpiredScreen({ restart }) {







  return (







    <main className="complete-screen expired">







      <div className="complete-crystal"><MirrorCrystal /></div>







      <small>TIME EXPIRED</small>







      <h1>CHAMBER LOCKED</h1>







      <p>The 90-minute chamber timer has reached zero.</p>







      <button onClick={restart}>RESTART CHAMBER</button>







    </main>







  );







}















export default function Chamber6() {







    const navigate = useNavigate();



  useEffect(() => {

    startChamber(6).catch((error) => {

      console.error("Chamber 6 start error:", error);

    });

  }, []);







const [mode, setMode] = useState("entry");







  const [round, setRound] = useState(1);







  const [score, setScore] = useState(0);







  const [clues, setClues] = useState(0);







  const [time, setTime] = useState(() => {
    const storedStart = Number(
      localStorage.getItem("onesZerosStartTime")
    );

    if (!Number.isFinite(storedStart) || storedStart <= 0) {
      return 0;
    }

    return Math.max(
      0,
      TOTAL_TIME - Math.floor((Date.now() - storedStart) / 1000)
    );
  });







  const [message, setMessage] = useState("Analyze every transformation carefully.");







  const [messageType, setMessageType] = useState("info");







  const [complete, setComplete] = useState(false);







  const [expired, setExpired] = useState(false);







  const [roundWon, setRoundWon] = useState(false);















  useEffect(() => {







    if (mode !== "game" || complete || expired) return undefined;















    const updateTimer = () => {
      const storedStart = Number(
        localStorage.getItem("onesZerosStartTime")
      );

      if (!Number.isFinite(storedStart) || storedStart <= 0) {
        setTime(0);
        setExpired(true);
        return;
      }

      const remaining = Math.max(
        0,
        TOTAL_TIME - Math.floor((Date.now() - storedStart) / 1000)
      );

      setTime(remaining);

      if (remaining === 0) {
        setExpired(true);
      }
    };















    updateTimer();







    const timer = setInterval(updateTimer, 1000);







    return () => clearInterval(timer);







  }, [mode, complete, expired]);















  const enter = () => {







    







    setMode("game");







    setRound(1);







    setScore(0);







    setClues(0);







    setTime(() => {
      const storedStart = Number(
        localStorage.getItem("onesZerosStartTime")
      );

      return Number.isFinite(storedStart) && storedStart > 0
        ? Math.max(
            0,
            TOTAL_TIME - Math.floor((Date.now() - storedStart) / 1000)
          )
        : 0;
    });







    setComplete(false);







    setExpired(false);







    setRoundWon(false);







    setMessage("Analyze every transformation carefully.");







    setMessageType("info");







  };















  const error = text => {







    setMessage(text);







    setMessageType("error");







    setScore(v => Math.max(0, v - 10));







  };















  const success = text => {







    setMessage(text);







    setMessageType("success");







  };















  const finishRound = (points, text) => {







    setScore(v => v + points);







    setClues(v => Math.min(7, v + 1));







    setRoundWon(true);







    setMessage(text);







    setMessageType("success");







  };















  const continueToNextRound = () => {







    if (!roundWon) return;















    if (round === 4) {







      setComplete(true);







      sessionStorage.setItem("onesZerosChamber6Completed", "true");







      sessionStorage.setItem("onesZerosChamber6Result", CHAMBER_RESULT);



      completeChamber({

        chamberNumber: 6,

        resultCode: CHAMBER_RESULT,

        score,

      }).catch((error) => {

        console.error("Chamber 6 completion error:", error);

      });







      return;







    }















    const next = round + 1;







    setRound(next);







    setRoundWon(false);







    setMessage(`Round ${next} unlocked. Analyze carefully.`);







    setMessageType("info");







  };















  const restart = () => {







    sessionStorage.removeItem("onesZerosChamber6Completed");







    sessionStorage.removeItem("onesZerosChamber6Result");







    







    setMode("entry");







    setRound(1);







    setScore(0);







    setClues(0);







    setTime(() => {
      const storedStart = Number(
        localStorage.getItem("onesZerosStartTime")
      );

      return Number.isFinite(storedStart) && storedStart > 0
        ? Math.max(
            0,
            TOTAL_TIME - Math.floor((Date.now() - storedStart) / 1000)
          )
        : 0;
    });







    setComplete(false);







    setExpired(false);







    setRoundWon(false);







  };















  if (mode === "entry") return <EntryScreen onEnter={enter} />;







  if (expired) return <ExpiredScreen restart={restart} />;







  if (complete) {



    return (



      <CompleteScreen



        score={score}



        restart={restart}



        onNext={() => navigate("/chamber-07")}



      />



    );



  }















  return (







    <main className="game-screen">







      <GameHeader round={round} time={time} score={score} clues={clues} />















      <div className={`game-message ${messageType}`}>







        <b>{messageType === "success" ? "✓" : messageType === "error" ? "!" : "i"}</b>







        <span>{message}</span>







      </div>















      {round === 1 && <ReflectionRound complete={finishRound} error={error} />}







      {round === 2 && <MatrixRound complete={finishRound} error={error} />}







      {round === 3 && <WordRound complete={finishRound} error={error} success={success} />}







      {round === 4 && <FalseMirrorRound complete={finishRound} error={error} />}















      {roundWon && (







        <div className="continue-overlay">







          <div className="continue-card">







            <small>ROUND VERIFIED</small>







            <h2>Clue Collected ✓</h2>







            <p>







              {round === 4







                ? `CHAMBER CODE: ${CHAMBER_RESULT}`







                : "Your result has been recorded. Continue when ready."}







            </p>







            <button className="submit" onClick={continueToNextRound}>







              {round === 4 ? "COMPLETE CHAMBER" : "CONTINUE →"}







            </button>







          </div>







        </div>







      )}







    </main>







  );







}
