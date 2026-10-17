/**
 * Web Audio API synthesizer for the soft resonant ship's bell chime
 * played upon gaining new knowledge / journal entries (FEEL.md §8).
 * Pure browser audio synthesis, 0 network requests.
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Triggers a dual-tone soft nautical brass bell chime.
 */
export function playKnowledgeBell(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental ~880 Hz (A5), harmonic ~1760 Hz (A6)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(872, now + 1.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now);
    osc2.frequency.exponentialRampToValueAtTime(1750, now + 0.8);

    // Soft resonant strike and gentle decay
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.4);
    osc2.stop(now + 1.4);
  } catch (err) {
    // Graceful fallback if audio is not permitted or fails
    console.debug('Audio chime skipped:', err);
  }
}
