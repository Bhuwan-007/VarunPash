import { CONFIG } from '../../config';
import { resolveMovement } from '../collision';
import { GameMap } from '../world/deckMap';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerState {
  x: number; // In tile units
  y: number; // In tile units
  facing: Direction;
  isMoving: boolean;
  walkTimer: number;
}

export class Player {
  public x: number;
  public y: number;
  public facing: Direction = 'down';
  public isMoving: boolean = false;
  public walkTimer: number = 0;

  constructor(initialX: number, initialY: number) {
    this.x = initialX;
    this.y = initialY;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.isMoving = false;
  }

  public update(
    moveDir: { dx: number; dy: number },
    dt: number,
    map: GameMap
  ): void {
    const { dx, dy } = moveDir;

    if (dx !== 0 || dy !== 0) {
      this.isMoving = true;
      this.walkTimer += dt * 8; // step frequency

      // Update 4-direction facing
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }

      // Calculate desired delta in tile units
      const moveDistance = CONFIG.PLAYER_SPEED * dt;
      const deltaX = dx * moveDistance;
      const deltaY = dy * moveDistance;

      // Resolve collision against solid tiles (0.28 half-width allows fitting through 1-tile passages)
      const resolved = resolveMovement(map, this.x, this.y, deltaX, deltaY, 0.28, 0.28);
      this.x = resolved.x;
      this.y = resolved.y;
    } else {
      this.isMoving = false;
      this.walkTimer = 0;
    }
  }

  public getState(): PlayerState {
    return {
      x: this.x,
      y: this.y,
      facing: this.facing,
      isMoving: this.isMoving,
      walkTimer: this.walkTimer,
    };
  }
}
