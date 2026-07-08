# Blueprint: ontory-provider-gemini-p2-c2

| Field | Value |
|-------|-------|
| **Status** | Draft — pending intent approval |
| **Intent** | [ontory-provider-gemini-p2-c2-intent.md](./ontory-provider-gemini-p2-c2-intent.md) |
| **ADR** | ADR-0011 (proposed) · ADR-0009 contract frozen |
| **Repo** | `ontory` · branch `forge/ontory-provider-gemini-p2-c2` |
| **Baseline** | `org-memory-p2-c1-complete` @ `4b3e094` |

---

## Harness compliance rule (non-negotiable)

> Gemini **plugs into** the P2-C.0 Provider Contract. Add subject tests only — **no** contract/matrix edits.

Regression: **stub + openai + anthropic** MUST stay PASS throughout P2-C.2.

---

## Execution tasks

- [ ] Task 0 — forge-isolate from `org-memory-p2-c1-complete`
- [ ] Task 1 — ADR-0011 Accepted (governance)
- [ ] Task 2 — RequestMapper (pure)
- [ ] Task 3 — ResponseMapper + ErrorMapper (pure)
- [ ] Task 4 — `GeminiProviderAdapter` + client factory
- [ ] Task 5 — Config: `gemini` provider wire
- [ ] Task 6 — REST composition unchanged pattern (config-only)
- [ ] Task 7 — Unit tests (mocked SDK)
- [ ] Task 8 — `gemini.conformance.test.ts` — all MUST scenarios PASS
- [ ] Task 9 — Boundary CI: `@google/generative-ai` allowlist under `adapters/gemini/`
- [ ] Task 10 — Evidence A1/A2 + `gemini-pass.md`
- [ ] Task 11 — Closeout tag `org-memory-p2-c2-complete`

---

## Task 8 — Conformance gate

```bash
npm run test:conformance   # 4 subjects · C-CAN skipped per subject
npm test
npm run typecheck
npm run check:boundary
```

---

## Evidence pack (Task 10)

| Artifact | Path |
|----------|------|
| Proof | `.ai/reviews/org-memory-dogfood/ontory-provider-gemini-proof.md` |
| Acceptance | `.ai/reviews/org-memory-dogfood/P2-C-2-ACCEPTANCE.md` |
| Conformance | `.ai/governance/provider-conformance/results/gemini-pass.md` |
| Release | `.ai/governance/releases/P2-C-2-ONTORY-PROVIDER-GEMINI.md` |
| ADR extension | ADR-0009 extension note only |

---

## Explicit non-goals

- Capability metadata ADR (deferred — owner note after 3rd vendor)
- C-CAN · streaming · routing · Kernel refactor
