import { useEffect, useState } from "react";
import "./GameTimer.css";

const TOTAL_TIME = 90 * 60;

function GameTimer() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedStartTime = localStorage.getItem("onesZerosStartTime");

    if (!savedStartTime) {
      return TOTAL_TIME;
    }

    const elapsed = Math.floor(
      (Date.now() - Number(savedStartTime)) / 1000
    );

    return Math.max(TOTAL_TIME - elapsed, 0);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const startTime = localStorage.getItem("onesZerosStartTime");

      if (!startTime) {
        return;
      }

      const elapsed = Math.floor(
        (Date.now() - Number(startTime)) / 1000
      );

      const remaining = Math.max(TOTAL_TIME - elapsed, 0);

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="game-timer">
      <span className="timer-label">TIME</span>

      <span className="timer-value">
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

export default GameTimer;