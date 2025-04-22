
import { Position, Direction } from "@/types/game";

// Helper to generate all positions across a certain X between min/max Y (inclusive)
function verticalLine(x: number, yStart: number, yEnd: number): Position[] {
  const line: Position[] = [];
  for (let y = yStart; y <= yEnd; y++) {
    line.push({ x, y });
  }
  return line;
}

// Helper to generate all positions across a certain Y between min/max X (inclusive)
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

// Finish line: vertical line at x=10, y=1..4 (4 tiles wide, matching track width)
function getFinishLine(): Position[] {
  const finishLineX = 10;
  return verticalLine(finishLineX, padding, padding + trackWidth - 1); // y=1..4
}

// F1-style "sector" checkpoints, spaced roughly ~1/3 around the oval away from each other
// We'll use:
// - Checkpoint A: right straight (x=maxX, y=1..4) (quarter forward from finish)
// - Checkpoint B: bottom straight (y=maxY, x=any on track) (half-lap from finish)
// - Checkpoint C: left straight (x=minX, y=1..4 or 16..19) (3/4 lap from finish)

// For the vertical track, "inside" edge is at padding and "outside" edge is size - padding - 1
const minY = padding;
const maxY = size - padding - 1;
const minX = padding;
const maxX = size - padding - 1;

// Checkpoint A (right straight, vertical line, just past the top right curve)
const checkpointAX = maxX - Math.floor(trackWidth / 2); // keeps inside track
const checkpointA = verticalLine(checkpointAX, minY, minY + trackWidth - 1); // y=1..4

// Checkpoint B (bottom straight, horizontal line in the lower center)
const checkpointBY = maxY - Math.floor(trackWidth / 2); // y=16
const checkpointB = horizontalLine(checkpointBY, minX, maxX); // full straight

// Checkpoint C (left straight, vertical line, just past bottom left curve)
const checkpointCX = minX + Math.floor(trackWidth / 2); // x=3 for 4-tile track
const checkpointC = verticalLine(checkpointCX, minY, minY + trackWidth - 1); // y=1..4

// Checkpoints array in lap order (A, B, C)
const ovalCheckpoints = [
  ...checkpointA,
  ...checkpointB,
  ...checkpointC,
];

// Finish line
const finishLineOval = getFinishLine();

// Set starting positions on the top straight, just behind the finish line
const numberOfStartingPositions = 4;
const startingY = padding + trackWidth - 1; // y=4
const startingXs = [padding + 1, padding + 2, padding + 3, padding + 4];
const ovalStartPositions = Array(numberOfStartingPositions)
  .fill(0)
  .map((_, i) => ({
    position: { x: startingXs[i], y: startingY },
    direction: "E" as Direction
  }));

export const tracks = {
  oval: {
    size: 20,
    checkpoints: ovalCheckpoints, // the 3 sector lines
    finishLine: finishLineOval,
    startPositions: ovalStartPositions,
    trackTiles: ovalTrackTiles,
    // For bonus future functionality, we might separately export
    // checkpointA, checkpointB, checkpointC, but for now omit from object
  },

  figure8: {
    size: 12,
    checkpoints: [
      { x: 3, y: 3 },
      { x: 9, y: 3 },
      { x: 9, y: 9 },
      { x: 3, y: 9 },
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
    trackTiles: [], // TODO: implement for figure8 if needed!
  },
};

