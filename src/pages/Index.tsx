
import React, { useState, useEffect } from "react";
import { GameBoard } from "@/components/GameBoard";
import { GameControls } from "@/components/GameControls";
import { GameStatus } from "@/components/GameStatus";
import { 
  Player, 
  Position, 
  Track, 
  GameMode,
  Direction,
  PlayerColor
} from "@/types/game";
import { 
  getValidMoves, 
  getNewDirection, 
  calculateNewSpeed,
  checkSlipstream,
  checkCheckpoint,
  checkFinishLine,
  tracks
} from "@/lib/game-utils";
import { Button } from "@/components/ui/button";

const playerColors = ["red", "blue", "yellow", "green"] as const;

const Index = () => {
  // Game state
  const [trackType, setTrackType] = useState<keyof typeof tracks>("oval");
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [track, setTrack] = useState<Track>(tracks[trackType]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("turn-based");
  const [programmedMoves, setProgrammedMoves] = useState<Record<number, Position>>({});

  // Initialize game
  useEffect(() => {
    if (gameStarted) return;
    
    const newTrack = tracks[trackType];
    setTrack(newTrack);
    
    // Initialize players at starting positions
    const initialPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      const startPos = newTrack.startPositions[i];
      initialPlayers.push({
        id: i + 1,
        position: { ...startPos.position },
        direction: startPos.direction,
        speed: 0,
        color: playerColors[i] as PlayerColor,
        checkpoints: 0,
        totalCheckpoints: newTrack.checkpoints.length,
        isFinished: false,
        crashed: false  // Add the new crashed property
      });
    }
    
    setPlayers(initialPlayers);
    setCurrentPlayer(0);
    setWinner(null);
    setCurrentRound(1);
  }, [playerCount, trackType, gameStarted]);

  // Calculate valid moves when current player changes
  useEffect(() => {
    if (!gameStarted) return;
    
    const player = players[currentPlayer];
    const moves = getValidMoves(player, track.size);
    setValidMoves(moves);
  }, [currentPlayer, players, track.size, gameStarted]);

  // Handle player movement
  const handleMove = (position: Position) => {
    if (gameMode === "programming") {
      // Store the programmed move
      setProgrammedMoves({
        ...programmedMoves,
        [currentPlayer]: position
      });
      
      // Move to next player
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) {
        // All players have programmed their moves, execute them
        executeAllMoves();
      } else {
        setCurrentPlayer(nextPlayer);
      }
    } else {
      // Turn-based mode: execute move immediately
      executeMove(currentPlayer, position);
      
      // Move to next player
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) {
        setCurrentRound(currentRound + 1);
      }
      setCurrentPlayer(nextPlayer);
    }
  };

  // Execute move for a single player
  const executeMove = (playerIndex: number, newPosition: Position) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      const player = { ...updatedPlayers[playerIndex] };
      
      // Calculate new direction and speed
      const newDirection = getNewDirection(player.position, newPosition);
      const newSpeed = calculateNewSpeed(player, newPosition);
      
      // Check for slipstream
      const otherPlayers = prevPlayers.filter((_, i) => i !== playerIndex);
      const hasSlipstream = checkSlipstream(player, otherPlayers, newPosition);
      
      // Update player position and speed
      player.position = newPosition;
      player.direction = newDirection;
      player.speed = newSpeed + (hasSlipstream ? 1 : 0);
      
      // Check if hit checkpoint
      if (checkCheckpoint(newPosition, track.checkpoints)) {
        if (player.checkpoints < player.totalCheckpoints) {
          player.checkpoints += 1;
        }
      }
      
      // Check if reached finish line
      if (checkFinishLine(newPosition, track.finishLine) && 
          player.checkpoints === player.totalCheckpoints) {
        player.isFinished = true;
        setWinner(player);
      }
      
      updatedPlayers[playerIndex] = player;
      return updatedPlayers;
    });
  };

  // Execute all programmed moves
  const executeAllMoves = () => {
    // Execute in player order
    for (let i = 0; i < playerCount; i++) {
      if (programmedMoves[i]) {
        executeMove(i, programmedMoves[i]);
      }
    }
    
    // Reset programmed moves
    setProgrammedMoves({});
    
    // Next round
    setCurrentRound(currentRound + 1);
  };

  // Skip turn
  const handleSkipTurn = () => {
    if (gameMode === "programming") {
      setProgrammedMoves({
        ...programmedMoves,
        [currentPlayer]: players[currentPlayer].position
      });
    }
    
    const nextPlayer = (currentPlayer + 1) % playerCount;
    if (nextPlayer === 0) {
      if (gameMode === "programming") {
        executeAllMoves();
      } else {
        setCurrentRound(currentRound + 1);
      }
    }
    setCurrentPlayer(nextPlayer);
  };

  // Reset game
  const handleReset = () => {
    setGameStarted(false);
    setProgrammedMoves({});
    setWinner(null);
  };

  // Start screen
  if (!gameStarted) {
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
