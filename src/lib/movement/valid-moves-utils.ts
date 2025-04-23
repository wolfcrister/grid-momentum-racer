
import { Player, Position, Direction } from "@/types/game";
import { getAllAdjacentPositions } from "./position-utils";
import { getLastDelta } from "./speed-direction-utils";

// Calculate valid moves by momentum without checking collisions
export function getValidMovesByMomentum(player: Player, boardSize: number, trackTiles: Position[]): Position[] {
  const currentPos = player.position;

  // Case 1: Speed is zero -> can move only "forward" in direction
  if (player.speed === 0) {
    const directionVectors: Record<Direction, [number, number]> = {
      N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1],
      S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1]
    };
    const [dx, dy] = directionVectors[player.direction];
    const forwardPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    
    if (isValidTrackPosition(forwardPos, boardSize, trackTiles)) {
      return [forwardPos];
    } else {
      return getAllAdjacentPositions(currentPos, boardSize).filter(pos =>
        isValidTrackPosition(pos, boardSize, trackTiles)
      );
    }
  }

  // Case 2: Use the last movement vector as momentum
  const [dx, dy] = getLastDelta(player);

  if (dx === 0 && dy === 0) {
    const directionVectors: Record<Direction, [number, number]> = {
      N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1],
      S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1]
    };
    const [dx, dy] = directionVectors[player.direction];
    const forwardPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    
    if (isValidTrackPosition(forwardPos, boardSize, trackTiles)) {
      return [forwardPos];
    }
    
    return getAllAdjacentPositions(currentPos, boardSize).filter(pos =>
      isValidTrackPosition(pos, boardSize, trackTiles)
    );
  }

  const validMoves: Position[] = [];
  for (let sdx = -1; sdx <= 1; sdx++) {
    for (let sdy = -1; sdy <= 1; sdy++) {
      const newDx = dx + sdx;
      const newDy = dy + sdy;
      if (newDx === 0 && newDy === 0) continue;
      const nextPos = { x: currentPos.x + newDx, y: currentPos.y + newDy };
      if (isValidTrackPosition(nextPos, boardSize, trackTiles)) {
        validMoves.push(nextPos);
      }
    }
  }

  return validMoves;
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
  // Get the track tiles from the current track
  const trackTiles = player.trackTiles || [];
  
  const validMoves = getValidMovesByMomentum(player, boardSize, trackTiles);
  
  return validMoves.filter(move => 
    !isPositionOccupiedByPlayer(move, otherPlayers)
  );
}

// Helper function to check if a position is valid (within bounds and on track)
function isValidTrackPosition(position: Position, boardSize: number, trackTiles: Position[]): boolean {
  if (position.x < 0 || position.x >= boardSize || 
      position.y < 0 || position.y >= boardSize) {
    return false;
  }
  
  // Check if position is on a track tile
  return trackTiles.some(tt => tt.x === position.x && tt.y === position.y);
}
