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
  if (player.crashed) return [];
  
  const currentPos = player.position;
  const currentSpeed = player.speed;
  const currentDirection = player.direction;

  // If player has no speed, they can move to any adjacent tile ON THE TRACK
  if (currentSpeed === 0) {
    return getAllAdjacentPositions(currentPos, boardSize).filter(pos => 
      tracks.oval.trackTiles.some(tt => tt.x === pos.x && tt.y === pos.y)
    );
  }

  // Calculate the momentum position (continuing with same direction and speed)
  const momentumPos = calculateMomentumPosition(currentPos, currentDirection, currentSpeed);
  
  // Instead of defaulting to "crash" if momentum is not on track,
  // always allow the player to choose any adjacent tile to momentumPos that is on track.
  const validMoves: Position[] = [];

  // Add momentum position if it's valid and on track
  if (
    isValidPosition(momentumPos, boardSize) &&
    tracks.oval.trackTiles.some(tt => tt.x === momentumPos.x && tt.y === momentumPos.y)
  ) {
    validMoves.push(momentumPos);
  }

  // Add all adjacent positions to the momentum position (potential adjustments)
  const adjacentToMomentum = getAllAdjacentPositions(momentumPos, boardSize)
    .filter(pos => tracks.oval.trackTiles.some(tt => tt.x === pos.x && tt.y === pos.y));

  // Allow all positions that are on the track (possibly including the momentum position again, but that's ok)
  for (const pos of adjacentToMomentum) {
    // Don't add duplicates
    if (!validMoves.some(m => m.x === pos.x && m.y === pos.y)) {
      validMoves.push(pos);
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
  
  // In grid racer, your speed is based on your previous move
  return distance;
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
    size: 20,
    checkpoints: [
      { x: 5, y: 1 },  // Top checkpoint
      { x: 18, y: 10 }, // Right checkpoint
      { x: 10, y: 18 }, // Bottom checkpoint
      { x: 1, y: 10 }   // Left checkpoint
    ],
    // The finish line now crosses the course at x=4, for all y values that are on the track
    finishLine: Array.from({length: 4}, (_, idx) => ({
      x: 4,
      y: 4 + idx // y values 4,5,6,7
    })),
    startPositions: [
      { position: { x: 2, y: 5 }, direction: "E" as Direction },
      { position: { x: 2, y: 6 }, direction: "E" as Direction },
      { position: { x: 2, y: 7 }, direction: "E" as Direction },
      { position: { x: 2, y: 8 }, direction: "E" as Direction }
    ],
    trackTiles: generateTrackTiles()
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

// Generate the track tiles for a 20x20 board with a 4-tile wide track
function generateTrackTiles(): Position[] {
  const trackTiles: Position[] = [];
  const size = 20;
  const trackWidth = 4;
  const padding = 1;
  
  // Add outer track tiles
  for (let x = padding; x < size - padding; x++) {
    // Top part of track
    for (let y = padding; y < padding + trackWidth; y++) {
      trackTiles.push({ x, y });
    }
    // Bottom part of track
    for (let y = size - padding - trackWidth; y < size - padding; y++) {
      trackTiles.push({ x, y });
    }
  }
  
  // Add side track tiles
  for (let y = padding; y < size - padding; y++) {
    // Left part of track
    for (let x = padding; x < padding + trackWidth; x++) {
      trackTiles.push({ x, y });
    }
    // Right part of track
    for (let x = size - padding - trackWidth; x < size - padding; x++) {
      trackTiles.push({ x, y });
    }
  }
  
  return trackTiles;
}

// Add a new function to check if a move would result in a crash
export function checkCrash(position: Position): boolean {
  return !tracks.oval.trackTiles.some(tt => tt.x === position.x && tt.y === position.y);
}
