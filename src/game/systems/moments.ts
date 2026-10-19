/**
 * Moments module: no-op hooks for future manga moments integration.
 * (PROMPTS.md P7, MANGA_MOMENTS.md)
 *
 * Provides a stable API triggerMoment(id: string) that currently does nothing.
 * Will trigger high-impact full-screen manga panels in future updates.
 */

const triggeredMoments = new Set<string>();

export function triggerMoment(id: string): void {
  if (triggeredMoments.has(id)) return;
  triggeredMoments.add(id);
  console.log(`[Moment Hook Triggered] ${id}`);
}

export function resetMoments(): void {
  triggeredMoments.clear();
}

// Attach to window object for global compatibility
if (typeof window !== 'undefined') {
  (window as any).triggerMoment = triggerMoment;
}
