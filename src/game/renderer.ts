import { CONFIG, PALETTE } from '../config';
import { LightingEffect } from './effects/lightingEffect';
import { WaterEffect } from './effects/waterEffect';
import { ReadonlyGameState } from './engine';
import { TileType } from './world/deckMap';

/**
 * GameRenderer: Single dedicated rendering module.
 * STRICTLY READ-ONLY: Never modifies game state. Only reads ReadonlyGameState
 * and delegates visual effects to dedicated effect layer modules (Water, Lighting).
 *
 * Implements full-length vertical galleon aesthetics (16x24, 64px tiles):
 * - Flowing real ocean water with harmonic swells & foam crests
 * - Rich vertical oak deck planks and wide 2-tile staircase treads
 * - Tangible prop visuals: open cargo hatch with rungs, listening grate, cabin door,
 *   binnacle helm, capstan, cannons, lifeboats, brine barrels
 * - Natural grounded walking gait with alternating mariner boots (no jumping bob)
 * - Ornate brass corner brackets for interactable highlights (no generic yellow box)
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

    // --- LAYER 1: Deep Ocean Background & Flowing Real Water ---
    this.waterEffect.draw(ctx, frameTime);

    // --- LAYER 1b: Ship Lateral Wake Along Hull (Deck scene) ---
    if (state.scene === 'deck') {
      this.drawShipWake(ctx, effectiveCamX, effectiveCamY, frameTime);
    }

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

        this.drawTile(tile, screenX, screenY, TILE_SIZE, tx, ty, state.scene, frameTime);
      }
    }

    // --- LAYER 2b: In-world Encroaching Tide Creep ---
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

    // --- LAYER 2c: Interactable Highlight (Brass Corner Brackets & Golden Aura) ---
    if (activeInteractable) {
      this.drawInteractableHighlight(activeInteractable, effectiveCamX, effectiveCamY, frameTime);
    }

    // --- LAYER 3: Entities (Player & NPCs) ---
    if (state.scene === 'deck') {
      const bhimaX = 5.5 * TILE_SIZE - effectiveCamX;
      const bhimaY = 13.5 * TILE_SIZE - effectiveCamY;
      this.drawBhimaNPC(bhimaX, bhimaY);
    }

    const playerScreenX = player.x * TILE_SIZE - effectiveCamX;
    const playerScreenY = player.y * TILE_SIZE - effectiveCamY;
    this.drawPlayer(player, playerScreenX, playerScreenY);

    // --- LAYER 4: Atmospheric Lighting & Lanterns ---
    const glowTargets: { x: number; y: number; color: string; radius: number }[] = [];

    if (state.scene === 'deck') {
      // Deck storm lantern near cargo hatch (x: 10, y: 12)
      glowTargets.push({
        x: 10.5 * TILE_SIZE - effectiveCamX,
        y: 12.0 * TILE_SIZE - effectiveCamY,
        color: 'rgba(229, 169, 59, 0.35)',
        radius: 160,
      });
      // Stern lantern at quarterdeck rail (x: 14, y: 19)
      glowTargets.push({
        x: 14.5 * TILE_SIZE - effectiveCamX,
        y: 19.5 * TILE_SIZE - effectiveCamY,
        color: 'rgba(229, 169, 59, 0.28)',
        radius: 140,
      });
      // Forecastle bowsprit lantern (x: 7.5, y: 2)
      glowTargets.push({
        x: 8.0 * TILE_SIZE - effectiveCamX,
        y: 2.5 * TILE_SIZE - effectiveCamY,
        color: 'rgba(229, 169, 59, 0.25)',
        radius: 130,
      });
    } else {
      // Kaal Mani crystal glow in hold
      const relicX = 13.5 * TILE_SIZE - effectiveCamX;
      const relicY = 4.5 * TILE_SIZE - effectiveCamY;
      glowTargets.push({
        x: relicX,
        y: relicY,
        color: 'rgba(95, 211, 196, 0.45)', // Pulsing Tide Glow
        radius: 190,
      });
      // Hatch ladder light shaft from deck (x: 4.5, y: 3.5)
      glowTargets.push({
        x: 4.5 * TILE_SIZE - effectiveCamX,
        y: 3.5 * TILE_SIZE - effectiveCamY,
        color: 'rgba(232, 240, 245, 0.22)',
        radius: 150,
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

    // --- LAYER 6: Brief Ink Transition Fade ---
    if (state.inkFadeAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(7, 9, 15, ${Math.min(1, state.inkFadeAlpha * 1.25)})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
  }

  /**
   * Draws lateral ocean wake and foaming currents surging along the ship's hull.
   */
  private drawShipWake(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    time: number
  ): void {
    const { TILE_SIZE } = CONFIG;
    const portHullX = 3 * TILE_SIZE - camX;
    const starHullX = 13 * TILE_SIZE - camX;
    const bowY = 2 * TILE_SIZE - camY;
    const sternY = 22 * TILE_SIZE - camY;

    ctx.save();

    // Port side lateral wake foam
    ctx.strokeStyle = 'rgba(95, 211, 196, 0.28)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let y = bowY; y <= sternY; y += 24) {
      const wave = Math.sin((y + time * 60) * 0.05) * 6;
      if (y === bowY) ctx.moveTo(portHullX - 4 + wave, y);
      else ctx.lineTo(portHullX - 4 + wave, y);
    }
    ctx.stroke();

    // Starboard side lateral wake foam
    ctx.strokeStyle = 'rgba(95, 211, 196, 0.28)';
    ctx.beginPath();
    for (let y = bowY; y <= sternY; y += 24) {
      const wave = Math.cos((y + time * 60) * 0.05) * 6;
      if (y === bowY) ctx.moveTo(starHullX + 4 + wave, y);
      else ctx.lineTo(starHullX + 4 + wave, y);
    }
    ctx.stroke();

    // Bow beakhead cutting wake spray
    const bowX = 8 * TILE_SIZE - camX;
    ctx.strokeStyle = 'rgba(232, 240, 245, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bowX, bowY);
    ctx.lineTo(bowX - 45 - Math.sin(time * 3) * 6, bowY + 55);
    ctx.moveTo(bowX, bowY);
    ctx.lineTo(bowX + 45 + Math.sin(time * 3) * 6, bowY + 55);
    ctx.stroke();

    ctx.restore();
  }

  private drawTile(
    tile: TileType,
    screenX: number,
    screenY: number,
    size: number,
    tileX: number,
    tileY: number,
    scene: 'deck' | 'hold',
    time: number
  ): void {
    const { ctx } = this;

    switch (tile) {
      case 'deck': {
        // Check if this tile is one of the staircases:
        // Forecastle stairs: rows 6-8 at cols 4, 5 (port) and cols 10, 11 (starboard)
        // Quarterdeck stairs: rows 15-16 at cols 4, 5 (port) and cols 10, 11 (starboard)
        const isForeStair = tileY >= 6 && tileY <= 8 && (tileX === 4 || tileX === 5 || tileX === 10 || tileX === 11);
        const isAftStair = tileY >= 15 && tileY <= 16 && (tileX === 4 || tileX === 5 || tileX === 10 || tileX === 11);

        if (isForeStair || isAftStair) {
          // Render wooden staircase treads with beveled nosings and shadow depth
          ctx.fillStyle = '#6e563b';
          ctx.fillRect(screenX, screenY, size, size);

          // 4 horizontal step treads per 64px tile (16px per step)
          for (let s = 0; s < 4; s++) {
            const stepY = screenY + s * 16;
            // Step shadow underneath tread
            ctx.fillStyle = '#2a1f14';
            ctx.fillRect(screenX, stepY + 12, size, 4);

            // Step tread face
            ctx.fillStyle = s % 2 === 0 ? '#8a6e4d' : '#7f6445';
            ctx.fillRect(screenX, stepY, size, 12);

            // Polished brass grip edge / nosing
            ctx.fillStyle = 'rgba(229, 169, 59, 0.4)';
            ctx.fillRect(screenX + 2, stepY, size - 4, 2);

            // Step riser border
            ctx.strokeStyle = PALETTE.Tar;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, stepY, size, 16);
          }

          // Side timber stringers
          ctx.fillStyle = '#423223';
          if (tileX === 4 || tileX === 10) {
            ctx.fillRect(screenX, screenY, 6, size);
          }
          if (tileX === 5 || tileX === 11) {
            ctx.fillRect(screenX + size - 6, screenY, 6, size);
          }
          break;
        }

        // Standard Vertical Oak Planks
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Vertical plank seams (4 vertical planks per tile, 16px wide each)
        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 1.5;
        for (let p = 0; p <= size; p += 16) {
          ctx.beginPath();
          ctx.moveTo(screenX + p, screenY);
          ctx.lineTo(screenX + p, screenY + size);
          ctx.stroke();
        }

        // Horizontal plank stagger joints
        const stagger = (tileX % 2 === 0 ? 0 : 32) + (tileY % 2 === 0 ? 0 : 16);
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + stagger % size);
        ctx.lineTo(screenX + size, screenY + stagger % size);
        ctx.stroke();

        // Dark iron trunnels (plank nails)
        ctx.fillStyle = PALETTE.Tar;
        const nY = screenY + 6;
        const nY2 = screenY + size - 6;
        for (let p = 8; p < size; p += 16) {
          ctx.fillRect(screenX + p - 1, nY, 3, 3);
          ctx.fillRect(screenX + p - 1, nY2, 3, 3);
        }
        break;
      }

      case 'rail': {
        // Transverse balustrades on rows 6 and 16 between stairs (cols 6..9)
        const isTransverseRail = (tileY === 6 || tileY === 16) && tileX >= 6 && tileX <= 9;
        if (isTransverseRail) {
          // Deck floor base underneath
          ctx.fillStyle = '#4a3b2c';
          ctx.fillRect(screenX, screenY, size, size);

          // Carved baluster railing posts
          ctx.fillStyle = '#2c1f14';
          ctx.fillRect(screenX, screenY + 18, size, 28);

          // Turned balusters
          for (let b = 8; b < size; b += 14) {
            ctx.fillStyle = '#7a6247';
            ctx.fillRect(screenX + b - 3, screenY + 22, 6, 20);
            ctx.fillStyle = PALETTE.Lantern;
            ctx.fillRect(screenX + b - 2, screenY + 20, 4, 3);
          }

          // Polished teak top handrail
          ctx.fillStyle = '#8f7253';
          ctx.fillRect(screenX, screenY + 16, size, 8);
          ctx.strokeStyle = PALETTE.Tar;
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX, screenY + 16, size, 8);
          break;
        }

        // Exterior Hull Gunwale / Bulwarks
        // Solid dark oak bulwark timber
        ctx.fillStyle = '#312317';
        ctx.fillRect(screenX, screenY, size, size);

        // Polished teak capping rail along outer edge
        ctx.fillStyle = '#57422f';
        ctx.fillRect(screenX + 8, screenY + 8, size - 16, size - 16);

        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(screenX + 8, screenY + 8, size - 16, size - 16);

        // Brass belaying pin / stanchion insert
        ctx.fillStyle = PALETTE.Lantern;
        ctx.fillRect(screenX + size / 2 - 3, screenY + 12, 6, size - 24);

        // Cast shadow on deck edge
        ctx.fillStyle = 'rgba(7, 9, 15, 0.45)';
        if (tileX <= 3) {
          ctx.fillRect(screenX + size - 6, screenY, 6, size);
        } else if (tileX >= 12) {
          ctx.fillRect(screenX, screenY, 6, size);
        }
        break;
      }

      case 'mast': {
        // Deck planks base
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Round mast trunk
        const cx = screenX + size / 2;
        const cy = screenY + size / 2;
        const r = size * 0.42;

        ctx.fillStyle = '#3a2818';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Iron mast hoops
        ctx.strokeStyle = '#18120c';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(229, 169, 59, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
        ctx.stroke();

        // Belaying pin collar and coils of hemp rope
        ctx.fillStyle = '#8a6e4d';
        for (let a = 0; a < 8; a++) {
          const angle = (a * Math.PI) / 4;
          const px = cx + Math.cos(angle) * (r + 4);
          const py = cy + Math.sin(angle) * (r + 4);
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'hatch': {
        if (scene === 'deck') {
          // Deck planks base
          ctx.fillStyle = PALETTE.Driftwood;
          ctx.fillRect(screenX, screenY, size, size);

          // Heavy raised oak coaming frame (to keep deck water out)
          const pad = 4;
          ctx.fillStyle = '#3a2717';
          ctx.fillRect(screenX + pad, screenY + pad, size - pad * 2, size - pad * 2);

          // Deep dark hold stairwell opening
          const voidPad = 10;
          ctx.fillStyle = '#05080c';
          ctx.fillRect(screenX + voidPad, screenY + voidPad, size - voidPad * 2, size - voidPad * 2);

          // Real visible staircase descending into the cargo hold
          for (let s = 0; s < 4; s++) {
            const stepY = screenY + voidPad + 4 + s * 14;
            // Tread shadow
            ctx.fillStyle = '#100c08';
            ctx.fillRect(screenX + voidPad + 4, stepY + 9, size - voidPad * 2 - 8, 4);

            // Step tread face (getting darker descending into hold)
            const b = 110 - s * 20;
            ctx.fillStyle = `rgb(${b}, ${Math.round(b * 0.8)}, ${Math.round(b * 0.58)})`;
            ctx.fillRect(screenX + voidPad + 4, stepY, size - voidPad * 2 - 8, 9);

            // Brass step nosing
            ctx.fillStyle = 'rgba(229, 169, 59, 0.45)';
            ctx.fillRect(screenX + voidPad + 5, stepY, size - voidPad * 2 - 10, 2);

            // Step border
            ctx.strokeStyle = PALETTE.Tar;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + voidPad + 4, stepY, size - voidPad * 2 - 8, 9);
          }

          // Propped wooden hatch lid with iron strap hinges
          ctx.fillStyle = '#57422f';
          ctx.fillRect(screenX + 6, screenY + 2, size - 12, 8);
          ctx.strokeStyle = PALETTE.Tar;
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX + 6, screenY + 2, size - 12, 8);

          // Brass lid hinges
          ctx.fillStyle = PALETTE.Lantern;
          ctx.fillRect(screenX + 12, screenY + 2, 4, 8);
          ctx.fillRect(screenX + size - 16, screenY + 2, 4, 8);
        } else {
          // Hold Ascent Staircase leading up to the main deck
          ctx.fillStyle = '#33271c';
          ctx.fillRect(screenX, screenY, size, size);

          // Timber stair stringers on sides
          ctx.fillStyle = '#523c28';
          ctx.fillRect(screenX + 8, screenY, 6, size);
          ctx.fillRect(screenX + size - 14, screenY, 6, size);

          // 4 visible wooden stair treads ascending up toward deck light
          for (let s = 0; s < 4; s++) {
            const stepY = screenY + s * 16;
            // Tread shadow
            ctx.fillStyle = '#140f0a';
            ctx.fillRect(screenX + 12, stepY + 12, size - 24, 4);

            // Tread face (lighter toward top where daylight shines)
            const light = 90 + (3 - s) * 20;
            ctx.fillStyle = `rgb(${light}, ${Math.round(light * 0.78)}, ${Math.round(light * 0.58)})`;
            ctx.fillRect(screenX + 12, stepY, size - 24, 12);

            // Brass grip nosing
            ctx.fillStyle = 'rgba(229, 169, 59, 0.5)';
            ctx.fillRect(screenX + 14, stepY, size - 28, 2);

            ctx.strokeStyle = PALETTE.Tar;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 12, stepY, size - 24, 12);
          }

          // Shaft of daylight pouring down from open deck hatch above
          const grad = ctx.createLinearGradient(screenX + size / 2, screenY, screenX + size / 2, screenY + size);
          grad.addColorStop(0, 'rgba(232, 240, 245, 0.55)');
          grad.addColorStop(0.7, 'rgba(232, 240, 245, 0.15)');
          grad.addColorStop(1, 'rgba(232, 240, 245, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(screenX + 10, screenY, size - 20, size);
        }
        break;
      }

      case 'grate': {
        // Listening Grate: Solid brass/iron perimeter frame with slatted vents
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Heavy iron frame
        ctx.fillStyle = '#221911';
        ctx.fillRect(screenX + 4, screenY + 4, size - 8, size - 8);

        // Slatted vent bars with dark hold visible between them
        ctx.strokeStyle = '#5c4834';
        ctx.lineWidth = 3;
        for (let g = 10; g < size - 8; g += 8) {
          ctx.beginPath();
          ctx.moveTo(screenX + g, screenY + 8);
          ctx.lineTo(screenX + g, screenY + size - 8);
          ctx.stroke();
        }

        // Brass corner studs
        ctx.fillStyle = PALETTE.Lantern;
        ctx.fillRect(screenX + 6, screenY + 6, 3, 3);
        ctx.fillRect(screenX + size - 9, screenY + 6, 3, 3);
        ctx.fillRect(screenX + 6, screenY + size - 9, 3, 3);
        ctx.fillRect(screenX + size - 9, screenY + size - 9, 3, 3);
        break;
      }

      case 'door': {
        if (scene === 'hold' && tileX === 16) {
          // Navigator's Stern Companionway Stairs (Inactive, chained trapdoor)
          ctx.fillStyle = '#33271c';
          ctx.fillRect(screenX, screenY, size, size);

          // Wooden stringers
          ctx.fillStyle = '#523c28';
          ctx.fillRect(screenX + 8, screenY, 6, size);
          ctx.fillRect(screenX + size - 14, screenY, 6, size);

          // Stepped treads
          for (let s = 0; s < 4; s++) {
            const stepY = screenY + s * 16;
            ctx.fillStyle = '#5c432d';
            ctx.fillRect(screenX + 12, stepY, size - 24, 12);
            ctx.strokeStyle = PALETTE.Tar;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 12, stepY, size - 24, 12);
          }

          // Chained trapdoor in ceiling
          ctx.fillStyle = '#1c140d';
          ctx.fillRect(screenX + 10, screenY + 4, size - 20, 10);

          // Heavy iron chain and padlock
          ctx.strokeStyle = '#8a8f98';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(screenX + 12, screenY + 6);
          ctx.lineTo(screenX + size - 12, screenY + 12);
          ctx.stroke();

          ctx.fillStyle = PALETTE.Lantern;
          ctx.fillRect(screenX + size / 2 - 3, screenY + 8, 6, 8);
          break;
        }

        // Captain's Cabin Door: heavy oak double door with barricade beams
        ctx.fillStyle = '#2c1e13';
        ctx.fillRect(screenX, screenY, size, size);

        // Arched inner panel
        ctx.fillStyle = '#453323';
        ctx.fillRect(screenX + 6, screenY + 4, size - 12, size - 8);

        // Heavy wrought iron strap hinges
        ctx.fillStyle = '#18120c';
        ctx.fillRect(screenX + 6, screenY + 14, size - 12, 5);
        ctx.fillRect(screenX + 6, screenY + size - 20, size - 12, 5);

        // Wooden barricade beam nailed across the door
        ctx.fillStyle = '#825f38';
        ctx.save();
        ctx.translate(screenX + size / 2, screenY + size / 2);
        ctx.rotate(-0.15);
        ctx.fillRect(-size / 2 + 4, -8, size - 8, 16);
        ctx.strokeStyle = PALETTE.Tar;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size / 2 + 4, -8, size - 8, 16);
        ctx.restore();

        // Locked iron padlock / latch
        ctx.fillStyle = PALETTE.Lantern;
        ctx.beginPath();
        ctx.arc(screenX + size / 2, screenY + size / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'cannon': {
        // Port Cannon: 18-pounder naval gun
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        // Wooden naval truck carriage
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(screenX + 16, screenY + 18, size - 24, 28);

        // Cast-iron wheels
        ctx.fillStyle = '#18120c';
        ctx.fillRect(screenX + 14, screenY + 14, 8, 8);
        ctx.fillRect(screenX + 14, screenY + 42, 8, 8);
        ctx.fillRect(screenX + size - 14, screenY + 14, 8, 8);
        ctx.fillRect(screenX + size - 14, screenY + 42, 8, 8);

        // Tapered black iron gun barrel protruding out to port (left)
        ctx.fillStyle = '#1a1f24';
        ctx.beginPath();
        ctx.moveTo(screenX - 16, screenY + 28);
        ctx.lineTo(screenX + 36, screenY + 24);
        ctx.lineTo(screenX + 36, screenY + 40);
        ctx.lineTo(screenX - 16, screenY + 36);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0e1217';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Muzzle ring
        ctx.fillStyle = '#2c333b';
        ctx.fillRect(screenX - 20, screenY + 27, 5, 10);
        break;
      }

      case 'helm': {
        // Could be the ship's wheel or davit winch
        ctx.fillStyle = PALETTE.Driftwood;
        ctx.fillRect(screenX, screenY, size, size);

        if (tileY === 11 && tileX === 12) {
          // Davit Winch Plate: gear teeth, cable drum, and crank handle
          ctx.fillStyle = '#2d241e';
          ctx.fillRect(screenX + 10, screenY + 12, size - 20, size - 24);

          // Braided wire drum
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(screenX + 16, screenY + 20, size - 32, 24);

          // Crank lever
          ctx.strokeStyle = PALETTE.Lantern;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(screenX + size / 2, screenY + size / 2);
          ctx.lineTo(screenX + size - 12, screenY + 16);
          ctx.stroke();
        } else {
          // Ship's Wheel / Helm: 8-spoke wheel with turned handles & binnacle
          const cx = screenX + size / 2;
          const cy = screenY + size / 2;

          // Binnacle wooden pedestal
          ctx.fillStyle = '#423020';
          ctx.fillRect(cx - 16, cy + 8, 32, 20);

          // Brass compass housing dome
          ctx.fillStyle = PALETTE.Lantern;
          ctx.beginPath();
          ctx.arc(cx, cy + 14, 6, 0, Math.PI * 2);
          ctx.fill();

          // Outer turned wheel rim
          ctx.strokeStyle = '#6e4f30';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx, cy - 4, 18, 0, Math.PI * 2);
          ctx.stroke();

          // 8 Spoke handles extending outward
          ctx.strokeStyle = PALETTE.Lantern;
          ctx.lineWidth = 2.5;
          for (let s = 0; s < 8; s++) {
            const angle = (s * Math.PI) / 4 + time * 0.2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * 8, cy - 4 + Math.sin(angle) * 8);
            ctx.lineTo(cx + Math.cos(angle) * 24, cy - 4 + Math.sin(angle) * 24);
            ctx.stroke();
          }

          // Brass central boss hub
          ctx.fillStyle = PALETTE.Lantern;
          ctx.beginPath();
          ctx.arc(cx, cy - 4, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'lifeboat': {
        // Clinker-built wooden cutter on davits
        ctx.fillStyle = 'rgba(14, 38, 52, 0.4)';
        ctx.fillRect(screenX, screenY, size, size);

        // White-washed wooden hull with sheer curve
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.ellipse(screenX + size / 2, screenY + size / 2, size / 2 - 4, size / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Canvas tarpaulin cover
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.ellipse(screenX + size / 2, screenY + size / 2, size / 2 - 10, size / 3 - 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Davit arm clamps
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(screenX + 8, screenY + 4, 6, size - 8);
        break;
      }

      case 'chest': {
        if (scene === 'deck') {
          // Stacked brine barrels and salt-pork crates
          ctx.fillStyle = PALETTE.Driftwood;
          ctx.fillRect(screenX, screenY, size, size);

          // Round wooden brine barrel
          const cx = screenX + size / 2;
          const cy = screenY + size / 2;

          ctx.fillStyle = '#634931';
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.fill();

          // Dark iron barrel hoops
          ctx.strokeStyle = '#18120c';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.stroke();

          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.stroke();

          // Bung hole
          ctx.fillStyle = PALETTE.Tar;
          ctx.beginPath();
          ctx.arc(cx + 6, cy - 4, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Iron-banded gold treasure chest in hold
          ctx.fillStyle = '#33271c';
          ctx.fillRect(screenX, screenY, size, size);

          ctx.fillStyle = '#5c4028';
          ctx.fillRect(screenX + 12, screenY + 16, size - 24, size - 32);

          ctx.strokeStyle = PALETTE.Lantern;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(screenX + 12, screenY + 16, size - 24, size - 32);

          // Brass hasp and lock plate
          ctx.fillStyle = PALETTE.Lantern;
          ctx.fillRect(screenX + size / 2 - 4, screenY + size / 2 - 4, 8, 10);
        }
        break;
      }

      case 'statue': {
        if (scene === 'deck') {
          // Bow anchor windlass capstan
          ctx.fillStyle = PALETTE.Driftwood;
          ctx.fillRect(screenX, screenY, size, size);

          const cx = screenX + size / 2;
          const cy = screenY + size / 2;

          // Flanged base
          ctx.fillStyle = '#36271a';
          ctx.beginPath();
          ctx.arc(cx, cy, 24, 0, Math.PI * 2);
          ctx.fill();

          // Iron pawl ring
          ctx.strokeStyle = '#18120c';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Wooden barrel drum
          ctx.fillStyle = '#6e5135';
          ctx.beginPath();
          ctx.arc(cx, cy, 15, 0, Math.PI * 2);
          ctx.fill();

          // Radial bar sockets
          ctx.fillStyle = PALETTE.Lantern;
          for (let b = 0; b < 6; b++) {
            const angle = (b * Math.PI) / 3;
            ctx.fillRect(cx + Math.cos(angle) * 11 - 2, cy + Math.sin(angle) * 11 - 2, 4, 4);
          }
        } else {
          // Petrified statue in hold
          ctx.fillStyle = '#33271c';
          ctx.fillRect(screenX, screenY, size, size);

          ctx.fillStyle = '#4b5563';
          ctx.beginPath();
          ctx.arc(screenX + size / 2, screenY + 24, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillRect(screenX + size / 2 - 12, screenY + 38, 24, 24);

          // Salt crust glint
          ctx.fillStyle = PALETTE.TideGlow;
          ctx.fillRect(screenX + size / 2 - 4, screenY + 22, 3, 3);
        }
        break;
      }

      case 'relic': {
        // The Kaal Mani in hold: pulsing turquoise crystal
        ctx.fillStyle = '#221a12';
        ctx.fillRect(screenX, screenY, size, size);

        const cx = screenX + size / 2;
        const cy = screenY + size / 2;
        const pulse = 0.5 + 0.5 * Math.sin(time * 3);

        ctx.save();
        ctx.shadowColor = PALETTE.TideGlow;
        ctx.shadowBlur = 20 + pulse * 10;

        // Radiant crystal aura
        ctx.fillStyle = PALETTE.TideGlow;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28);
        ctx.lineTo(cx + 20, cy);
        ctx.lineTo(cx, cy + 28);
        ctx.lineTo(cx - 20, cy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#e8f0f5';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'hold_floor': {
        ctx.fillStyle = '#382b1e';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = '#1f170f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(screenX, screenY, size, size);

        ctx.beginPath();
        ctx.moveTo(screenX, screenY + size / 2);
        ctx.lineTo(screenX + size, screenY + size / 2);
        ctx.stroke();
        break;
      }

      case 'wall': {
        ctx.fillStyle = '#211810';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.strokeStyle = '#120d08';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, size, size);

        // Ribbed beam supports
        ctx.fillStyle = '#332519';
        ctx.fillRect(screenX + 6, screenY + 6, size - 12, size - 12);
        break;
      }

      case 'galley': {
        ctx.fillStyle = '#423325';
        ctx.fillRect(screenX, screenY, size, size);

        ctx.fillStyle = '#241a12';
        ctx.fillRect(screenX + 8, screenY + 8, size - 16, size - 16);
        break;
      }

      case 'empty':
      default:
        // Ocean water flows through underneath via Layer 1
        break;
    }
  }

  /**
   * Highlights the active interactable with tight, small nautical brass corner brackets
   * and soft golden aura, hugging the visible object's bounds (1/4 to 1/2 size).
   * Supports per-object highlightSize data.
   */
  private drawInteractableHighlight(
    interactable: NonNullable<ReadonlyGameState['activeInteractable']>,
    camX: number,
    camY: number,
    time: number
  ): void {
    const { ctx } = this;
    const { TILE_SIZE } = CONFIG;

    const baseW = interactable.width ?? 1;
    const baseH = interactable.height ?? 1;
    const bounds = interactable.highlightSize;

    // Use per-object tunable highlight bounds or default to tight 0.5 size centered
    const hlW = (bounds?.width ?? (baseW * 0.5)) * TILE_SIZE;
    const hlH = (bounds?.height ?? (baseH * 0.5)) * TILE_SIZE;
    const hlOffsetX = (bounds?.offsetX ?? ((baseW - (bounds?.width ?? (baseW * 0.5))) / 2)) * TILE_SIZE;
    const hlOffsetY = (bounds?.offsetY ?? ((baseH - (bounds?.height ?? (baseH * 0.5))) / 2)) * TILE_SIZE;

    const ix = interactable.x * TILE_SIZE + hlOffsetX - camX;
    const iy = interactable.y * TILE_SIZE + hlOffsetY - camY;

    const pulse = 0.5 + 0.5 * Math.sin(time * 5);

    ctx.save();

    // 1. Soft subtle golden ambient glow
    ctx.fillStyle = `rgba(229, 169, 59, ${0.08 + pulse * 0.06})`;
    ctx.fillRect(ix, iy, hlW, hlH);

    // 2. Small nautical brass corner brackets (tight, hugging bounds)
    const armLen = Math.max(5, Math.min(8, hlW / 4, hlH / 4));
    ctx.strokeStyle = PALETTE.Lantern;
    ctx.lineWidth = 1.8;

    // Top-Left corner
    ctx.beginPath();
    ctx.moveTo(ix, iy + armLen);
    ctx.lineTo(ix, iy);
    ctx.lineTo(ix + armLen, iy);
    ctx.stroke();

    // Top-Right corner
    ctx.beginPath();
    ctx.moveTo(ix + hlW - armLen, iy);
    ctx.lineTo(ix + hlW, iy);
    ctx.lineTo(ix + hlW, iy + armLen);
    ctx.stroke();

    // Bottom-Left corner
    ctx.beginPath();
    ctx.moveTo(ix, iy + hlH - armLen);
    ctx.lineTo(ix, iy + hlH);
    ctx.lineTo(ix + armLen, iy + hlH);
    ctx.stroke();

    // Bottom-Right corner
    ctx.beginPath();
    ctx.moveTo(ix + hlW - armLen, iy + hlH);
    ctx.lineTo(ix + hlW, iy + hlH);
    ctx.lineTo(ix + hlW, iy + hlH - armLen);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Natural, grounded walking gait:
   * - Torso stays grounded with NO jumping/hopping bob!
   * - Dark mariner leather boots stride with alternating cadence when moving.
   * - Cleanly planted side-by-side when standing still.
   */
  private drawPlayer(player: ReadonlyGameState['player'], px: number, py: number): void {
    const { ctx } = this;

    ctx.save();

    // 1. Grounded drop shadow
    ctx.fillStyle = 'rgba(7, 9, 15, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px, py + 18, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Mariner Leather Boots (Natural grounded walking stride)
    const isMoving = player.isMoving;
    const walkTimer = player.walkTimer;
    const stride = isMoving ? Math.sin(walkTimer * 7) * 4 : 0;

    ctx.fillStyle = '#18120c'; // Dark leather boot
    if (player.facing === 'up' || player.facing === 'down') {
      // Left boot
      ctx.fillRect(px - 9, py + 12 + stride, 6, 8);
      // Right boot
      ctx.fillRect(px + 3, py + 12 - stride, 6, 8);
    } else if (player.facing === 'left') {
      // Side profile stride
      ctx.fillRect(px - 6 + stride, py + 12, 8, 7);
      ctx.fillRect(px - 2 - stride, py + 13, 8, 7);
    } else {
      // Right side profile stride
      ctx.fillRect(px - 6 - stride, py + 12, 8, 7);
      ctx.fillRect(px - 2 + stride, py + 13, 8, 7);
    }

    // Brass boot buckles
    ctx.fillStyle = 'rgba(229, 169, 59, 0.6)';
    ctx.fillRect(px - 8, py + 14 + (isMoving ? stride : 0), 2, 2);
    ctx.fillRect(px + 4, py + 14 - (isMoving ? stride : 0), 2, 2);

    // 3. Angarakha Coat Body (Deep sea blue-grey, grounded)
    ctx.fillStyle = '#22303c';
    ctx.fillRect(px - 13, py - 14, 26, 26);

    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(px - 13, py - 14, 26, 26);

    // Coat hem trim
    ctx.strokeStyle = '#374957';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 13, py + 10);
    ctx.lineTo(px + 13, py + 10);
    ctx.stroke();

    // 4. Waist Sash in Tide Glow turquoise
    ctx.fillStyle = PALETTE.TideGlow;
    ctx.fillRect(px - 14, py + 1, 28, 5);
    // Hanging knot sash ends
    ctx.fillRect(px + (player.facing === 'left' ? -10 : 4), py + 6, 5, 8);

    // 5. Head Turban / Cowl in Bone
    ctx.fillStyle = PALETTE.Bone;
    ctx.beginPath();
    ctx.arc(px, py - 23, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Turban fabric wrap fold
    ctx.strokeStyle = '#c4b5a0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(px, py - 22, 10, -0.2, Math.PI * 0.9);
    ctx.stroke();

    // 6. Face shadow in Tar
    ctx.fillStyle = PALETTE.Tar;
    ctx.beginPath();
    ctx.arc(px, py - 21, 8, 0, Math.PI * 2);
    ctx.fill();

    // 7. 4-Direction Eye Glint
    ctx.fillStyle = PALETTE.Lantern;
    if (player.facing === 'down') {
      ctx.fillRect(px - 4, py - 21, 2, 2);
      ctx.fillRect(px + 2, py - 21, 2, 2);
    } else if (player.facing === 'up') {
      ctx.fillStyle = PALETTE.Ash;
      ctx.fillRect(px - 3, py - 24, 6, 2);
    } else if (player.facing === 'left') {
      ctx.fillRect(px - 5, py - 21, 2, 2);
    } else if (player.facing === 'right') {
      ctx.fillRect(px + 3, py - 21, 2, 2);
    }

    ctx.restore();
  }

  /**
   * Bhima the Cook NPC (Procedural visual sprite for P3 test)
   * Stained canvas apron over coarse tunic, earring, ladle/spoon.
   */
  private drawBhimaNPC(bx: number, by: number): void {
    const { ctx } = this;
    ctx.save();

    // 1. Drop shadow
    ctx.fillStyle = 'rgba(7, 9, 15, 0.45)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 18, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Heavy work boots
    ctx.fillStyle = '#221a14';
    ctx.fillRect(bx - 9, by + 12, 7, 8);
    ctx.fillRect(bx + 2, by + 12, 7, 8);

    // 3. Stained Canvas Apron & Cook Robes
    ctx.fillStyle = '#3c2e22'; // Dark tunic underneath
    ctx.fillRect(bx - 14, by - 14, 28, 26);

    ctx.fillStyle = '#d4c5a9'; // Bone stained apron
    ctx.fillRect(bx - 10, by - 10, 20, 22);

    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(bx - 10, by - 10, 20, 22);

    // Apron bib straps
    ctx.strokeStyle = '#8c7b64';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 7, by - 10);
    ctx.lineTo(bx - 5, by - 14);
    ctx.moveTo(bx + 7, by - 10);
    ctx.lineTo(bx + 5, by - 14);
    ctx.stroke();

    // Grease & turmeric stains on apron
    ctx.fillStyle = 'rgba(163, 114, 43, 0.5)';
    ctx.beginPath();
    ctx.arc(bx - 3, by - 2, 4, 0, Math.PI * 2);
    ctx.arc(bx + 4, by + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head & Turban
    ctx.fillStyle = '#a69076'; // Ochre/weathered cloth wrap
    ctx.beginPath();
    ctx.arc(bx, by - 23, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Face shadow
    ctx.fillStyle = PALETTE.Tar;
    ctx.beginPath();
    ctx.arc(bx, by - 21, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Gold hoop earring in left ear
    ctx.strokeStyle = PALETTE.Lantern;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(bx - 8, by - 20, 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes glinting
    ctx.fillStyle = PALETTE.Lantern;
    ctx.fillRect(bx - 3, by - 21, 2, 2);
    ctx.fillRect(bx + 2, by - 21, 2, 2);

    // 5. Wooden Cook Spoon tucked in sash
    ctx.fillStyle = '#9c6f44';
    ctx.fillRect(bx + 9, by - 8, 3, 18);
    ctx.beginPath();
    ctx.ellipse(bx + 10.5, by - 10, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Floating Interaction Prompt Badge [E] centered above the interactable's bounds.
   */
  private drawInteractionPrompt(
    interactable: NonNullable<ReadonlyGameState['activeInteractable']>,
    cameraX: number,
    cameraY: number
  ): void {
    const { ctx } = this;
    const { TILE_SIZE } = CONFIG;

    const baseW = interactable.width ?? 1;
    const baseH = interactable.height ?? 1;
    const bounds = interactable.highlightSize;
    const hlW = (bounds?.width ?? (baseW * 0.5)) * TILE_SIZE;
    const hlOffsetX = (bounds?.offsetX ?? ((baseW - (bounds?.width ?? (baseW * 0.5))) / 2)) * TILE_SIZE;
    const hlOffsetY = (bounds?.offsetY ?? ((baseH - (bounds?.height ?? (baseH * 0.5))) / 2)) * TILE_SIZE;

    const screenX = (interactable.x * TILE_SIZE + hlOffsetX + hlW / 2) - cameraX;
    const screenY = (interactable.y * TILE_SIZE + hlOffsetY) - cameraY - 14;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Key prompt badge "[E]" in Lantern
    const badgeWidth = 34;
    const badgeHeight = 26;
    ctx.fillStyle = PALETTE.Lantern;
    ctx.fillRect(screenX - badgeWidth / 2, screenY - badgeHeight, badgeWidth, badgeHeight);

    ctx.strokeStyle = PALETTE.Tar;
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - badgeWidth / 2, screenY - badgeHeight, badgeWidth, badgeHeight);

    ctx.fillStyle = PALETTE.Tar;
    ctx.font = 'bold 15px monospace';
    ctx.fillText('E', screenX, screenY - badgeHeight / 2);

    // Label pill underneath
    ctx.font = '13px monospace';
    const textWidth = ctx.measureText(interactable.label).width;
    const pillPadding = 12;

    ctx.fillStyle = 'rgba(7, 9, 15, 0.9)';
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
