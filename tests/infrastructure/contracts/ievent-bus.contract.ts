import { describe, it, expect } from 'vitest';
import type { IEventBus } from '../../../src/ports/events/ievent-bus.port.js';

export function describeEventBusContract(label: string, createBus: () => IEventBus): void {
  describe(`IEventBus contract — ${label}`, () => {
    it('should publish without throwing', async () => {
      const bus = createBus();
      await expect(bus.publish('memory.created', { id: 'mem-1' })).resolves.toBeUndefined();
    });

    it('should deliver published events to subscribers', async () => {
      const bus = createBus();
      const received: string[] = [];
      const subscription = await bus.subscribe<{ id: string }>('memory.updated', async (event) => {
        received.push(event.payload.id);
      });

      await bus.publish('memory.updated', { id: 'mem-2' }, { correlationId: 'corr-1' });
      await new Promise((resolve) => setTimeout(resolve, 400));
      await subscription.unsubscribe();

      expect(received).toContain('mem-2');
    });
  });
}
