
import { useState } from "react";
import { Player, Position, Track, GameMode, PlayerColor } from "@/types/game";
import { tracks } from "@/lib/tracks";
import { toast } from "@/components/ui/sonner";
import {
  getValidMoves,
  checkSlipstream,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  checkCrash,
  getNewDirection,
  calculateNewSpeed,
} from "@/lib/game-utils";

type PlayerWithHistory = Player & {
  moveHistory?: Position[];
};

export function useGameState() {
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

  return {
    gameStarted,
    setGameStarted,
    trackType,
    setTrackType,
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
  };
}
