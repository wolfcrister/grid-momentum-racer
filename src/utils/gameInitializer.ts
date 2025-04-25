
import { Player, GameMode, PlayerColor } from "@/types/game";
import { tracks } from "@/lib/tracks";

const playerColors = ["red", "blue", "yellow", "green"] as const;

export function initializeGame({ 
  trackType, 
  playerCount, 
  gameMode 
}: {
  trackType: keyof typeof tracks;
  playerCount: number;
  gameMode: GameMode;
}) {
  const newTrack = tracks[trackType];
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

  return {
    track: newTrack,
    players: initialPlayers,
    gameMode
  };
}
