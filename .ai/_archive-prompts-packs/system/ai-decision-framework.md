# AI Brain — Decision Framework

**Purpose:** Rules for making architectural decisions.  
**Authority:** Binding for all changes.

---

## Decision Triggers

Buat keputusan arsitektur ketika:

1. Menambah layer baru
2. Menambah port baru
3. Mengubah contract
4. Menambah adapter
5. Menambah phase baru
6. Mengubah schema

---

## Decision Process

### Step 1: Identify

```
Apa masalahnya?
Apa opsi yang ada?
Siapa stakeholder?
```

### Step 2: Evaluate

```
Apakah melanggar Constitution?
Apakah melanggar ADR?
Apakah backward compatible?
Apakah future compatible?
```

### Step 3: Decide

```
Pilih opsi dengan:
1. Minimal coupling
2. Maksimal cohesion
3. Forward compatibility
```

### Step 4: Document

```
Jika structural: Buat ADR
Jika implementation: Update DESIGN.md
Jika contract: Update protocol
```

---

## Layer Decision Matrix

| Change | Do What |
|--------|---------|
| New port | Define interface + ADR |
| New adapter | Implement port |
| New service | Follow repository pattern |
| New MCP tool | Add to registry |
| New REST endpoint | Add to routes |

---

## ADR Triggers

Buat ADR jika:

| Trigger | Example |
|---------|---------|
| Structural change | New layer, new port |
| Breaking change | Remove field, rename |
| New pattern | New architecture approach |
| Cross-phase | Affects multiple phases |

---

## Version Decision

| Change Type | Version Bump |
|-------------|--------------|
| Add optional field | Minor |
| Add required field | Major |
| Remove field | Major |
| Rename endpoint | Major |
| Add endpoint | Minor |
| Fix bug | Patch |

---

## Backward Compatibility

**Always prefer additive changes.**

```
✓ Add optional parameter
✓ Add new endpoint
✓ Add new response field

✗ Remove required parameter
✗ Remove endpoint
✗ Change field type
```

---

## Future Compatibility Check

Before implementing, verify:

```
Phase 8: Graph traversal — apakah design compatible?
Phase 9: Multi-AI — apakah scope extensible?
Phase 10: Enterprise — apakah RBAC pluggable?
```

---

## Override Process

Jika harus override rule:

1. Owner approval required
2. Document rationale
3. Set timeline for fix
4. Create tracking issue

---

*Every decision should be traceable to this framework.*
