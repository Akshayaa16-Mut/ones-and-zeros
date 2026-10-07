import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register/Register";
import GameStart from "./pages/GameStart/GameStart";

import Chamber1 from "./pages/Chamber1/Chamber1";
import Chamber2 from "./pages/Chamber2/Chamber2";
import Chamber3 from "./pages/Chamber3/Chamber3";
import Chamber4 from "./pages/Chamber4/Chamber4";
import Chamber5 from "./pages/Chamber5/Chamber5";
import Chamber6 from "./pages/Chamber6/Chamber6";
import Chamber7 from "./pages/Chamber7/Chamber7";
import Chamber8 from "./pages/Chamber8/Chamber8";


/* =========================================================
   GAME ROUTE PROTECTION
   ========================================================= */

function GameRoute({ children }) {
  const gameStarted =
    localStorage.getItem("onesZerosGameStarted") === "true";

  if (!gameStarted) {
    return <Navigate to="/register" replace />;
  }

  return children;
}


/* =========================================================
   APP
   ========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            START
           ============================== */}

        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/game-start"
          element={<GameStart />}
        />


        {/* ==============================
            CHAMBER 01
           ============================== */}

        <Route
          path="/chamber-01"
          element={
            <GameRoute>
              <Chamber1 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 02
           ============================== */}

        <Route
          path="/chamber-02"
          element={
            <GameRoute>
              <Chamber2 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 03
           ============================== */}

        <Route
          path="/chamber-03"
          element={
            <GameRoute>
              <Chamber3 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 04
           ============================== */}

        <Route
          path="/chamber-04"
          element={
            <GameRoute>
              <Chamber4 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 05
           ============================== */}

        <Route
          path="/chamber-05"
          element={
            <GameRoute>
              <Chamber5 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 06
           ============================== */}

        <Route
          path="/chamber-06"
          element={
            <GameRoute>
              <Chamber6 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 07
           ============================== */}

        <Route
          path="/chamber-07"
          element={
            <GameRoute>
              <Chamber7 />
            </GameRoute>
          }
        />


        {/* ==============================
            CHAMBER 08
           ============================== */}

        <Route
          path="/chamber-08"
          element={
            <GameRoute>
              <Chamber8 />
            </GameRoute>
          }
        />


        {/* ==============================
            UNKNOWN ROUTE
           ============================== */}

        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;