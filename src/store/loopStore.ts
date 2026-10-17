import { create } from 'zustand';
import { CONFIG, startTimeForDeaths } from '../config';
import { initialPersisted, useMemoryStore } from './memoryStore';

export interface LoopState {
  shipTime: number; // starts at deathCount * RESPAWN_SHIFT
  inventory: string[];
  npcStates: Record<string, any>;
  playerPos: { x: number; y: number }; // In tile coordinates
  scene: 'deck' | 'hold';
  flags: Record<string, boolean>; // doors, safe, mutiny, etc.
  plates: Record<string, boolean>;
  timeScale: number;
  isPaused: boolean;
  hasLearnedNewThisLoop: boolean;
  latestLearnedText: string | null;

  // Actions
  reset: (startTime?: number, defaultSpawn?: { x: number; y: number }) => void;
  tick: (dt: number) => void;
  setTimeScale: (scale: number) => void;
  setPaused: (paused: boolean) => void;
  setPlayerPos: (pos: { x: number; y: number }) => void;
  setScene: (scene: 'deck' | 'hold') => void;
  setFlag: (key: string, val: boolean) => void;
  markLearned: (text?: string) => void;
  setShipTime: (time: number) => void;
}

export const useLoopStore = create<LoopState>((set, get) => ({
  shipTime: startTimeForDeaths(initialPersisted.deathCount ?? 0),
  inventory: [],
  npcStates: {},
  playerPos: { x: 8, y: 4 }, // Tile coordinates on main deck
  scene: 'deck',
  flags: {},
  plates: {},
  timeScale: CONFIG.TIME_SCALE,
  isPaused: false,
  hasLearnedNewThisLoop: false,
  latestLearnedText: null,

  reset: (startTime?: number, defaultSpawn = { x: 8, y: 4 }) => {
    const targetStartTime =
      startTime !== undefined ? startTime : startTimeForDeaths(useMemoryStore.getState().deathCount);
    set({
      shipTime: Math.min(targetStartTime, CONFIG.TIMELINE),

      inventory: [],
      npcStates: {},
      playerPos: defaultSpawn,
      scene: 'deck',
      flags: {},
      plates: {},
      hasLearnedNewThisLoop: false,
      latestLearnedText: null,
      isPaused: false,
    });
  },

  tick: (dt: number) => {
    const { isPaused, timeScale, shipTime } = get();
    if (isPaused) return;

    const nextTime = Math.min(CONFIG.TIMELINE, shipTime + dt * timeScale);
    set({ shipTime: nextTime });
  },

  setTimeScale: (scale: number) => {
    set({ timeScale: Math.max(0.25, Math.min(scale, 10)) });
  },

  setPaused: (paused: boolean) => {
    set({ isPaused: paused });
  },

  setPlayerPos: (pos: { x: number; y: number }) => {
    set({ playerPos: pos });
  },

  setScene: (scene: 'deck' | 'hold') => {
    set({ scene });
  },

  setFlag: (key: string, val: boolean) => {
    set((state) => ({
      flags: { ...state.flags, [key]: val },
    }));
  },

  markLearned: (text?: string) => {
    set({
      hasLearnedNewThisLoop: true,
      latestLearnedText: text ?? 'A fragment of hidden truth.',
    });
  },

  setShipTime: (time: number) => {
    set({ shipTime: Math.max(0, Math.min(time, CONFIG.TIMELINE)) });
  },
}));
