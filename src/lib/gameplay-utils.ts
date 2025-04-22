
import { Player, Position } from "@/types/game";
import { getAllAdjacentPositions, isValidPosition } from "./position-utils";
import { getLastDelta } from "./movement-utils";
import { tracks } from "./tracks";

// Get valid moves based on true momentum rules (vector-based)
export function getValidMoves(player: Player, boardSize: number): Position[] {
  if (player.crashed) return [];
  // Get the track layout from the imported tracks
  const trackLayout = tracks.oval; // always oval for now—could refactor for trackType
  const currentPos = player.position;

  // ---- Case 1: Speed is zero -> can move to any adjacent tile ON TRACK ----
  if (player.speed === 0) {
    return getAllAdjacentPositions(currentPos, boardSize).filter(pos => 
      trackLayout.trackTiles.some(tt => tt.x === pos.x && tt.y === pos.y)
    );
  }

  // ---- Case 2: Use the last movement vector as momentum ----
  // Infer last movement vector (dx, dy)
  const [dx, dy] = getLastDelta(player);

  // No movement, so no momentum
  if (dx === 0 && dy === 0) {
    return getAllAdjacentPositions(currentPos, boardSize).filter(pos =>
      trackLayout.trackTiles.some(tt => tt.x === pos.x && tt.y === pos.y)
    );
  }

  // Correct 2D vector momentum: allowed are (dx+sdx, dy+sdy), for sdx/sdy in [-1,0,1]
  const validMoves: Position[] = [];
  for (let sdx = -1; sdx <= 1; sdx++) {
    for (let sdy = -1; sdy <= 1; sdy++) {
      const newDx = dx + sdx;
      const newDy = dy + sdy;
      // Don't allow no movement at all:
      if (newDx === 0 && newDy === 0) continue;
      const nextPos = { x: currentPos.x + newDx, y: currentPos.y + newDy };
      if (
        isValidPosition(nextPos, boardSize) &&
        trackLayout.trackTiles.some(tt => tt.x === nextPos.x && tt.y === nextPos.y)
      ) {
        validMoves.push(nextPos);
      }
    }
  }

  return validMoves;
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
