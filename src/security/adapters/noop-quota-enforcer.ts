import type { IQuotaEnforcer } from '../ports/iquota-enforcer.port.js';
import type { QuotaCheckInput, QuotaStatus } from '../types/security.types.js';

export class NoOpQuotaEnforcer implements IQuotaEnforcer {
  async assertWithinQuota(_input: QuotaCheckInput): Promise<void> {
    return;
  }

  async getStatus(_ownerId: string): Promise<QuotaStatus> {
    return { windowSeconds: 60 };
  }
}
