import bhimaData from '../../data/dialogue/bhima.json';
import hariData from '../../data/dialogue/hari.json';
import ishaData from '../../data/dialogue/isha.json';
import kedarData from '../../data/dialogue/kedar.json';
import nakhudaData from '../../data/dialogue/nakhuda.json';
import { NPC_PROFILE_CARDS } from '../../data/journalEntries';
import { useLoopStore } from '../../store/loopStore';
import { useMemoryStore } from '../../store/memoryStore';
import { addDirectJournalEntry, addKnowledge } from '../systems/knowledge';
import { NpcScheduler } from '../systems/npcScheduler';

export interface DialogueWhen {
  timeMin?: number;
  timeMax?: number;
  activity?: string;
  flags?: string[];
  notFlags?: string[];
  minLoop?: number;
  role?: string | null;
  scene?: 'deck' | 'hold';
}

export interface DialogueLine {
  id: string;
  text: string;
  when?: DialogueWhen;
  priority?: number;
  journalNote?: string;
  requires?: string[];
  role?: string | null;
  minLoop?: number;
  grants?: string[];
  once?: boolean;
  talkCountMin?: number;
}

export interface DialogueData {
  npc: string;
  name: string;
  title?: string;
  lines: DialogueLine[];
}

const DIALOGUES: Record<string, DialogueData> = {
  bhima: bhimaData as DialogueData,
  nakhuda: nakhudaData as DialogueData,
  kedar: kedarData as DialogueData,
  isha: ishaData as DialogueData,
  hari: hariData as DialogueData,
};

export class DialogueManager {
  private static shownLineIds: Set<string> = new Set();
  private static talkedNpcIds: Set<string> = new Set();

