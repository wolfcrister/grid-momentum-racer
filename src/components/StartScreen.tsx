
import React from "react";
import { Button } from "@/components/ui/button";
import { tracks } from "@/lib/tracks";
import { GameMode } from "@/types/game";

interface Props {
  playerCount: number;
  setPlayerCount: (count: number) => void;
  trackType: keyof typeof tracks;
  setTrackType: (type: keyof typeof tracks) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  setGameStarted: (start: boolean) => void;
}

export function StartScreen({
  playerCount, setPlayerCount,
  trackType, setTrackType,
  gameMode, setGameMode,
  setGameStarted,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tighter mb-4 text-primary">
            GRID RACER
          </h1>
          <p className="text-xl text-muted-foreground">
            Chess meets Formula 1 — on a tactical battlefield of momentum and precision.
          </p>
        </div>
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg border border-border">
          <div>
            <label className="text-lg font-medium mb-2 block">Number of Players</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(num => (
                <Button
                  key={num}
                  variant={playerCount === num ? "default" : "outline"}
                  onClick={() => setPlayerCount(num)}
                >
                  {num} Players
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-lg font-medium mb-2 block">Track Layout</label>
            <div className="flex gap-2">
              {Object.keys(tracks).map(type => (
                <Button
                  key={type}
                  variant={trackType === type ? "default" : "outline"}
                  onClick={() => setTrackType(type as keyof typeof tracks)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-lg font-medium mb-2 block">Game Mode</label>
            <div className="flex gap-2">
              {["turn-based", "programming"].map(mode => (
                <Button
                  key={mode}
                  variant={gameMode === mode ? "default" : "outline"}
                  onClick={() => setGameMode(mode as GameMode)}
                >
                  {mode === "turn-based" ? "Turn Based" : "Programming"}
                </Button>
              ))}
            </div>
          </div>
          <Button
            size="lg"
            className="w-full mt-6"
            onClick={() => setGameStarted(true)}
          >
            Start Race
          </Button>
        </div>
        <div className="mt-8 p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-bold mb-4">How to Play</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <strong>Momentum is key:</strong> Your previous move determines your options</li>
            <li>• <strong>Choose wisely:</strong> Select from valid move options (highlighted)</li>
            <li>• <strong>Hit checkpoints:</strong> Pass all checkpoints before finishing</li>
            <li>• <strong>Use slipstream:</strong> Follow closely behind opponents for speed boosts</li>
            <li>• <strong>Reach the finish:</strong> Cross the checkered line after all checkpoints</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
