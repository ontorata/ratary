import type { MemoryQualitySignal } from './memory-quality-signal.types.js';

export interface SignalAuthContext {
  ownerId: string;
  workspaceId?: string;
}

export interface ISignalNormalizer {
  normalize(raw: unknown, ctx: SignalAuthContext): MemoryQualitySignal | null;
}
