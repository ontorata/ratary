import type { TransportSource } from '../shared/transport-context.types.js';

/** Health snapshot for a single transport server. */
export interface TransportHealth {
  status: 'ok' | 'degraded' | 'down';
  details?: Record<string, unknown>;
}

/**
 * Lifecycle contract — one implementation per protocol (ADR-027 Phase 10.5).
 * Servers own their own listener; the registry only coordinates start/stop.
 */
export interface ITransportServer {
  readonly protocol: TransportSource;
  start(): Promise<void>;
  stop(): Promise<void>;
  health(): TransportHealth;
}

/** Composition-root coordinator for all registered transport servers. */
export interface ITransportRegistry {
  register(server: ITransportServer): void;
  startAll(): Promise<void>;
  stopAll(): Promise<void>;
  listActive(): TransportSource[];
  health(): Record<TransportSource, TransportHealth>;
}
