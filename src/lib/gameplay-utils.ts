import { Player, Position } from "@/types/game";
import { getAllAdjacentPositions, isValidPosition } from "./position-utils";
import { getLastDelta, getValidMovesByMomentum, getValidMovesWithCollisions, isPositionOccupiedByPlayer } from "./movement-utils";
import { tracks } from "./tracks";

// Get valid moves based on true momentum rules (vector-based)
export function getValidMoves(player: Player, boardSize: number, allPlayers?: Player[]): Position[] {
  if (player.crashed) return [];
  
  // If allPlayers is provided, check for collisions with other players
  if (allPlayers) {
    return getValidMovesWithCollisions(player, allPlayers, boardSize);
  }
  
  // Otherwise, just use the basic momentum rules
  return getValidMovesByMomentum(player, boardSize);
}

// Check if there is a slipstream boost available
export function checkSlipstream(
  player: Player, 
  otherPlayers: Player[], 
  newPosition: Position
): boolean {
  // Check if another car is in front of the player in their direction of travel
  const playerDirection = getNewDirection(player.position, newPosition);
  
  for (const otherPlayer of otherPlayers) {
    // Skip self
    if (otherPlayer.id === player.id) continue;
    
    // Check if other player is in the same "lane" based on direction
    const otherPlayerRelativePosition = {
      x: otherPlayer.position.x - newPosition.x,
      y: otherPlayer.position.y - newPosition.y,
    };
    
    // Simplify to check if other car is in front in the same direction
    const isInFront = isInFrontInDirection(otherPlayerRelativePosition, playerDirection);
    
    // Check if close enough for slipstream (within 2 spaces)
    const distance = Math.sqrt(
      Math.pow(otherPlayerRelativePosition.x, 2) + 
      Math.pow(otherPlayerRelativePosition.y, 2)
    );
    
    if (isInFront && distance <= 2) {
      return true;
    }
  }
  
  return false;
}

// Helper to check if a position is in front of the player in a given direction
function isInFrontInDirection(relativePosition: Position, direction: Direction): boolean {
  switch (direction) {
    case "N": return relativePosition.y < 0 && Math.abs(relativePosition.x) <= 1;
    case "NE": return relativePosition.x > 0 && relativePosition.y < 0;
    case "E": return relativePosition.x > 0 && Math.abs(relativePosition.y) <= 1;
    case "SE": return relativePosition.x > 0 && relativePosition.y > 0;
    case "S": return relativePosition.y > 0 && Math.abs(relativePosition.x) <= 1;
    case "SW": return relativePosition.x < 0 && relativePosition.y > 0;
    case "W": return relativePosition.x < 0 && Math.abs(relativePosition.y) <= 1;
    case "NW": return relativePosition.x < 0 && relativePosition.y < 0;
    default: return false;
  }
}

// We need to import Direction here for the isInFrontInDirection function
import { Direction } from "@/types/game";
import { getNewDirection } from "./movement-utils";

// Helper: checks how far from the nearest track tile a given position is
export function distanceFromTrack(position: Position, trackTiles: Position[]): number {
  let minDist = Infinity;
  for (const tile of trackTiles) {
    const dx = Math.abs(tile.x - position.x);
    const dy = Math.abs(tile.y - position.y);
    const dist = Math.max(dx, dy); // Chebyshev for grid
    if (dist < minDist) minDist = dist;
  }
  return minDist === Infinity ? -1 : minDist;
}

// Helper: returns the direction 180 degrees opposite
const reverseDirection: Record<Direction, Direction> = {
  N: "S",
  NE: "SW",
  E: "W",
  SE: "NW",
  S: "N",
  SW: "NE",
  W: "E",
  NW: "SE",
};
export function getReverseDirection(direction: Direction): Direction {
  return reverseDirection[direction];
}

// Check if a player has crossed a checkpoint line
export function checkCheckpointCrossed(
  from: Position,
  to: Position,
  checkpoints: Position[][]
): number | null {
  // For each checkpoint line:
  for (let i = 0; i < checkpoints.length; i++) {
    const checkpointLine = checkpoints[i];
    // If from-to segment crosses any tile of the checkpoint line, return its index
    for (const tile of checkpointLine) {
      if (doesSegmentPassThroughTile(from, to, tile)) {
        return i;
      }
    }
  }
  return null;
}

// Helper: Does the line from-from-to pass through the tile exactly
function doesSegmentPassThroughTile(from: Position, to: Position, tile: Position): boolean {
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
function getLinePoints(from: Position, to: Position): Position[] {
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

// For finish line: treat as "tile crossed" for now; logic can match this format for future extension
export function checkFinishLineCrossed(
  from: Position,
  to: Position,
  finishLine: Position[]
): boolean {
  for (const tile of finishLine) {
    if (doesSegmentPassThroughTile(from, to, tile)) {
      return true;
    }
  }
  return false;
}

export function checkCrash(position: Position): boolean {
  // Only crash if the target position is not on track in the currently selected track  
  return !tracks.oval.trackTiles.some(tt => tt.x === position.x && tt.y === position.y);
}
