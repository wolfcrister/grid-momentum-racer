
import React, { useEffect } from "react";
import { Position } from "@/types/game";
import { GameSetup } from "@/components/game/GameSetup";
import { GameLayout } from "@/components/game/GameLayout";
import { useGameState } from "@/hooks/useGameState";
import { initializeGame } from "@/utils/gameInitializer";
import { executeMove } from "@/utils/gameMoveHandler";
import { checkCrash, getValidMoves } from "@/lib/game-utils";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const gameState = useGameState();
  const {
    gameStarted,
    setGameStarted,
    track,
    setTrack,
    players,
    setPlayers,
    currentPlayer,
    setCurrentPlayer,
    currentRound,
    setCurrentRound,
    winner,
    setWinner,
    validMoves,
    setValidMoves,
    gameMode,
    setGameMode,
    programmedMoves,
    setProgrammedMoves,
    playerCount,
    setPlayerCount,
  } = gameState;

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

  const handleInitGame = (config: { trackType: any; playerCount: number; gameMode: any; }) => {
    const { track: newTrack, players: newPlayers, gameMode: newGameMode } = initializeGame(config);
    setTrack(newTrack);
    setPlayers(newPlayers);
    setGameMode(newGameMode);
    setPlayerCount(config.playerCount);
    setGameStarted(true);
    setWinner(null);
  };

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
      const { updatedPlayers, hasWon } = executeMove(currentPlayer, position, players, track);
      setPlayers(updatedPlayers);
      if (hasWon) {
        setWinner(hasWon);
        toast("Winner!", {
          description: `Player ${hasWon.id} has won the race!`,
          duration: 5000
        });
      }
      
      const nextPlayer = (currentPlayer + 1) % playerCount;
      if (nextPlayer === 0) {
        setCurrentRound(currentRound + 1);
      }
      setCurrentPlayer(nextPlayer);
    }
  };

  const executeAllMoves = () => {
    let currentPlayers = [...players];
    let gameWinner = null;
    
    for (let i = 0; i < playerCount; i++) {
      if (programmedMoves[i]) {
        const { updatedPlayers, hasWon } = executeMove(i, programmedMoves[i], currentPlayers, track);
        currentPlayers = updatedPlayers;
        if (hasWon) gameWinner = hasWon;
      }
    }
    
    setPlayers(currentPlayers);
    setProgrammedMoves({});
    setCurrentRound(currentRound + 1);
    
    if (gameWinner) {
      setWinner(gameWinner);
      toast("Winner!", {
        description: `Player ${gameWinner.id} has won the race!`,
        duration: 5000
      });
    }
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

  if (!gameStarted) {
    return <GameSetup onStartGame={handleInitGame} />;
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
      onReset={() => setGameStarted(false)}
      onSkipTurn={handleSkipTurn}
      gameMode={gameMode}
    />
  );
};

export default Index;
