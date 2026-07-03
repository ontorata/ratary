# AI Brain — Architecture

**Purpose:** Layer patterns and port definitions.  
**Authority:** Binding for all implementations.

---

## Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│              Transport Layer                  │
│  (MCP Server, REST Server)                  │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────┴───────────────────────┐
│           Application Layer                  │
│  (Services: Memory, Context, Search)        │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────┴───────────────────────┐
│              Domain Layer                    │
│  (Pure functions: ranking, scoring)        │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────┴───────────────────────┐
│           Persistence Layer                  │
│  (Repositories: D1 adapter)                 │
└─────────────────────────────────────────────┘
```

---

## Dependency Rule

**All dependencies point INWARD only.**

```
Transport → Application → Domain ← Persistence
```

---

## Port Pattern

### When adding new capability:

1. Define **Port Interface** (in domain)
2. Implement **Adapter** (in infrastructure)
3. Wire at **Composition Root**

### Example:

```typescript
// Port (domain/ports/)
interface IMemoryRepository {
  findById(id: string): Promise<Memory>;
  save(memory: Memory): Promise<void>;
}

// Adapter (infrastructure/adapters/)
class D1MemoryRepository implements IMemoryRepository {
  constructor(private db: D1Database) {}
  // ...
}

// Composition Root (app.ts)
const memoryRepo = new D1MemoryRepository(db);
const memoryService = new MemoryService(memoryRepo);
```

---

## Repository Pattern

### Do:

```typescript
interface IMemoryRepository {
  findById(id: string): Promise<Memory>;
  findByOwner(ownerId: string): Promise<Memory[]>;
  save(memory: Memory): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Don't:

```typescript
// NO direct SQL in services
class MemoryService {
  async findById(id: string) {
    return await this.db.prepare('SELECT * FROM memories...'); // ❌
  }
}
```

---

## Retrieval Pattern

### IRretrievalCandidateSource

```typescript
interface IRretrievalCandidateSource {
  retrieve(query: RetrievalQuery, scope: MemoryScope): Promise<Candidate[]>;
}
```

### Composite Pattern

```
CompositeRetrievalCandidateSource
├── SqlRetrievalCandidateSource
├── VectorRetrievalCandidateSource
└── GraphRetrievalCandidateSource (Phase 8)
```

---

## Memory Scope

```typescript
interface MemoryScope {
  ownerId: string;  // Required
  workspaceId?: string;  // Phase 9
  agentId?: string;  // Phase 9
  organizationId?: string;  // Phase 10
}
```

---

## Service Thinness Rule

Services should:
- Orchestrate ports
- Enforce scope
- Apply business rules

Services should NOT:
- Write SQL
- Handle HTTP
- Transform types manually

---

## Testing Rule

Every port has:
- Unit test (adapter mock)
- Integration test (real adapter)

---

*Follow this architecture. No exceptions.*