  public static getBestLine(npcId: string): { data: DialogueData; line: DialogueLine } | null {
    const data = DIALOGUES[npcId];
    if (!data) {
      console.warn(`[DialogueManager] Unknown NPC: ${npcId}`);
      return null;
    }

    const shipTime = useLoopStore.getState().shipTime;
    const npcState = NpcScheduler.getNpcState(npcId, shipTime);
    const memoryState = useMemoryStore.getState();
    const currentFlags = memoryState.knowledge;
    const currentRole = memoryState.playerRole;
    const currentLoop = memoryState.deathCount + 1; // 0 deaths = Loop 1

    // Increment talk count for this NPC in the current loop
    const talkCount = useLoopStore.getState().incrementTalkCount(npcId);

    // Filter lines whose 'when' condition, requirements, role, and minLoop match live state
    const candidateLines = data.lines.filter((line) => {
      // 1. Check once flag against both local set and persisted storyLinesSeen
      const isAlreadySeen = this.shownLineIds.has(line.id) || (memoryState.storyLinesSeen?.includes(line.id) ?? false);
      if (line.once && isAlreadySeen) {
        return false;
      }

      // 2. Check context-aware 'when' conditions
      if (line.when) {
        const w = line.when;
        if (w.timeMin !== undefined && shipTime < w.timeMin) return false;
        if (w.timeMax !== undefined && shipTime > w.timeMax) return false;
        if (w.activity && npcState && npcState.activity !== w.activity) return false;
        if (w.scene && npcState && npcState.scene !== w.scene) return false;
        if (w.minLoop !== undefined && currentLoop < w.minLoop) return false;
        if (w.role && w.role !== currentRole) return false;
        if (w.flags && !w.flags.every((f) => currentFlags.includes(f))) return false;
        if (w.notFlags && w.notFlags.some((f) => currentFlags.includes(f))) return false;
      }

      // 3. Check legacy/fallback role requirement
      if (line.role && line.role !== currentRole) {
        return false;
      }

      // 4. Check legacy minLoop requirement
      if (line.minLoop !== undefined && line.minLoop > 0 && currentLoop < line.minLoop) {
        return false;
      }

      // 5. Check legacy required knowledge flags
      if (line.requires && line.requires.length > 0) {
        const hasAllFlags = line.requires.every((req) => currentFlags.includes(req));
        if (!hasAllFlags) {
          return false;
        }
      }

      return true;
    });

    if (candidateLines.length === 0) {
      return null;
    }

    const lastShown = memoryState.lastShownDialogue?.[npcId] ?? [];
    const last1Shown = lastShown[0];
    const last3Shown = new Set(lastShown.slice(0, 3));

    let chosenLine: DialogueLine | null = null;

    // TIER 1: Unseen story lines (once: true). Choose highest priority
    const unseenStoryLines = candidateLines.filter((l) => l.once);
    if (unseenStoryLines.length > 0) {
      unseenStoryLines.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
      chosenLine = unseenStoryLines[0];
    }

    // TIER 2: If no unseen story line, check for escalation if player talks repeatedly
    if (!chosenLine && talkCount >= 2) {
      // Find matching escalation lines where talkCount >= talkCountMin
      const escalationLines = candidateLines.filter(
        (l) => l.talkCountMin !== undefined && talkCount >= l.talkCountMin && l.id !== last1Shown
      );
      if (escalationLines.length > 0) {
        escalationLines.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
        chosenLine = escalationLines[0];
      }
    }

    // TIER 3: Flavor line selection (weighted toward unseen, never one of last 3, never same twice)
    if (!chosenLine) {
      // Exclude escalation lines if talkCount < line.talkCountMin
      const availableFlavor = candidateLines.filter((l) => {
        if (l.talkCountMin && talkCount < l.talkCountMin) return false;
        return true;
      });

      // Filter out last 3 shown
      let pool = availableFlavor.filter((l) => !last3Shown.has(l.id));

      // If pool is empty because all lines have been seen recently, relax to not being same twice in a row
      if (pool.length === 0) {
        pool = availableFlavor.filter((l) => l.id !== last1Shown);
      }
      if (pool.length === 0) {
        pool = availableFlavor;
      }

      // Weight towards lines that haven't been shown recently or at all
      const weightedList: DialogueLine[] = [];
      for (const line of pool) {
        const hasBeenShown = lastShown.includes(line.id) || this.shownLineIds.has(line.id);
        const weight = hasBeenShown ? 1 : 3;
        for (let i = 0; i < weight; i++) {
          weightedList.push(line);
        }
      }

      // Pick randomly from weighted pool
      const pickIdx = Math.floor(Math.random() * weightedList.length);
      chosenLine = weightedList[pickIdx] ?? pool[0];
    }

    if (!chosenLine) {
      return null;
    }

    // Mark as shown in session set and persisted memory store
    this.shownLineIds.add(chosenLine.id);
    useMemoryStore.getState().recordShownLine(npcId, chosenLine.id, chosenLine.once);

    // First talk with NPC creates NPC card in People tab
    const profile = NPC_PROFILE_CARDS[npcId];
    if (profile) {
      const alreadyHasCard = memoryState.journal.some((e) => e.id === profile.id);
      if (!alreadyHasCard) {
        addDirectJournalEntry({
          id: profile.id,
          tab: 'People',
          title: `${profile.name} (${profile.role})`,
          text: profile.description,
          npcId,
        });
      }
    }
    this.talkedNpcIds.add(npcId);

    // Each later line with journalNote appends a note under that NPC
    if (chosenLine.journalNote) {
      addDirectJournalEntry({
        id: `note_${chosenLine.id}`,
        tab: 'People',
        text: chosenLine.journalNote,
        title: `Note: ${data.name}`,
        npcId,
      });
    }

    // Immediately grant any flags attached to this line through addKnowledge
    if (chosenLine.grants && chosenLine.grants.length > 0) {
      for (const flag of chosenLine.grants) {
        addKnowledge(flag);
      }
    }

    return { data, line: chosenLine };
  }

  public static resetShownLines(): void {
    this.shownLineIds.clear();
    this.talkedNpcIds.clear();
  }
}
