import { QuotaExceededError } from '../../types/errors.js';
import type { IQuotaEnforcer } from '../ports/iquota-enforcer.port.js';
import type { QuotaCheckInput, QuotaStatus } from '../types/security.types.js';

interface CounterWindow {
  count: number;
  windowStartMs: number;
}

export interface MemoryQuotaEnforcerOptions {
  maxRequestsPerMinute: number;
  maxWritesPerDay: number;
  windowSeconds?: number;
}

/** In-memory quota counters for single-node deployments (Phase 17 MVP). */
export class MemoryQuotaEnforcer implements IQuotaEnforcer {
  private readonly requestCounters = new Map<string, CounterWindow>();
  private readonly writeCounters = new Map<string, CounterWindow>();
  private readonly windowMs: number;

  constructor(private readonly options: MemoryQuotaEnforcerOptions) {
    this.windowMs = (options.windowSeconds ?? 60) * 1000;
  }

  async assertWithinQuota(input: QuotaCheckInput): Promise<void> {
    const key = `${input.user.ownerId}:${input.scope.organizationId ?? 'default'}`;
    const now = Date.now();

    const req = this.requestCounters.get(key) ?? { count: 0, windowStartMs: now };
    if (now - req.windowStartMs >= this.windowMs) {
      req.count = 0;
      req.windowStartMs = now;
    }
    req.count += 1;
    this.requestCounters.set(key, req);

    if (req.count > this.options.maxRequestsPerMinute) {
      throw new QuotaExceededError('Request rate limit exceeded');
    }

    if (input.action === 'write') {
      const dayKey = `${key}:writes`;
      const write = this.writeCounters.get(dayKey) ?? { count: 0, windowStartMs: now };
      const dayMs = 86_400_000;
      if (now - write.windowStartMs >= dayMs) {
        write.count = 0;
        write.windowStartMs = now;
      }
      write.count += 1;
      this.writeCounters.set(dayKey, write);

      if (write.count > this.options.maxWritesPerDay) {
        throw new QuotaExceededError('Daily write quota exceeded');
      }
    }
  }

  async getStatus(ownerId: string, organizationId?: string): Promise<QuotaStatus> {
    const key = `${ownerId}:${organizationId ?? 'default'}`;
    const req = this.requestCounters.get(key);
    const used = req?.count ?? 0;
    return {
      requestsRemaining: Math.max(0, this.options.maxRequestsPerMinute - used),
      windowSeconds: Math.floor(this.windowMs / 1000),
    };
  }
}
