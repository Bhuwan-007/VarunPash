import { create } from 'zustand';
import { CONFIG, startTimeForDeaths } from '../config';
import { initialPersisted, useMemoryStore } from './memoryStore';

export interface LoopState {
  shipTime: number; // starts at deathCount * RESPAWN_SHIFT
  inventory: string[];
  coins: number;
  chargedNpcsThisLoop: string[];
  npcStates: Record<string, any>;
  playerPos: { x: number; y: number }; // In tile coordinates
  scene: 'deck' | 'hold';
  flags: Record<string, boolean>; // doors, safe, mutiny, etc.
  plates: Record<string, boolean>;
  timeScale: number;
  isPaused: boolean;
  hasLearnedNewThisLoop: boolean;
  latestLearnedText: string | null;
  learnedEntriesThisLoop: string[];

  strongboxOpened: boolean;
  strongboxJammed: boolean;
  strongboxWrongAttempts: number;
  hasPickedDeckLocketThisLoop: boolean;
  lifeboatsLaunched: boolean;

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
  spendCoins: (count: number) => boolean;
  addCoins: (count: number) => void;
  addItem: (item: string) => void;
  recordChargedNpc: (npcId: string) => void;
  grantRoleStartingInventory: () => void;
  openStrongbox: () => void;
  recordWrongStrongboxAttempt: () => boolean;
  pickDeckLocket: () => void;
  launchLifeboats: () => void;
}

export function getStartingInventoryForRole(role: 'navigator' | 'quartermaster' | 'deckhand' | null | undefined): {
  inventory: string[];
  coins: number;
} {
  switch (role) {
    case 'navigator':
      return { inventory: ['Map'], coins: 0 };
    case 'quartermaster':
      return { inventory: ['Armory Key', 'Hold Key'], coins: 6 };
    case 'deckhand':
    default:
      return { inventory: [], coins: 0 };
  }
}

const initialRole = initialPersisted.playerRole ?? 'deckhand';
const initialRoleItems = getStartingInventoryForRole(initialRole);

export const useLoopStore = create<LoopState>((set, get) => ({
  shipTime: startTimeForDeaths(initialPersisted.deathCount ?? 0),
  inventory: initialRoleItems.inventory,
  coins: initialRoleItems.coins,
  chargedNpcsThisLoop: [],
  npcStates: {},
  playerPos: { x: 7, y: 10 }, // Tile coordinates on main deck
  scene: 'deck',
  flags: {},
  plates: {},
  timeScale: CONFIG.TIME_SCALE,
  isPaused: false,
  hasLearnedNewThisLoop: false,
  latestLearnedText: null,
  learnedEntriesThisLoop: [],
  strongboxOpened: false,
  strongboxJammed: false,
  strongboxWrongAttempts: 0,
  hasPickedDeckLocketThisLoop: false,
  lifeboatsLaunched: false,

  reset: (startTime?: number, defaultSpawn = { x: 7, y: 10 }) => {
    const targetStartTime =
      startTime !== undefined ? startTime : startTimeForDeaths(useMemoryStore.getState().deathCount);
    const role = useMemoryStore.getState().playerRole;
    const roleItems = getStartingInventoryForRole(role);

    set({
      shipTime: Math.min(targetStartTime, CONFIG.TIMELINE),

      inventory: [...roleItems.inventory],
      coins: roleItems.coins,
      chargedNpcsThisLoop: [],
      strongboxOpened: false,
      strongboxJammed: false,
      strongboxWrongAttempts: 0,
      hasPickedDeckLocketThisLoop: false,
      lifeboatsLaunched: false,
      npcStates: {},
      playerPos: defaultSpawn,
      scene: 'deck',
      flags: {},
      plates: {},
      hasLearnedNewThisLoop: false,
      latestLearnedText: null,
      learnedEntriesThisLoop: [],
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
    const current = get().learnedEntriesThisLoop;
    const newEntry = text ?? 'A fragment of hidden truth.';
    const updated = current.includes(newEntry) ? current : [...current, newEntry].slice(-2);
    set({
      hasLearnedNewThisLoop: true,
      learnedEntriesThisLoop: updated,
      latestLearnedText: updated.join('\n\n'),
    });
  },

  setShipTime: (time: number) => {
    set({ shipTime: Math.max(0, Math.min(time, CONFIG.TIMELINE)) });
  },

  spendCoins: (count: number) => {
    const current = get().coins;
    if (current < count) return false;
    set({ coins: current - count });
    return true;
  },

  addCoins: (count: number) => {
    set((state) => ({ coins: state.coins + count }));
  },

  recordChargedNpc: (npcId: string) => {
    set((state) => ({
      chargedNpcsThisLoop: state.chargedNpcsThisLoop.includes(npcId)
        ? state.chargedNpcsThisLoop
        : [...state.chargedNpcsThisLoop, npcId],
    }));
  },

  grantRoleStartingInventory: () => {
    const role = useMemoryStore.getState().playerRole;
    const roleItems = getStartingInventoryForRole(role);
    set({
      inventory: [...roleItems.inventory],
      coins: roleItems.coins,
    });
  },

  addItem: (item: string) => {
    const current = get().inventory;
    if (!current.includes(item)) {
      set({ inventory: [...current, item] });
    }
  },

  openStrongbox: () => {
    set({ strongboxOpened: true });
  },

  recordWrongStrongboxAttempt: () => {
    const next = get().strongboxWrongAttempts + 1;
    const isJammed = next >= 3;
    set({
      strongboxWrongAttempts: next,
      strongboxJammed: isJammed,
    });
    return isJammed;
  },

  pickDeckLocket: () => {
    set({ hasPickedDeckLocketThisLoop: true });
    get().addItem('Silver Locket');
  },

  launchLifeboats: () => {
    set({ lifeboatsLaunched: true });
    useMemoryStore.getState().addJournalEntry({
      id: 'entry_boats_away',
      tab: 'Clues',
      title: 'Boats Away',
      text: 'The boats are away. Now the Kaal Mani.',
    });
  },
}));
