/** Tracks active SSE streams per client key (typically IP) to prevent connection exhaustion. */
export class SseConnectionGuard {
  private readonly active = new Map<string, number>();

  constructor(readonly maxConcurrentPerKey: number) {}

  tryAcquire(key: string): boolean {
    const current = this.active.get(key) ?? 0;
    if (current >= this.maxConcurrentPerKey) return false;
    this.active.set(key, current + 1);
    return true;
  }

  release(key: string): void {
    const current = this.active.get(key);
    if (current === undefined) return;
    if (current <= 1) this.active.delete(key);
    else this.active.set(key, current - 1);
  }

  activeCount(key: string): number {
    return this.active.get(key) ?? 0;
  }
}
