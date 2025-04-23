
// Import and re-export from the new movement utils structure
import { 
  getNextPosition,
  getLastDelta,
  getNewDirection,
  calculateNewSpeed,
  isPositionOccupiedByPlayer,
  getValidMovesWithCollisions,
  getValidMovesByMomentum,
  getAllAdjacentPositions
} from './movement-utils';

// Import and re-export functions from position-utils.ts
import {
  isValidPosition,
  doesSegmentPassThroughTile
} from './position-utils';

// Import and re-export functions from gameplay-utils.ts
import {
  checkSlipstream,
  distanceFromTrack,
  getReverseDirection,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
} from './gameplay-utils';

// Re-export all the imported functions
export {
  // From movement-utils.ts
  getNextPosition,
  getLastDelta,
  getNewDirection,
  calculateNewSpeed,
  isPositionOccupiedByPlayer,
  getValidMovesWithCollisions,
  getValidMovesByMomentum,
  getAllAdjacentPositions,
  
  // From position-utils.ts
  isValidPosition,
  doesSegmentPassThroughTile,

  // From gameplay-utils.ts
  checkSlipstream,
  distanceFromTrack,
  getReverseDirection,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
};
