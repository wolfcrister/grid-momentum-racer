
import { Position, Direction, Player } from "@/types/game";

// Calculate new direction based on movement
export function getNewDirection(from: Position, to: Position): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (dx === 0 && dy < 0) return "N";
  if (dx > 0 && dy < 0) return "NE";
  if (dx > 0 && dy === 0) return "E";
  if (dx > 0 && dy > 0) return "SE";
  if (dx === 0 && dy > 0) return "S";
  if (dx < 0 && dy > 0) return "SW";
  if (dx < 0 && dy === 0) return "W";
  if (dx < 0 && dy < 0) return "NW";
  
  return "N";
}

// Calculate speed based on movement
export function calculateNewSpeed(player: Player, newPosition: Position): number {
  const dx = Math.abs(newPosition.x - player.position.x);
  const dy = Math.abs(newPosition.y - player.position.y);
  const distance = Math.max(dx, dy);
  
  if (distance === player.speed + 1) {
    return player.speed + 1;
  } else if (distance === player.speed) {
    return player.speed;
  } else {
    return distance;
  }
}

// Get the last movement delta
export function getLastDelta(player: Player): [number, number] {
  if (!("lastPosition" in player) || !player["lastPosition"]) {
    const directionVectors: Record<Direction, [number, number]> = {
      N: [0, -1],
      NE: [1, -1],
      E: [1, 0],
      SE: [1, 1],
      S: [0, 1],
      SW: [-1, 1],
      W: [-1, 0],
      NW: [-1, -1],
    };
    return directionVectors[player.direction];
  }
  const prev = (player as any).lastPosition as Position;
  return [player.position.x - prev.x, player.position.y - prev.y];
}

