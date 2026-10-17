import { create } from 'zustand';

export interface JournalEntry {
  id: string;
  tab: string;
  text: string;
  loop: number;
}

export interface GhostFrame {
  t: number;
  x: number;
  y: number;
  scene: 'deck' | 'hold';
}

export interface MemoryState {
  playerRole: 'navigator' | 'quartermaster' | 'deckhand' | null;
  knowledge: string[]; // flags from RULES.md
  journal: JournalEntry[];
  deathCount: number; // drives respawn offset
  endingsSeen: string[];
  ghost: GhostFrame[] | null; // previous loop only
  lastDeathStrategic: boolean;
  lastDeathRemembered: string | null;
  shipTimeAtDeath: number | null;

  // Actions
  addKnowledge: (flag: string, entry?: JournalEntry) => boolean;
  recordDeath: (
    cause: string,
    newDiscovered?: boolean,
    rememberedText?: string,
    shipTimeAtDeath?: number
  ) => { strategic: boolean };
  newGame: () => void;
  setPlayerRole: (role: 'navigator' | 'quartermaster' | 'deckhand') => void;
}


const STORAGE_KEY = 'varunpash_memory_store';

function loadPersistedState(): Partial<MemoryState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load MemoryStore from localStorage:', err);
  }
  return {};
}

function savePersistedState(state: MemoryState): void {
  try {
    const toSave = {
      playerRole: state.playerRole,
      knowledge: state.knowledge,
      journal: state.journal,
      deathCount: state.deathCount,
      endingsSeen: state.endingsSeen,
      ghost: state.ghost,
      lastDeathStrategic: state.lastDeathStrategic,
      lastDeathRemembered: state.lastDeathRemembered,
      shipTimeAtDeath: state.shipTimeAtDeath,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Failed to save MemoryStore to localStorage:', err);
  }
}

export const initialPersisted = loadPersistedState();

export const useMemoryStore = create<MemoryState>((set, get) => ({
  playerRole: initialPersisted.playerRole ?? 'deckhand',
  knowledge: initialPersisted.knowledge ?? [],
  journal: initialPersisted.journal ?? [],
  deathCount: initialPersisted.deathCount ?? 0,
  endingsSeen: initialPersisted.endingsSeen ?? [],
  ghost: initialPersisted.ghost ?? null,
  lastDeathStrategic: initialPersisted.lastDeathStrategic ?? false,
  lastDeathRemembered: initialPersisted.lastDeathRemembered ?? null,
  shipTimeAtDeath: initialPersisted.shipTimeAtDeath ?? null,

  addKnowledge: (flag: string, entry?: JournalEntry) => {
    const state = get();
    if (state.knowledge.includes(flag)) {
      return false;
    }

    const nextKnowledge = [...state.knowledge, flag];
    const nextJournal = entry ? [...state.journal, entry] : state.journal;

    set({
      knowledge: nextKnowledge,
      journal: nextJournal,
    });

    savePersistedState(get());
    return true;
  },

  recordDeath: (
    _cause: string,
    newDiscovered: boolean = false,
    rememberedText?: string,
    shipTimeAtDeath?: number
  ) => {
    const state = get();
    const nextDeathCount = state.deathCount + 1;
    const strategic = newDiscovered;

    set({
      deathCount: nextDeathCount,
      lastDeathStrategic: strategic,
      lastDeathRemembered: strategic ? (rememberedText ?? 'A fleeting truth etched into memory.') : null,
      shipTimeAtDeath: shipTimeAtDeath !== undefined ? shipTimeAtDeath : state.shipTimeAtDeath,
    });

    savePersistedState(get());
    return { strategic };
  },

  newGame: () => {
    const roles: ('navigator' | 'quartermaster' | 'deckhand')[] = ['navigator', 'quartermaster', 'deckhand'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const fresh: MemoryState = {
      playerRole: randomRole,
      knowledge: [],
      journal: [],
      deathCount: 0,
      endingsSeen: [],
      ghost: null,
      lastDeathStrategic: false,
      lastDeathRemembered: null,
      shipTimeAtDeath: null,
      addKnowledge: get().addKnowledge,
      recordDeath: get().recordDeath,
      newGame: get().newGame,
      setPlayerRole: get().setPlayerRole,
    };

    set(fresh);
    savePersistedState(fresh);
  },


  setPlayerRole: (role) => {
    set({ playerRole: role });
    savePersistedState(get());
  },
}));
