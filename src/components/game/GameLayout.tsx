import React from "react";
import { GameHeader } from "./GameHeader";
import { GamePlayArea } from "./GamePlayArea";
import { GameSidebar } from "./GameSidebar";
import { Position, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";

interface GameLayoutProps {
  players: Player[];
  currentPlayer: number;
  currentRound: number;
  validMoves: Position[];
  winner: Player | null;
  track: typeof tracks.oval;
  onMove: (position: Position) => void;
  onReset: () => void;
  onSkipTurn: () => void;
  gameMode: "turn-based" | "programming";
  moveLog?: MoveLogEntry[];
}

export function GameLayout({
  players,
  currentPlayer,
  currentRound,
  validMoves,
  winner,
  track,
  onMove,
  onReset,
  onSkipTurn,
  gameMode,
  moveLog = []
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        <GameHeader />
        
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <GamePlayArea
            players={players}
            currentPlayer={currentPlayer}
            currentRound={currentRound}
            validMoves={validMoves}
            track={track}
            onMove={onMove}
            onReset={onReset}
            onSkipTurn={onSkipTurn}
            gameMode={gameMode}
            moveLog={moveLog}
          />
          
          <GameSidebar
            players={players}
            currentRound={currentRound}
            winner={winner}
            onReset={onReset}
            gameMode={gameMode}
          />
        </div>
      </div>
    </div>
  );
}
