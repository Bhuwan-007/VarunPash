import { CONFIG } from '../config';
import { NpcScheduler } from './systems/npcScheduler';
import { Interactable } from './world/interactables';

export interface InteractableScreenBounds {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  feetX: number;
  feetY: number;
  headX: number;
  headY: number;
  isNpc: boolean;
  npcFacing?: string;
  label: string;
}

/**
 * Shared interactable bounding calculation for both renderer highlights and [E] prompt badges.
 * Anchors dynamically to moving NPCs using live interpolated coordinates from NpcScheduler.
 */
export function getInteractableScreenBounds(
  interactable: Interactable,
  shipTime: number,
  cameraX: number,
  cameraY: number,
  tileSize: number = CONFIG.TILE_SIZE
): InteractableScreenBounds {
  if (interactable.id.startsWith('npc_')) {
    const npcId = interactable.id.replace('npc_', '');
    const npcState = NpcScheduler.getNpcState(npcId, shipTime);
    if (npcState) {
      const worldPxX = npcState.x * tileSize;
      const worldPxY = npcState.y * tileSize;
      const screenX = worldPxX - cameraX;
      const screenY = worldPxY - cameraY;
      return {
        centerX: screenX,
        centerY: screenY,
        width: 32,
        height: 36,
        feetX: screenX,
        feetY: screenY + 16,
        headX: screenX,
        headY: screenY - 24,
        isNpc: true,
        npcFacing: npcState.facing,
        label: interactable.label,
      };
    }
  }

  // Static interactables (doors, hatches, safes, lifeboats, grates)
  const baseW = interactable.width ?? 1;
  const baseH = interactable.height ?? 1;
  const bounds = interactable.highlightSize;
  const hlW = (bounds?.width ?? (baseW * 0.5)) * tileSize;
  const hlH = (bounds?.height ?? (baseH * 0.5)) * tileSize;
  const hlOffsetX = (bounds?.offsetX ?? ((baseW - (bounds?.width ?? (baseW * 0.5))) / 2)) * tileSize;
  const hlOffsetY = (bounds?.offsetY ?? ((baseH - (bounds?.height ?? (baseH * 0.5))) / 2)) * tileSize;

  const left = interactable.x * tileSize + hlOffsetX - cameraX;
  const top = interactable.y * tileSize + hlOffsetY - cameraY;
  const centerX = left + hlW / 2;
  const centerY = top + hlH / 2;

  return {
    centerX,
    centerY,
    width: hlW,
    height: hlH,
    feetX: centerX,
    feetY: top + hlH,
    headX: centerX,
    headY: top,
    isNpc: false,
    label: interactable.label,
  };
}
