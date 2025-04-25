
import { Player, Position, Direction } from "@/types/game";
import { getAllAdjacentPositions, isValidPosition, doesSegmentPassThroughTile } from "./position-utils";
import { getLastDelta, getValidMovesByMomentum, getValidMovesWithCollisions, isPositionOccupiedByPlayer, getNextPosition } from "./movement-utils";
import { tracks } from "./tracks";

// Get valid moves based on true momentum rules (vector-based)
export function getValidMoves(player: Player, boardSize: { width: number, height: number }, allPlayers?: Player[]): Position[] {
  if (player.crashed) return [];
  
  // If speed is zero, only allow moving forward in current direction
  if (player.speed === 0) {
    const forwardPosition = getNextPosition(player.position, player.direction);
    
    // Check if the forward position is valid and on track
    if (isValidPosition(forwardPosition, boardSize) && 
        tracks.oval.trackTiles.some(tt => tt.x === forwardPosition.x && tt.y === forwardPosition.y) &&
        (!allPlayers || !isPositionOccupiedByPlayer(forwardPosition, allPlayers.filter(p => p.id !== player.id)))) {
      return [forwardPosition];
    }
    return [];
  }
  
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

// Get a random direction
export function getRandomDirection(): Direction {
  const directions: Direction[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.floor(Math.random() * directions.length)];
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

// Updated crash check function to implement new crash/spin mechanics
export function checkCrash(
  player: Player,
  trackTiles: Position[],
  players: Player[],
  boardSize: { width: number, height: number }
): { crashed: boolean; didSpin: boolean } {
  // Get valid moves
  const validMoves = getValidMoves(player, boardSize, players);
  
  // If there are valid moves, there's no crash
  if (validMoves.length > 0) {
    return { crashed: false, didSpin: false };
  }
  
  // If no valid moves are available, decide between crash and spin based on speed
  if (player.speed >= 4) {
    return { crashed: true, didSpin: false };
  } else {
    return { crashed: false, didSpin: true };
  }
}

// Import the required functions from movement-utils to fill the import dependencies
import { getNewDirection } from "./movement-utils";

