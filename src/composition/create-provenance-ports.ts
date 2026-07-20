/**
 * Composition root for Phase 36 decision provenance (ADR-069).
 * Flag-off: nothing constructed; retrieval paths unchanged (I0).
 */
import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IProvenanceQuery } from '../ports/provenance/iprovenance-query.port.js';
import { SqlProvenanceQuery } from '../infrastructure/provenance/sql-provenance-query.js';

export type ProvenancePorts = { enabled: false } | { enabled: true; query: IProvenanceQuery };

export function createProvenancePorts(sql: ISqlDatabase, env: Env): ProvenancePorts {
  if (!env.DECISION_PROVENANCE_ENABLED) {
    return { enabled: false };
  }

  return {
    enabled: true,
    query: new SqlProvenanceQuery(sql),
  };
}
