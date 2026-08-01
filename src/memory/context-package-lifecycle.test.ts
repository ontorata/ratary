import { describe, expect, it } from 'vitest';
import { ContextService } from './context.service.js';
import { InMemoryContextPackageLifecycleStore } from '../infrastructure/context/in-memory-context-package-lifecycle-store.js';
import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import { ConflictError, NotFoundError } from '../types/errors.js';

const scope = { ownerId: 'owner-1' };

function emptyRepo(): IMemoryRepository {
  return {
    recordAccessBatch: async () => undefined,
  } as unknown as IMemoryRepository;
}

function emptySource(): IRetrievalCandidateSource {
  return {
    findCandidates: async () => [],
  };
}

describe('ContextService lifecycle (ADR-1013)', () => {
  it('registers mint as active and allows retire then archive', async () => {
    const store = new InMemoryContextPackageLifecycleStore();
    const service = new ContextService(emptyRepo(), emptySource(), undefined, {
      lifecycleStore: store,
    });

    const built = await service.buildContext(scope, { query: 'q' });
    expect(built.lifecycleState).toBe('active');

    const registered = await service.getPackageLifecycle(scope, built.packageId);
    expect(registered.lifecycleState).toBe('active');

    const retired = await service.retirePackage(scope, built.packageId);
    expect(retired.lifecycleState).toBe('retired');

    const archived = await service.archivePackage(scope, built.packageId);
    expect(archived.lifecycleState).toBe('archived');

    await expect(service.retirePackage(scope, built.packageId)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('allows active → archive and rejects unknown package', async () => {
    const store = new InMemoryContextPackageLifecycleStore();
    const service = new ContextService(emptyRepo(), emptySource(), undefined, {
      lifecycleStore: store,
    });

    const built = await service.buildContext(scope, { query: 'q' });
    const archived = await service.archivePackage(scope, built.packageId);
    expect(archived.lifecycleState).toBe('archived');

    await expect(service.getPackageLifecycle(scope, 'missing')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('isolates lifecycle rows by ownerId', async () => {
    const store = new InMemoryContextPackageLifecycleStore();
    const service = new ContextService(emptyRepo(), emptySource(), undefined, {
      lifecycleStore: store,
    });

    const built = await service.buildContext(scope, { query: 'q' });
    await expect(
      service.getPackageLifecycle({ ownerId: 'other-owner' }, built.packageId),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
