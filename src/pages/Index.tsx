
import React, { useState, useEffect } from "react";
import { Player, Position, Track, GameMode, Direction, PlayerColor } from "@/types/game";
import { GameSetup } from "@/components/game/GameSetup";
import { GameLayout } from "@/components/game/GameLayout";
import { tracks } from "@/lib/tracks";
import { toast } from "@/components/ui/sonner";
import {
  getValidMoves,
  getNewDirection,
  calculateNewSpeed,
  checkSlipstream,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  getReverseDirection,
  checkCrash
} from "@/lib/game-utils";

const playerColors = ["red", "blue", "yellow", "green"] as const;

// Update Player type to include moveHistory
type PlayerWithHistory = Player & {
  moveHistory?: Position[];
};

const Index = () => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [trackType, setTrackType] = useState<keyof typeof tracks>("oval");
  const [track, setTrack] = useState<Track>(tracks[trackType]);
  const [players, setPlayers] = useState<PlayerWithHistory[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("turn-based");
  const [programmedMoves, setProgrammedMoves] = useState<Record<number, Position>>({});
  const [playerCount, setPlayerCount] = useState(2);

  // Initialize game
  const initializeGame = ({ trackType, playerCount, gameMode }: {
    trackType: keyof typeof tracks;
    playerCount: number;
    gameMode: GameMode;
  }) => {
    const newTrack = tracks[trackType];
    setTrack(newTrack);
    setTrackType(trackType);
    setPlayerCount(playerCount);
    setGameMode(gameMode);

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
        checkpointsPassed: new Set(),
        totalCheckpoints: newTrack.checkpoints.length,
        isFinished: false,
        crashed: false
      });
    }

    setPlayers(initialPlayers);
    setCurrentPlayer(0);
    setWinner(null);
    setCurrentRound(1);
    setGameStarted(true);
  };

  // Calculate valid moves when current player changes
  useEffect(() => {
    if (!gameStarted) return;
    
    const player = players[currentPlayer];
    const moves = getValidMoves(player, track.size, players);
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
      const lastPosition = { ...player.position };

      // Calculate new direction and speed
      const newDirection = getNewDirection(player.position, newPosition);
      
      // Calculate new speed based on the distance moved
      const newSpeed = calculateNewSpeed(player.position, newPosition);

      // Track move history
      const moveHistory = player.moveHistory || [];
      moveHistory.push({ ...player.position });
      player.moveHistory = moveHistory.slice(-5); // Keep last 5 moves

      // Check for crash or spin out
      const { crashed, didSpin } = checkCrash(
        player,
        newPosition,
        track.trackTiles,
        prevPlayers,
        track.size
      );

      if (crashed) {
        player.crashed = true;
        player.speed = 0;
        toast("Player " + player.id + " crashed!", {
          description: "Out of the race",
          duration: 3000
        });
      } else if (didSpin) {
        player.speed = 0;
        player.direction = getReverseDirection(newDirection);
        player.crashed = false;
        toast("Player " + player.id + " spun out!", {
          description: "Speed reset to 0",
          duration: 2000
        });
      } else {
        // Check for slipstream
        const otherPlayers = prevPlayers.filter((_, i) => i !== playerIndex);
        const hasSlipstream = checkSlipstream(player, otherPlayers, newPosition);
        const speedBonus = hasSlipstream ? 1 : 0;

        player.position = newPosition;
        player.direction = newDirection;
        player.speed = newSpeed + speedBonus;
        player.crashed = false;

        // Check checkpoints and finish line
        const cpIndex = checkCheckpointCrossed(lastPosition, newPosition, track.checkpoints);
        if (cpIndex !== null && !player.checkpointsPassed.has(cpIndex)) {
          const newPassed = new Set(player.checkpointsPassed);
          newPassed.add(cpIndex);
          player.checkpointsPassed = newPassed;
          
          toast("Checkpoint passed!", {
            description: `Player ${player.id}: ${player.checkpointsPassed.size}/${player.totalCheckpoints}`,
            duration: 2000
          });
        }

        if (
          player.checkpointsPassed.size === player.totalCheckpoints &&
          checkFinishLineCrossed(lastPosition, newPosition, track.finishLine)
        ) {
          player.isFinished = true;
          setWinner(player);
          
          toast("Winner!", {
            description: `Player ${player.id} has won the race!`,
            duration: 5000
          });
        }
      }

      updatedPlayers[playerIndex] = player;
      return updatedPlayers;
    });
  };

  // Execute all programmed moves
  const executeAllMoves = () => {
    for (let i = 0; i < playerCount; i++) {
      if (programmedMoves[i]) {
        executeMove(i, programmedMoves[i]);
      }
    }
    setProgrammedMoves({});
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

  if (!gameStarted) {
    return <GameSetup onStartGame={initializeGame} />;
  }

  return (
    <GameLayout
      players={players}
      currentPlayer={currentPlayer}
      currentRound={currentRound}
      validMoves={validMoves}
      winner={winner}
      track={track}
      onMove={handleMove}
      onReset={handleReset}
      onSkipTurn={handleSkipTurn}
      gameMode={gameMode}
    />
  );
};

export default Index;
