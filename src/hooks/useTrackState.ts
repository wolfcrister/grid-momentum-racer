import { useState } from "react";
import { tracks } from "@/lib/tracks";

export function useTrackState(initialTrackType: keyof typeof tracks = "oval", initialPlayerCount = 2) {
  const [trackType, setTrackType] = useState<keyof typeof tracks>(initialTrackType);
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [track, setTrack] = useState(tracks[trackType]);
  // Keep track in sync with trackType
  const updateTrackType = (type: keyof typeof tracks) => {
    setTrackType(type);
    setTrack(tracks[type]);
  };

  return {
    trackType,
    setTrackType: updateTrackType,
    playerCount,
    setPlayerCount,
    track,
    setTrack,
  };
}
