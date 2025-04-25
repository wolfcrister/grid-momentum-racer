
import { Player, Position } from "@/types/game";
import { toast } from "@/components/ui/sonner";
import {
  getNewDirection,
  calculateNewSpeed,
  checkSlipstream,
  checkCheckpointCrossed,
  checkFinishLineCrossed
} from "@/lib/game-utils";

export function executeMove(
  playerIndex: number,
  newPosition: Position,
  prevPlayers: Player[],
  track: any
) {
  const updatedPlayers = [...prevPlayers];
  const player = { ...updatedPlayers[playerIndex] };
  const lastPosition = { ...player.position };

  const newDirection = getNewDirection(player.position, newPosition);
  const newSpeed = calculateNewSpeed(player.position, newPosition);

  const moveHistory = player.moveHistory || [];
  moveHistory.push({ ...player.position });
  player.moveHistory = moveHistory.slice(-5);

  player.position = newPosition;
  player.direction = newDirection;
  player.speed = newSpeed;

  const otherPlayers = prevPlayers.filter((_, i) => i !== playerIndex);
  const hasSlipstream = checkSlipstream(player, otherPlayers, newPosition);
  if (hasSlipstream) {
    player.speed += 1;
    toast("Slipstream boost!", {
      description: `Player ${player.id} gets +1 speed`,
      duration: 2000
    });
  }

  const cpIndex = checkCheckpointCrossed(lastPosition, newPosition, track.checkpoints);
  if (cpIndex !== null && !player.checkpointsPassed.has(cpIndex)) {
    const newPassed = new Set(player.checkpointsPassed);
    newPassed.add(cpIndex);
    player.checkpointsPassed = newPassed;
    
    toast("Checkpoint passed!", {
      description: `Player ${player.id}: ${player.checkpointsPassed.size}/${player.totalCheckpoints}`,
      duration: 2000
    });
  }

  const hasWon = player.checkpointsPassed.size === player.totalCheckpoints &&
    checkFinishLineCrossed(lastPosition, newPosition, track.finishLine);

  updatedPlayers[playerIndex] = player;
  
  return {
    updatedPlayers,
    hasWon: hasWon ? player : null
  };
}
