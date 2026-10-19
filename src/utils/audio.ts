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

/**
 * Synthesizes three seagulls crying in sequence for the Gull Omen at 355s (FEEL.md §6).
 */
export function playGullCry(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const cryTimes = [0, 0.75, 1.5];

    cryTimes.forEach((delay) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Gull call: upward inflection followed by harsh drop
      osc.frequency.setValueAtTime(1400, startTime);
      osc.frequency.linearRampToValueAtTime(2450, startTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1600, startTime + 0.38);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (err) {
    console.debug('Gull audio skipped:', err);
  }
}

/**
 * Synthesizes a deep sub-surface leviathan rumble for the Makara breach at 480s.
 */
export function playMakaraRumble(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 3.0);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 3.0);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 3.3);
  } catch (err) {
    console.debug('Makara audio skipped:', err);
  }
}

/**
 * Synthesizes a flintlock pistol shot through slatted wood when Nakhuda shoots intruders.
 */
export function playGunshot(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Noise blast
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Low thump
    const osc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    thumpGain.gain.setValueAtTime(0.4, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.4);
    osc.stop(now + 0.3);
  } catch (err) {
    console.debug('Gunshot audio skipped:', err);
  }
}

/**
 * Synthesizes a sharp steel knife strike when Kedar attacks.
 */
export function playKnifeStab(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.debug('Knife audio skipped:', err);
  }
}

/**
 * Synthesizes a crisp double-rap wooden knock on oak cabin doors.
 */
export function playDoorKnock(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const knockTimes = [0, 0.12];
    knockTimes.forEach((delay) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, startTime);
      osc.frequency.exponentialRampToValueAtTime(90, startTime + 0.08);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  } catch (err) {
    console.debug('Door knock audio skipped:', err);
  }
}

/**
 * Synthesizes a gentle paper page turn sound for manga and journal.
 */
export function playPageTurn(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.linearRampToValueAtTime(700, now + 0.16);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.18);
  } catch (err) {
    console.debug('Page turn audio skipped:', err);
  }
}



