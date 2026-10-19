import { CONFIG, startTimeForDeaths } from '../../config';
import { useLoopStore } from '../../store/loopStore';
import { useMemoryStore } from '../../store/memoryStore';
import { useUIStore } from '../../store/uiStore';
import { DialogueManager } from '../dialogue/dialogueManager';
import { triggerMoment } from './moments';

export class LoopManager {
  private isDying: boolean = false;
  private onPlayerRespawnCallback?: (startScene: 'deck', startPos: { x: number; y: number }) => void;
  private onScreenShakeCallback?: (intensity: number, duration: number) => void;

  constructor() {}

  public setCallbacks(callbacks: {
    onRespawn: (startScene: 'deck', startPos: { x: number; y: number }) => void;
    onShake?: (intensity: number, duration: number) => void;
  }): void {
    this.onPlayerRespawnCallback = callbacks.onRespawn;
    this.onScreenShakeCallback = callbacks.onShake;
  }

  /**
   * Triggers player death, checks strategic vs wasted learning,
   * increments deathCount exactly once, and displays DeathToast.
   */
  public handleDeath(cause: string): void {
    if (this.isDying) return;
    this.isDying = true;

    const loopState = useLoopStore.getState();
    const memoryState = useMemoryStore.getState();
    const uiStore = useUIStore.getState();

    // Capture shipTime at moment of death
    const shipTimeAtDeath = loopState.shipTime;

    // Pause loop during death toast sequence
    loopState.setPaused(true);

    // Trigger visual screen shake effect
    if (this.onScreenShakeCallback) {
      this.onScreenShakeCallback(12, 0.4);
    }

    // Determine strategic vs wasted death
    const wasStrategic = loopState.hasLearnedNewThisLoop;
    const rememberedText = loopState.latestLearnedText ?? undefined;

    // Record death in persisted MemoryStore
    const result = memoryState.recordDeath(cause, wasStrategic, rememberedText, shipTimeAtDeath);
    const newDeathCount = useMemoryStore.getState().deathCount;

    // Show DeathToast via UIStore
    uiStore.showDeathToast({
      strategic: result.strategic,
      cause,
      remembered: result.strategic ? rememberedText : undefined,
    });

    console.log(
      `[LoopManager] Death #${newDeathCount} (${cause}) at shipTime ${shipTimeAtDeath.toFixed(1)}s. Strategic: ${
        result.strategic
      }. Next loop start: ${startTimeForDeaths(newDeathCount)}s`
    );
  }

  /**
   * Completes the death sequence, resets the loop, applies the respawn time shift,
   * and repositions the player.
   */
  public respawn(): void {
    const memoryState = useMemoryStore.getState();
    const loopState = useLoopStore.getState();
    const uiStore = useUIStore.getState();

    uiStore.hideDeathToast();

    // PLACEHOLDER: Currently silently resets game at 20 deaths.
    // In P8, this placeholder will be replaced with the hidden Drowned Loop ending (four-panel cutscene) before resetting.
    if (memoryState.deathCount >= CONFIG.MAX_DEATHS) {
      this.fullResetGame();
      return;
    }

    // Calculate new loop starting shipTime = startTimeForDeaths(deathCount)
    const newStartTime = startTimeForDeaths(memoryState.deathCount);
    const defaultDeckSpawn = { x: 7, y: 10 };

    // Reset loop state for the next run
    loopState.reset(newStartTime, defaultDeckSpawn);

    // Reposition player in game engine
    if (this.onPlayerRespawnCallback) {
      this.onPlayerRespawnCallback('deck', defaultDeckSpawn);
    }

    if (memoryState.deathCount >= 1) {
      triggerMoment('wake');
    }

    this.isDying = false;
  }

  /**
   * BUG 2 Requirement:
   * RESTART LOOP: restarts the current loop at the same start time (startTimeForDeaths(deathCount)),
   * no death counted.
   */
  public restartLoop(): void {
    const memoryState = useMemoryStore.getState();
    const loopState = useLoopStore.getState();
    const uiStore = useUIStore.getState();

    uiStore.hideDeathToast();
    this.isDying = false;

    const currentStartTime = startTimeForDeaths(memoryState.deathCount);
    const defaultDeckSpawn = { x: 7, y: 10 };

    loopState.reset(currentStartTime, defaultDeckSpawn);

    if (this.onPlayerRespawnCallback) {
      this.onPlayerRespawnCallback('deck', defaultDeckSpawn);
    }

    console.log(`[LoopManager] Restarted loop at ${currentStartTime}s without incrementing deathCount.`);
  }

  /**
   * BUG 2 Requirement:
   * NEW GAME (FULL RESET): deathCount = 0, shipTime = 0 (10:00 left),
   * clear the persisted MemoryStore (knowledge, journal, endingsSeen),
   * re-roll playerRole, clear tally marks, hide the death toast, reset all LoopStore state.
   */
  public fullResetGame(): void {
    const memoryState = useMemoryStore.getState();
    const loopState = useLoopStore.getState();
    const uiStore = useUIStore.getState();

    // 1. Reset memory store (clears knowledge, journal, endingsSeen, deathCount = 0, re-rolls playerRole)
    memoryState.newGame(true);

    // Reset dialogue seen states for a fresh game
    DialogueManager.resetShownLines();

    // 2. Hide death toast & close any open dialogue or journal
    uiStore.hideDeathToast();
    uiStore.closeDialogue();
    uiStore.setJournalOpen(false);
    this.isDying = false;

    // 3. Reset loop store to 0 (deathCount = 0 -> startTime = 0)
    const defaultDeckSpawn = { x: 7, y: 10 };
    loopState.reset(startTimeForDeaths(0), defaultDeckSpawn);

    // 4. Reposition player and camera to deck spawn
    if (this.onPlayerRespawnCallback) {
      this.onPlayerRespawnCallback('deck', defaultDeckSpawn);
    }

    console.log('[LoopManager] Executed NEW GAME (FULL RESET). All state cleared.');
  }

  public isDeathInProgress(): boolean {
    return this.isDying;
  }
}

