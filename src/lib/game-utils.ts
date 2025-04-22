
// Import and re-export functions from movement-utils.ts
import { 
  getNextPosition,
  getLastDelta,
  calculateMomentumPosition,
  getNewDirection,
  calculateNewSpeed,
  isPositionOccupiedByPlayer,
  getValidMovesWithCollisions,
  getValidMovesByMomentum
} from './movement-utils';

// Import and re-export functions from position-utils.ts
import {
  isValidPosition,
  getAllAdjacentPositions
} from './position-utils';

// Import and re-export functions from gameplay-utils.ts
import {
  getValidMoves,
  checkSlipstream,
  distanceFromTrack,
  getReverseDirection,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  checkCrash
} from './gameplay-utils';

// Re-export all the imported functions
export {
  // From movement-utils.ts
  getNextPosition,
  getLastDelta,
  calculateMomentumPosition,
  getNewDirection,
  calculateNewSpeed,
  isPositionOccupiedByPlayer,
  getValidMovesWithCollisions,
  getValidMovesByMomentum,
  
  // From position-utils.ts
  isValidPosition,
  getAllAdjacentPositions,
  
  // From gameplay-utils.ts
  getValidMoves,
  checkSlipstream,
  distanceFromTrack,
  getReverseDirection,
  checkCheckpointCrossed,
  checkFinishLineCrossed,
  checkCrash
};
