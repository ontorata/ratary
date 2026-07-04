import type { TransportContext } from './transport-context.types.js';

/**
 * Single use-case entry — all transports delegate here (Phase 10.5B).
 * Handlers call existing application services; no business logic at transport edge.
 */
export interface IApplicationHandler<TInput, TOutput> {
  handle(ctx: TransportContext, input: TInput): Promise<TOutput>;
}
