
import { Position, Direction, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";
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
  // If no previous position, use direction vector for first move
  if (player.speed === 0) {
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
  
  // For subsequent moves, calculate based on actual movement
  const prevPositions = player.moveHistory || [];
  const lastPosition = prevPositions.length > 0 ? 
    prevPositions[prevPositions.length - 1] : 
    player.position;
    
  return [player.position.x - lastPosition.x, player.position.y - lastPosition.y];
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
export function calculateNewSpeed(from: Position, to: Position): number {
  // Calculate the distance between the old and new positions
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  
  // Get the maximum distance in any direction
  // This represents the speed based on the movement
  return Math.max(dx, dy);
}

// Check if a position has a player occupying it
export function isPositionOccupiedByPlayer(position: Position, players: Player[]): boolean {
  return players.some(player => 
    !player.crashed && player.position.x === position.x && player.position.y === position.y
  );
}

// Calculate valid moves accounting for player collisions
export function getValidMovesWithCollisions(player: Player, players: Player[], boardSize: { width: number, height: number }): Position[] {
  const otherPlayers = players.filter(p => p.id !== player.id && !p.crashed);
  const validMoves = getValidMovesByMomentum(player, boardSize);
  
  // Filter out positions occupied by other players
  return validMoves.filter(move => 
    !isPositionOccupiedByPlayer(move, otherPlayers)
  );
}

// Base valid moves by momentum without checking collisions
export function getValidMovesByMomentum(player: Player, boardSize: { width: number, height: number }): Position[] {
  if (player.crashed) return [];
  // Get the track layout from the imported tracks
  const trackLayout = tracks.oval; // always oval for now—could refactor for trackType
  const currentPos = player.position;

  // ---- Case 1: Speed is zero -> can move to any adjacent tile ON TRACK ----
  if (player.speed === 0) {
    // For zero speed, allow movement in the current direction (starting the race)
    const forwardPosition = getNextPosition(currentPos, player.direction);
    if (isValidPosition(forwardPosition, boardSize) && 
        trackLayout.trackTiles.some(tt => tt.x === forwardPosition.x && tt.y === forwardPosition.y)) {
      return [forwardPosition];
    }
    return [];
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

// Helper function for adjacent positions
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
