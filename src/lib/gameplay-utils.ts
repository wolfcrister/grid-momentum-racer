
import { Player, Position } from "@/types/game";

/**
 * Check if a player gets slipstream from being behind another player
 * Grants a +1 speed bonus
 */
export function checkSlipstream(player: Player, otherPlayers: Player[], newPosition: Position): boolean {
  // Slipstream only applies if a player is moving in the same direction 
  // as another player and positioned behind them
  
  // For simplicity, we check if the player will be adjacent to another player
  // and that player is moving in roughly the same direction
  return otherPlayers.some(other => {
    // Check if adjacent in one of the 8 directions
    const dx = Math.abs(newPosition.x - other.position.x);
    const dy = Math.abs(newPosition.y - other.position.y);
    
    // Adjacent check (includes diagonals)
    const isAdjacent = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
    
    // Same general direction check
    const isSameDirection = player.direction === other.direction;
    
    return isAdjacent && isSameDirection && other.speed > 0;
  });
}

/**
 * Check if a player crosses a checkpoint line
 * Returns the index of the crossed checkpoint, or null if none
 */
export function checkCheckpointCrossed(
  from: Position, 
  to: Position, 
  checkpoints: Position[][]
): number | null {
  for (let i = 0; i < checkpoints.length; i++) {
    const checkpoint = checkpoints[i];
    if (doesSegmentCrossCheckpoint(from, to, checkpoint)) {
      return i;
    }
  }
  return null;
}

/**
 * Check if player movement crosses the finish line
 */
export function checkFinishLineCrossed(from: Position, to: Position, finishLine: Position[]): boolean {
  return doesSegmentCrossCheckpoint(from, to, finishLine);
}

/**
 * Determines if a movement segment crosses a checkpoint line
 */
function doesSegmentCrossCheckpoint(from: Position, to: Position, checkpointLine: Position[]): boolean {
  // For simplicity, we'll just check if the movement path
  // intersects with any point on the checkpoint line
  
  // Define line segments for the movement
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Check if any point on the checkpoint line is on the movement path
  return checkpointLine.some(cp => {
    // If movement is straight
    if (dx === 0) {
      // Vertical movement, check if checkpoint is on the same x
      if (cp.x === from.x) {
        const minY = Math.min(from.y, to.y);
        const maxY = Math.max(from.y, to.y);
        return cp.y >= minY && cp.y <= maxY;
      }
    } else if (dy === 0) {
      // Horizontal movement, check if checkpoint is on the same y
      if (cp.y === from.y) {
        const minX = Math.min(from.x, to.x);
        const maxX = Math.max(from.x, to.x);
        return cp.x >= minX && cp.x <= maxX;
      }
    } else {
      // Diagonal movement - more complex, check if checkpoint lies on the diagonal
      const slope = dy / dx;
      const expectedY = from.y + slope * (cp.x - from.x);
      
      if (Math.abs(cp.y - expectedY) < 0.1) { // Allow small rounding errors
        const minX = Math.min(from.x, to.x);
        const maxX = Math.max(from.x, to.x);
        return cp.x >= minX && cp.x <= maxX;
      }
    }
    return false;
  });
}

/**
 * Calculate distance from track
 */
export function distanceFromTrack(position: Position, trackTiles: Position[]): number {
  // Simple Manhattan distance to nearest track tile
  let minDistance = Infinity;
  for (const tile of trackTiles) {
    const distance = Math.abs(position.x - tile.x) + Math.abs(position.y - tile.y);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  return minDistance;
}

/**
 * Get the reverse direction
 */
export function getReverseDirection(direction: string): string {
  const directions = {
    N: "S",
    NE: "SW",
    E: "W",
    SE: "NW",
    S: "N",
    SW: "NE",
    W: "E",
    NW: "SE",
  };
  return directions[direction as keyof typeof directions];
}
