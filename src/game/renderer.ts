import { CONFIG, PALETTE } from '../config';
import { ReadonlyGameState } from './engine';
import { TileType } from './world/deckMap';

/**
 * GameRenderer: Dedicated rendering module.
 * STRICTLY READ-ONLY: Never modifies game state. Only reads ReadonlyGameState
 * and draws the scene to the HTML5 Canvas 2D context.
 */
export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(state: ReadonlyGameState): void {
    const { ctx } = this;
    const { map, player, camera, activeInteractable, messageBanner, frameTime } = state;
    const { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } = CONFIG;

    // 1. Clear background to dark ocean (Abyss)
    ctx.fillStyle = PALETTE.Abyss;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle ocean waves in Deepwater
    this.drawOceanWaves(frameTime);

    // 2. Visible tile range based on camera viewport
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol = Math.min(map.width - 1, Math.floor((camera.x + camera.viewportWidth) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow = Math.min(map.height - 1, Math.floor((camera.y + camera.viewportHeight) / TILE_SIZE));

    // 3. Draw Tiles
    for (let ty = startRow; ty <= endRow; ty++) {
      for (let tx = startCol; tx <= endCol; tx++) {
        const tile = map.tiles[ty][tx];
        const screenX = tx * TILE_SIZE - camera.x;
        const screenY = ty * TILE_SIZE - camera.y;

        this.drawTile(tile, screenX, screenY, TILE_SIZE, tx, ty);
      }
    }

    // 4. Highlight active interactable tile if nearby
    if (activeInteractable) {
      const ix = activeInteractable.x * TILE_SIZE - camera.x;
      const iy = activeInteractable.y * TILE_SIZE - camera.y;
      const pulse = 0.5 + 0.5 * Math.sin(frameTime * 6);

      ctx.save();
      ctx.strokeStyle = PALETTE.Lantern;
      ctx.lineWidth = 3 + pulse * 2;
      ctx.strokeRect(ix + 4, iy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      ctx.restore();
    }

    // 5. Draw Player
    this.drawPlayer(player, camera.x, camera.y);

    // 6. Draw floating interaction prompt [E]
    if (activeInteractable) {
      this.drawInteractionPrompt(activeInteractable, camera.x, camera.y);
    }

    // 7. Draw HUD & Status overlays
    this.drawHUD(state);
  }

  private drawOceanWaves(time: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = PALETTE.Deepwater;
    ctx.lineWidth = 2;

    const waveCount = 8;
    for (let i = 0; i < waveCount; i++) {
      const y = (i * 100 + time * 15) % CONFIG.CANVAS_HEIGHT;
      const offset = Math.sin(time * 1.5 + i) * 20;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        320 + offset, y - 10,
        640 - offset, y + 10,
        CONFIG.CANVAS_WIDTH, y
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawTile(
    tile: TileType,
    screenX: number,
    screenY: number,
    size: number,
    tileX: number,
    tileY: number
  ): void {
    const { ctx } = this;

    switch (tile) {
      case 'deck': {
        // Wood planks in Driftwood with Tar gaps
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, size, size);

        // Horizontal plank lines
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + size / 2);
        ctx.lineTo(screenX + size, screenY + size / 2);
        ctx.stroke();

        // Staggered plank nail dots
        ctx.fillStyle = PALETTE.Tar;
        const nailOff = (tileX % 2 === 0) ? 10 : size - 10;
        ctx.fillRect(screenX + nailOff, screenY + 8, 3, 3);
        ctx.fillRect(screenX + nailOff, screenY + size - 12, 3, 3);
        break;
      }

      case 'hold_floor': {
        // Darker cargo hold planks
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, size, size);

        // Plank dividers
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + size / 2);
        ctx.lineTo(screenX + size, screenY + size / 2);
        ctx.stroke();
        break;
      }

      case 'wall': {
        // Heavy wooden bulkhead wall
        ctx.fillStyle = '#2b2319';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, size, size);

        // Reinforced iron cross-braces
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
        // Ship railing with sea backdrop
        ctx.fillStyle = PALETTE.Deepwater;
        ctx.fillRect(screenX, screenY, size, size);

        // Outer stanchions
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX + 8, screenY + 12, size - 16, size - 24);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + 8, screenY + 12, size - 16, size - 24);

        // Rail posts
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + 16, screenY + 6, 8, size - 12);
        break;
      }

      case 'hatch': {
        // Wood deck background
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Dark square opening
        const pad = 12;
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + pad, screenY + pad, size - pad * 2, size - pad * 2);

        // Hatch rim in Lantern tone
        ctx.strokeStyle = PALETTE.Lantern;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + pad, screenY + pad, size - pad * 2, size - pad * 2);

        // Ladder rungs
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
        // Cabin Door
        ctx.fillStyle = '#3a2f22';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 4;
        ctx.strokeRect(screenX + 6, screenY + 4, size - 12, size - 8);

        // Brass handle / lock in Lantern
        ctx.fillStyle = PALETTE.Lantern;
        ctx.beginPath();
        ctx.arc(screenX + size - 18, screenY + size / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'cannon': {
        // Deck beneath
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Port Cannon pointing left
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + 10, screenY + 24, size - 20, 48);

        // Cannon barrel tip pointing out to port (left)
        ctx.fillStyle = PALETTE.BloodRust;
        ctx.fillRect(screenX - 8, screenY + 36, 24, 24);
        break;
      }

      case 'helm': {
        // Deck floor
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Helm wheel center
        ctx.save();
        ctx.translate(screenX + size / 2, screenY + size / 2);

        ctx.strokeStyle = PALETTE.Lantern;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();

        // 8 Spokes
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
        // Galley counter/stove
        ctx.fillStyle = '#4a3b2c';
        ctx.fillRect(screenX, screenY, size, size);

        // Metal stove top in Ash
        ctx.fillStyle = PALETTE.Ash;
        ctx.fillRect(screenX + 10, screenY + 10, size - 20, size - 20);

        // Burner rings
        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX + size / 2, screenY + size / 2, 16, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'lifeboat': {
        // Lifeboat in Ash & Driftwood
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
        // Hold floor beneath
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        // Kaal Mani Crystal glowing Tide Glow
        const cx = screenX + size / 2;
        const cy = screenY + size / 2;

        ctx.save();
        ctx.shadowColor = PALETTE.TideGlow;
        ctx.shadowBlur = 20;

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
        // Hold floor beneath
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        // Stone statue pedestal in Tar
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + 16, screenY + size - 24, size - 32, 16);

        // Petrified figure silhouette in Ash
        ctx.fillStyle = PALETTE.Ash;
        ctx.beginPath();
        ctx.arc(screenX + size / 2, screenY + 28, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(screenX + size / 2 - 12, screenY + 42, 24, 32);

        // Locket glint on statue chest in Lantern
        ctx.fillStyle = PALETTE.Lantern;
        ctx.fillRect(screenX + size / 2 - 3, screenY + 52, 6, 6);
        break;
      }

      case 'chest': {
        // Hold floor
        ctx.fillStyle = '#42372c';
        ctx.fillRect(screenX, screenY, size, size);

        // Wooden chest with gold trim
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX + 14, screenY + 20, size - 28, size - 40);

        ctx.strokeStyle = PALETTE.Lantern;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + 14, screenY + 20, size - 28, size - 40);

        // Keyhole
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX + size / 2 - 3, screenY + size / 2 - 3, 6, 8);
        break;
      }

      case 'grate': {
        // Dark floor beneath
        ctx.fillStyle = PALETTE.Tar;
        ctx.fillRect(screenX, screenY, size, size);

        // Metal grate mesh in Ash
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

  private drawPlayer(player: ReadonlyGameState['player'], cameraX: number, cameraY: number): void {
    const { ctx } = this;
    const { TILE_SIZE } = CONFIG;

    // Player screen coordinates
    const px = player.x * TILE_SIZE - cameraX;
    const py = player.y * TILE_SIZE - cameraY;

    // Subtle bobbing when moving
    const bob = player.isMoving ? Math.sin(player.walkTimer) * 3 : 0;

    ctx.save();

    // 1. Drop shadow on deck (Tar)
    ctx.fillStyle = 'rgba(7, 9, 15, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px, py + 18, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Body / Maritime Angarakha (Dark Blue-Grey)
    ctx.fillStyle = '#22303c';
    ctx.fillRect(px - 14, py - 16 + bob, 28, 30);

    // Outline
    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 14, py - 16 + bob, 28, 30);

    // 3. Colored Waist Sash (Tide Glow)
    ctx.fillStyle = PALETTE.TideGlow;
    ctx.fillRect(px - 15, py + 2 + bob, 30, 6);

    // 4. Head / Mariner Turban & Cowl (Bone)
    ctx.fillStyle = PALETTE.Bone;
    ctx.beginPath();
    ctx.arc(px, py - 26 + bob, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Face shadow / cowl interior (Tar)
    ctx.fillStyle = PALETTE.Tar;
    ctx.beginPath();
    ctx.arc(px, py - 24 + bob, 9, 0, Math.PI * 2);
    ctx.fill();

    // 6. 4-Direction eye glint / facing indicator
    ctx.fillStyle = PALETTE.Lantern;
    if (player.facing === 'down') {
      ctx.fillRect(px - 4, py - 24 + bob, 2, 2);
      ctx.fillRect(px + 2, py - 24 + bob, 2, 2);
    } else if (player.facing === 'up') {
      // Back of turban, subtle fold
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

  private drawHUD(state: ReadonlyGameState): void {
    const { ctx } = this;
    const { scene, player, messageBanner } = state;

    ctx.save();

    // Top-Left Scene & Coordinates Badge
    ctx.fillStyle = 'rgba(7, 9, 15, 0.8)';
    ctx.fillRect(20, 20, 280, 52);

    ctx.strokeStyle = PALETTE.Deepwater;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 280, 52);

    ctx.textAlign = 'left';
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = PALETTE.TideGlow;
    ctx.fillText(scene === 'deck' ? 'LOCATION: MAIN DECK' : 'LOCATION: CARGO HOLD', 32, 42);

    ctx.font = '12px monospace';
    ctx.fillStyle = PALETTE.Ash;
    ctx.fillText(`POS: X=${player.x.toFixed(1)}  Y=${player.y.toFixed(1)}  FACING: ${player.facing.toUpperCase()}`, 32, 60);

    // Bottom Controls Guide
    ctx.fillStyle = 'rgba(7, 9, 15, 0.8)';
    ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 270, CONFIG.CANVAS_HEIGHT - 44, 540, 32);

    ctx.strokeStyle = PALETTE.Deepwater;
    ctx.lineWidth = 1;
    ctx.strokeRect(CONFIG.CANVAS_WIDTH / 2 - 270, CONFIG.CANVAS_HEIGHT - 44, 540, 32);

    ctx.textAlign = 'center';
    ctx.font = '13px monospace';
    ctx.fillStyle = PALETTE.Bone;
    ctx.fillText('WASD / Arrows to Move  |  [E] Interact / Use Hatch', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 28);

    // Center Message Banner (if triggered)
    if (messageBanner) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px monospace';
      const bWidth = ctx.measureText(messageBanner).width + 36;
      ctx.fillStyle = 'rgba(7, 9, 15, 0.9)';
      ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - bWidth / 2, 85, bWidth, 34);

      ctx.strokeStyle = PALETTE.Lantern;
      ctx.lineWidth = 2;
      ctx.strokeRect(CONFIG.CANVAS_WIDTH / 2 - bWidth / 2, 85, bWidth, 34);

      ctx.fillStyle = PALETTE.Lantern;
      ctx.fillText(messageBanner, CONFIG.CANVAS_WIDTH / 2, 102);
    }

    ctx.restore();
  }
}
