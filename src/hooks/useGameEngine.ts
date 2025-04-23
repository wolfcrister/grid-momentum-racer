
import { useEffect, useState } from "react";
import { GameMode, Player, Position } from "@/types/game";
import { tracks } from "@/lib/tracks";
import { getValidMovesWithCollisions } from "@/lib/movement-utils";
import { useTrackState } from "./useTrackState";
import { usePlayersState } from "./usePlayersState";
import { useGameModeState } from "./useGameModeState";
import { useMoveLogState } from "./useMoveLogState";

// This hook orchestrates the game logic by composing smaller specialized hooks!
export function useGameEngine() {
  // Track state
  const {
    trackType, setTrackType,
    playerCount, setPlayerCount,
    track, setTrack
  } = useTrackState();

  // Move log
  const { moveLog, setMoveLog } = useMoveLogState();

  // Mode state
  const {
    gameStarted, setGameStarted,
    gameMode, setGameMode,
    programmedMoves, setProgrammedMoves,
  } = useGameModeState();

  // State for winner
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Add state for valid moves
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // Player state (needs the latest playerCount, track, moveLog/winner handlers)
  const {
    players, setPlayers,
    currentPlayer, setCurrentPlayer,
    currentRound, setCurrentRound,
    initializePlayers,
    executeMove,
  } = usePlayersState(
    playerCount,
    track,
    setMoveLog,
    setWinner,
    1 // initial round
  );

  // Initialize game when settings change
  useEffect(() => {
    if (gameStarted) return;
    setTrack(tracks[trackType]);
    setPlayers(initializePlayers());
    setCurrentPlayer(0);
    setWinner(null);
    setCurrentRound(1);
    setValidMoves([]);
    setMoveLog([]);
    setProgrammedMoves({});
  }, [playerCount, trackType, gameStarted, initializePlayers, setTrack, setPlayers, 
      setCurrentPlayer, setCurrentRound, setValidMoves, setMoveLog, setProgrammedMoves]);

  // Calculate valid moves when current player changes
  useEffect(() => {
    if (!gameStarted) return;
    const player = players[currentPlayer];
    // Fix: Use getValidMovesWithCollisions directly instead of getValidMoves 
    // which was causing an infinite loop
    const moves = getValidMovesWithCollisions(player, players, track.size);
    setValidMoves(moves);
  }, [currentPlayer, players, track.size, gameStarted]);

  // Handle player movement
  const handleMove = (position: Position) => {
    if (gameMode === "programming") {
      setProgrammedMoves({
        ...programmedMoves,
        [currentPlayer]: position
      });
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) {
        executeAllMoves();
      } else {
        setCurrentPlayer(nextPlayer);
      }
    } else {
      executeMove(currentPlayer, position);
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) setCurrentRound(currentRound + 1);
      setCurrentPlayer(nextPlayer);
    }
  };

  // Execute all programmed moves (programming mode)
  const executeAllMoves = () => {
    for (let i = 0; i < playerCount; i++) {
      if (programmedMoves[i]) {
        executeMove(i, programmedMoves[i]);
      }
    }
    setProgrammedMoves({});
    setCurrentRound(currentRound + 1);
  };

  const handleSkipTurn = () => {
    if (gameMode === "programming") {
      setProgrammedMoves({
        ...programmedMoves,
        [currentPlayer]: players[currentPlayer].position
      });
    }
    const nextPlayer = (currentPlayer + 1) % playerCount;
    if (nextPlayer === 0) {
      if (gameMode === "programming") {
        executeAllMoves();
      } else {
        setCurrentRound(currentRound + 1);
      }
    }
    setCurrentPlayer(nextPlayer);
  };

  // Reset game state
  const handleReset = () => {
    setGameStarted(false);
    setProgrammedMoves({});
    setWinner(null);
    setMoveLog([]);
  };

  return {
    trackType, setTrackType,
    gameStarted, setGameStarted,
    playerCount, setPlayerCount,
    track, players, setPlayers,
    currentPlayer, setCurrentPlayer,
    currentRound,
    winner,
    validMoves,
    gameMode, setGameMode,
    handleMove,
    handleReset,
    moveLog, setMoveLog,
    programmedMoves,
    handleSkipTurn,
    setCurrentRound,
  };
}
