
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
  checkpoints: number;
  totalCheckpoints: number;
  isFinished: boolean;
  crashed: boolean;
};

export type GameMode = "turn-based" | "programming";

export type Track = {
  size: number;
  checkpoints: Position[];
  finishLine: Position[];
  startPositions: Array<{
    position: Position;
    direction: Direction;
  }>;
  trackTiles: Position[];
};
