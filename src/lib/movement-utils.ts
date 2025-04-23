
// Re-export all functionality from the new modular files
export {
  getNextPosition,
  getAllAdjacentPositions
} from './movement/position-utils';

export {
  getNewDirection,
  calculateNewSpeed,
  getLastDelta
} from './movement/speed-direction-utils';

export {
  getValidMovesByMomentum,
  getValidMovesWithCollisions,
  isPositionOccupiedByPlayer
} from './movement/valid-moves-utils';

