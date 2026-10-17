import { CONFIG } from '../../config';

export type SceneId = 'deck' | 'hold';

export type InteractableType =
  | 'hatch'
  | 'door'
  | 'helm'
  | 'cannon'
  | 'galley'
  | 'safe'
  | 'lifeboat'
  | 'relic'
  | 'statue'
  | 'gold'
  | 'vent';

export interface Interactable {
  id: string;
  scene: SceneId;
  x: number; // in tile units
  y: number; // in tile units
  width?: number; // tile units, default 1
  height?: number; // tile units, default 1
  type: InteractableType;
  label: string;
  targetScene?: SceneId;
  targetPosition?: { x: number; y: number };
}

/**
 * Checks if a position is within the interaction radius of an interactable object.
 */
export function isWithinInteractRadius(
  playerX: number,
  playerY: number,
  target: Interactable,
  radius: number = CONFIG.INTERACT_RADIUS
): boolean {
  const targetCenterX = target.x + (target.width ?? 1) / 2;
  const targetCenterY = target.y + (target.height ?? 1) / 2;
  const dx = playerX - targetCenterX;
  const dy = playerY - targetCenterY;
  return Math.hypot(dx, dy) <= radius;
}
