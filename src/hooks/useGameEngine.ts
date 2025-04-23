
import { useState, useEffect } from "react";
import {
  Player,
  Position,
  Track,
  GameMode,
  Direction
} from "@/types/game";
import {
  getValidMoves,
  checkSlipstream,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  checkCrash,
  getReverseDirection,
  getAllAdjacentPositions,
} from "@/lib/game-utils";
import { getNewDirection, calculateNewSpeed } from "@/lib/movement-utils";
import { tracks } from "@/lib/tracks";
import { toast } from "@/hooks/use-toast";
import { MoveLogEntry } from "@/components/MoveLog";

const playerColors = ["red", "blue", "yellow", "green"] as const;
const MAIN_DIRECTIONS: Direction[] = ["N", "E", "S", "W"];

function pickRandomMainDirection(): Direction {
  return MAIN_DIRECTIONS[Math.floor(Math.random() * MAIN_DIRECTIONS.length)];
}

// REFACTORED: Split game initialization logic into a separate hook
export function useGameInitialization(playerCount: number, trackType: keyof typeof tracks) {
  const initializePlayers = () => {
    const newTrack = tracks[trackType];
    const initialPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      const startPos = newTrack.startPositions[i];
      initialPlayers.push({
        id: i + 1,
        position: { ...startPos.position },
        direction: startPos.direction,
        speed: 0,
        color: playerColors[i],
        checkpointsPassed: new Set(),
        totalCheckpoints: newTrack.checkpoints.length,
        isFinished: false,
        crashed: false
      });
    }
    return initialPlayers;
  };

  return { initializePlayers, tracks };
}

