import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanCollege = college.trim();
    const cleanYear = year.trim();

    if (!cleanName || !cleanCollege || !cleanYear) {
      setError("Please enter all your details before continuing.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create player ID locally
      const playerId = crypto.randomUUID();

      // Create player in Supabase
      const { error: supabaseError } = await supabase
        .from("players")
        .insert([
          {
            id: playerId,
            name: cleanName,
            college: cleanCollege,
            year: cleanYear,
          },
        ]);

      if (supabaseError) {
        throw supabaseError;
      }

      // Save player details locally
      localStorage.setItem(
        "onesZerosPlayer",
        JSON.stringify({
          id: playerId,
          name: cleanName,
          college: cleanCollege,
          year: cleanYear,
        })
      );

      // Save player ID separately for the game session
      localStorage.setItem("onesZerosPlayerId", playerId);

      // New game has not started yet
      localStorage.removeItem("onesZerosGameStarted");

      // Reset game timer data
      localStorage.removeItem("onesZerosStartTime");
      localStorage.removeItem("onesZerosTime");

      // Reset chamber
      localStorage.setItem("onesZerosCurrentChamber", "1");

      // Reset shared session timer
      sessionStorage.removeItem("onesZerosGameStart");

      // Remove old session ID if a previous game existed
      localStorage.removeItem("onesZerosGameSessionId");

      // Continue to game start screen
      navigate("/game-start");
    } catch (error) {
      console.error("Player registration error:", error);

      setError(
        "Unable to register your details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-background-grid" />

      <section className="register-card">
        <header className="register-header">
          <div className="register-symbol" aria-hidden="true">
            <span>0</span>
            <i>|</i>
            <span>1</span>
          </div>

          <div className="register-heading">
            <p className="register-eyebrow">ONES &amp; ZEROS</p>

            <h1>PLAYER REGISTRATION</h1>

            <p className="register-subtitle">
              ENTER YOUR DETAILS TO BEGIN THE CHAMBER CHALLENGE.
            </p>
          </div>
        </header>

        <div className="register-info">
          <div className="info-item">
            <strong>08</strong>
            <span>CHAMBERS</span>
          </div>

          <div className="info-divider" />

          <div className="info-item">
            <strong>90</strong>
            <span>MINUTES</span>
          </div>

          <div className="info-divider" />

          <div className="info-item">
            <strong>01</strong>
            <span>FINAL ESCAPE</span>
          </div>
        </div>

        <div className="form-section-title">
          <span className="section-line" />
          <span>PLAYER INFORMATION</span>
          <span className="section-line" />
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="player-name">FULL NAME</label>

            <div className="input-wrapper">
              <span className="input-prefix">01</span>

              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="ENTER YOUR NAME"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="college-name">COLLEGE NAME</label>

            <div className="input-wrapper">
              <span className="input-prefix">02</span>

              <input
                id="college-name"
                type="text"
                value={college}
                onChange={(event) => setCollege(event.target.value)}
                placeholder="ENTER YOUR COLLEGE NAME"
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="year-of-study">YEAR OF STUDY</label>

            <div className="input-wrapper">
              <span className="input-prefix">03</span>

              <input
                id="year-of-study"
                type="text"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                placeholder="ENTER YOUR YEAR OF STUDY"
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <div className="register-error" role="alert">
              <span>!</span>
              {error}
            </div>
          )}

          <div className="register-notice">
            <span className="notice-icon">↗</span>

            <p>
              Make sure your details are correct. Your 90-minute
              challenge begins after you start the game.
            </p>
          </div>

          <button
            className="register-button"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading ? "REGISTERING..." : "CONTINUE TO GAME"}
            </span>

            <span className="button-arrow">→</span>
          </button>
        </form>

        <footer className="register-footer">
          <span>ONES &amp; ZEROS</span>
          <span>PLAYER ACCESS // 001</span>
        </footer>
      </section>
    </main>
  );
}

export default Register;