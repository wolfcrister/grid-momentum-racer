
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { GridTile } from "./GridTile";
import { Car } from "./Car";
import { Position, Direction, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";

interface GameBoardProps {
  size: number;
  players: Player[];
  currentPlayer: number;
  onMove: (position: Position) => void;
  validMoves: Position[];
  checkpoints: Position[][];  // Changed from Position[] to Position[][] to match Track type
  finishLine: Position[];
}

export function GameBoard({
  size,
  players,
  currentPlayer,
  onMove,
  validMoves,
  checkpoints,
  finishLine
}: GameBoardProps) {
  // Log valid moves for debugging
  useEffect(() => {
    console.log("GameBoard received validMoves:", validMoves);
  }, [validMoves]);

  // Calculate the momentum position for the current player
  const getMomentumPosition = () => {
    const player = players[currentPlayer];
    if (player.speed === 0) return null;

    // For vector-based momentum, we need to use the last movement delta
    // This is stored on the player as lastPosition
    if (!("lastPosition" in player) || !player["lastPosition"]) {
      return null;
    }
    
    const lastPosition = (player as any).lastPosition as Position;
    const dx = player.position.x - lastPosition.x;
    const dy = player.position.y - lastPosition.y;
    
    // The momentum position is current position + the last movement vector
    const momentumPos = {
      x: player.position.x + dx,
      y: player.position.y + dy
    };
    
    // Check if the calculated momentum position is within board boundaries
    if (momentumPos.x >= 0 && momentumPos.x < size && 
        momentumPos.y >= 0 && momentumPos.y < size) {
      return momentumPos;
    }
    
    return null;
  };

  const momentumPosition = getMomentumPosition();

  const renderTile = (x: number, y: number) => {
    const position: Position = { x, y };
    // Update how we check for checkpoint tiles to handle the 2D array structure
    const isCheckpoint = checkpoints.some(checkpointLine => 
      checkpointLine.some(cp => cp.x === x && cp.y === y)
    );
    const isFinish = finishLine.some(fl => fl.x === x && fl.y === y);
    const isValidMove = validMoves.some(vm => vm.x === x && vm.y === y);
    const isTrackTile = tracks.oval.trackTiles.some(tt => tt.x === x && tt.y === y);
    
    // Determine if this is the momentum position
    const isMomentumPosition = momentumPosition && x === momentumPosition.x && y === momentumPosition.y;
    
    const tileType = isFinish ? "finish" : isCheckpoint ? "checkpoint" : "track";
    
    return (
      <GridTile 
        key={`${x}-${y}`}
        position={position}
        type={tileType}
        isValidMove={isValidMove}
        isMomentumPosition={isMomentumPosition}
        isTrackTile={isTrackTile}
        onClick={() => {
          console.log("Tile clicked:", position, "isValidMove:", isValidMove);
          if (isValidMove) {
            onMove(position);
          }
        }}
      />
    );
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className={cn(
          "grid gap-0.5 bg-muted p-0.5 rounded-lg overflow-hidden",
          "shadow-2xl border-2 border-accent/50"
        )}
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          aspectRatio: "1/1",
          position: "relative",
          // Fix: Use correct React CSS variable syntax (camelCase)
          "--gridSize": size, // Changed from '--grid-size' to '--gridSize'
        }}
      >
        {Array.from({ length: size * size }).map((_, index) => {
          const x = index % size;
          const y = Math.floor(index / size);
          return renderTile(x, y);
        })}

        {players.map((player, index) => (
          <Car 
            key={player.id}
            player={player}
            isActive={index === currentPlayer}
            position={player.position}
            direction={player.direction}
          />
        ))}
      </div>
      
      {/* Debug info */}
      <div className="mt-2 p-2 bg-muted/50 text-xs rounded">
        <div>Valid moves: {validMoves.length} ({validMoves.map(m => `[${m.x},${m.y}]`).join(", ")})</div>
        <div>Current player: {currentPlayer + 1} at position [{players[currentPlayer]?.position.x}, {players[currentPlayer]?.position.y}]</div>
      </div>
    </div>
  );
}
