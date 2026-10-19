import { create } from 'zustand';
import { JOURNAL_ENTRIES } from '../data/journalEntries';

export interface JournalEntry {
  id: string;
  tab: 'Clues' | 'Tide Table' | 'People' | 'Codes' | string;
  text: string;
  loop?: number;
  title?: string;
  npcId?: string;
  code?: string;
  tideTime?: string;
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
  unreadTabs: Record<string, boolean>;
  deathCount: number; // drives respawn offset
  endingsSeen: string[];
  ghost: GhostFrame[] | null; // previous loop only
  lastDeathStrategic: boolean;
  lastDeathRemembered: string | null;
  shipTimeAtDeath: number | null;
  gullSeenLoops: number[];
  lastShownDialogue: Record<string, string[]>;
  storyLinesSeen: string[];

  // Actions
  addKnowledge: (flag: string, entry?: JournalEntry) => boolean;
  addJournalEntry: (entry: Omit<JournalEntry, 'loop'> & { loop?: number }) => boolean;
  markTabRead: (tab: string) => void;
  recordDeath: (
    cause: string,
    newDiscovered?: boolean,
    rememberedText?: string,
    shipTimeAtDeath?: number
  ) => { strategic: boolean };
  newGame: (fullReset?: boolean) => void;
  setPlayerRole: (role: 'navigator' | 'quartermaster' | 'deckhand') => void;
  recordGullSighting: (loopNumber: number) => boolean;
  recordEnding: (endingId: string) => void;
  recordShownLine: (npcId: string, lineId: string, isStory?: boolean) => void;
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
      gullSeenLoops: state.gullSeenLoops,
      lastShownDialogue: state.lastShownDialogue,
      storyLinesSeen: state.storyLinesSeen,
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
  unreadTabs: {},
  deathCount: initialPersisted.deathCount ?? 0,
  endingsSeen: initialPersisted.endingsSeen ?? [],
  ghost: initialPersisted.ghost ?? null,
  lastDeathStrategic: initialPersisted.lastDeathStrategic ?? false,
  lastDeathRemembered: initialPersisted.lastDeathRemembered ?? null,
  shipTimeAtDeath: initialPersisted.shipTimeAtDeath ?? null,
  gullSeenLoops: (initialPersisted as any).gullSeenLoops ?? [],
  lastShownDialogue: (initialPersisted as any).lastShownDialogue ?? {},
  storyLinesSeen: (initialPersisted as any).storyLinesSeen ?? [],

  addKnowledge: (flag: string, entry?: JournalEntry) => {
    const state = get();
    if (state.knowledge.includes(flag)) {
      return false;
    }

    const nextKnowledge = [...state.knowledge, flag];
    let nextJournal = state.journal;
    let nextUnread = state.unreadTabs;

    if (entry && !state.journal.some((e) => e.id === entry.id)) {
      nextJournal = [...state.journal, entry];
      nextUnread = { ...state.unreadTabs, [entry.tab]: true };
    }

    set({
      knowledge: nextKnowledge,
      journal: nextJournal,
      unreadTabs: nextUnread,
    });

    savePersistedState(get());
    return true;
  },

  addJournalEntry: (entry) => {
    const state = get();
    // Dedupe by id
    if (state.journal.some((e) => e.id === entry.id)) {
      return false;
    }

    const loopNumber = entry.loop ?? state.deathCount + 1;
    const fullEntry: JournalEntry = {
      ...entry,
      loop: loopNumber,
    };

    const nextJournal = [...state.journal, fullEntry];
    const nextUnread = { ...state.unreadTabs, [entry.tab]: true };

    set({
      journal: nextJournal,
      unreadTabs: nextUnread,
    });

    savePersistedState(get());
    return true;
  },

