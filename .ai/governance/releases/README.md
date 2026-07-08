# Governance Releases

Phase-level release markers with auditable wave chains, tags, and test evidence.

| Release | Engineering | Distribution | Tag | Branch |
|---------|-------------|----------------|-----|--------|
| P0-A Identity Foundation | ✅ COMPLETE | ✅ **RELEASED** on `main` | `identity-foundation-p0-a-complete` @ `2a57647` | merged |
| P0-B Engineering Governance | ✅ COMPLETE · 🔒 FROZEN | ✅ **RELEASED** on `main` | `engineering-governance-p0-b-complete` @ `dc2fa5e` | merged @ `9b5666a` |
| P1-A Org Memory Dogfood | ✅ TASKS 1–8 complete · 🔒 LOCKED | ✅ **CLOSED** (G1–G6) | `org-memory-p1-a-complete` | `forge/org-memory-dogfood` |
| P1-B Knowledge Foundation | ✅ WAVES 1–5 complete | ✅ **CLOSED** (G1–G6) | `org-memory-p1-b-complete` | `forge/knowledge-ingestion` |
| P1-C Recall Intelligence | ✅ WAVES 1–5 complete · 🔒 LOCKED | ✅ **CLOSED** (G1–G7) | `org-memory-p1-c-complete` | `forge/retrieval-recall-intelligence` |
| P1-D AI Workspace | ✅ WAVES 1–5 smoke · 🔒 LOCKED | ✅ **CLOSED** (architecture v1.0) | `org-memory-p1-d-complete` | `forge/ai-workspace-p1-d` |
| P2-C.0 Provider Conformance | ✅ harness PASS · 🔒 LOCKED | ✅ **CLOSED** | `org-memory-p2-c0-complete` @ `8e307ce` | `forge/ontory-provider-conformance-p2-c0` |
| P2-C.1 Anthropic Provider | ✅ adapter + conformance PASS | ✅ **CLOSED** | `org-memory-p2-c1-complete` @ `4b3e094` | `forge/ontory-provider-anthropic-p2-c1` |
| P2-C.2 Gemini Provider | ✅ adapter + conformance PASS | ✅ **CLOSED** | `org-memory-p2-c2-complete` @ `7241319` | `forge/ontory-provider-gemini-p2-c2` |

**P2-C provider expansion series:** CLOSED — stub · openai · anthropic · gemini behind frozen ADR-0009 contract.

**P2-D streaming:** ADR-0012 **Accepted** — implementation gated at P2-D.1 blueprint + forge-isolate.

**RC vs RELEASED:** Engineering complete + tags on forge branch ≠ RELEASED. Distribution completes only after merge to `main` and remote verification.

P0-A wave lock tags (immutable on origin):

- `identity-wave-3-locked`
- `identity-wave-4-locked`
- `identity-wave-5-locked`

P0-B wave lock tags (immutable on origin):

- `engineering-governance-wave-1-locked` … `engineering-governance-wave-6-locked`

See [P0-A-IDENTITY-FOUNDATION.md](./P0-A-IDENTITY-FOUNDATION.md) · [P0-B-ENGINEERING-GOVERNANCE.md](./P0-B-ENGINEERING-GOVERNANCE.md) · [P1-A-ORG-MEMORY-DOGFOOD.md](./P1-A-ORG-MEMORY-DOGFOOD.md) · [P1-B-KNOWLEDGE-FOUNDATION.md](./P1-B-KNOWLEDGE-FOUNDATION.md) · [P1-C-RECALL-INTELLIGENCE.md](./P1-C-RECALL-INTELLIGENCE.md) · [P1-D-AI-WORKSPACE.md](./P1-D-AI-WORKSPACE.md) · [P2-C-0-ONTORY-PROVIDER-CONFORMANCE.md](./P2-C-0-ONTORY-PROVIDER-CONFORMANCE.md) · [P2-C-1-ONTORY-PROVIDER-ANTHROPIC.md](./P2-C-1-ONTORY-PROVIDER-ANTHROPIC.md) · [P2-C-2-ONTORY-PROVIDER-GEMINI.md](./P2-C-2-ONTORY-PROVIDER-GEMINI.md)
