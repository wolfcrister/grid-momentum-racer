
import { Position } from "@/types/game";

// Check if a position is within board boundaries
export function isValidPosition(position: Position, boardSize: { width: number, height: number }): boolean {
  return position.x >= 0 && position.x < boardSize.width && 
         position.y >= 0 && position.y < boardSize.height;
}

// Get all adjacent positions
export function getAllAdjacentPositions(position: Position, boardSize: { width: number, height: number }): Position[] {
  const { x, y } = position;
  const adjacent: Position[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const newPos = { x: x + dx, y: y + dy };
      if (isValidPosition(newPos, boardSize)) {
        adjacent.push(newPos);
      }
    }
  }
  return adjacent;
}

// Helper: Does the line from-from-to pass through the tile exactly
export function doesSegmentPassThroughTile(from: Position, to: Position, tile: Position): boolean {
  // For simplicity, if either endpoint is on the tile:
  if (
    (from.x === tile.x && from.y === tile.y) ||
    (to.x === tile.x && to.y === tile.y)
  )
    return true;

  // If moving in straight line, any tile strictly between (in Chebyshev path), consider segment
  // Bresenham's line algorithm for ALL points between
  const points = getLinePoints(from, to);
  return points.some(
    (p) => p.x === tile.x && p.y === tile.y
  );
}

// Bresenham's algorithm for grid line travel
export function getLinePoints(from: Position, to: Position): Position[] {
  const points: Position[] = [];
  let x0 = from.x, y0 = from.y;
  let x1 = to.x, y1 = to.y;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (!(x0 === from.x && y0 === from.y) && !(x0 === to.x && y0 === to.y)) {
      points.push({ x: x0, y: y0 });
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return points;
}