  markTabRead: (tab: string) => {
    const state = get();
    if (!state.unreadTabs[tab]) return;
    const nextUnread = { ...state.unreadTabs };
    delete nextUnread[tab];
    set({ unreadTabs: nextUnread });
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

  newGame: (fullReset: boolean = false) => {
    const roles: ('navigator' | 'quartermaster' | 'deckhand')[] = ['navigator', 'quartermaster', 'deckhand'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const existingEndings = fullReset ? [] : get().endingsSeen;
    const fresh: MemoryState = {
      playerRole: randomRole,
      knowledge: [],
      journal: [],
      unreadTabs: {},
      deathCount: 0,
      endingsSeen: existingEndings,
      ghost: null,
      lastDeathStrategic: false,
      lastDeathRemembered: null,
      shipTimeAtDeath: null,
      gullSeenLoops: [],
      lastShownDialogue: fullReset ? {} : get().lastShownDialogue,
      storyLinesSeen: fullReset ? [] : get().storyLinesSeen,
      addKnowledge: get().addKnowledge,
      addJournalEntry: get().addJournalEntry,
      markTabRead: get().markTabRead,
      recordDeath: get().recordDeath,
      newGame: get().newGame,
      setPlayerRole: get().setPlayerRole,
      recordGullSighting: get().recordGullSighting,
      recordEnding: get().recordEnding,
      recordShownLine: get().recordShownLine,
    };

    set(fresh);
    savePersistedState(fresh);
  },

  recordEnding: (endingId: string) => {
    const state = get();
    if (!state.endingsSeen.includes(endingId)) {
      const nextEndings = [...state.endingsSeen, endingId];
      set({ endingsSeen: nextEndings });
      savePersistedState(get());
    }
  },

  setPlayerRole: (role) => {
    set({ playerRole: role });
    savePersistedState(get());
  },

  recordGullSighting: (loopNumber: number) => {
    const state = get();
    if (state.gullSeenLoops.includes(loopNumber)) {
      return false;
    }
    const updated = [...state.gullSeenLoops, loopNumber];
    set({ gullSeenLoops: updated });
    savePersistedState(get());

    if (updated.length >= 3 && !state.knowledge.includes('K_OMEN_GULL')) {
      const def = JOURNAL_ENTRIES['K_OMEN_GULL'];
      const journalEntry = def
        ? {
          id: def.id,
          tab: def.tab,
          title: def.title,
          text: def.text,
          tideTime: def.tideTime,
          loop: state.deathCount + 1,
        }
        : undefined;
      state.addKnowledge('K_OMEN_GULL', journalEntry);
      return true;
    }
    return false;
  },

  recordShownLine: (npcId: string, lineId: string, isStory?: boolean) => {
    const state = get();
    const currentList = state.lastShownDialogue[npcId] ?? [];
    // Keep last 6 lines in memory, but dialogue selector checks last 3
    const nextList = [lineId, ...currentList.filter((id) => id !== lineId)].slice(0, 6);
    const nextLastShown = {
      ...state.lastShownDialogue,
      [npcId]: nextList,
    };
    let nextStorySeen = state.storyLinesSeen;
    if (isStory && !nextStorySeen.includes(lineId)) {
      nextStorySeen = [...nextStorySeen, lineId];
    }
    set({
      lastShownDialogue: nextLastShown,
      storyLinesSeen: nextStorySeen,
    });
    savePersistedState(get());
  },
}));

// Expose dev console command window.journalDump()
if (typeof window !== 'undefined') {
  (window as unknown as { journalDump: () => void }).journalDump = () => {
    const state = useMemoryStore.getState();
    console.group(`=== VARUNPASH JOURNAL DUMP (${state.journal.length} entries) ===`);
    console.log('Knowledge flags:', state.knowledge);
    const tabs = ['Clues', 'Tide Table', 'People', 'Codes'];
    for (const tab of tabs) {
      const entries = state.journal.filter((e) => e.tab === tab);
      console.group(`[Tab: ${tab}] (${entries.length} entries)`);
      entries.forEach((e, idx) => {
        console.log(`${idx + 1}. [${e.id}] ${e.title ? e.title + ' - ' : ''}"${e.text}" ${e.npcId ? `(NPC: ${e.npcId})` : ''}`);
      });
      console.groupEnd();
    }
    console.groupEnd();
  };
}
