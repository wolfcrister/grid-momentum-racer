
import React from "react";
import { GameBoard } from "@/components/GameBoard";
import { GameControls } from "@/components/GameControls";
import { GameStatus } from "@/components/GameStatus";
import { MoveLog } from "@/components/MoveLog";
import { Button } from "@/components/ui/button";
import { tracks } from "@/lib/tracks";
import { StartScreen } from "@/components/StartScreen";
import { useGameEngine } from "@/hooks/useGameEngine";

const Index = () => {
  const {
    trackType, setTrackType,
    gameStarted, setGameStarted,
    playerCount, setPlayerCount,
    track, players,
    currentPlayer,
    currentRound,
    winner,
    validMoves,
    gameMode, setGameMode,
    handleMove,
    handleReset,
    moveLog,
    handleSkipTurn,
  } = useGameEngine();

  if (!gameStarted) {
    return (
      <StartScreen
        playerCount={playerCount}
        setPlayerCount={setPlayerCount}
        trackType={trackType}
        setTrackType={setTrackType}
        gameMode={gameMode}
        setGameMode={setGameMode}
        setGameStarted={setGameStarted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-primary text-center">GRID RACER</h1>
        </header>
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <GameControls
              currentPlayer={players[currentPlayer]}
              gameMode={gameMode}
              onModeChange={setGameMode}
              onReset={handleReset}
              canReset={true}
              onSkipTurn={handleSkipTurn}
              canSkipTurn={true}
            />
            <GameBoard
              size={track.size}
              players={players}
              currentPlayer={currentPlayer}
              onMove={handleMove}
              validMoves={validMoves}
              checkpoints={track.checkpoints}
              finishLine={track.finishLine}
            />
            <MoveLog moves={moveLog} maxEntries={20} />
          </div>
          <aside>
            <GameStatus
              players={players}
              currentRound={currentRound}
              winner={winner}
            />
            {winner && (
              <div className="mt-4 p-4 bg-accent text-accent-foreground rounded-lg text-center animate-pulse">
                <h3 className="text-xl font-bold mb-2">Player {winner.id} Wins!</h3>
                <Button onClick={handleReset} variant="secondary" className="mt-2">
                  Play Again
                </Button>
              </div>
            )}
            <div className="mt-4 p-4 bg-card rounded-lg border border-border">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
