
export type Position = {
  x: number;
  y: number;
};

export type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type PlayerColor = "red" | "blue" | "yellow" | "green";

export type Player = {
  id: number;
  position: Position;
  direction: Direction;
  speed: number;
  color: PlayerColor;
  // Track checkpoints as a set of line indices for the lap (not per tile)
  checkpointsPassed: Set<number>;
  totalCheckpoints: number;
  isFinished: boolean;
  trackTiles?: Position[]; // Added to store reference to track tiles
};

export type GameMode = "turn-based" | "programming";

export type Track = {
  size: number;
  // Store checkpoints as an array of unit checkpoint lines (each one is an array of tiles)
  checkpoints: Position[][];
  finishLine: Position[];
  startPositions: Array<{
    position: Position;
    direction: Direction;
  }>;
  trackTiles: Position[];
};
