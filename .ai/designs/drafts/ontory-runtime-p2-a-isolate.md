# P2-A Ontory Runtime Kernel — Forge Isolate

| Field | Value |
|-------|-------|
| **Repo** | `D:\Apps\ontory` (`@ontorata/ontory`) |
| **Branch** | `forge/ontory-runtime-p2-a` |
| **Baseline** | `org-memory-p1-d-complete` |
| **ADR** | ADR-0007 **Accepted** |
| **Intent** | [ontory-runtime-p2-a-intent.md](./ontory-runtime-p2-a-intent.md) |
| **Status** | ✅ **ACCEPTED** (owner 2026-07-08) — D1–D4 frozen · Tasks 1–6 green · Task 7 Studio REST complete |
| **Verification** | 2026-07-08 — `npm test` 4 PASS · `check:boundary` OK · typecheck OK |

---

## Pre-flight checklist

- [x] ADR-0007 Accepted (D1–D4 locked)
- [x] P2-A intent approved
- [x] Separate `ontory` repository bootstrap
- [x] Stub provider only (no vendor SDK)
- [x] REST adapter only (transport ≠ contract)
- [x] Dispatcher without provider-specific logic
- [x] Stateless runtime (no ambient execution store)
- [x] No Ratary / Studio package dependencies

---

## Layout (kernel only)

```text
ontory/
├── src/runtime/          # contracts · dispatcher · runtime-port · provider-runtime
├── src/adapters/rest/    # HTTP transport adapter
├── src/adapters/stub-provider/
├── scripts/check-runtime-boundary.mjs
└── tests/
```

---

## Acceptance criteria (isolate)

| Area | Required |
|------|----------|
| Repository bootstrap | ✅ |
| Runtime contracts | ✅ |
| Dispatcher boundary | ✅ |
| Stub provider only | ✅ |
| REST adapter only | ✅ |
| Stateless runtime | ✅ |
| No vendor dependency | ✅ |
| No Ratary dependency | ✅ |
| No Studio dependency | ✅ |

**Reject isolate if:** OpenAI adapter, Memory Service, agent loop, or Ratary imports appear.

---

## Governance rule (bootstrap)

> **Dispatcher MUST NOT contain provider-specific logic.**

Allowed: routing · lifecycle · validation · execution coordination  
Forbidden: prompt vendor formatting · OpenAI/Anthropic/Gemini payloads · tool protocols

---

## Baseline verification

| Command | Result |
|---------|--------|
| `npm test` | ✅ PASS — 2 files / 4 tests |
| `npm run check:boundary` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |

---

## Explicit non-goals preserved

Agents · planning · tools · marketplace · vendor providers · memory · recall · streaming optimization

**Isolate ACCEPTED.** Dispatcher remains provider-agnostic (validate · select runtime · coordinate · envelope).  
Next disciplined scope: Studio REST client (Task 7) → evidence (Task 8). Vendor adapters still out of scope.
