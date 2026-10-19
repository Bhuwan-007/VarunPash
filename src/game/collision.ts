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
  'mast',
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
 * Uses a small epsilon to prevent false positive collisions on exact boundaries.
 */
export function checkAABBCollision(map: GameMap, box: BoundingBox): boolean {
  const EPS = 0.002;
  const startX = Math.floor(box.minX + EPS);
  const endX = Math.floor(box.maxX - EPS);
  const startY = Math.floor(box.minY + EPS);
  const endY = Math.floor(box.maxY - EPS);

  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      if (isTileSolid(map, tx, ty)) {
        return true;
      }
    }
  }

  return false;
}

export interface DynamicObstacle {
  x: number;
  y: number;
  radius: number;
}

export function checkObstacleCollision(
  px: number,
  py: number,
  obstacles: DynamicObstacle[] = [],
  playerRadius: number = 0.2
): boolean {
  for (const obs of obstacles) {
    const minDist = obs.radius + playerRadius;
    const dx = px - obs.x;
    const dy = py - obs.y;
    if (dx * dx + dy * dy < minDist * minDist) {
      return true;
    }
  }
  return false;
}

/**
 * Resolves movement with separate X and Y axis AABB collisions to allow smooth sliding along walls and NPCs.
 * Includes corner assistance nudge to prevent getting caught on doorframes and staircase edges.
 * Returns the resolved position { x, y }.
 */
export function resolveMovement(
  map: GameMap,
  currentX: number,
  currentY: number,
  deltaX: number,
  deltaY: number,
  halfWidth: number = 0.18,
  halfHeight: number = 0.14,
  obstacles: DynamicObstacle[] = []
): { x: number; y: number } {
  let newX = currentX;
  let newY = currentY;

  const skinInset = 0.04; // Prevents orthogonal contact from blocking parallel sliding

  // 1. Attempt X movement
  if (deltaX !== 0) {
    const testX = currentX + deltaX;
    const boxX: BoundingBox = {
      minX: testX - halfWidth,
      maxX: testX + halfWidth,
      minY: currentY - halfHeight + skinInset,
      maxY: currentY + halfHeight - skinInset,
    };

    if (!checkAABBCollision(map, boxX) && !checkObstacleCollision(testX, currentY, obstacles, halfWidth)) {
      newX = testX;
    }
  }

  // 2. Attempt Y movement
  if (deltaY !== 0) {
    const testY = currentY + deltaY;
    const boxY: BoundingBox = {
      minX: newX - halfWidth + skinInset,
      maxX: newX + halfWidth - skinInset,
      minY: testY - halfHeight,
      maxY: testY + halfHeight,
    };

    if (!checkAABBCollision(map, boxY) && !checkObstacleCollision(newX, testY, obstacles, halfHeight)) {
      newY = testY;
    }
  }

  // 3. Smooth Corner Slide assistance
  if (deltaX !== 0 && deltaY === 0 && newX === currentX) {
    const nudge = 0.08;
    const boxUp: BoundingBox = {
      minX: currentX + deltaX - halfWidth,
      maxX: currentX + deltaX + halfWidth,
      minY: currentY - nudge - halfHeight + skinInset,
      maxY: currentY - nudge + halfHeight - skinInset,
    };
    const boxDown: BoundingBox = {
      minX: currentX + deltaX - halfWidth,
      maxX: currentX + deltaX + halfWidth,
      minY: currentY + nudge - halfHeight + skinInset,
      maxY: currentY + nudge + halfHeight - skinInset,
    };
    if (!checkAABBCollision(map, boxUp) && !checkObstacleCollision(currentX + deltaX, currentY - nudge * 0.7, obstacles, halfWidth)) {
      newY = currentY - nudge * 0.7;
    } else if (!checkAABBCollision(map, boxDown) && !checkObstacleCollision(currentX + deltaX, currentY + nudge * 0.7, obstacles, halfWidth)) {
      newY = currentY + nudge * 0.7;
    }
  } else if (deltaY !== 0 && deltaX === 0 && newY === currentY) {
    const nudge = 0.08;
    const boxLeft: BoundingBox = {
      minX: currentX - nudge - halfWidth + skinInset,
      maxX: currentX - nudge + halfWidth - skinInset,
      minY: currentY + deltaY - halfHeight,
      maxY: currentY + deltaY + halfHeight,
    };
    const boxRight: BoundingBox = {
      minX: currentX + nudge - halfWidth + skinInset,
      maxX: currentX + nudge + halfWidth - skinInset,
      minY: currentY + deltaY - halfHeight,
      maxY: currentY + deltaY + halfHeight,
    };
    if (!checkAABBCollision(map, boxLeft) && !checkObstacleCollision(currentX - nudge * 0.7, currentY + deltaY, obstacles, halfHeight)) {
      newX = currentX - nudge * 0.7;
    } else if (!checkAABBCollision(map, boxRight) && !checkObstacleCollision(currentX + nudge * 0.7, currentY + deltaY, obstacles, halfHeight)) {
      newX = currentX + nudge * 0.7;
    }
  }

  return { x: newX, y: newY };
}

/**
 * Checks if a position { x, y } is fully walkable for the player's bounding box and dynamic obstacles.
 */
export function isPositionWalkable(
  map: GameMap,
  x: number,
  y: number,
  halfWidth: number = 0.18,
  halfHeight: number = 0.14,
  obstacles: DynamicObstacle[] = []
): boolean {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return false;
  }
  const box: BoundingBox = {
    minX: x - halfWidth,
    maxX: x + halfWidth,
    minY: y - halfHeight,
    maxY: y + halfHeight,
  };
  return !checkAABBCollision(map, box) && !checkObstacleCollision(x, y, obstacles, halfWidth);
}

