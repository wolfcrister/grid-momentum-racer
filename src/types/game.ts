
export type Track = {
  size: number;
  checkpoints: Position[];
  finishLine: Position[];
  startPositions: Array<{
    position: Position;
    direction: Direction;
  }>;
  trackTiles: Position[]; // Add this line
};
