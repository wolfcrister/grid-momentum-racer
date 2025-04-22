
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

// Create finish line as a horizontal line across the top straight
function getFinishLine(): Position[] {
  // Create a finish line that spans from the left edge to the right edge of the top straight
  const finishLineY = padding + Math.floor(trackWidth / 2); // Middle of the top straight
  return horizontalLine(finishLineY, padding, size - padding - 1);
}

// Get the finish line positions
const finishLineOval = getFinishLine();

// Set starting positions on the top straight, just behind the finish line
const numberOfStartingPositions = 4;
const startingY = padding + trackWidth - 1; // Bottom row of top straight
const startingXs = [padding + 1, padding + 2, padding + 3, padding + 4]; // Spaced positions
const ovalStartPositions = Array(numberOfStartingPositions)
  .fill(0)
  .map((_, i) => ({
    position: { x: startingXs[i], y: startingY },
    direction: "E" as Direction
  }));

// Create checkpoint positions as lines crossing each straight section
const ovalCheckpoints = [
  // Right straight - vertical line crossing from outer to inner edge
  ...verticalLine(size - padding - Math.floor(trackWidth / 2), padding, size - padding - 1),
  
  // Bottom straight - horizontal line crossing from left to right edge
  ...horizontalLine(size - padding - Math.floor(trackWidth / 2), padding, size - padding - 1),
  
  // Left straight - vertical line crossing from outer to inner edge
  ...verticalLine(padding + Math.floor(trackWidth / 2), padding, size - padding - 1)
];

export const tracks = {
  oval: {
    size: 20,
    checkpoints: ovalCheckpoints,
    finishLine: finishLineOval,
    startPositions: ovalStartPositions,
    trackTiles: ovalTrackTiles,
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

