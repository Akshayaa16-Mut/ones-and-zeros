import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";







import "./Chamber5.css";

import {
  startChamber,
  completeChamber,
} from "../../lib/chamberProgress";







const TOTAL_TIME = 90 * 60;







const BOLT_CAPACITY = 4;















const COLORS = [







  ["crimson", "CRIMSON", "#ef4444"],







  ["scarlet", "SCARLET", "#f97316"],







  ["amber", "AMBER", "#f59e0b"],







  ["lime", "LIME", "#84cc16"],







  ["emerald", "EMERALD", "#10b981"],







  ["cyan", "CYAN", "#06b6d4"],







  ["azure", "AZURE", "#38bdf8"],







  ["indigo", "INDIGO", "#6366f1"],







  ["violet", "VIOLET", "#8b5cf6"],







  ["magenta", "MAGENTA", "#d946ef"],







  ["rose", "ROSE", "#fb7185"],







  ["gold", "GOLD", "#eab308"],







];















const SHADOW_PUZZLES = [







  {







    object: "OBELISK",







    light: "↖",







    answer: 2,







    options: ["▟", "▙", "▜", "▛"],







  },







  {







    object: "CRESCENT",







    light: "→",







    answer: 4,







    options: ["◐", "◓", "◒", "◑"],







  },







  {







    object: "ARROW RELIEF",







    light: "↓",







    answer: 1,







    options: ["↙", "↘", "↖", "↗"],







  },







  {







    object: "TWIN SPIRE",







    light: "←",







    answer: 3,







    options: ["▥", "▤", "▦", "▧"],







  },







  {







    object: "ASYMMETRIC CUBE",







    light: "↗",







    answer: 2,







    options: ["◩", "◪", "◫", "◧"],







  },







  {







    object: "BROKEN RING",







    light: "↑",







    answer: 4,







    options: ["◔", "◕", "◒", "◓"],







  },







];















const MAHJONG_GLYPHS = [







  "👻", "👻", "👻", "👻", "👻", "👻",







  "👻", "👻", "👻", "👻", "👻", "👻",







  "👻", "👻", "👻", "👻", "👻", "👻",







  "👻", "👻", "👻", "👻", "👻", "👻",







];















const MAHJONG_MARKS = [







  "·", ":", "∶", "⋮", "•", "°", "×", "+",







  "=", "−", "⌁", "∼",







];















