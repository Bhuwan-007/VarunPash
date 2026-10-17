import { CONFIG } from '../config';
import { Camera } from './camera';
import { Player, PlayerState } from './entities/player';
import { InputManager } from './input';
import { createDeckMap, GameMap } from './world/deckMap';
import { createHoldMap } from './world/holdMap';
import { Interactable, isWithinInteractRadius, SceneId } from './world/interactables';

export interface ReadonlyGameState {
  readonly scene: SceneId;
  readonly map: GameMap;
  readonly player: PlayerState;
  readonly camera: {
    readonly x: number;
    readonly y: number;
    readonly viewportWidth: number;
    readonly viewportHeight: number;
  };
  readonly activeInteractable: Interactable | null;
  readonly messageBanner: string | null;
  readonly frameTime: number;
}

export class GameEngine {
  private input: InputManager;
  private camera: Camera;
  private player: Player;
  private scene: SceneId = 'deck';
  private deckMap: GameMap;
  private holdMap: GameMap;

  private activeInteractable: Interactable | null = null;
  private messageBanner: string | null = null;
  private messageTimer: number = 0;

  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimestep: number = 1 / 60; // Fixed 60 Hz physics/logic timestep
  private frameTime: number = 0;

  private onRenderCallback?: (state: ReadonlyGameState) => void;

  constructor() {
    this.input = new InputManager();
    this.camera = new Camera();
    this.deckMap = createDeckMap();
    this.holdMap = createHoldMap();

    // Start on deck at designated spawn
    this.player = new Player(this.deckMap.spawnPosition.x, this.deckMap.spawnPosition.y);

    // Initial camera placement
    const targetPxX = this.player.x * CONFIG.TILE_SIZE;
    const targetPxY = this.player.y * CONFIG.TILE_SIZE;
    this.camera.update(targetPxX, targetPxY, this.deckMap.width, this.deckMap.height, true);
  }

  public setRenderCallback(callback: (state: ReadonlyGameState) => void): void {
    this.onRenderCallback = callback;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    requestAnimationFrame(this.gameLoop);
  }

  public stop(): void {
    this.isRunning = false;
  }

  public dispose(): void {
    this.stop();
    this.input.dispose();
  }

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning) return;

    // Elapsed real time in seconds, capped at 0.1s to avoid spiral of death on tab refocus
    let elapsed = (timestamp - this.lastTimestamp) / 1000;
    if (elapsed > 0.1) elapsed = 0.1;
    this.lastTimestamp = timestamp;
    this.accumulator += elapsed;
    this.frameTime += elapsed;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedTimestep) {
      this.update(this.fixedTimestep);
      this.accumulator -= this.fixedTimestep;
    }

    // Render current state
    if (this.onRenderCallback) {
      this.onRenderCallback(this.getReadonlyState());
    }

    requestAnimationFrame(this.gameLoop);
  };

  private getActiveMap(): GameMap {
    return this.scene === 'deck' ? this.deckMap : this.holdMap;
  }

  private update(dt: number): void {
    const activeMap = this.getActiveMap();

    // 1. Process movement
    const moveDir = this.input.getMovementVector();
    this.player.update(moveDir, dt, activeMap);

    // 2. Camera tracking
    const playerWorldPxX = this.player.x * CONFIG.TILE_SIZE;
    const playerWorldPxY = this.player.y * CONFIG.TILE_SIZE;
    this.camera.update(playerWorldPxX, playerWorldPxY, activeMap.width, activeMap.height);

    // 3. Proximity check for interactables
    let closest: Interactable | null = null;
    let minDistance = Infinity;

    for (const item of activeMap.interactables) {
      const centerX = item.x + (item.width ?? 1) / 2;
      const centerY = item.y + (item.height ?? 1) / 2;
      const dist = Math.hypot(this.player.x - centerX, this.player.y - centerY);

      if (dist <= CONFIG.INTERACT_RADIUS && dist < minDistance) {
        closest = item;
        minDistance = dist;
      }
    }
    this.activeInteractable = closest;

    // 4. Handle interact action [E]
    if (this.input.wasActionJustPressed('interact') && this.activeInteractable) {
      this.triggerInteraction(this.activeInteractable);
    }

    // 5. Message banner timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.messageBanner = null;
      }
    }

    // End frame input cleanup
    this.input.endFrame();
  }

  private triggerInteraction(interactable: Interactable): void {
    // Hatch transition between Deck and Hold
    if (interactable.type === 'hatch' && interactable.targetScene && interactable.targetPosition) {
      this.scene = interactable.targetScene;
      this.player.setPosition(interactable.targetPosition.x, interactable.targetPosition.y);

      // Snap camera immediately on scene change
      const newMap = this.getActiveMap();
      this.camera.update(
        this.player.x * CONFIG.TILE_SIZE,
        this.player.y * CONFIG.TILE_SIZE,
        newMap.width,
        newMap.height,
        true
      );

      this.messageBanner = this.scene === 'hold' ? 'Entered Cargo Hold' : 'Returned to Main Deck';
      this.messageTimer = 2.0;
    } else {
      // Non-hatch interactable examination feedback
      this.messageBanner = `Interacted with: ${interactable.label}`;
      this.messageTimer = 2.5;
    }
  }

  public getReadonlyState(): ReadonlyGameState {
    return {
      scene: this.scene,
      map: this.getActiveMap(),
      player: this.player.getState(),
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        viewportWidth: this.camera.viewportWidth,
        viewportHeight: this.camera.viewportHeight,
      },
      activeInteractable: this.activeInteractable,
      messageBanner: this.messageBanner,
      frameTime: this.frameTime,
    };
  }
}