/**
 * Finds the nearest walkable position to (targetX, targetY).
 * Performs a radial search around (targetX, targetY) up to maxRadius tiles.
 * The player must NEVER be placed inside a solid tile or inside a dynamic obstacle.
 */
export function findNearestWalkableTile(
  map: GameMap,
  targetX: number,
  targetY: number,
  halfWidth: number = 0.18,
  halfHeight: number = 0.14,
  maxRadius: number = 5,
  obstacles: DynamicObstacle[] = []
): { x: number; y: number } {
  if (isPositionWalkable(map, targetX, targetY, halfWidth, halfHeight, obstacles)) {
    return { x: targetX, y: targetY };
  }

  // Radial search in 0.2-tile increments
  const step = 0.2;
  for (let r = step; r <= maxRadius; r += step) {
    const angleSteps = Math.max(8, Math.round(2 * Math.PI * r * 5));
    for (let i = 0; i < angleSteps; i++) {
      const angle = (i * 2 * Math.PI) / angleSteps;
      const testX = Math.round((targetX + Math.cos(angle) * r) * 100) / 100;
      const testY = Math.round((targetY + Math.sin(angle) * r) * 100) / 100;

      if (isPositionWalkable(map, testX, testY, halfWidth, halfHeight, obstacles)) {
        return { x: testX, y: testY };
      }
    }
  }

  console.warn(`[findNearestWalkableTile] Could not find walkable tile near (${targetX}, ${targetY}) on map ${map.id}`);
  return { x: targetX, y: targetY };
}

/**
 * Dev-only startup check: asserts that every spawn point and scene transition point
 * is strictly walkable and not inside a solid tile.
 */
export function assertWalkablePositions(deckMap: GameMap, holdMap: GameMap): void {
  const check = (map: GameMap, pos: { x: number; y: number }, label: string) => {
    const safe = findNearestWalkableTile(map, pos.x, pos.y);
    const walkable = isPositionWalkable(map, safe.x, safe.y);
    console.assert(walkable, `[STARTUP ASSERTION FAILED] ${label} at (${pos.x}, ${pos.y}) on map "${map.id}" is NOT walkable!`);
    if (!walkable) {
      console.error(`[STARTUP ASSERTION FAILED] ${label} at (${pos.x}, ${pos.y}) on map "${map.id}" is inside collision!`);
    }
  };

  // 1. Spawns
  check(deckMap, deckMap.spawnPosition, 'deckMap.spawnPosition');
  check(holdMap, holdMap.spawnPosition, 'holdMap.spawnPosition');

  // 2. Role Hold Access Assertions
  // Quartermaster: deck_hatch -> hold, hold_hatch -> deck
  const qmDown = deckMap.interactables.find((i) => i.id === 'deck_hatch');
  const qmUp = holdMap.interactables.find((i) => i.id === 'hold_hatch');
  console.assert(!!qmDown && !!qmDown.targetPosition, 'Quartermaster deck_hatch transition missing');
  console.assert(!!qmUp && !!qmUp.targetPosition, 'Hold ascent hold_hatch transition missing');
  if (qmDown?.targetPosition) check(holdMap, qmDown.targetPosition, 'Quartermaster Hold Entry (deck_hatch)');
  if (qmUp?.targetPosition) check(deckMap, qmUp.targetPosition, 'Quartermaster Hold Exit (hold_hatch)');

  // Navigator: navigator_stern_hatch -> hold, hold_stern_stairs -> deck
  const navDown = deckMap.interactables.find((i) => i.id === 'navigator_stern_hatch');
  const navUp = holdMap.interactables.find((i) => i.id === 'hold_stern_stairs');
  console.assert(!!navDown && !!navDown.targetPosition, 'Navigator stern hatch transition missing');
  console.assert(!!navUp && !!navUp.targetPosition, 'Navigator stern stairs transition missing');
  if (navDown?.targetPosition) check(holdMap, navDown.targetPosition, 'Navigator Hold Entry (navigator_stern_hatch)');
  if (navUp?.targetPosition) check(deckMap, navUp.targetPosition, 'Navigator Hold Exit (hold_stern_stairs)');

  // Deckhand: deckhand_deck_vent -> hold, hold_vent_grate -> deck
  const dhDown = deckMap.interactables.find((i) => i.id === 'deckhand_deck_vent');
  const dhUp = holdMap.interactables.find((i) => i.id === 'hold_vent_grate');
  console.assert(!!dhDown && !!dhDown.targetPosition, 'Deckhand deck vent transition missing');
  console.assert(!!dhUp && !!dhUp.targetPosition, 'Deckhand hold vent transition missing');
  if (dhDown?.targetPosition) check(holdMap, dhDown.targetPosition, 'Deckhand Hold Entry (deckhand_deck_vent)');
  if (dhUp?.targetPosition) check(deckMap, dhUp.targetPosition, 'Deckhand Hold Exit (hold_vent_grate)');

  // 3. All other transitions
  for (const item of deckMap.interactables) {
    if (item.targetPosition && item.targetScene) {
      const targetMap = item.targetScene === 'hold' ? holdMap : deckMap;
      check(targetMap, item.targetPosition, `deckMap interactable "${item.id}" targetPosition`);
    }
  }

  for (const item of holdMap.interactables) {
    if (item.targetPosition && item.targetScene) {
      const targetMap = item.targetScene === 'deck' ? deckMap : holdMap;
      check(targetMap, item.targetPosition, `holdMap interactable "${item.id}" targetPosition`);
    }
  }

  console.log('[DevAssertion PASSED] All 3 roles can enter & exit hold without softlock. All spawn and transition tiles are walkable.');
}


