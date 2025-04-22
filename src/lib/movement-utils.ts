import { Position, Direction, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";
import { isValidPosition } from "./position-utils";

// Get the next position based on current position and direction
export function getNextPosition(position: Position, direction: Direction): Position {
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

  const [dx, dy] = directionVectors[direction];
  return {
    x: position.x + dx,
    y: position.y + dy,
  };
}

// Get the last movement delta (dx, dy) based on previous and current positions
export function getLastDelta(player: Player): [number, number] {
  // If no previous move, fall back to direction/speed conversion for first move
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

// Calculate the momentum position (where you would go if you maintained same direction/speed)
export function calculateMomentumPosition(position: Position, direction: Direction, speed: number): Position {
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

  const [dx, dy] = directionVectors[direction];
  return {
    x: position.x + (dx * speed),
    y: position.y + (dy * speed),
  };
}

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
  
  // Default fallback
  return "N";
}

// Calculate speed based on movement
export function calculateNewSpeed(player: Player, newPosition: Position): number {
  // Calculate the distance between the old and new positions
  const dx = Math.abs(newPosition.x - player.position.x);
  const dy = Math.abs(newPosition.y - player.position.y);
  
  // Get the maximum distance in any direction
  // This represents the speed based on the movement
  const distance = Math.max(dx, dy);
  
  // If the distance equals the current speed + 1, the player is accelerating
  if (distance === player.speed + 1) {
    return player.speed + 1;
  }
  // If the distance equals the current speed, maintaining momentum
  else if (distance === player.speed) {
    return player.speed;
  }
  // Otherwise, the player is slowing down or changing direction
  else {
    return distance;
  }
}