// REFACTORED: Split move execution logic into a separate hook
export function useMoveExecution(
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  currentRound: number,
  track: Track,
  setMoveLog: React.Dispatch<React.SetStateAction<MoveLogEntry[]>>,
  setWinner: React.Dispatch<React.SetStateAction<Player | null>>
) {
  const executeMove = (playerIndex: number, newPosition: Position) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      const player = { ...updatedPlayers[playerIndex] };
      const lastPosition = { ...player.position };
      const { trackTiles } = track;
      const newDirection = getNewDirection(player.position, newPosition);
      const oldSpeed = player.speed;
      const newSpeed = calculateNewSpeed(player, newPosition);

      const dx = newPosition.x - lastPosition.x;
      const dy = newPosition.y - lastPosition.y;
      const momentumPos = { x: newPosition.x + dx, y: newPosition.y + dy };

      // ---- Modified SPIN / CRASH LOGIC ----
      let isCrashed = false;
      let didSpin = false;

      // Check if the new position would result in a crash
      // FIXED: Pass only the position to checkCrash
      isCrashed = checkCrash(newPosition);

      // Calculate next turn's possible moves if standing at newPosition with potential state
      let possibleMovesNextTurn: Position[] = [];
      if (!player.crashed && !isCrashed) {
        const simPlayer = { ...player, position: newPosition, direction: newDirection, speed: newSpeed };
        (simPlayer as any).lastPosition = lastPosition;
        possibleMovesNextTurn = getValidMoves(simPlayer, track.size, updatedPlayers);
      }

      // If possibleMovesNextTurn has at least one move ON TRACK, all okay.
      if (possibleMovesNextTurn.length > 0) {
        // All good
      } else {
        // No possible valid moves on track for next turn
        // Now check if there's ANY adjacent tile (8-connectivity) that is ON the board but OFF track.
        const adjacents = getAllAdjacentPositions(newPosition, track.size);
        const offTrackAdjacents = adjacents.filter(p =>
          !trackTiles.some(tt => tt.x === p.x && tt.y === p.y)
        );
        if (offTrackAdjacents.length > 0) {
          // SPIN condition: can "just" spin out—set position, speed=0, face random main direction
          didSpin = true;
          toast("Player " + player.id + " spun out!", {
            description: "Facing a random direction and speed reset.",
            duration: 2000
          });
        } else {
          // CRASH condition: can't even spin, you're truly stuck/off track
          isCrashed = true;
          toast("Player " + player.id + " crashed!", {
            description: "Out of the race",
            duration: 3000
          });
        }
      }

      // ------- RESULT: Apply logic for speed/position/direction -------
      if (isCrashed) {
        player.crashed = true;
        player.speed = 0;
      } else if (didSpin) {
        player.speed = 0;
        player.direction = pickRandomMainDirection();
        player.crashed = false;
      } else {
        player.crashed = false;
      }

      let speedBonus = 0;
      if (!isCrashed && !didSpin) {
        const otherPlayers = prevPlayers.filter((_, i) => i !== playerIndex);
        const hasSlipstream = checkSlipstream(player, otherPlayers, newPosition);
        speedBonus = hasSlipstream ? 1 : 0;
      }

      player.position = newPosition;
      // After spin: keep random direction; otherwise, update normally
      player.direction = didSpin
        ? player.direction
        : newDirection;
      player.speed = isCrashed
        ? 0
        : (didSpin ? 0 : newSpeed + speedBonus);

      // Calculate momentum vector for log
      const momentumVector: [number, number] = [dx, dy];

      // Record the move in the log, including momentum
      const speedChange = player.speed - oldSpeed;
      setMoveLog(prev => [
        ...prev,
        {
          playerId: player.id,
          playerColor: player.color,
          from: lastPosition,
          to: newPosition,
          round: currentRound,
          speedChange,
          momentum: momentumVector,
          // Custom: mark spin or crash in log for UI if you want later
          event: isCrashed ? "crash" : didSpin ? "spin" : undefined
        }
      ]);
      (player as any).lastPosition = lastPosition;

      if (!isCrashed) {
        // Type fixing: ensure we're working with checkpoints as Position[][]
        const checkpointLines = track.checkpoints;
        const cpIndex = checkCheckpointCrossed(lastPosition, newPosition, checkpointLines);
        if (
          cpIndex !== null &&
          !player.checkpointsPassed.has(cpIndex) &&
          player.checkpointsPassed.size < player.totalCheckpoints
        ) {
          const newPassed = new Set(player.checkpointsPassed);
          newPassed.add(cpIndex);
          player.checkpointsPassed = newPassed;
          toast("Checkpoint passed!", {
            description: `Player ${player.id}: ${player.checkpointsPassed.size}/${player.totalCheckpoints}`,
            duration: 2000
          });
        }
      }

      if (
        !isCrashed &&
        player.checkpointsPassed.size === player.totalCheckpoints &&
        checkFinishLineCrossed(lastPosition, newPosition, track.finishLine)
      ) {
        player.isFinished = true;
        setWinner(player);
        toast("Winner!", {
          description: `Player ${player.id} has won the race!`,
          duration: 5000
        });
      }

      updatedPlayers[playerIndex] = player;
      return updatedPlayers;
    });
  };

  return executeMove;
}

// Main game engine hook
export function useGameEngine() {
  // Game state
  const [trackType, setTrackType] = useState<keyof typeof tracks>("oval");
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [track, setTrack] = useState<Track>(tracks[trackType]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("turn-based");
  const [programmedMoves, setProgrammedMoves] = useState<Record<number, Position>>({});
  const [moveLog, setMoveLog] = useState<MoveLogEntry[]>([]);

  const { initializePlayers } = useGameInitialization(playerCount, trackType);
  const executeMove = useMoveExecution(players, setPlayers, currentRound, track, setMoveLog, setWinner);

  // Initialize game
  useEffect(() => {
    if (gameStarted) return;
    const newTrack = tracks[trackType];
    setTrack(newTrack);
    setPlayers(initializePlayers());
    setCurrentPlayer(0);
    setWinner(null);
    setCurrentRound(1);
  }, [playerCount, trackType, gameStarted, initializePlayers]);

  // Calculate valid moves when current player changes
  useEffect(() => {
    if (!gameStarted) return;
    const player = players[currentPlayer];
    const moves = getValidMoves(player, track.size, players);
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
      if (nextPlayer === 0) {
        setCurrentRound(currentRound + 1);
      }
      setCurrentPlayer(nextPlayer);
    }
  };

  // Execute all programmed moves
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

  // Reset game
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