function formatTime(seconds) {







  const safe = Math.max(0, seconds);







  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(







    safe % 60







  ).padStart(2, "0")}`;







}















/* ============================================================







   ROUND 2 — 24 × 24 ARROW GENERATOR















   Arrows are added one-by-one while guaranteeing that the newly







   placed arrow has at least one clear direction. Removing arrows







   in reverse placement order therefore always has a solution.







   ============================================================ */















function makeArrowBoard() {







  const size = 24;







  const board = Array.from({ length: size }, () =>







    Array(size).fill(null)







  );















  let seed = Math.floor(Math.random() * 2147483646) + 1;















  const random = () => {







    seed = (seed * 16807) % 2147483647;







    return (seed - 1) / 2147483646;







  };















  const directions = ["↑", "↓", "←", "→"];







  const cells = Array.from({ length: size * size }, (_, i) => i);















  for (let i = cells.length - 1; i > 0; i--) {







    const j = Math.floor(random() * (i + 1));







    [cells[i], cells[j]] = [cells[j], cells[i]];







  }















  let placed = 0;















  for (const cell of cells) {







    if (placed >= 82) break;















    const row = Math.floor(cell / size);







    const col = cell % size;















    const possible = directions.filter((direction) => {







      if (direction === "↑") {







        for (let r = row - 1; r >= 0; r--) {







          if (board[r][col]) return false;







        }







        return true;







      }















      if (direction === "↓") {







        for (let r = row + 1; r < size; r++) {







          if (board[r][col]) return false;







        }







        return true;







      }















      if (direction === "←") {







        for (let c = col - 1; c >= 0; c--) {







          if (board[row][c]) return false;







        }







        return true;







      }















      for (let c = col + 1; c < size; c++) {







        if (board[row][c]) return false;







      }















      return true;







    });















    if (!possible.length) continue;















    const direction =







      possible[Math.floor(random() * possible.length)];















    board[row][col] = {







      direction,







      id: placed,







    };















    placed += 1;







  }















  return board;







}















function canArrowExit(board, row, col) {







  const item = board[row][col];







  if (!item) return false;















  const direction = item.direction;















  if (direction === "↑") {







    for (let r = row - 1; r >= 0; r--) {







      if (board[r][col]) return false;







    }







    return true;







  }















  if (direction === "↓") {







    for (let r = row + 1; r < 24; r++) {







      if (board[r][col]) return false;







    }







    return true;







  }















  if (direction === "←") {







    for (let c = col - 1; c >= 0; c--) {







      if (board[row][c]) return false;







    }







    return true;







  }















  for (let c = col + 1; c < 24; c++) {







    if (board[row][c]) return false;







  }















  return true;







}















/* ============================================================







   ROUND 3 — EXTREME GHOST BOLTS















   PLAYER RULE:







   - Only top bolt moves.







   - Target must be empty OR same colour.







   - Target capacity = 4.















   GENERATOR:







   - Start solved.







   - Perform reverse moves.







   - Reverse move may place the exposed bolt on ANY non-full







     tube, but only when the move can later be undone legally.







   - This produces mixed/random stacks while retaining a solution.







   ============================================================ */















function makeBolts() {







  const createSolved = () => [







    ...COLORS.map(([id]) => Array(BOLT_CAPACITY).fill(id)),







    [],







    [],







  ];















  const scrambleOnce = () => {







    const tubes = createSolved();















    let seed = Math.floor(Math.random() * 2147483646) + 1;















    const random = () => {







      seed = (seed * 16807) % 2147483647;







      return (seed - 1) / 2147483646;







    };















    let previous = null;















    for (let step = 0; step < 2600; step++) {







      const candidates = [];















      for (let from = 0; from < tubes.length; from++) {







        const source = tubes[from];















        if (!source.length) continue;















        const movingColour = source[source.length - 1];















        const underneath =







          source.length > 1







            ? source[source.length - 2]







            : null;















        /*







         * After moving this top bolt, the source must be either:







         * empty OR still have the same colour on top.







         *







         * Therefore the player can later move the bolt back.







         */







        const reversible =







          source.length === 1 ||







          underneath === movingColour;















        if (!reversible) continue;















        for (let to = 0; to < tubes.length; to++) {







          if (to === from) continue;















          if (







            previous &&







            previous.from === to &&







            previous.to === from







          ) {







            continue;







          }















          if (tubes[to].length >= BOLT_CAPACITY) continue;















          const targetTop =







            tubes[to].length > 0







              ? tubes[to][tubes[to].length - 1]







              : null;















          let score = 0;















          /*







           * Strongly prefer putting a colour on a different







           * colour. This creates mixed stacks.







           */







          if (







            targetTop !== null &&







            targetTop !== movingColour







          ) {







            score += 50;







          }















          if (tubes[to].length === 3) score += 15;







          if (tubes[to].length === 2) score += 12;







          if (tubes[to].length === 1) score += 8;















          if (tubes[to].length === 0) score -= 12;















          if (source.length >= 3) score += 5;















          /*







           * Slight random variation prevents identical boards.







           */







          score += random() * 18;















          candidates.push({







            from,







            to,







            score,







          });







        }







      }















      if (!candidates.length) break;















      candidates.sort((a, b) => b.score - a.score);















      const pool = candidates.slice(







        0,







        Math.min(30, candidates.length)







      );















      const selected =







        pool[Math.floor(random() * pool.length)];















      const bolt =







        tubes[selected.from].pop();















      tubes[selected.to].push(bolt);















      previous = selected;







    }















    return tubes;







  };















  /*







   * Try several boards and keep the one with the highest







   * mixing score. This avoids accidentally getting an easy board.







   */







  let best = null;







  let bestScore = -Infinity;















  for (let attempt = 0; attempt < 18; attempt++) {







    const candidate = scrambleOnce();















    const mixedTubes = candidate.filter(







      (tube) =>







        tube.length >= 2 &&







        new Set(tube).size >= 2







    ).length;















    const mixedPairs = candidate.reduce(







      (total, tube) =>







        total +







        tube.reduce(







          (count, colour, index) =>







            index > 0 && colour !== tube[index - 1]







              ? count + 1







              : count,







          0







        ),







      0







    );















    const solvedTubes = candidate.filter(







      (tube) =>







        tube.length === 4 &&







        tube.every((colour) => colour === tube[0])







    ).length;















    const score =







      mixedTubes * 100 +







      mixedPairs * 10 -







      solvedTubes * 100;















    if (score > bestScore) {







      bestScore = score;







      best = candidate;







    }







  }















  return best;







}















/* ============================================================







   ROUND 4 — 48 INDIVIDUAL MAHJONG CARDS















   24 exact pairs.







   Every card is independent.







   Exact twins are scattered.







   Cards contain glyph + rotation + mark.







   Similar-looking cards can still be false matches.







   ============================================================ */















function makeMahjong() {







  const cards = [];















  for (let pair = 0; pair < 24; pair++) {







    const glyph = MAHJONG_GLYPHS[pair];















    const rotation =







      [0, 90, 180, 270][pair % 4];















    const mark =







      MAHJONG_MARKS[







        pair % MAHJONG_MARKS.length







      ];















    const variant = pair % 3;















    const signature =







      `${glyph}|${rotation}|${mark}|${variant}`;















    cards.push({







      uid: `${pair}-A`,







      pairId: pair,







      glyph,







      rotation,







      mark,







      variant,







      signature,







    });















    cards.push({







      uid: `${pair}-B`,







      pairId: pair,







      glyph,







      rotation,







      mark,







      variant,







      signature,







    });







  }















  /*







   * Fisher-Yates shuffle.







   */







  for (let i = cards.length - 1; i > 0; i--) {







    const j = Math.floor(Math.random() * (i + 1));







    [cards[i], cards[j]] = [cards[j], cards[i]];







  }















  /*







   * Re-shuffle until no exact pair is adjacent.







   */







  for (let attempt = 0; attempt < 50; attempt++) {







    let adjacentPair = false;















    for (let i = 0; i < cards.length - 1; i++) {







      if (







        cards[i].pairId ===







        cards[i + 1].pairId







      ) {







        adjacentPair = true;







        break;







      }







    }















    if (!adjacentPair) break;















    for (let i = cards.length - 1; i > 0; i--) {







      const j = Math.floor(Math.random() * (i + 1));







      [cards[i], cards[j]] = [







        cards[j],







        cards[i],







      ];







    }







  }















  return cards;







}















export default function Chamber5() {

  const navigate = useNavigate();

  /* =======================================================
     CHAMBER 05 PROGRESS / TIMING
  ======================================================= */

  useEffect(() => {
    startChamber(5).catch((error) => {
      console.error("Chamber 5 start error:", error);
    });
  }, []);







  /* ==========================================================







     TIMER







     ========================================================== */















  const [timeLeft, setTimeLeft] = useState(() => {







    const saved =







      localStorage.getItem(







        "onesZerosStartTime"







      );















    const start = saved







      ? Number(saved)







      : 0;























    return Math.max(







      0,







      TOTAL_TIME -







        Math.floor(







          (Date.now() - start) / 1000







        )







    );







  });















  /* ==========================================================







     GLOBAL STATE







     ========================================================== */















  const [round, setRound] = useState(1);















  const [moves, setMoves] = useState(0);















  const [errors, setErrors] = useState(0);















  const [message, setMessage] = useState(







    "The ghost does not hide information. It hides relationships."







  );















  const [codes, setCodes] = useState([]);















  const [gameOver, setGameOver] =







    useState(false);







  // Prevent a rapid double-click on the final answer from



  // scheduling the next round more than once.



  const roundCompleteLock = useRef(false);















  /* ==========================================================







     ROUND 1







     ========================================================== */















  const [shadowIndex, setShadowIndex] =







    useState(0);















  const [shadowErrors, setShadowErrors] =







    useState(0);















  /* ==========================================================







     ROUND 2







     ========================================================== */















  const [arrows, setArrows] =







    useState(makeArrowBoard);















  const [arrowErrors, setArrowErrors] =







    useState(0);















  /* ==========================================================







     ROUND 3







     ========================================================== */















  const [bolts, setBolts] =







    useState(makeBolts);















  const [boltSelected, setBoltSelected] =







    useState(null);















  const [boltErrors, setBoltErrors] =







    useState(0);















  /* ==========================================================







     ROUND 4







     ========================================================== */















  const [mahjong, setMahjong] =







    useState(makeMahjong);















  const [mahjongSelected, setMahjongSelected] =







    useState(null);















  const [mahjongErrors, setMahjongErrors] =







    useState(0);















  /* ==========================================================







     TIMER EFFECT







     ========================================================== */















  useEffect(() => {







    if (gameOver || codes.length === 4) {







      return;







    }















    const id = setInterval(() => {







      const saved =







        localStorage.getItem(







          "onesZerosStartTime"







        );















      const start = saved







        ? Number(saved)







        : 0;















      const remaining = Math.max(







        0,







        TOTAL_TIME -







          Math.floor(







            (Date.now() - start) / 1000







          )







      );















      setTimeLeft(remaining);















      if (remaining <= 0) {







        setGameOver(true);







      }







    }, 1000);















    return () => clearInterval(id);







  }, [gameOver, codes.length]);















  /* ==========================================================







     COMPLETE ROUND







     ========================================================== */















  const completeRound = (code) => {



    if (roundCompleteLock.current) {



      return;



    }







    roundCompleteLock.current = true;







    setCodes((previous) => [







      ...previous,







      code,







    ]);















    if (round < 4) {







      setMessage(







        "LAYER VERIFIED. The next layer is less forgiving."







      );















      setTimeout(() => {







        setRound((previous) => previous + 1);



        roundCompleteLock.current = false;



      }, 550);







    } else {







      sessionStorage.setItem(







        "onesZerosChamber5Result",







        code







      );















      sessionStorage.setItem(







        "onesZerosChamber5Completed",







        "true"







      );















      setMessage(
        `CHAMBER 05 COMPLETE — GHOST CODE ${code}`
      );

      completeChamber({
        chamberNumber: 5,
        resultCode: "110",
        score: 0,
      }).catch((error) => {
        console.error("Chamber 5 completion error:", error);
      });
    }







  };















  /* ==========================================================







     ROUND 1







     ========================================================== */















  const shadow =







    SHADOW_PUZZLES[shadowIndex];















  const answerShadow = (choice) => {







    setMoves((m) => m + 1);















    if (choice === shadow.answer) {







      if (







        shadowIndex ===







        SHADOW_PUZZLES.length - 1







      ) {







        completeRound("74");







      } else {







        setShadowIndex(







          (index) => index + 1







        );















        setMessage(







          "CORRECT. The light reveals another distortion."







        );







      }















      return;







    }















    setErrors((e) => e + 1);















    setShadowErrors(







      (e) => e + 1







    );















    setMessage(







      "FALSE SHADOW. Compare orientation, internal cuts and light direction."







    );







  };















  /* ==========================================================







     ROUND 2







     ========================================================== */















  const arrowCount = useMemo(







    () =>







      arrows







        .flat()







        .filter(Boolean)







        .length,







    [arrows]







  );















  const clickArrow = (row, col) => {







    if (!arrows[row][col]) {







      return;







    }















    setMoves((m) => m + 1);















    if (







      !canArrowExit(







        arrows,







        row,







        col







      )







    ) {







      setErrors((e) => e + 1);















      setArrowErrors(







        (e) => e + 1







      );















      setMessage(







        "BLOCKED. That arrow is not currently free."







      );















      return;







    }















    const next =







      arrows.map((line) => [







        ...line,







      ]);















    next[row][col] = null;















    setArrows(next);















    const remaining =







      next







        .flat()







        .filter(Boolean)







        .length;















    if (remaining === 0) {



      completeRound("61");







    } else {







      setMessage(







        `${remaining} ARROWS REMAIN. Search for the next legal exit.`







      );







    }







  };















  /* ==========================================================







     ROUND 3







     ========================================================== */















  const boltCount =







    bolts.reduce(







      (total, tube) =>







        total + tube.length,







      0







    );















  const clickBoltTube = (index) => {







    /* SELECT SOURCE */















    if (boltSelected === null) {







      if (!bolts[index].length) {







        return;







      }















      setBoltSelected(index);















      setMessage(







        `SOURCE TUBE ${String(







          index + 1







        ).padStart(







          2,







          "0"







        )} SELECTED — FIND A LEGAL DESTINATION.`







      );















      return;







    }















    /* CANCEL */















    if (boltSelected === index) {







      setBoltSelected(null);















      setMessage(







        "SOURCE DESELECTED."







      );















      return;







    }















    const source =







      bolts[boltSelected];















    const target =







      bolts[index];















    const movingColour =







      source[source.length - 1];















    const targetTop =







      target.length > 0







        ? target[target.length - 1]







        : null;















    /*







     * THE ONLY PLAYER MOVE CONDITION.







     */















    const legal =







      target.length <







        BOLT_CAPACITY &&







      (







        target.length === 0 ||







        targetTop === movingColour







      );















    if (!legal) {







      setErrors((e) => e + 1);















      setBoltErrors(







        (e) => e + 1







      );















      if (







        target.length >=







        BOLT_CAPACITY







      ) {







        setMessage(







          "TUBE FULL — PRESERVE YOUR EMPTY SPACE."







        );







      } else {







        setMessage(







          "WRONG COLOUR — ONLY THE SAME COLOUR CAN RECEIVE THIS BOLT."







        );







      }















      return;







    }















    const next =







      bolts.map((tube) => [







        ...tube,







      ]);















    const bolt =







      next[boltSelected].pop();















    next[index].push(bolt);















    setBolts(next);















    setBoltSelected(null);















    setMoves((m) => m + 1);















    const solved =







      next.every(







        (tube) =>







          tube.length === 0 ||







          (







            tube.length === 4 &&







            tube.every(







              (colour) =>







                colour === tube[0]







            )







          )







      );















    if (solved) {







      completeRound("38");







      return;







    }















    setMessage(







      "MOVE ACCEPTED — BUILD THE PERFECT COLOUR STACKS."







    );







  };















  /* ==========================================================







     ROUND 4







     ========================================================== */















  const clickMahjong = (index) => {







    const card =







      mahjong[index];















    if (!card) {







      return;







    }















    if (







      mahjongSelected === null







    ) {







      setMahjongSelected(index);















      setMessage(







        `CARD ${String(







          index + 1







        ).padStart(







          2,







          "0"







        )} SELECTED — FIND ITS EXACT TWIN AMONG THE OTHER CARDS.`







      );















      return;







    }















    if (







      mahjongSelected === index







    ) {







      setMahjongSelected(null);















      return;







    }















    const first =







      mahjong[mahjongSelected];















    const second =







      mahjong[index];















    const exact =







      first.signature ===







      second.signature;















    if (!exact) {







      setErrors((e) => e + 1);















      setMahjongErrors(







        (e) => e + 1







      );















      setMessage(







        "FALSE MATCH — SIMILAR IS NOT IDENTICAL. CHECK EVERY DETAIL."







      );















      setMahjongSelected(null);















      return;







    }















    const next =







      mahjong.slice();















    next[mahjongSelected] =







      null;















    next[index] = null;















    setMahjong(next);















    setMahjongSelected(null);















    setMoves((m) => m + 1);















    const remaining =







      next.filter(Boolean)







        .length;















    if (remaining === 0) {







      completeRound("92");







    } else {







      setMessage(







        `EXACT TWIN FOUND — ${remaining} CARDS REMAIN. SCAN AGAIN.`







      );







    }







  };















  /* ==========================================================







     RESTART







     ========================================================== */















  const restartChamber = () => {







    sessionStorage.removeItem(







      "onesZerosChamber5Completed"







    );















    sessionStorage.removeItem(







      "onesZerosChamber5Result"







    );























    window.location.reload();







  };















  /* ==========================================================







     RENDER







     ========================================================== */















  return (







    <main className="chamber5-page">















      {/* ATMOSPHERE */}















      <div className="binary-rain">







        {Array.from(







          { length: 90 },







          (_, i) =>







            `${i % 2}  ${(







              (i * 17 + 31) %







              101







            )







              .toString(2)







              .padStart(7, "0")} `







        ).join("")}







      </div>















      {/* SPIDER ATMOSPHERE — NO GHOSTS */}







      <div className="spider-atmosphere">















        {/* SPIDER WEBS */}







        <div className="web web-1" />







      <div className="web web-2" />







      <div className="web web-3" />







      <div className="web web-4" />







      <div className="web web-5" />







      <div className="web web-6" />















      {/* 6 VERTICAL SPIDERS */}







      {[1, 2, 3, 4, 5, 6].map((spider) => (







          <div key={spider} className={`spider spider-${spider}`}>







            <span className="spider-thread" />







            <span className="spider-body">🕷</span>







          </div>







        ))}















      </div>















      {/* HEADER */}















      <header className="chamber5-header">















        <div className="brand">







          <span className="brand-zero">







            0







          </span>















          <span className="brand-divider">







            &







          </span>















          <span className="brand-one">







            1







          </span>







        </div>















        <nav className="chamber-nav">







          {[1, 2, 3, 4].map(







            (item) => (







              <div







                key={item}







                className={`nav-node ${







                  item === round







                    ? "active"







                    : item < round







                    ? "visited"







                    : ""







                }`}







              >







                <span>







                  0{item}







                </span>















                <small>







                  {[







                    "SHADOW",







                    "ARROWS",







                    "BOLTS",







                    "MAHJONG",







                  ][item - 1]}







                </small>







              </div>







            )







          )}







        </nav>















        <div className="timer-box">







          <span>







            TIME REMAINING







          </span>















          <strong>







            {formatTime(timeLeft)}







          </strong>







        </div>















      </header>















      {/* MAIN */}















      <section className="chamber5-main">















        {/* LEFT */}















        <aside className="ghost-sidebar">















          <div className="sidebar-title">







            CHAMBER







          </div>















          <div className="chamber-number">







            05







          </div>















          <div className="ghost-title">







            GHOST







          </div>















          <p className="sidebar-description">







            Observe what is visible.







            Question what appears







            identical. The solution is







            hidden inside relationships.







          </p>















          <div className="progress-title">







            CHAMBER PROGRESS







          </div>















          <div className="progress-list">















            {[







              "SHADOW MATCH",







              "GHOST ARROWS",







              "GHOST BOLTS",







              "GHOST MAHJONG",







            ].map((label, index) => (







              <div







                key={label}







                className={`progress-item ${







                  round === index + 1







                    ? "current"







                    : round >







                      index + 1







                    ? "completed"







                    : ""







                }`}







              >







                <span>







                  {round >







                  index + 1







                    ? "✓"







                    : `0${







                        index + 1







                      }`}







                </span>















                <span>







                  {label}







                </span>







              </div>







            ))}















          </div>















          <div className="sidebar-stats">















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







                ERRORS







              </span>















              <strong>







                {errors}







              </strong>







            </div>















          </div>















        </aside>















        {/* CENTER */}















        <section className="ghost-game">















          <div className="game-heading">















            <span>







              CHAMBER 05 / LAYER{" "}







              0{round}







            </span>















            <h1>







              {







                [







                  "SHADOW MATCH",







                  "GHOST ARROWS",







                  "GHOST BOLTS",







                  "GHOST MAHJONG",







                ][round - 1]







              }







            </h1>















            <p>







              {message}







            </p>















          </div>















          {/* ==================================================







              ROUND 1







              ================================================== */}















          {round === 1 && (







            <div className="ghost-panel extreme-panel">















              <div className="panel-top">







                <span>







                  ROUND 01 / SHADOW







                  MATCH







                </span>















                <small>







                  EXTREME







                </small>







              </div>















              <div className="difficulty-banner">







                {shadowIndex + 1} /{" "}







                {SHADOW_PUZZLES.length}{" "}







                — COMPARE SILHOUETTE +







                LIGHT DIRECTION







              </div>















              <p className="round-copy">







                The object is shown under a







                specific light direction. Find







                the shadow that exactly follows







                its geometry. Similar silhouettes







                are deliberate decoys.







              </p>















              <div className="shadow-stage">















                <div className="object-zone">















                  <span>







                    OBJECT







                  </span>















                  <div className="ghost-object">







                    {shadow.object ===







                    "CRESCENT"







                      ? "◒"







                      : shadow.object ===







                        "TWIN SPIRE"







                      ? "♜"







                      : shadow.object ===







                        "BROKEN RING"







                      ? "◌"







                      : shadow.object ===







                        "ASYMMETRIC CUBE"







                      ? "◩"







                      : shadow.object ===







                        "ARROW RELIEF"







                      ? "↙"







                      : "♜"}







                  </div>















                  <strong>







                    {shadow.object}







                  </strong>















                </div>















                <div className="light-zone">















                  <span>







                    LIGHT SOURCE







                  </span>















                  <div className="light-beam">







                    {shadow.light}







                  </div>















                  <strong>







                    DIRECTION







                  </strong>















                  <small>







                    Rotation and internal







                    geometry matter.







                  </small>















                </div>















                <div className="clue-zone">















                  <span>







                    ANALYSIS







                  </span>















                  <p>







                    Which projection preserves







                    the object's exact structure







                    under this light?







                  </p>















                  <p>







                    <b>







                      Do not choose by visual







                      similarity alone.







                    </b>







                  </p>















                </div>















              </div>















              <div className="shadow-options">















                {shadow.options.map(







                  (option, index) => (







                    <button







                      key={`${option}-${index}`}







                      className="shadow-option"







                      onClick={() =>







                        answerShadow(







                          index + 1







                        )







                      }







                    >







                      <small>







                        0{index + 1}







                      </small>















                      <strong>







                        {option}







                      </strong>















                      <span>







                        PROJECTION







                      </span>







                    </button>







                  )







                )}















              </div>















              <div className="round-metric">







                <span>







                  SHADOW ERRORS:{" "}







                  {shadowErrors}







                </span>















                <span>







                  STAGE:{" "}







                  {shadowIndex + 1}/







                  {SHADOW_PUZZLES.length}







                </span>







              </div>















            </div>







          )}















          {/* ==================================================







              ROUND 2







              ================================================== */}















          {round === 2 && (







            <div className="ghost-panel extreme-panel">















              <div className="panel-top">







                <span>







                  ROUND 02 / 24×24







                  ARROW FIELD







                </span>















                <small>







                  EXTREME







                </small>







              </div>















              <div className="difficulty-banner">







                82 ARROWS // FIND THE







                CURRENTLY CLEAR RAY







              </div>















              <p className="round-copy">







                Every arrow points toward an exit.







                An arrow may be removed only when







                the complete path in its direction







                is clear. Removing one arrow exposes







                another.







              </p>















              <div className="arrows-board">















                {arrows.map(







                  (rowData, row) =>







                    rowData.map(







                      (item, col) => (







                        <button







                          key={`${row}-${col}`}







                          className={`arrow-cell ${







                            item







                              ? "has-arrow"







                              : "empty-arrow"







                          } ${







                            item







                              ? `arrow-${item.direction}`







                              : ""







                          }`}







                          onClick={() =>







                            clickArrow(







                              row,







                              col







                            )







                          }







                        >







                          {item







                            ? item.direction







                            : ""}







                        </button>







                      )







                    )







                )}















              </div>















              <div className="arrow-status">















                <div>







                  <span>







                    ARROWS LEFT







                  </span>















                  <strong>







                    {arrowCount}







                  </strong>







                </div>















                <div>







                  <span>







                    ERRORS







                  </span>















                  <strong>







                    {arrowErrors}







                  </strong>







                </div>















                <div>







                  <span>







                    GRID







                  </span>















                  <strong>







                    24×24







                  </strong>







                </div>















              </div>















            </div>







          )}















          {/* ==================================================







              ROUND 3







              ================================================== */}















          {round === 3 && (







            <div className="ghost-panel extreme-panel">















              <div className="panel-top">







                <span>







                  ROUND 03 / GHOST







                  BOLTS







                </span>















                <small>







                  EXTREME







                </small>







              </div>















              <div className="difficulty-banner">







                12 COLOURS // 14 TUBES //







                48 BOLTS // CAPACITY 4







              </div>















              <p className="round-copy">







                Only the exposed bolt can move.







                A bolt may land only on the same







                colour or an empty tube. Mixed stacks







                are deliberate. Plan several moves







                ahead.







              </p>















              <div className="colour-legend">















                {COLORS.map(







                  ([id, label, hex]) => (







                    <span key={id}>







                      <i







                        style={{







                          background: hex,







                          color: hex,







                        }}







                      />















                      {label}







                    </span>







                  )







                )}















              </div>















              <div className="bolt-instruction">















                <span className="step-dot">







                  01







                </span>















                SELECT SOURCE















                <span>→</span>















                <span className="step-dot">







                  02







                </span>















                SELECT DESTINATION















                <span>→</span>















                <b>







                  SAME COLOUR / EMPTY







                </b>















              </div>















              <div className="bolt-board">















                {bolts.map(







                  (tube, index) => (







                    <button







                      key={index}







                      className={`bolt-tube ${







                        boltSelected ===







                        index







                          ? "bolt-selected"







                          : ""







                      }`}







                      onClick={() =>







                        clickBoltTube(







                          index







                        )







                      }







                    >















                      <span className="tube-number">







                        TUBE{" "}







                        {String(







                          index + 1







                        ).padStart(







                          2,







                          "0"







                        )}







                      </span>















                      {tube.length ? (







                        <div className="bolt-stack">















                          {tube.map(







                            (colour, boltIndex) => {







                              const colorData =







                                COLORS.find(







                                  ([id]) =>







                                    id ===







                                    colour







                                );















                              return (







                                <div







                                  key={`${index}-${boltIndex}`}







                                  className="ghost-bolt"







                                  style={{







                                    background:







                                      colorData?.[2],







                                  }}







                                >







                                  <span className="bolt-hole" />







                                </div>







                              );







                            }







                          )}















                        </div>







                      ) : (







                        <em>







                          EMPTY







                        </em>







                      )}















                    </button>







                  )







                )}















              </div>















              <div className="bolt-status">















                <div>







                  <span>







                    BOLTS LEFT







                  </span>















                  <strong>







                    {boltCount}







                  </strong>







                </div>















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







                    BOLT ERRORS







                  </span>















                  <strong>







                    {boltErrors}







                  </strong>







                </div>















              </div>















            </div>







          )}















          {/* ==================================================







              ROUND 4







              ================================================== */}















          {round === 4 && (







            <div className="ghost-panel extreme-panel">















              <div className="panel-top">







                <span>







                  ROUND 04 / 48







                  INDIVIDUAL CARDS







                </span>















                <small>







                  EXTREME







                </small>







              </div>















              <div className="difficulty-banner">







                48 CARDS // 24 EXACT PAIRS







                // 6×8 GRID // SCATTERED







                TWINS







              </div>















              <p className="round-copy">







                Every card is separate. Exact twins







                are randomly scattered across the







                entire board. Similar cards can be







                false matches. Compare the glyph,







                rotation, internal mark and variant.







              </p>















              <div className="mahjong-rule-strip">















                <span>







                  01 SCAN







                </span>















                <span>







                  02 REMEMBER







                </span>















                <span>







                  03 SELECT







                </span>















                <span>







                  04 FIND TWIN







                </span>















                <span>







                  05 CLEAR







                </span>















              </div>















              <div className="individual-card-board">















                {mahjong.map(







                  (card, index) => (







                    <button







                      key={







                        card







                          ? card.uid







                          : `cleared-${index}`







                      }







                      disabled={!card}







                      className={`individual-mahjong-card ${







                        mahjongSelected ===







                        index







                          ? "card-selected"







                          : ""







                      } ${







                        !card







                          ? "card-cleared"







                          : ""







                      }`}







                      onClick={() =>







                        clickMahjong(







                          index







                        )







                      }







                    >















                      {card ? (







                        <>







                          <span className="card-index">







                            {String(







                              index + 1







                            ).padStart(







                              2,







                              "0"







                            )}







                          </span>















                          <span







                            className="card-glyph"







                            style={{







                              transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,







                            }}







                          >







                            {card.glyph}







                          </span>















                          <span className="card-mark">







                            {card.mark}







                          </span>







                        </>







                      ) : (







                        <span className="cleared-label">







                          CLEARED







                        </span>







                      )}















                    </button>







                  )







                )}















              </div>















              <div className="mahjong-status">















                <div>







                  <span>







                    CARDS LEFT







                  </span>















                  <strong>







                    {







                      mahjong.filter(







                        Boolean







                      ).length







                    }







                  </strong>







                </div>















                <div>







                  <span>







                    PAIRS FOUND







                  </span>















                  <strong>







                    {(48 -







                      mahjong.filter(







                        Boolean







                      ).length) /







                      2}







                  </strong>







                </div>















                <div>







                  <span>







                    ERRORS







                  </span>















                  <strong>







                    {mahjongErrors}







                  </strong>







                </div>















              </div>















            </div>







          )}















          {/* FINAL */}















          {codes.length === 4 && (







            <div className="ghost-complete">















              <div>✓</div>















              <h2>







                GHOST CLEARED







              </h2>















              <p>







                CHAMBER RESULT







              </p>















              <strong className="binary-final-result">







                110







              </strong>



              <button

                type="button"

                className="next-chamber-btn"

                onClick={() => navigate("/chamber-06")}

              >

                ENTER CHAMBER 06 →

              </button>















            </div>







          )}















        </section>















        {/* RIGHT */}















        <aside className="ghost-right">















          <div className="right-card clue-card">















            <span>







              CHAMBER CODE







            </span>















            <h3>







              Collected result







            </h3>















            <strong>







              {codes.length







                ? codes.join(" ")







                : "— — — —"}







            </strong>















            <small>







              / SAVED AUTOMATICALLY







            </small>















          </div>















          <div className="right-card">















            <span>







              BINARY SIGNAL







            </span>















            <div className="binary-display">







              0101







            </div>















            <small>







              GHOST / OBSERVATION







            </small>















          </div>















          <div className="right-card">















            <span>







              STORED CODES







            </span>















            <div className="stored-codes">















              {[1, 2, 3, 4].map(







                (item, index) => (







                  <div key={item}>







                    <span>







                      0{item}







                    </span>















                    <b>







                      {codes[index] ??







                        "— —"}







                    </b>







                  </div>







                )







              )}















            </div>















          </div>















          <button







            className="restart-chamber"







            onClick={restartChamber}







          >







            RESTART CHAMBER







          </button>















        </aside>















      </section>















      {/* GAME OVER */}















      {gameOver && (







        <div className="game-over">















          <h2>







            TIME EXPIRED







          </h2>















          <p>







            THE GHOST REMAINS UNSOLVED.







          </p>















          <button







            onClick={restartChamber}







          >







            RESTART CHAMBER







          </button>















        </div>







      )}















    </main>







  );







}
