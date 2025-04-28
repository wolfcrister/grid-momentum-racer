
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { GridTile } from "./GridTile";
import { Car } from "./Car";
import { Position, Direction, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";
import { getLastDelta } from "@/lib/game-utils";
import { GAME_CONFIG } from "@/lib/game-config";
import { ZoomIn, ZoomOut } from "lucide-react";

interface GameBoardProps {
  size: { width: number; height: number };
  players: Player[];
  currentPlayer: number;
  onMove: (position: Position) => void;
  validMoves: Position[];
  checkpoints: Position[][];
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
  const [scale, setScale] = useState(1);

  const getMomentumPosition = () => {
    const player = players[currentPlayer];
    if (player.crashed || player.speed === 0) return null;

    const [dx, dy] = getLastDelta(player);
    
    const momentumPos = {
      x: player.position.x + dx,
      y: player.position.y + dy
    };
    
    if (momentumPos.x >= 0 && momentumPos.x < size.width && 
        momentumPos.y >= 0 && momentumPos.y < size.height) {
      return momentumPos;
    }
    
    return null;
  };

  const momentumPosition = getMomentumPosition();

  const isTileInCheckpoints = (x: number, y: number): boolean => {
    return checkpoints.some(checkpointLine => 
      checkpointLine.some(pos => pos.x === x && pos.y === y)
    );
  };

  const renderTile = (x: number, y: number) => {
    const position: Position = { x, y };
    const isCheckpoint = isTileInCheckpoints(x, y);
    const isFinish = finishLine.some(fl => fl.x === x && fl.y === y);
    const isValidMove = validMoves.some(vm => vm.x === x && vm.y === y) && !players[currentPlayer].crashed;
    const isTrackTile = tracks.oval.trackTiles.some(tt => tt.x === x && tt.y === y);
    
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

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.25, 2));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="flex justify-end mb-2 space-x-2">
        <button 
          onClick={handleZoomOut} 
          className="p-1 bg-muted hover:bg-muted-foreground/20 rounded"
          disabled={scale <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button 
          onClick={handleZoomIn} 
          className="p-1 bg-muted hover:bg-muted-foreground/20 rounded"
          disabled={scale >= 2}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-auto max-h-[75vh] border border-accent/30 rounded-lg">
        <div
          className={cn(
            "grid gap-0.5 bg-muted p-0.5 rounded-lg",
            "shadow-2xl border-2 border-accent/50"
          )}
          style={{
            gridTemplateColumns: `repeat(${size.width}, 1fr)`,
            aspectRatio: `${size.width}/${size.height}`,
            position: "relative",
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease',
            width: `${100 / scale}%`,
            margin: '0 auto'
          }}
        >
          {Array.from({ length: size.width * size.height }).map((_, index) => {
            const x = index % size.width;
            const y = Math.floor(index / size.width);
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
    </div>
  );
}
