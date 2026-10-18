import { playGullCry, playMakaraRumble } from '../../utils/audio';

export interface EventStatus {
  phase: 'calm' | 'gull_omen' | 'mutiny' | 'makara' | 'sinking';
  gullPresent: boolean;
  mutinyActive: boolean;
  makaraActive: boolean;
  portLethal: boolean;
  sunk: boolean;
}

export class EventScheduler {
  private lastTriggeredGull: number = -1;
  private lastTriggeredMakara: number = -1;

  public reset(): void {
    this.lastTriggeredGull = -1;
    this.lastTriggeredMakara = -1;
  }

  /**
   * Pure function: calculates the exact world event status for any given shipTime.
   */
  public static getEventStatus(shipTime: number, mutinyStopped: boolean = false): EventStatus {
    const sunk = shipTime >= 600;
    const makaraActive = shipTime >= 480;
    const mutinyActive = shipTime >= 360 && !mutinyStopped;
    const gullPresent = shipTime >= 355 && shipTime < 360;

    let phase: EventStatus['phase'] = 'calm';
    if (sunk) phase = 'sinking';
    else if (makaraActive) phase = 'makara';
    else if (mutinyActive) phase = 'mutiny';
    else if (gullPresent) phase = 'gull_omen';

    return {
      phase,
      gullPresent,
      mutinyActive,
      makaraActive,
      portLethal: makaraActive,
      sunk,
    };
  }

  /**
   * Ticks event transitions and plays audio/screen shake on runtime crossings.
   */
  public update(
    currentShipTime: number,
    previousShipTime: number,
    callbacks: {
      onShake?: (intensity: number, duration: number) => void;
      onDeath?: (cause: string) => void;
    }
  ): void {
    // 1. Gull omen cry at 355
    if (previousShipTime < 355 && currentShipTime >= 355 && this.lastTriggeredGull !== Math.floor(currentShipTime / 600)) {
      this.lastTriggeredGull = Math.floor(currentShipTime / 600);
      playGullCry();
    }

    // 2. Makara breach at 480
    if (previousShipTime < 480 && currentShipTime >= 480 && this.lastTriggeredMakara !== Math.floor(currentShipTime / 600)) {
      this.lastTriggeredMakara = Math.floor(currentShipTime / 600);
      playMakaraRumble();
      if (callbacks.onShake) {
        callbacks.onShake(14, 2.5);
      }
    }

    // 3. Sinking at 600
    if (currentShipTime >= 600 && callbacks.onDeath) {
      callbacks.onDeath('drowned in sinking');
    }
  }
}
