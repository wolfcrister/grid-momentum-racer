
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

// --- Top straight Y and X ranges ---
const size = 20;
const trackWidth = 4;
const padding = 1;
const topStraightY = padding; // y=1
const xMin = padding;         // x=1
const xMax = size - padding - 1; // x=18

// Create finish line as a horizontal strip spanning the top straight road tiles
function getFinishLineOnTopStraight(): Position[] {
  // For the finish line, use the center two rows of the top straight if trackWidth=4, e.g., y=2,3 (middle of 1,2,3,4)
  const finishLineRows = trackWidth % 2 === 0
    ? [topStraightY + 1, topStraightY + 2] // y=2,3 if trackWidth=4
    : [topStraightY + Math.floor(trackWidth / 2)];
  // The finish should run fully across the top road from xMin to xMax (the road, not the curbs/walls)
  let positions: Position[] = [];
  for (const y of finishLineRows) {
    positions = positions.concat(horizontalLine(y, xMin, xMax));
  }
  // Only include those tiles which are actually track tiles (i.e., for edge safety)
  return positions.filter(tile => ovalTrackTiles.some(tt => tt.x === tile.x && tt.y === tile.y));
}

const finishLineOval = getFinishLineOnTopStraight();

// Set starting positions on the top straight, just behind or on the finish line
// We'll start at xMin+1, moving rightwards for 4 players (spaced out)
const numberOfStartingPositions = 4;
const startingY = topStraightY + trackWidth - 1; // e.g., y=4 (bottom of top straight)
const startingXs = [xMin + 2, xMin + 4, xMin + 6, xMin + 8]; // e.g. [3,5,7,9]
const ovalStartPositions = Array(numberOfStartingPositions)
  .fill(0)
  .map((_, i) => ({
    position: { x: startingXs[i], y: startingY },
    direction: "E" as Direction
  }));

// Updated checkpoint positions based on the image
// Use specific positions matching the blue tiles in the image
const ovalCheckpoints = [
  // Left side checkpoint (corner)
  { x: 4, y: 10 },
  
  // Bottom checkpoint
  { x: 10, y: 16 }, 
  
  // Right side checkpoint
  { x: 16, y: 10 },
  
  // Start/Finish line (just one position to represent)
  { x: 10, y: 2 }
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
