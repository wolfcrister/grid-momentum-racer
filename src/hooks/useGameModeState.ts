
import { useState } from "react";
import { GameMode, Position } from "@/types/game";

export function useGameModeState(initialGameMode: GameMode = "turn-based") {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(initialGameMode);
  const [programmedMoves, setProgrammedMoves] = useState<Record<number, Position>>({});

  return {
    gameStarted,
    setGameStarted,
    gameMode,
    setGameMode,
    programmedMoves,
    setProgrammedMoves,
  };
}
