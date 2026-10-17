import { JOURNAL_ENTRIES } from '../../data/journalEntries';
import { useLoopStore } from '../../store/loopStore';
import { useMemoryStore } from '../../store/memoryStore';
import { useUIStore } from '../../store/uiStore';
import { playKnowledgeBell } from '../../utils/audio';

/**
 * Single dedicated function to add knowledge flags and corresponding journal entries.
 * (RULES.md section 7, FEEL.md section 8, PROMPTS.md P3).
 *
 * - Adds flag and JournalEntry to MemoryStore (persisted).
 * - Returns true only if the flag was newly learned.
 * - When true:
 *   - Sets hasLearnedNewThisLoop in LoopStore so strategic-death detection works.
 *   - Stores real journal entry text in LoopStore.
 *   - Plays a soft resonant ship bell chime via Web Audio API.
 *   - Triggers Tide Glow pulse on HUD journal icon.
 */
export function addKnowledge(flag: string): boolean {
  const memoryStore = useMemoryStore.getState();
  if (memoryStore.knowledge.includes(flag)) {
    return false;
  }

  const entryDef = JOURNAL_ENTRIES[flag];
  const loopNumber = memoryStore.deathCount + 1;
  const journalEntry = entryDef
    ? {
        id: entryDef.id,
        tab: entryDef.tab,
        title: entryDef.title,
        text: entryDef.text,
        code: entryDef.code,
        tideTime: entryDef.tideTime,
        loop: loopNumber,
      }
    : undefined;

  const added = memoryStore.addKnowledge(flag, journalEntry);
  if (!added) return false;

  const loopStore = useLoopStore.getState();
  const entryText = entryDef?.text ?? 'A forgotten truth returns.';
  loopStore.markLearned(entryText);

  useUIStore.getState().triggerJournalPulse();
  playKnowledgeBell();

  return true;
}
