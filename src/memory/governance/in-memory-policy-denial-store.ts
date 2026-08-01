import { buildPolicyDenialEvent, type PolicyDenialEvent } from './policy-denial.types.js';
import type { IPolicyDenialStore } from './ipolicy-denial-store.interface.js';
import type { NewPolicyDenialInput } from './policy-denial.types.js';

const DEFAULT_CAP = 500;

export class InMemoryPolicyDenialStore implements IPolicyDenialStore {
  private readonly events = new Map<string, PolicyDenialEvent[]>();

  constructor(private readonly cap: number = DEFAULT_CAP) {}

  async append(event: PolicyDenialEvent): Promise<void> {
    const history = this.events.get(event.ownerId) ?? [];
    history.unshift(event);
    this.events.set(event.ownerId, history.slice(0, this.cap));
  }

  async record(input: NewPolicyDenialInput): Promise<void> {
    await this.append(buildPolicyDenialEvent(input));
  }

  async list(ownerId: string, limit = 100, since?: string): Promise<PolicyDenialEvent[]> {
    const rows = this.events.get(ownerId) ?? [];
    const filtered = since ? rows.filter((row) => row.occurredAt >= since) : rows;
    return filtered.slice(0, limit);
  }

  async summarizeByPoint(ownerId: string, since?: string) {
    const rows = await this.list(ownerId, this.cap, since);
    const byPoint = { write: 0, recall: 0, stewardship: 0 } as Record<
      'write' | 'recall' | 'stewardship',
      number
    >;
    for (const row of rows) {
      byPoint[row.point] += 1;
    }
    return {
      since: since ?? rows.at(-1)?.occurredAt ?? new Date().toISOString(),
      byPoint,
      total: rows.length,
    };
  }
}
