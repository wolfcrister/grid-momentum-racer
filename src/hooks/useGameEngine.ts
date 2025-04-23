
import { useState, useEffect } from "react";
import { 
  Player, 
  Position, 
  Track, 
  GameMode 
} from "@/types/game";
import { 
  getValidMoves, 
  getNewDirection, 
  calculateNewSpeed,
  checkSlipstream,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  checkCrash,
  distanceFromTrack,
  getReverseDirection,
} from "@/lib/game-utils";
import { tracks } from "@/lib/tracks";
import { toast } from "@/hooks/use-toast";
import { MoveLogEntry } from "@/components/MoveLog";

const playerColors = ["red", "blue", "yellow", "green"] as const;

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

  // Initialize game
  useEffect(() => {
    if (gameStarted) return;
    const newTrack = tracks[trackType];
    setTrack(newTrack);
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
    setPlayers(initialPlayers);
    setCurrentPlayer(0);
    setWinner(null);
    setCurrentRound(1);
  }, [playerCount, trackType, gameStarted]);

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

  // Execute move for a single player
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

      const actualMoveDist = distanceFromTrack(newPosition, trackTiles);
      const momentumDist = distanceFromTrack(momentumPos, trackTiles);

      let possibleMovesNextTurn: Position[] = [];
      if (!player.crashed) {
        const simPlayer = { ...player, position: newPosition, direction: newDirection, speed: newSpeed };
        (simPlayer as any).lastPosition = lastPosition;
        possibleMovesNextTurn = getValidMoves(simPlayer, track.size, players);
      }

      let isCrashed = false;
      let didSpin = false;

      if (possibleMovesNextTurn.length === 0) {
        isCrashed = true;
      } else if (momentumDist > 1) {
        isCrashed = true;
      } else if (momentumDist === 1) {
        didSpin = true;
        toast("Player " + player.id + " spun out!", {
          description: "Speed reset to 0",
          duration: 2000
        });
      }

      if (isCrashed) {
        player.crashed = true;
        player.speed = 0;
        toast("Player " + player.id + " crashed!", {
          description: "Out of the race",
          duration: 3000
        });
      } else if (didSpin) {
        player.speed = 0;
        player.direction = getReverseDirection(newDirection);
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
      player.direction = didSpin ? getReverseDirection(newDirection) : newDirection;
      player.speed = isCrashed ? 0 : (didSpin ? 0 : newSpeed + speedBonus);

      // Calculate momentum vector for log
      const momentumVector: [number, number] = [dx, dy];

      // Record the move in the log, including momentum
      const speedChange = (player.speed - oldSpeed);
      setMoveLog(prev => [
        ...prev,
        {
          playerId: player.id,
          playerColor: player.color,
          from: lastPosition,
          to: newPosition,
          round: currentRound,
          speedChange,
          momentum: momentumVector
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
