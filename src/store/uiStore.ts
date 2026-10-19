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

export interface ActiveCutsceneSession {
  id: string;
  onComplete?: () => void;
}

export interface UIState {
  gameScreen: 'title' | 'intro' | 'game';
  deathToast: DeathToastData | null;
  debugPanelOpen: boolean;
  journalOpen: boolean;
  journalPulse: boolean;
  activeCutsceneId: string | null;
  activeCutscene: ActiveCutsceneSession | null;
  activeDialogue: ActiveDialogueSession | null;
  interactionIgnoreTimer: number;
  hasDismissedControlsHint: boolean;
  roleCardOpen: boolean;
  strongboxKeypadOpen: boolean;

  // Actions
  setGameScreen: (screen: 'title' | 'intro' | 'game') => void;
  showDeathToast: (data: Omit<DeathToastData, 'visible'>) => void;
  hideDeathToast: () => void;
  toggleDebugPanel: () => void;
  setDebugPanelOpen: (open: boolean) => void;
  setJournalOpen: (open: boolean) => void;
  toggleJournal: () => void;
  triggerJournalPulse: () => void;
  setActiveCutsceneId: (id: string | null) => void;
  playCutscene: (id: string, onComplete?: () => void) => void;
  closeCutscene: () => void;
  startDialogue: (npcId: string) => boolean;
  closeDialogue: () => void;
  setInteractionIgnoreTimer: (duration: number) => void;
  dismissControlsHint: () => void;
  openRoleCard: () => void;
  closeRoleCard: () => void;
  openStrongboxKeypad: () => void;
  closeStrongboxKeypad: () => void;
}

let pulseTimeout: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set, get) => ({
  gameScreen: 'title', // Start on Title Screen per Prompt Issue 6
  deathToast: null,
  debugPanelOpen: true, // Visible for dev testing per P2
  journalOpen: false,
  journalPulse: false,
  activeCutsceneId: null,
  activeCutscene: null,
  activeDialogue: null,
  interactionIgnoreTimer: 0,
  hasDismissedControlsHint: false,
  roleCardOpen: false,
  strongboxKeypadOpen: false,

  setGameScreen: (screen) => set({ gameScreen: screen }),
  dismissControlsHint: () => set({ hasDismissedControlsHint: true }),
  playCutscene: (id: string, onComplete?: () => void) => {
    useLoopStore.getState().setPaused(true);
    set({
      activeCutscene: { id, onComplete },
      activeCutsceneId: id,
    });
  },
  closeCutscene: () => {
    const session = get().activeCutscene;
    set({
      activeCutscene: null,
      activeCutsceneId: null,
      interactionIgnoreTimer: 0.3,
    });
    if (session?.onComplete) {
      session.onComplete();
    }
    if (!get().journalOpen && !get().activeDialogue && !get().roleCardOpen && !get().strongboxKeypadOpen) {
      useLoopStore.getState().setPaused(false);
    }
  },
  openRoleCard: () => {
    useLoopStore.getState().setPaused(true);
    set({ roleCardOpen: true });
  },
  closeRoleCard: () => {
    set({ roleCardOpen: false, interactionIgnoreTimer: 0.3 });
    if (!get().journalOpen && !get().activeDialogue) {
      useLoopStore.getState().setPaused(false);
    }
  },
  openStrongboxKeypad: () => {
    useLoopStore.getState().setPaused(true);
    set({ strongboxKeypadOpen: true });
  },
  closeStrongboxKeypad: () => {
    set({ strongboxKeypadOpen: false, interactionIgnoreTimer: 0.3 });
    if (!get().journalOpen && !get().activeDialogue && !get().roleCardOpen) {
      useLoopStore.getState().setPaused(false);
    }
  },

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

export const playCutscene = (id: string, onComplete?: () => void) => {
  useUIStore.getState().playCutscene(id, onComplete);
};

if (typeof window !== 'undefined') {
  (window as unknown as { playCutscene: typeof playCutscene }).playCutscene = playCutscene;
}
