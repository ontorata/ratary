/**
 * Decision provenance query port — Phase 36 / ADR-069.
 * why-chain / effect-chain over owner-scoped provenance edges.
 */
import type {
  ChainWalkOptions,
  ProvenanceChainStep,
} from '../../knowledge/provenance/chain-walk.js';

export type { ChainWalkOptions, ProvenanceChainStep };

export interface IProvenanceQuery {
  whyChain(
    ownerId: string,
    memoryId: string,
    options?: ChainWalkOptions,
  ): Promise<ProvenanceChainStep[]>;

  effectChain(
    ownerId: string,
    memoryId: string,
    options?: ChainWalkOptions,
  ): Promise<ProvenanceChainStep[]>;
}
