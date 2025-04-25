
import { Position, Direction } from "@/types/game";
import { GAME_CONFIG } from "./game-config";

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

// Generate the track tiles for a board with a 5-tile wide oval track
function generateOvalTrackTiles() {
  const trackTiles: Position[] = [];
  const width = GAME_CONFIG.grid.size.width;
  const height = GAME_CONFIG.grid.size.height;
  const trackWidth = 5;
  const padding = 1;

  // Top/bottom straights
  for (let x = padding; x < width - padding; x++) {
    for (let y = padding; y < padding + trackWidth; y++) trackTiles.push({ x, y });
    for (let y = height - padding - trackWidth; y < height - padding; y++) trackTiles.push({ x, y });
  }
  // Left/right straights
  for (let y = padding; y < height - padding; y++) {
    for (let x = padding; x < padding + trackWidth; x++) trackTiles.push({ x, y });
    for (let x = width - padding - trackWidth; x < width - padding; x++) trackTiles.push({ x, y });
  }
  return trackTiles;
}

const ovalTrackTiles = generateOvalTrackTiles();

// --- Track setup constants ---
const width = GAME_CONFIG.grid.size.width;
const height = GAME_CONFIG.grid.size.height;
const trackWidth = 5;
const padding = 1;

// For the vertical track sections
const minY = padding;
const maxY = height - padding - 1;
const minX = padding;
const maxX = width - padding - 1;

// Finish line: vertical line at x=15, y=1..5 (5 tiles wide, matching track width)
function getFinishLine(): Position[] {
  const finishLineX = 15;
  return verticalLine(finishLineX, padding, padding + trackWidth - 1);
}

// Checkpoints positioned for the larger track
const checkpointA = verticalLine(30, 15, 19);
const checkpointB = horizontalLine(11, 1, 5);

const ovalCheckpoints = [
  checkpointA,
  checkpointB,
];

const finishLineOval = getFinishLine();

// Set starting positions ON the finish line tiles, facing east
const ovalStartPositions = finishLineOval.map(pos => ({
  position: { ...pos },
  direction: "E" as Direction,
}));

export const tracks = {
  oval: {
    size: {
      width: GAME_CONFIG.grid.size.width,
      height: GAME_CONFIG.grid.size.height
    },
    checkpoints: ovalCheckpoints,
    finishLine: finishLineOval,
    startPositions: ovalStartPositions,
    trackTiles: ovalTrackTiles,
  },

  figure8: {
    size: {
      width: 12,
      height: 12
    },
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
