import { describe, it, expect, beforeEach } from 'vitest';
import { HealthService } from '../../src/services/health.service.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService(new MockD1Client());
  });

  it('should return ok when database responds', async () => {
    const status = await service.check();
    expect(status.status).toBe('ok');
    expect(status.checks.database).toBe('ok');
  });
});
