import { supabase } from "./supabase";

export async function startChamber(chamberNumber) {
  const gameSessionId = localStorage.getItem(
    "onesZerosGameSessionId"
  );

  if (!gameSessionId) {
    throw new Error("Game session ID not found.");
  }

  const enteredAt = new Date().toISOString();

  localStorage.setItem(
    `onesZerosChamber${chamberNumber}EnteredAt`,
    enteredAt
  );

  return enteredAt;
}

export async function completeChamber({
  chamberNumber,
  resultCode,
  score = 0,
}) {
  const gameSessionId = localStorage.getItem(
    "onesZerosGameSessionId"
  );

  if (!gameSessionId) {
    throw new Error("Game session ID not found.");
  }

  const enteredAt = localStorage.getItem(
    `onesZerosChamber${chamberNumber}EnteredAt`
  );

  if (!enteredAt) {
    throw new Error(
      `Chamber ${chamberNumber} entry time was not found.`
    );
  }

  const completedAt = new Date().toISOString();

  const durationSeconds = Math.max(
    0,
    Math.floor(
      (new Date(completedAt).getTime() -
        new Date(enteredAt).getTime()) /
        1000
    )
  );

  const { error } = await supabase
    .from("chamber_progress")
    .insert([
      {
        game_session_id: gameSessionId,
        chamber_number: chamberNumber,
        result_code: String(resultCode),
        score: score,
        completed: true,
        entered_at: enteredAt,
        completed_at: completedAt,
        duration_seconds: durationSeconds,
      },
    ]);

  if (error) {
    throw error;
  }

  return {
    enteredAt,
    completedAt,
    durationSeconds,
  };
}