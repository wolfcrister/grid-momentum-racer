
import React from "react";
import { cn } from "@/lib/utils";
import { GridTile } from "./GridTile";
import { Car } from "./Car";
import { Position, Direction, Player } from "@/types/game";
import { MoveRight } from "lucide-react";

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
  const renderTile = (x: number, y: number) => {
    const position: Position = { x, y };
    const isCheckpoint = checkpoints.some(cp => cp.x === x && cp.y === y);
    const isFinish = finishLine.some(fl => fl.x === x && fl.y === y);
    const isValidMove = validMoves.some(vm => vm.x === x && vm.y === y);
    
    // Calculate if this is the momentum position (where car would go if continuing same direction/speed)
    const player = players[currentPlayer];
    const isMomentumPosition = player.speed > 0 && 
      validMoves.length > 0 &&
      isValidMove &&
      Math.abs(x - player.position.x) === Math.abs(player.direction === "E" || player.direction === "W" ? player.speed : 0) &&
      Math.abs(y - player.position.y) === Math.abs(player.direction === "N" || player.direction === "S" ? player.speed : 0);
    
    const tileType = isFinish ? "finish" : isCheckpoint ? "checkpoint" : "track";
    
    return (
      <GridTile 
        key={`${x}-${y}`}
        position={position}
        type={tileType}
        isValidMove={isValidMove}
        isMomentumPosition={isMomentumPosition}
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
          position: "relative" // Add relative positioning to container
        }}
      >
        {Array.from({ length: size * size }).map((_, index) => {
          const x = index % size;
          const y = Math.floor(index / size);
          return renderTile(x, y);
        })}

        {/* Player cars with updated positioning */}
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
