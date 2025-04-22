
import { Position, Direction, Player } from "@/types/game";

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

// Get valid moves based on momentum rules
export function getValidMoves(player: Player, boardSize: number): Position[] {
  const currentPos = player.position;
  const currentDir = player.direction;
  const currentSpeed = player.speed;

  // If player has no speed, they can move to any adjacent tile
  if (currentSpeed === 0) {
    return getAllAdjacentPositions(currentPos, boardSize);
  }

  // Get the momentum vector based on current direction
  const validMoves: Position[] = [];

  // Player must maintain momentum direction or make small adjustment
  const directionsToCheck: Direction[] = getAdjacentDirections(currentDir);
  
  // Add the current direction (continuing momentum)
  directionsToCheck.push(currentDir);

  // Calculate positions based on speed and allowed directions
  directionsToCheck.forEach(dir => {
    const newPos = moveWithSpeed(currentPos, dir, currentSpeed);
    if (isValidPosition(newPos, boardSize)) {
      validMoves.push(newPos);
    }
  });

  return validMoves;
}

// Get positions by moving with current speed in a direction
function moveWithSpeed(position: Position, direction: Direction, speed: number): Position {
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

// Get directions adjacent to the current direction
function getAdjacentDirections(direction: Direction): Direction[] {
  const allDirections: Direction[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const currentIndex = allDirections.indexOf(direction);
  
  const leftIndex = (currentIndex - 1 + 8) % 8;
  const rightIndex = (currentIndex + 1) % 8;
  
  return [allDirections[leftIndex], allDirections[rightIndex]];
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
  // Calculate distance moved
  const dx = newPosition.x - player.position.x;
  const dy = newPosition.y - player.position.y;
  
  // Calculate Euclidean distance (rounded to nearest integer)
  return Math.round(Math.sqrt(dx * dx + dy * dy));
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

// Track definitions
export const tracks = {
  oval: {
    size: 10,
    checkpoints: [
      { x: 5, y: 1 },
      { x: 8, y: 5 },
      { x: 5, y: 8 }
    ],
    finishLine: [
      { x: 2, y: 5 },
      { x: 1, y: 5 }
    ],
    startPositions: [
      { position: { x: 3, y: 5 }, direction: "W" as Direction },
      { position: { x: 3, y: 6 }, direction: "W" as Direction },
      { position: { x: 4, y: 5 }, direction: "W" as Direction },
      { position: { x: 4, y: 6 }, direction: "W" as Direction }
    ]
  },
  figure8: {
    size: 12,
    checkpoints: [
      { x: 3, y: 3 },
      { x: 9, y: 3 },
      { x: 9, y: 9 },
      { x: 3, y: 9 }
    ],
    finishLine: [
      { x: 6, y: 1 },
      { x: 5, y: 1 }
    ],
    startPositions: [
      { position: { x: 7, y: 1 }, direction: "W" as Direction },
      { position: { x: 7, y: 2 }, direction: "W" as Direction },
      { position: { x: 8, y: 1 }, direction: "W" as Direction },
      { position: { x: 8, y: 2 }, direction: "W" as Direction }
    ]
  }
};
