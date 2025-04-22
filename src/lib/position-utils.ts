
import { Position } from "@/types/game";
import { tracks } from "@/lib/tracks";

// Check if a position is within board boundaries
export function isValidPosition(position: Position, boardSize: number): boolean {
  return position.x >= 0 && position.x < boardSize && 
         position.y >= 0 && position.y < boardSize;
}

// Get all adjacent positions
export function getAllAdjacentPositions(position: Position, boardSize: number): Position[] {
  const { x, y } = position;
  const adjacent: Position[] = [];
  
  // Check all 8 adjacent positions
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      // Skip the current position
      if (dx === 0 && dy === 0) continue;
      
      const newPos = { x: x + dx, y: y + dy };
      if (isValidPosition(newPos, boardSize)) {
        adjacent.push(newPos);
      }
    }
  }
  
  return adjacent;
}

// Check if a player has reached a checkpoint or finish line
export function checkCheckpoint(
  position: Position, 
  checkpoints: Position[]
): boolean {
  return checkpoints.some(cp => cp.x === position.x && cp.y === position.y);
}

export function checkFinishLine(
  position: Position,
  finishLine: Position[]
): boolean {
  return finishLine.some(fl => fl.x === position.x && fl.y === position.y);
}

// Add a new function to check if a move would result in a crash
export function checkCrash(position: Position): boolean {
  // Only crash if the target position is not on track in the currently selected track  
  return !tracks.oval.trackTiles.some(tt => tt.x === position.x && tt.y === position.y);
}
