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
function generateOvalTrackTiles(): Position[] {
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

// ENHANCED: The finish line will "cross" the track using the vertical (X=4 and X=5), but only where those tiles are part of the TRACK (so a true stripe across, not just the inside/outside line)
// It runs the *full width of the track* (i.e., across all track Y for X=4 and X=5)
function getFinishLineStripe(trackTiles: Position[], xVals: number[]): Position[] {
  return trackTiles.filter(p => xVals.includes(p.x));
}
const finishLineOval = getFinishLineStripe(ovalTrackTiles, [4, 5]);

export const tracks = {
  oval: {
    size: 20,
    checkpoints: [
      { x: 5, y: 1 },   // Top
      { x: 18, y: 10 }, // Right
      { x: 10, y: 18 }, // Bottom
      { x: 1, y: 10 },  // Left
    ],
    finishLine: finishLineOval,
    startPositions: [
      { position: { x: 2, y: 5 }, direction: "E" as Direction },
      { position: { x: 2, y: 6 }, direction: "E" as Direction },
      { position: { x: 2, y: 7 }, direction: "E" as Direction },
      { position: { x: 2, y: 8 }, direction: "E" as Direction },
    ],
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
