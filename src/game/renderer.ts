import { CONFIG, PALETTE } from '../config';
import { LightingEffect } from './effects/lightingEffect';
import { WaterEffect } from './effects/waterEffect';
import { ReadonlyGameState } from './engine';
import { TileType } from './world/deckMap';

/**
 * GameRenderer: Single dedicated rendering module.
 * STRICTLY READ-ONLY: Never modifies game state. Only reads ReadonlyGameState
 * and delegates visual effects to dedicated effect layer modules (Water, Lighting).
 */
export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private waterEffect: WaterEffect;
  private lightingEffect: LightingEffect;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.waterEffect = new WaterEffect();
    this.lightingEffect = new LightingEffect();
  }

  public render(state: ReadonlyGameState): void {
    const { ctx } = this;
    const { map, player, camera, shakeOffset, activeInteractable, messageBanner, frameTime } = state;
    const { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } = CONFIG;

    // Apply screen shake offset to effective camera viewport
    const effectiveCamX = camera.x - shakeOffset.offsetX;
    const effectiveCamY = camera.y - shakeOffset.offsetY;

    // --- LAYER 1: Deep Ocean Background & Water Waves ---
    ctx.fillStyle = PALETTE.Abyss;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.waterEffect.draw(ctx, frameTime);

    // --- LAYER 2: Ship Tiles ---
    const startCol = Math.max(0, Math.floor(effectiveCamX / TILE_SIZE));
    const endCol = Math.min(map.width - 1, Math.floor((effectiveCamX + camera.viewportWidth) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(effectiveCamY / TILE_SIZE));
    const endRow = Math.min(map.height - 1, Math.floor((effectiveCamY + camera.viewportHeight) / TILE_SIZE));

    for (let ty = startRow; ty <= endRow; ty++) {
      for (let tx = startCol; tx <= endCol; tx++) {
        const tile = map.tiles[ty][tx];
        const screenX = tx * TILE_SIZE - effectiveCamX;
        const screenY = ty * TILE_SIZE - effectiveCamY;

        this.drawTile(tile, screenX, screenY, TILE_SIZE, tx, ty);
      }
    }

    // --- LAYER 2b: In-world Encroaching Tide Creep (Visual Dread replacing UI warnings) ---
    this.waterEffect.drawDeckWaterCreep(
      ctx,
      state.deathCount,
      frameTime,
      effectiveCamX,
      effectiveCamY,
      map.width,
      map.height,
      state.scene
    );

    // Interactable tile highlight
    if (activeInteractable) {
      const ix = activeInteractable.x * TILE_SIZE - effectiveCamX;
      const iy = activeInteractable.y * TILE_SIZE - effectiveCamY;
      const pulse = 0.5 + 0.5 * Math.sin(frameTime * 6);

      ctx.save();
      ctx.strokeStyle = PALETTE.Lantern;
      ctx.lineWidth = 3 + pulse * 2;
      ctx.strokeRect(ix + 4, iy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      ctx.restore();
    }

    // --- LAYER 3: Entities (Player) ---
    const playerScreenX = player.x * TILE_SIZE - effectiveCamX;
    const playerScreenY = player.y * TILE_SIZE - effectiveCamY;
    this.drawPlayer(player, playerScreenX, playerScreenY);

    // --- LAYER 4: Atmospheric Lighting & Vignette ---
    const glowTargets: { x: number; y: number; color: string; radius: number }[] = [];

    // Kaal Mani crystal glow in hold
    if (state.scene === 'hold') {
      const relicX = 13.5 * TILE_SIZE - effectiveCamX;
      const relicY = 4.5 * TILE_SIZE - effectiveCamY;
      glowTargets.push({
        x: relicX,
        y: relicY,
        color: 'rgba(95, 211, 196, 0.35)', // Tide Glow
        radius: 180,
      });
    }

    this.lightingEffect.draw(ctx, playerScreenX, playerScreenY, glowTargets);

    // --- LAYER 5: In-world Floating Prompts [E] ---
    if (activeInteractable) {
      this.drawInteractionPrompt(activeInteractable, effectiveCamX, effectiveCamY);
    }

    // In-game message notification banner
    if (messageBanner) {
      this.drawMessageBanner(messageBanner);
    }
  }

  private drawTile(
    tile: TileType,
    screenX: number,
    screenY: number,
    size: number,
    tileX: number,
    _tileY: number
  ): void {
    const { ctx } = this;

    switch (tile) {
      case 'deck': {
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, size, size);

        ctx.beginPath();
        ctx.moveTo(screenX, screenY + size / 2);
        ctx.lineTo(screenX + size, screenY + size / 2);
        ctx.stroke();

        ctx.fillStyle = PALETTE.Tar;
        const nailOff = tileX % 2 === 0 ? 10 : size - 10;
        ctx.fillRect(screenX + nailOff, screenY + 8, 3, 3);
        ctx.fillRect(screenX + nailOff, screenY + size - 12, 3, 3);
        break;
      }

      case 'hold_floor': {
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, size, size);

        ctx.beginPath();
        ctx.moveTo(screenX, screenY + size / 2);
        ctx.lineTo(screenX + size, screenY + size / 2);
        ctx.stroke();
        break;
      }

      case 'wall': {
        ctx.fillStyle = '#2b2319';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + size, screenY + size);
        ctx.moveTo(screenX + size, screenY);
        ctx.lineTo(screenX, screenY + size);
        ctx.stroke();
        break;
      }

      case 'rail': {
        ctx.fillStyle = PALETTE.Deepwater;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX + 8, screenY + 12, size - 16, size - 24);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + 8, screenY + 12, size - 16, size - 24);

        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + 16, screenY + 6, 8, size - 12);
        break;
      }

      case 'hatch': {
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        const pad = 12;
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + pad, screenY + pad, size - pad * 2, size - pad * 2);

        ctx.strokeStyle = PALETTE.Lantern;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + pad, screenY + pad, size - pad * 2, size - pad * 2);

        ctx.strokeStyle = PALETTE.Bone;
        ctx.lineWidth = 3;
        for (let r = 0; r < 3; r++) {
          const ry = screenY + pad + 16 + r * 16;
          ctx.beginPath();
          ctx.moveTo(screenX + pad + 10, ry);
          ctx.lineTo(screenX + size - pad - 10, ry);
          ctx.stroke();
        }
        break;
      }

      case 'door': {
        ctx.fillStyle = '#3a2f22';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 4;
        ctx.strokeRect(screenX + 6, screenY + 4, size - 12, size - 8);

        ctx.fillStyle = PALETTE.Lantern;
        ctx.beginPath();
        ctx.arc(screenX + size - 18, screenY + size / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'cannon': {
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + 10, screenY + 24, size - 20, 48);

        ctx.fillStyle = PALETTE.BloodRust;
        ctx.fillRect(screenX - 8, screenY + 36, 24, 24);
        break;
      }

      case 'helm': {
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.save();
        ctx.translate(screenX + size / 2, screenY + size / 2);

        ctx.strokeStyle = PALETTE.Lantern;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();

        for (let s = 0; s < 8; s++) {
          const angle = (s * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * 32, Math.sin(angle) * 32);
          ctx.stroke();
        }

        ctx.fillStyle = PALETTE.Driftwood;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        break;
      }

      case 'galley': {
        ctx.fillStyle = '#4a3b2c';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = PALETTE.Ash;
        ctx.fillRect(screenX + 10, screenY + 10, size - 20, size - 20);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX + size / 2, screenY + size / 2, 16, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'lifeboat': {
        ctx.fillStyle = PALETTE.Deepwater;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = PALETTE.Driftwood;
        ctx.beginPath();
        ctx.ellipse(screenX + size / 2, screenY + size / 2, size / 2 - 6, size / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.stroke();
        break;
      }

      case 'relic': {
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        const cx = screenX + size / 2;
        const cy = screenY + size / 2;

        ctx.save();
        ctx.shadowColor = PALETTE.TideGlow;
        ctx.shadowBlur = 24;

        ctx.fillStyle = PALETTE.TideGlow;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 30);
        ctx.lineTo(cx + 22, cy);
        ctx.lineTo(cx, cy + 30);
        ctx.lineTo(cx - 22, cy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = PALETTE.Bone;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'statue': {
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + 16, screenY + size - 24, size - 32, 16);

        ctx.fillStyle = PALETTE.Ash;
        ctx.beginPath();
        ctx.arc(screenX + size / 2, screenY + 28, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(screenX + size / 2 - 12, screenY + 42, 24, 32);

        ctx.fillStyle = PALETTE.Lantern;
        ctx.fillRect(screenX + size / 2 - 3, screenY + 52, 6, 6);
        break;
      }

      case 'chest': {
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX + 14, screenY + 20, size - 28, size - 40);

        ctx.strokeStyle = PALETTE.Lantern;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + 14, screenY + 20, size - 28, size - 40);

        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + size / 2 - 3, screenY + size / 2 - 3, 6, 8);
        break;
      }

      case 'grate': {
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Ash;
        ctx.lineWidth = 2;
        for (let g = 8; g < size; g += 16) {
          ctx.beginPath();
          ctx.moveTo(screenX + g, screenY + 6);
          ctx.lineTo(screenX + g, screenY + size - 6);
          ctx.moveTo(screenX + 6, screenY + g);
          ctx.lineTo(screenX + size - 6, screenY + g);
          ctx.stroke();
        }
        break;
      }

      default:
        break;
    }
  }

  private drawPlayer(player: ReadonlyGameState['player'], px: number, py: number): void {
    const { ctx } = this;
    const bob = player.isMoving ? Math.sin(player.walkTimer) * 3 : 0;

    ctx.save();

    // 1. Drop shadow
    ctx.fillStyle = 'rgba(7, 9, 15, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px, py + 18, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Angarakha Body
    ctx.fillStyle = '#22303c';
    ctx.fillRect(px - 14, py - 16 + bob, 28, 30);

    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 14, py - 16 + bob, 28, 30);

    // 3. Waist Sash in Tide Glow
    ctx.fillStyle = PALETTE.TideGlow;
    ctx.fillRect(px - 15, py + 2 + bob, 30, 6);

    // 4. Head Turban / Cowl in Bone
    ctx.fillStyle = PALETTE.Bone;
    ctx.beginPath();
    ctx.arc(px, py - 26 + bob, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Face shadow in Tar
    ctx.fillStyle = PALETTE.Tar;
    ctx.beginPath();
    ctx.arc(px, py - 24 + bob, 9, 0, Math.PI * 2);
    ctx.fill();

    // 6. 4-Direction eye glint
    ctx.fillStyle = PALETTE.Lantern;
    if (player.facing === 'down') {
      ctx.fillRect(px - 4, py - 24 + bob, 2, 2);
      ctx.fillRect(px + 2, py - 24 + bob, 2, 2);
    } else if (player.facing === 'up') {
      ctx.fillStyle = PALETTE.Ash;
      ctx.fillRect(px - 3, py - 27 + bob, 6, 3);
    } else if (player.facing === 'left') {
      ctx.fillRect(px - 5, py - 24 + bob, 2, 2);
    } else if (player.facing === 'right') {
      ctx.fillRect(px + 3, py - 24 + bob, 2, 2);
    }

    ctx.restore();
  }

  private drawInteractionPrompt(
    interactable: ReadonlyGameState['activeInteractable'],
    cameraX: number,
    cameraY: number
  ): void {
    if (!interactable) return;
    const { ctx } = this;
    const { TILE_SIZE } = CONFIG;

    const screenX = (interactable.x + (interactable.width ?? 1) / 2) * TILE_SIZE - cameraX;
    const screenY = interactable.y * TILE_SIZE - cameraY - 14;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Key prompt badge "[E]" in Lantern
    const badgeWidth = 36;
    const badgeHeight = 28;
    ctx.fillStyle = PALETTE.Lantern;
    ctx.fillRect(screenX - badgeWidth / 2, screenY - badgeHeight, badgeWidth, badgeHeight);

    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - badgeWidth / 2, screenY - badgeHeight, badgeWidth, badgeHeight);

    ctx.fillStyle = PALETTE.Tar;
    ctx.font = 'bold 16px monospace';
    ctx.fillText('E', screenX, screenY - badgeHeight / 2);

    // Label pill underneath
    ctx.font = '14px monospace';
    const textWidth = ctx.measureText(interactable.label).width;
    const pillPadding = 12;

    ctx.fillStyle = 'rgba(7, 9, 15, 0.85)';
    ctx.fillRect(screenX - textWidth / 2 - pillPadding, screenY + 4, textWidth + pillPadding * 2, 22);

    ctx.strokeStyle = PALETTE.Deepwater;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screenX - textWidth / 2 - pillPadding, screenY + 4, textWidth + pillPadding * 2, 22);

    ctx.fillStyle = PALETTE.Bone;
    ctx.fillText(interactable.label, screenX, screenY + 15);

    ctx.restore();
  }

  private drawMessageBanner(message: string): void {
    const { ctx } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px monospace';
    const bWidth = ctx.measureText(message).width + 36;
    ctx.fillStyle = 'rgba(7, 9, 15, 0.9)';
    ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - bWidth / 2, 90, bWidth, 34);

    ctx.strokeStyle = PALETTE.Lantern;
    ctx.lineWidth = 2;
    ctx.strokeRect(CONFIG.CANVAS_WIDTH / 2 - bWidth / 2, 90, bWidth, 34);

    ctx.fillStyle = PALETTE.Lantern;
    ctx.fillText(message, CONFIG.CANVAS_WIDTH / 2, 107);
    ctx.restore();
  }
}
