import bhimaData from '../../data/dialogue/bhima.json';
import { useMemoryStore } from '../../store/memoryStore';
import { addKnowledge } from '../systems/knowledge';

export interface DialogueLine {
  id: string;
  text: string;
  requires: string[];
  role: string | null;
  minLoop: number;
  grants: string[];
  priority: number;
  once: boolean;
}

export interface DialogueData {
  npc: string;
  name: string;
  title?: string;
  lines: DialogueLine[];
}

const DIALOGUES: Record<string, DialogueData> = {
  bhima: bhimaData as DialogueData,
};

export class DialogueManager {
  private static shownLineIds: Set<string> = new Set();

  public static getBestLine(npcId: string): { data: DialogueData; line: DialogueLine } | null {
    const data = DIALOGUES[npcId];
    if (!data) {
      console.warn(`[DialogueManager] Unknown NPC: ${npcId}`);
      return null;
    }

    const memoryState = useMemoryStore.getState();
    const currentFlags = memoryState.knowledge;
    const currentRole = memoryState.playerRole;
    const currentLoop = memoryState.deathCount + 1; // 0 deaths = Loop 1

    // Filter lines whose requirements, role, and minLoop are all satisfied
    const candidateLines = data.lines.filter((line) => {
      // 1. Check once flag
      if (line.once && this.shownLineIds.has(line.id)) {
        return false;
      }

      // 2. Check role requirement
      if (line.role && line.role !== currentRole) {
        return false;
      }

      // 3. Check minLoop requirement
      if (line.minLoop > 0 && currentLoop < line.minLoop) {
        return false;
      }

      // 4. Check required knowledge flags
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
    candidateLines.sort((a, b) => b.priority - a.priority);
    const chosenLine = candidateLines[0];

    // Mark as shown if once
    if (chosenLine.once) {
      this.shownLineIds.add(chosenLine.id);
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
  }
}
