
import React from "react";
import { GameBoard } from "@/components/GameBoard";
import { GameControls } from "@/components/GameControls";
import { MoveLog, MoveLogEntry } from "@/components/MoveLog";
import { Position, Player } from "@/types/game";
import { tracks } from "@/lib/tracks";

interface GamePlayAreaProps {
  players: Player[];
  currentPlayer: number;
  currentRound: number;
  validMoves: Position[];
  track: typeof tracks.oval;
  onMove: (position: Position) => void;
  onReset: () => void;
  onSkipTurn: () => void;
  gameMode: "turn-based" | "programming";
  moveLog?: MoveLogEntry[];
}

export function GamePlayArea({
  players,
  currentPlayer,
  currentRound,
  validMoves,
  track,
  onMove,
  onReset,
  onSkipTurn,
  gameMode,
  moveLog = []
}: GamePlayAreaProps) {
  return (
    <div className="space-y-6">
      <GameControls
        currentPlayer={players[currentPlayer]}
        gameMode={gameMode}
        onModeChange={() => {}} // This is handled at a higher level
        onReset={onReset}
        canReset={true}
        onSkipTurn={onSkipTurn}
        canSkipTurn={true}
      />
      
      <GameBoard
        size={track.size}
        players={players}
        currentPlayer={currentPlayer}
        onMove={onMove}
        validMoves={validMoves}
        checkpoints={track.checkpoints}
        finishLine={track.finishLine}
      />
      
      <MoveLog 
        moves={moveLog} 
        maxEntries={20} 
      />
    </div>
  );
}
