
import { Position, Direction } from "@/types/game";

// Helper to generate all positions across a certain X between min/max Y (inclusive)
function verticalLine(x: number, yStart: number, yEnd: number): Position[] {
  const line: Position[] = [];
  for (let y = yStart; y <= yEnd; y++) {
    line.push({ x, y });
  }
  return line;
}
function horizontalLine(y: number, xStart: number, xEnd: number): Position[] {
  const line: Position[] = [];
  for (let x = xStart; x <= xEnd; x++) {
    line.push({ x, y });
  }
  return line;
}

// Generate the track tiles for a 20x20 board with a 4-tile wide oval track
function generateOvalTrackTiles() {
  const trackTiles: Position[] = [];
  const size = 20;
  const trackWidth = 4;
  const padding = 1;

  // Top/bottom straights
  for (let x = padding; x < size - padding; x++) {
    for (let y = padding; y < padding + trackWidth; y++) trackTiles.push({ x, y });
    for (let y = size - padding - trackWidth; y < size - padding; y++) trackTiles.push({ x, y });
  }
  // Left/right straights
  for (let y = padding; y < size - padding; y++) {
    for (let x = padding; x < padding + trackWidth; x++) trackTiles.push({ x, y });
    for (let x = size - padding - trackWidth; x < size - padding; x++) trackTiles.push({ x, y });
  }
  return trackTiles;
}

const ovalTrackTiles = generateOvalTrackTiles();

// --- Track setup constants ---
const size = 20;
const trackWidth = 4;
const padding = 1;

// For the vertical track, "inside" edge is at padding and "outside" edge is size - padding - 1
const minY = padding;
const maxY = size - padding - 1;
const minX = padding;
const maxX = size - padding - 1;

// Finish line: vertical line at x=10, y=1..4 (4 tiles wide, matching track width)
function getFinishLine(): Position[] {
  const finishLineX = 10;
  return verticalLine(finishLineX, padding, padding + trackWidth - 1); // y=1..4
}

// --- Checkpoint A: vertical line from (14,15) to (14,18) ---
// --- Checkpoint B: horizontal line from (1,11) to (4,11) ---
const checkpointA = verticalLine(14, 15, 18);
const checkpointB = horizontalLine(11, 1, 4);

// For unit checkpoint lines
const ovalCheckpoints = [
  checkpointA,
  checkpointB,
];

const finishLineOval = getFinishLine();

// Set starting positions ON the finish line tiles, facing south
const ovalStartPositions = finishLineOval.map(pos => ({
  position: { ...pos },
  direction: "S" as Direction,
}));

export const tracks = {
  oval: {
    size: 20,
    checkpoints: ovalCheckpoints, // Array of unit checkpoint lines
    finishLine: finishLineOval,
    startPositions: ovalStartPositions,
    trackTiles: ovalTrackTiles,
  },

  figure8: {
    size: 12,
    checkpoints: [
      // Placeholders for unit-style checkpoint lines (could be refactored further if needed)
      [{ x: 3, y: 3 }],
      [{ x: 9, y: 3 }],
      [{ x: 9, y: 9 }],
      [{ x: 3, y: 9 }],
    ],
    finishLine: [
      { x: 6, y: 1 },
      { x: 5, y: 1 },
    ],
    startPositions: [
      { position: { x: 7, y: 1 }, direction: "W" as Direction },
      { position: { x: 7, y: 2 }, direction: "W" as Direction },
      { position: { x: 8, y: 1 }, direction: "W" as Direction },
      { position: { x: 8, y: 2 }, direction: "W" as Direction },
    ],
    trackTiles: [],
  },
};
