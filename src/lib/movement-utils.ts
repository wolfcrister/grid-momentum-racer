import { Position, Direction, Player } from "@/types/game";
import { tracks } from "./tracks";
import { isValidPosition } from "./position-utils";

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
export function getLastDelta(player: Player): [number, number] {
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

// Check if a position has a player occupying it
export function isPositionOccupiedByPlayer(position: Position, players: Player[]): boolean {
  return players.some(player => 
    player.position.x === position.x && player.position.y === position.y
  );
}

// Calculate valid moves accounting for player collisions
export function getValidMovesWithCollisions(player: Player, players: Player[], boardSize: number): Position[] {
  const otherPlayers = players.filter(p => p.id !== player.id);
  const validMoves = getValidMovesByMomentum(player, boardSize);
  
  // Filter out positions occupied by other players
  return validMoves.filter(move => 
    !isPositionOccupiedByPlayer(move, otherPlayers)
  );
}

// Base valid moves by momentum without checking collisions
export function getValidMovesByMomentum(player: Player, boardSize: number): Position[] {
  const trackLayout = tracks.oval; // always oval for now
  const currentPos = player.position;

  // ---- Case 1: Speed is zero -> can move only "forward" in direction, and only if it's on the board and not occupied
  if (player.speed === 0) {
    const directionVectors: Record<Direction, [number, number]> = {
      N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1],
      S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1]
    };
    const [dx, dy] = directionVectors[player.direction];
    const forwardPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    
    // Check if forward move is valid
    if (
      isValidPosition(forwardPos, boardSize) && 
      trackLayout.trackTiles.some(tt => tt.x === forwardPos.x && tt.y === forwardPos.y)
    ) {
      return [forwardPos];
    } else {
      // If forward isn't valid, try all adjacent positions
      return getAllAdjacentPositions(currentPos, boardSize).filter(pos =>
        trackLayout.trackTiles.some(tt => tt.x === pos.x && tt.y === pos.y)
      );
    }
  }

  // ---- Case 2: Use the last movement vector as momentum ----
  // Infer last movement vector (dx, dy)
  const [dx, dy] = getLastDelta(player);

  // No momentum, allow moving in current direction
  if (dx === 0 && dy === 0) {
    const directionVectors: Record<Direction, [number, number]> = {
      N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1],
      S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1]
    };
    const [dx, dy] = directionVectors[player.direction];
    const forwardPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    
    // Check if forward move is valid
    if (
      isValidPosition(forwardPos, boardSize) &&
      trackLayout.trackTiles.some(tt => tt.x === forwardPos.x && tt.y === forwardPos.y)
    ) {
      return [forwardPos];
    }
    
    // If forward isn't valid, try all adjacent positions
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

// Helper function for adjacent positions (export for use in engine)
export function getAllAdjacentPositions(position: Position, boardSize: number): Position[] {
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

// Export only the ones needed for game engine use
export {};
