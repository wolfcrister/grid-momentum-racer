
import React from "react";
import { Button } from "@/components/ui/button";
import { GameStatus } from "@/components/GameStatus";
import { Player } from "@/types/game";

interface GameSidebarProps {
  players: Player[];
  currentRound: number;
  winner: Player | null;
  onReset: () => void;
  gameMode: "turn-based" | "programming";
}

export function GameSidebar({ 
  players, 
  currentRound, 
  winner, 
  onReset,
  gameMode 
}: GameSidebarProps) {
  return (
    <aside>
      <GameStatus
        players={players}
        currentRound={currentRound}
        winner={winner}
      />
      
      {winner && (
        <div className="mt-4 p-4 bg-accent text-accent-foreground rounded-lg text-center animate-pulse">
          <h3 className="text-xl font-bold mb-2">Player {winner.id} Wins!</h3>
          <Button onClick={onReset} variant="secondary" className="mt-2">
            Play Again
          </Button>
        </div>
      )}
      
      <div className="mt-4 p-6 bg-card rounded-lg border border-border">
        <h3 className="font-bold mb-2">Game Tips</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Plan your trajectory several moves ahead</li>
          <li>• Higher speed makes tight turns more difficult</li>
          <li>• Use slipstream for a speed boost</li>
          <li>• Visit all checkpoints in any order</li>
          {gameMode === "programming" && (
            <li>• In programming mode, all moves execute simultaneously</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
