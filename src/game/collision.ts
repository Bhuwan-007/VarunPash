import { GameMap, TileType } from './world/deckMap';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const SOLID_TILES: Set<TileType> = new Set([
  'wall',
  'rail',
  'empty',
  'cannon',
  'helm',
  'galley',
  'lifeboat',
  'relic',
  'statue',
  'chest',
  'door',
]);

export function isTileSolid(map: GameMap, tx: number, ty: number): boolean {
  if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) {
    return true; // Outside map bounds is solid
  }
  const tile = map.tiles[ty]?.[tx];
  if (!tile) return true;
  return SOLID_TILES.has(tile);
}

/**
 * Checks if a bounding box (in tile units) collides with any solid tile in the map.
 */
export function checkAABBCollision(map: GameMap, box: BoundingBox): boolean {
  const startX = Math.floor(box.minX);
  const endX = Math.floor(box.maxX);
  const startY = Math.floor(box.minY);
  const endY = Math.floor(box.maxY);

  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      if (isTileSolid(map, tx, ty)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Resolves movement with separate X and Y axis AABB collisions to allow smooth sliding along walls.
 * Returns the resolved position { x, y }.
 */
export function resolveMovement(
  map: GameMap,
  currentX: number,
  currentY: number,
  deltaX: number,
  deltaY: number,
  halfWidth: number = 0.3,
  halfHeight: number = 0.3
): { x: number; y: number } {
  let newX = currentX;
  let newY = currentY;

  // Attempt X movement
  if (deltaX !== 0) {
    const testX = currentX + deltaX;
    const boxX: BoundingBox = {
      minX: testX - halfWidth,
      maxX: testX + halfWidth,
      minY: currentY - halfHeight,
      maxY: currentY + halfHeight,
    };

    if (!checkAABBCollision(map, boxX)) {
      newX = testX;
    }
  }

  // Attempt Y movement
  if (deltaY !== 0) {
    const testY = currentY + deltaY;
    const boxY: BoundingBox = {
      minX: newX - halfWidth,
      maxX: newX + halfWidth,
      minY: testY - halfHeight,
      maxY: testY + halfHeight,
    };

    if (!checkAABBCollision(map, boxY)) {
      newY = testY;
    }
  }

  return { x: newX, y: newY };
}
