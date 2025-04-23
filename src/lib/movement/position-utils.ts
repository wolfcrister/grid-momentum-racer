
import { Position, Direction } from "@/types/game";

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

// Get all adjacent positions
export function getAllAdjacentPositions(position: Position, boardSize: number): Position[] {
  const { x, y } = position;
  const adjacent: Position[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const newPos = { x: x + dx, y: y + dy };
      if (isWithinBounds(newPos, boardSize)) {
        adjacent.push(newPos);
      }
    }
  }
  return adjacent;
}

// Helper to check if position is within board bounds
function isWithinBounds(position: Position, boardSize: number): boolean {
  return position.x >= 0 && position.x < boardSize && 
         position.y >= 0 && position.y < boardSize;
}

