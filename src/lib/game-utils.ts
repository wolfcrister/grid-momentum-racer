import { Position, Direction, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";

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
function getLastDelta(player: Player): [number, number] {
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

// Get all adjacent positions
function getAllAdjacentPositions(position: Position, boardSize: number): Position[] {
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

// Check if a position is within board boundaries
function isValidPosition(position: Position, boardSize: number): boolean {
  return position.x >= 0 && position.x < boardSize && 
         position.y >= 0 && position.y < boardSize;
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
