
import React from 'react';
import { Player } from '@/types/game';

interface GameStatusProps {
  players: Player[];
  currentRound: number;
  winner: Player | null;
}

export function GameStatus({ players, currentRound, winner }: GameStatusProps) {
  return (
    <div className="bg-card p-4 rounded-lg shadow-md border border-border">
      <h3 className="font-bold mb-3">Game Status</h3>
      
      <div className="text-sm mb-2">
        <span className="text-muted-foreground">Round: </span>
        <span className="font-medium">{currentRound}</span>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Players</h4>
        
        {players.map((player) => {
          // Display checkpoints as count from set
          const checkpointCount = player.checkpointsPassed.size;
          
          return (
            <div 
              key={player.id} 
              className={`p-2 rounded flex items-center justify-between ${
                player.crashed 
                  ? "bg-muted/50 text-muted-foreground" 
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    player.color === "red" ? "bg-primary" :
                    player.color === "blue" ? "bg-secondary" :
                    player.color === "yellow" ? "bg-accent" :
                    "bg-green-500"
                  }`}
                />
                <span className={player.crashed ? "line-through" : ""}>
                  Player {player.id}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground mr-1">Speed:</span>
                <span className="font-mono">{player.speed}</span>
                <span className="mx-1">|</span>
                <span className="text-muted-foreground mr-1">CP:</span>
                <span className="font-mono">{checkpointCount}/{player.totalCheckpoints}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
