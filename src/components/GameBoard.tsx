
import React from "react";
import { cn } from "@/lib/utils";
import { GridTile } from "./GridTile";
import { Car } from "./Car";
import { Position, Direction, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";
import { calculateMomentumPosition } from "@/lib/game-utils";

interface GameBoardProps {
  size: number;
  players: Player[];
  currentPlayer: number;
  onMove: (position: Position) => void;
  validMoves: Position[];
  checkpoints: Position[];
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
  // Calculate the momentum position for the current player
  const getMomentumPosition = () => {
    const player = players[currentPlayer];
    if (player.crashed || player.speed === 0) return null;

    // Use the utility function to calculate momentum position
    // Important: Use the actual speed value of the player
    const momentumPos = calculateMomentumPosition(player.position, player.direction, player.speed);
    
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
    const isCheckpoint = checkpoints.some(cp => cp.x === x && cp.y === y);
    const isFinish = finishLine.some(fl => fl.x === x && fl.y === y);
    const isValidMove = validMoves.some(vm => vm.x === x && vm.y === y) && !players[currentPlayer].crashed;
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
        onClick={() => isValidMove && onMove(position)}
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
          position: "relative"
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
    </div>
  );
}
