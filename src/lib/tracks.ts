
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

// Generate a simple figure-8 track on a 12x12 grid
function generateFigure8TrackTiles() {
  const trackTiles: Position[] = [];
  const size = 12;
  
  // Horizontal parts
  for (let x = 1; x < size - 1; x++) {
    // Top row
    trackTiles.push({ x, y: 1 });
    trackTiles.push({ x, y: 2 });
    
    // Middle rows
    if (x !== 5 && x !== 6) {
      trackTiles.push({ x, y: 5 });
      trackTiles.push({ x, y: 6 });
    }
    
    // Bottom row
    trackTiles.push({ x, y: 9 });
    trackTiles.push({ x, y: 10 });
  }
  
  // Vertical parts
  for (let y = 1; y < size - 1; y++) {
    // Left column
    if (y !== 5 && y !== 6) {
      trackTiles.push({ x: 1, y });
      trackTiles.push({ x: 2, y });
    }
    
    // Middle column (except where horizontal bars pass)
    if (y !== 1 && y !== 2 && y !== 5 && y !== 6 && y !== 9 && y !== 10) {
      trackTiles.push({ x: 5, y });
      trackTiles.push({ x: 6, y });
    }
    
    // Right column
    if (y !== 5 && y !== 6) {
      trackTiles.push({ x: 9, y });
      trackTiles.push({ x: 10, y });
    }
  }
  
  return trackTiles;
}

const ovalTrackTiles = generateOvalTrackTiles();
const figure8TrackTiles = generateFigure8TrackTiles();

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
      // Checkpoints for figure8 track
      verticalLine(9, 3, 5),
      verticalLine(2, 7, 9),
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
    trackTiles: figure8TrackTiles,
  },
};
