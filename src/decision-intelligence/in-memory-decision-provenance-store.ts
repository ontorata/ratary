import type {
  CreateDecisionProvenanceBody,
  DecisionProvenanceRecord,
} from './decision-provenance.types.js';
import { buildDecisionProvenanceRecord } from './decision-provenance.types.js';

export interface IDecisionProvenanceStore {
  append(ownerId: string, body: CreateDecisionProvenanceBody): Promise<DecisionProvenanceRecord>;
  list(ownerId: string, limit?: number): Promise<DecisionProvenanceRecord[]>;
}

const DEFAULT_CAP = 200;

export class InMemoryDecisionProvenanceStore implements IDecisionProvenanceStore {
  private readonly records = new Map<string, DecisionProvenanceRecord[]>();

  constructor(private readonly cap: number = DEFAULT_CAP) {}

  async append(ownerId: string, body: CreateDecisionProvenanceBody): Promise<DecisionProvenanceRecord> {
    const record = buildDecisionProvenanceRecord(ownerId, body);
    const history = this.records.get(ownerId) ?? [];
    history.unshift(record);
    this.records.set(ownerId, history.slice(0, this.cap));
    return record;
  }

  async list(ownerId: string, limit = this.cap): Promise<DecisionProvenanceRecord[]> {
    return (this.records.get(ownerId) ?? []).slice(0, limit);
  }
}
