/**
 * Canonical relation persistence port (flat relations today; graph engines later).
 * @see .ai/adr/008-platform-architecture.md
 */
export type { IMemoryRelationRepository as IRelationRepository } from '../../repositories/memory-relation.repository.interface.js';

/** @deprecated Prefer IRelationRepository for new code. */
export type { IMemoryRelationRepository } from '../../repositories/memory-relation.repository.interface.js';
