import { create } from 'zustand';
import { DialogueLine, DialogueManager } from '../game/dialogue/dialogueManager';
import { useLoopStore } from './loopStore';

export interface DeathToastData {
  visible: boolean;
  strategic: boolean;
  cause: string;
  remembered?: string;
}

export interface ActiveDialogueSession {
  npc: string;
  name: string;
  title?: string;
  line: DialogueLine;
}

export interface UIState {
  deathToast: DeathToastData | null;
  debugPanelOpen: boolean;
  journalOpen: boolean;
  journalPulse: boolean;
  activeCutsceneId: string | null;
  activeDialogue: ActiveDialogueSession | null;
  interactionIgnoreTimer: number;

  // Actions
  showDeathToast: (data: Omit<DeathToastData, 'visible'>) => void;
  hideDeathToast: () => void;
  toggleDebugPanel: () => void;
  setDebugPanelOpen: (open: boolean) => void;
  setJournalOpen: (open: boolean) => void;
  toggleJournal: () => void;
  triggerJournalPulse: () => void;
  setActiveCutsceneId: (id: string | null) => void;
  startDialogue: (npcId: string) => boolean;
  closeDialogue: () => void;
  setInteractionIgnoreTimer: (duration: number) => void;
}

let pulseTimeout: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set, get) => ({
  deathToast: null,
  debugPanelOpen: true, // Visible for dev testing per P2
  journalOpen: false,
  journalPulse: false,
  activeCutsceneId: null,
  activeDialogue: null,
  interactionIgnoreTimer: 0,

  showDeathToast: (data) => {
    set({
      deathToast: {
        visible: true,
        strategic: data.strategic,
        cause: data.cause,
        remembered: data.remembered,
      },
    });
  },

  hideDeathToast: () => {
    set({ deathToast: null });
  },

  toggleDebugPanel: () => {
    set((state) => ({ debugPanelOpen: !state.debugPanelOpen }));
  },

  setDebugPanelOpen: (open) => {
    set({ debugPanelOpen: open });
  },

  setJournalOpen: (open) => {
    const wasOpen = get().journalOpen;
    if (wasOpen === open) return;

    if (open) {
      useLoopStore.getState().setPaused(true);
      set({ journalOpen: true });
    } else {
      set({ journalOpen: false });
      if (!get().activeDialogue) {
        useLoopStore.getState().setPaused(false);
      }
    }
  },

  toggleJournal: () => {
    const current = get().journalOpen;
    get().setJournalOpen(!current);
  },

  triggerJournalPulse: () => {
    if (pulseTimeout) {
      clearTimeout(pulseTimeout);
    }
    set({ journalPulse: true });
    pulseTimeout = setTimeout(() => {
      set({ journalPulse: false });
      pulseTimeout = null;
    }, 2000);
  },

  setActiveCutsceneId: (id) => {
    set({ activeCutsceneId: id });
  },

  startDialogue: (npcId) => {
    const match = DialogueManager.getBestLine(npcId);
    if (!match) return false;

    // Pause ship clock while in dialogue
    useLoopStore.getState().setPaused(true);

    set({
      activeDialogue: {
        npc: match.data.npc,
        name: match.data.name,
        title: match.data.title,
        line: match.line,
      },
    });
    return true;
  },

  closeDialogue: () => {
    set({
      activeDialogue: null,
      interactionIgnoreTimer: 0.3, // Ignore E for 0.3s after closing dialogue to prevent retriggering
    });

    if (!get().journalOpen) {
      useLoopStore.getState().setPaused(false);
    }
  },

  setInteractionIgnoreTimer: (duration) => {
    set({ interactionIgnoreTimer: duration });
  },
}));
