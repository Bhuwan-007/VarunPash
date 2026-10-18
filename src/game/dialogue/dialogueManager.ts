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

    // Filter lines whose 'when' condition, requirements, role, and minLoop match live state
    const candidateLines = data.lines.filter((line) => {
      // 1. Check once flag
      if (line.once && this.shownLineIds.has(line.id)) {
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

    // Sort by priority descending (highest priority line wins)
    candidateLines.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    const chosenLine = candidateLines[0];

    // Mark as shown if once
    if (chosenLine.once) {
      this.shownLineIds.add(chosenLine.id);
    }

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
