
import React from "react";
import { Position, Player } from "@/types/game";

export interface MoveLogEntry {
  playerId: number;
  playerColor: string;
  from: Position;
  to: Position;
  round: number;
  speedChange: number;
}

interface MoveLogProps {
  moves: MoveLogEntry[];
  maxEntries?: number;
}

export function MoveLog({ moves, maxEntries = 10 }: MoveLogProps) {
  // Get the most recent moves first, limited by maxEntries
  const recentMoves = [...moves].reverse().slice(0, maxEntries);
  
  return (
    <div className="p-4 bg-card rounded-lg shadow-lg border border-border max-h-[300px] overflow-y-auto">
      <h3 className="font-bold mb-2">Move Log</h3>
      
      {recentMoves.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">No moves yet</div>
      ) : (
        <div className="space-y-1">
          {recentMoves.map((move, index) => {
            const speedChangeText = move.speedChange > 0 
              ? `+${move.speedChange}` 
              : move.speedChange < 0 
                ? `${move.speedChange}` 
                : "±0";
                
            return (
              <div key={index} className="text-sm flex items-center gap-1">
                <span className="font-mono text-xs bg-muted px-1">R{move.round}</span>
                <div 
                  className={`w-3 h-3 rounded-full ${
                    move.playerColor === "red" ? "bg-primary" :
                    move.playerColor === "blue" ? "bg-secondary" :
                    move.playerColor === "yellow" ? "bg-accent" :
                    "bg-green-500"
                  }`}
                />
                <span>P{move.playerId}:</span>
                <span className="font-mono">
                  ({move.from.x},{move.from.y})→({move.to.x},{move.to.y})
                </span>
                <span 
                  className={`font-mono ml-auto ${
                    move.speedChange > 0 ? "text-green-500" :
                    move.speedChange < 0 ? "text-red-500" :
                    "text-muted-foreground"
                  }`}
                >
                  {speedChangeText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
