import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./GameStart.css";

function GameStart() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setError("");
    setLoading(true);

    try {
      // =========================================
      // GET REGISTERED PLAYER
      // =========================================

      const storedPlayer = localStorage.getItem("onesZerosPlayer");

      if (!storedPlayer) {
        throw new Error("Player registration was not found.");
      }

      const player = JSON.parse(storedPlayer);

      if (!player.id) {
        throw new Error("Player ID was not found.");
      }

      // =========================================
      // CREATE UNIQUE GAME SESSION ID
      // =========================================

      const gameSessionId = crypto.randomUUID();

      // =========================================
      // CREATE GAME SESSION IN SUPABASE
      // =========================================

      const { error: sessionError } = await supabase
        .from("game_sessions")
        .insert([
          {
            id: gameSessionId,
            player_name: player.name,
            college: player.college,
            year: player.year,
            current_chamber: 1,
          },
        ]);

      if (sessionError) {
        throw sessionError;
      }

      // =========================================
      // SAVE GAME SESSION ID
      // =========================================

      localStorage.setItem(
        "onesZerosGameSessionId",
        gameSessionId
      );

      // =========================================
      // START GAME TIMER
      // =========================================

      const startTime = Date.now();

      localStorage.setItem(
        "onesZerosGameStarted",
        "true"
      );

      localStorage.setItem(
        "onesZerosStartTime",
        String(startTime)
      );

      localStorage.setItem(
        "onesZerosTime",
        String(90 * 60)
      );

      sessionStorage.setItem(
        "onesZerosGameStart",
        String(startTime)
      );

      // =========================================
      // SET CURRENT CHAMBER
      // =========================================

      localStorage.setItem(
        "onesZerosCurrentChamber",
        "1"
      );

      // =========================================
      // CLEAR OLD CHAMBER RESULTS
      // =========================================

      const oldKeys = [
        "onesZerosChamber1Result",
        "onesZerosChamber2Result",
        "onesZerosChamber3Result",
        "onesZerosChamber4Result",
        "onesZerosChamber5Result",
        "onesZerosChamber6Result",
        "onesZerosChamber7Result",
        "onesZerosChamber8Completed",

        "onesZerosFinalBinary",
        "onesZerosGameCompleted",

        "chamber1Code",
        "chamber1Result",
        "chamber2Code",
        "chamber2Result",
        "chamber3Code",
        "chamber3Result",
        "chamber4Code",
        "chamber4Result",
        "chamber5Code",
        "chamber5Result",
        "chamber6Code",
        "chamber6Result",
        "chamber7Code",
        "chamber7Result",
      ];

      oldKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // =========================================
      // START CHAMBER 01
      // =========================================

      navigate("/chamber-01");
    } catch (error) {
      console.error(
        "Game session creation error:",
        error
      );

      setError(
        "Unable to start the game. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="game-start-page">
      <div className="game-start-card">

        <div className="binary-symbol">
          0 <span>&amp;</span> 1
        </div>

        <h1>ONES &amp; ZEROS</h1>

        <p className="game-start-subtitle">
          THE CHAMBER CHALLENGE
        </p>

        <div className="rules">
          <div className="rule">
            <strong>08</strong>
            <span>CHAMBERS</span>
          </div>

          <div className="rule">
            <strong>90</strong>
            <span>MINUTES</span>
          </div>

          <div className="rule">
            <strong>01</strong>
            <span>FINAL ESCAPE</span>
          </div>
        </div>

        <p className="instructions">
          Every chamber contains a hidden challenge.
          Solve it, discover the correct answer, and
          convert your answer into the required binary choice.
        </p>

        <p className="warning">
          ⚠ Once the game begins, the 90-minute timer starts.
        </p>

        {error && (
          <div className="register-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? "STARTING..." : "START GAME"}
        </button>

      </div>
    </main>
  );
}

export default GameStart;