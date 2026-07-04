import type { QuotaCheckInput, QuotaStatus } from '../types/security.types.js';

export interface IQuotaEnforcer {
  assertWithinQuota(input: QuotaCheckInput): Promise<void>;
  getStatus(ownerId: string, organizationId?: string): Promise<QuotaStatus>;
}
