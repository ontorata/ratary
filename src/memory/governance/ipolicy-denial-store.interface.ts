import type {
  PolicyDenialEvent,
  PolicyDenialPoint,
  PolicyDenialSummary,
} from './policy-denial.types.js';

export interface IPolicyDenialStore {
  append(event: PolicyDenialEvent): Promise<void>;
  list(ownerId: string, limit?: number, since?: string): Promise<PolicyDenialEvent[]>;
  summarizeByPoint(ownerId: string, since?: string): Promise<PolicyDenialSummary>;
}

export type { PolicyDenialPoint, PolicyDenialSummary };
