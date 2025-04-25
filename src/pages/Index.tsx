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
  checkCrash,
  getRandomDirection
} from "@/lib/game-utils";

const playerColors = ["red", "blue", "yellow", "green"] as const;

type PlayerWithHistory = Player & {
  moveHistory?: Position[];
};

const Index = () => {
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

  useEffect(() => {
    if (!gameStarted) return;
    
    const player = players[currentPlayer];
    if (!player.crashed) {
      const { crashed, didSpin } = checkCrash(
        player, 
        track.trackTiles, 
        players, 
        track.size
      );
      
      if (crashed || didSpin) {
        setPlayers(prevPlayers => {
          const updatedPlayers = [...prevPlayers];
          const updatedPlayer = { ...updatedPlayers[currentPlayer] };
          
          if (crashed) {
            updatedPlayer.crashed = true;
            updatedPlayer.speed = 0;
            toast(`Player ${updatedPlayer.id} crashed!`, {
              description: "Out of the race",
              duration: 3000
            });
          } else if (didSpin) {
            updatedPlayer.speed = 0;
            updatedPlayer.direction = getRandomDirection();
            toast(`Player ${updatedPlayer.id} spun out!`, {
              description: "Speed reset to 0",
              duration: 2000
            });
          }
          
          updatedPlayers[currentPlayer] = updatedPlayer;
          return updatedPlayers;
        });
      }
    }
    
    const moves = getValidMoves(player, track.size, players);
    setValidMoves(moves);
  }, [currentPlayer, players, track.size, track.trackTiles, gameStarted]);

  useEffect(() => {
    if (gameStarted && players[currentPlayer].crashed) {
      const timer = setTimeout(() => {
        handleSkipTurn();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, players, gameStarted]);

  const handleMove = (position: Position) => {
    if (gameMode === "programming") {
      setProgrammedMoves({
        ...programmedMoves,
        [currentPlayer]: position
      });
      
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) {
        executeAllMoves();
      } else {
        setCurrentPlayer(nextPlayer);
      }
    } else {
      executeMove(currentPlayer, position);
      
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) {
        setCurrentRound(currentRound + 1);
      }
      setCurrentPlayer(nextPlayer);
    }
  };

  const executeMove = (playerIndex: number, newPosition: Position) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      const player = { ...updatedPlayers[playerIndex] };
      const lastPosition = { ...player.position };

      const newDirection = getNewDirection(player.position, newPosition);
      const newSpeed = calculateNewSpeed(player.position, newPosition);

      const moveHistory = player.moveHistory || [];
      moveHistory.push({ ...player.position });
      player.moveHistory = moveHistory.slice(-5);

      player.position = newPosition;
      player.direction = newDirection;
      player.speed = newSpeed;

      const otherPlayers = prevPlayers.filter((_, i) => i !== playerIndex);
      const hasSlipstream = checkSlipstream(player, otherPlayers, newPosition);
      if (hasSlipstream) {
        player.speed += 1;
        toast("Slipstream boost!", {
          description: `Player ${player.id} gets +1 speed`,
          duration: 2000
        });
      }

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

      updatedPlayers[playerIndex] = player;
      return updatedPlayers;
    });
  };

  const executeAllMoves = () => {
    for (let i = 0; i < playerCount; i++) {
      if (programmedMoves[i]) {
        executeMove(i, programmedMoves[i]);
      }
    }
    setProgrammedMoves({});
    setCurrentRound(currentRound + 1);
  };

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
