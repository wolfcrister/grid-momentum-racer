
import { useState } from "react";
import { Player, Position, Track, Direction } from "@/types/game";
import { tracks } from "@/lib/tracks";
import { toast } from "@/hooks/use-toast";
import { MoveLogEntry } from "@/components/MoveLog";
import {
  getValidMoves,
  checkSlipstream,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  checkCrash,
  getAllAdjacentPositions,
  getNewDirection,
  calculateNewSpeed,
} from "@/lib/game-utils";

const playerColors = ["red", "blue", "yellow", "green"] as const;
const MAIN_DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
function pickRandomMainDirection(): Direction {
  return MAIN_DIRECTIONS[Math.floor(Math.random() * MAIN_DIRECTIONS.length)];
}

export function usePlayersState(
  playerCount: number,
  track: Track,
  setMoveLog: React.Dispatch<React.SetStateAction<MoveLogEntry[]>>,
  setWinner: React.Dispatch<React.SetStateAction<Player | null>>,
  currentRound: number,
) {
  // Set up initial players state
  const initializePlayers = () => {
    const initialPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      const startPos = track.startPositions[i];
      initialPlayers.push({
        id: i + 1,
        position: { ...startPos.position },
        direction: startPos.direction,
        speed: 0,
        color: playerColors[i],
        checkpointsPassed: new Set(),
        totalCheckpoints: track.checkpoints.length,
        isFinished: false,
        crashed: false,
      });
    }
    return initialPlayers;
  };

  const [players, setPlayers] = useState<Player[]>([]); // will be initialized by parent
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentRoundState, setCurrentRound] = useState(currentRound);
  const [winner, _setWinner] = useState<Player | null>(null);

  // Let parent manage winner for now
  // Expose functions for moving players
  const executeMove = (
    playerIndex: number,
    newPosition: Position,
    programmedMoves?: Record<number, Position>
  ) => {
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

      // Momentum vector
      // ---- Modified SPIN / CRASH LOGIC ----
      let isCrashed = false;
      let didSpin = false;

      // Check if the new position would result in a crash
      isCrashed = checkCrash(newPosition);

      // Calculate next turn's possible moves if standing at newPosition with potential state
      let possibleMovesNextTurn: Position[] = [];
      if (!player.crashed && !isCrashed) {
        const simPlayer = { ...player, position: newPosition, direction: newDirection, speed: newSpeed };
        (simPlayer as any).lastPosition = lastPosition;
        possibleMovesNextTurn = getValidMoves(simPlayer, track.size, updatedPlayers);
      }

      // If possibleMovesNextTurn has at least one move ON TRACK, all okay.
      if (possibleMovesNextTurn.length === 0) {
        const adjacents = getAllAdjacentPositions(newPosition, track.size);
        const offTrackAdjacents = adjacents.filter(p =>
          !trackTiles.some(tt => tt.x === p.x && tt.y === p.y)
        );
        if (offTrackAdjacents.length > 0) {
          didSpin = true;
          toast("Player " + player.id + " spun out!", {
            description: "Facing a random direction and speed reset.",
            duration: 2000
          });
        } else {
          isCrashed = true;
          toast("Player " + player.id + " crashed!", {
            description: "Out of the race",
            duration: 3000
          });
        }
      }

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
      player.direction = didSpin ? player.direction : newDirection;
      player.speed = isCrashed ? 0 : (didSpin ? 0 : newSpeed + speedBonus);

      // Record move in log
      const momentumVector: [number, number] = [dx, dy];
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
          event: isCrashed ? "crash" : didSpin ? "spin" : undefined
        }
      ]);
      (player as any).lastPosition = lastPosition;

      if (!isCrashed) {
        // Typefix: checkpoint lines
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

  return {
    players, setPlayers,
    currentPlayer, setCurrentPlayer,
    currentRound: currentRoundState, setCurrentRound,
    winner, setWinner: _setWinner,
    initializePlayers,
    executeMove,
  };
}
