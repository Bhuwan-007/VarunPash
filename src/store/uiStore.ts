import { create } from 'zustand';

export interface DeathToastData {
  visible: boolean;
  strategic: boolean;
  cause: string;
  remembered?: string;
}

export interface UIState {
  deathToast: DeathToastData | null;
  debugPanelOpen: boolean;
  journalOpen: boolean;
  activeCutsceneId: string | null;

  // Actions
  showDeathToast: (data: Omit<DeathToastData, 'visible'>) => void;
  hideDeathToast: () => void;
  toggleDebugPanel: () => void;
  setDebugPanelOpen: (open: boolean) => void;
  setJournalOpen: (open: boolean) => void;
  setActiveCutsceneId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  deathToast: null,
  debugPanelOpen: true, // Visible for dev testing per P2
  journalOpen: false,
  activeCutsceneId: null,

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
    set({ journalOpen: open });
  },

  setActiveCutsceneId: (id) => {
    set({ activeCutsceneId: id });
  },
}));
