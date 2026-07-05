# Panduan — Ratary

Satu panduan untuk **setup, pemakaian sehari-hari, dan MCP** (Cursor, Claude Code, Roo, Cline, Gemini CLI, dll.).

---

## 1. Setup (3 langkah)

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
```

Isi `.env` dari [Cloudflare Dashboard](https://dash.cloudflare.com):

- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `D1_API_TOKEN`

```bash
npm run db:migrate
npm run setup
```

**Cursor:** Settings → MCP → `ratary` hijau → Reload Window  
**Claude Code:** `claude` di folder repo → approve `ratary`

Uji: *"cari memory tentang ratary"*

---

## 2. Cara pakai (cukup chat)

Tidak perlu mengetik nama tool. Bilang natural:

| Anda ingin… | Contoh |
|-------------|--------|
| Lanjut kerja | `Lanjut kerja ratary — fokus dokumentasi` |
| Baca konteks dulu | `Baca memory tentang auth sebelum coding` |
| Simpan handoff | `Simpan handoff: selesai fix MCP, besok lanjut test` |
| Cari topik | `Cari memory tentang deployment Vercel` |
| Ringkas keputusan | `Ringkas apa yang sudah kita putuskan untuk mangroveapps` |

**Tips:** sebut **nama proyek** (`ratary`, `mangroveapps`) dan **topik** (`auth`, `hydration`). Akhiri sesi dengan handoff.

### Memory pintar (Fase 4)

AI otomatis memilih cuplikan memory yang paling relevan — bukan dump semua catatan. Jika MCP sudah hijau, **tidak ada setup tambahan**. Cukup bilang *"lanjut kerja …"*.

---

## 2.1 Agent Forge (kontributor di repo ini)

**Phase 07.1** mendefinisikan alur wajib saat AI mengubah kode di repo `ratary` — bukan runtime di server, melainkan **workflow Cursor** (skills + rule).

| Tahap | Skill | Kapan |
|-------|-------|-------|
| Recall | `forge-recall` | Awal sesi — `search_memory` via MCP |
| Intent | `forge-intent` | Sebelum desain/kode non-trivial |
| Isolate | `forge-isolate` | Branch/worktree terpisah |
| Blueprint | `forge-blueprint` | Rencana task sebelum implement |
| Execute | `forge-execute` | Implementasi |
| Prove / Inspect | `forge-prove`, `forge-inspect` | Test + review antar task |
| Land | `forge-land` | Merge / PR / discard |
| Remember | `forge-remember` | Akhir sesi — `save_memory` handoff |

**SSOT:** [.ai/phases/07.1-agent-forge/](../.ai/phases/07.1-agent-forge/README.md) · rule: `.cursor/rules/agent-forge.mdc` · skills: `.cursor/skills/forge-*`

Untuk fitur multi-file atau struktural, jangan lewati **Intent → Isolate → Blueprint**. Draft desain sementara: `.ai/designs/drafts/`.

**Phase 8.8 — Inspection Pattern Ledger (opsional):** setelah inspect PASS, kirim `submit_signal` dengan `type: inspection_outcome` (`resolved: true`, severity ≥ major) agar pola inspeksi terakumulasi; recall via tag `inspection-pattern` atau `GET /api/v1/inspection-patterns`. SSOT: [.ai/phases/08.8-inspection-pattern-ledger/](../.ai/phases/08.8-inspection-pattern-ledger/README.md).

---

## 3. Keamanan

| Situasi | `MCP_OWNER_ID` di `.env` |
|---------|--------------------------|
| Dev lokal, solo | Opsional |
| Production / tim | **Wajib** (UUID owner dari bootstrap REST) |

Tanpa `MCP_OWNER_ID` di production, MCP **tidak akan start** — mencegah memory tercampur antar user.

**Phase 9 — workspace (opsional):**

| Variable | Fungsi |
|----------|--------|
| `MCP_WORKSPACE_ID` | Scope memory ke workspace tertentu (default: workspace `default` owner) |
| `MCP_AGENT_ID` | Hint attribution agent (registry via `register_agent`) |

REST: header `X-Workspace-Id` / `X-Agent-Id` pada request memory.

Jangan commit atau share file `.env`.

---

## 4. Setelah `git pull`

1. `npm install`
2. `npm run setup`
3. Reload Cursor
4. Opsional: `npm run db:migrate`

---

## 5. Troubleshooting

| Gejala | Solusi |
|--------|--------|
| MCP merah | `npm run setup` → reload |
| Connection closed (Windows) | Pakai `command: "cmd"` — lihat §6 |
| AI tidak pakai memory | Sebut proyek + topik |
| Memory kosong | Normal di DB baru — simpan dulu |
| MCP error production | Set `MCP_OWNER_ID` di `.env`, atau pastikan `.env` punya `NODE_ENV=development` untuk dev lokal (stdio memuat `.env` dengan override). Reload MCP. |
| Claude pending approval | `claude` di folder repo → approve |
| ChatGPT | MCP stdio tidak didukung — lihat §6.1 (Actions, Remote MCP, OAuth) |

---

## 6.1 ChatGPT

ChatGPT **tidak** menjalankan MCP stdio lokal seperti Cursor. Dua jalur:

### A — Sekarang: Custom GPT + REST Actions (disarankan)

1. Deploy API publik (mis. Vercel) atau tunnel ke `npm run dev`
2. Bootstrap → simpan API key `aic_...`
3. **Custom GPT** → Configure → **Actions** → Import OpenAPI dari `https://<host>/docs/json`
4. Authentication: API Key → `Authorization: Bearer aic_...`
5. Instruksi GPT: cari memory by project, `POST /context` untuk task, simpan handoff via `POST /memory`

Detail endpoint: [README.md](../README.md) § REST API.

### B — Remote MCP: New App → Server URL (Phase 13.1 ✅)

Form **New App** di ChatGPT → **Server URL** → `https://<host>/mcp` (bukan URL REST `/api/v1`).

**Env (host long-running — Railway/VPS/Fly; SSE MCP sulit di Vercel serverless):**

```bash
REMOTE_MCP_ENABLED=true
REMOTE_MCP_PATH=/mcp
REMOTE_MCP_PUBLIC_URL=https://your-host.example.com/mcp
REMOTE_MCP_CORS_ORIGINS=*
```

**Auth:**

| Metode | Env tambahan | Catatan |
|--------|--------------|---------|
| API key | — | `Authorization: Bearer aic_...` atau `X-API-Key` |
| OAuth (ChatGPT dropdown) | `REMOTE_MCP_OAUTH_ENABLED=true`, `OIDC_ISSUER_URL`, `OIDC_MCP_OWNER_ID` | Phase 17 OIDC; discovery di `/.well-known/oauth-protected-resource/mcp` |

- Implementasi: [.ai/phases/13.1-remote-mcp-clients/](../.ai/phases/13.1-remote-mcp-clients/README.md)
- ADR: [ADR-048 Implemented](../adr/048-remote-mcp-transport.md)

**Jangan** tempel URL REST (`/api/v1`) ke field Server URL MCP — protokol berbeda.

---

## 6. MCP — client lain

**Disarankan:** `npm run setup` (Cursor + Claude Code) — credential dari `.env`, jangan duplikasi di `mcp.json`.

### Konfigurasi dasar

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "tsx", "D:/Apps/ratary/src/mcp/stdio.ts"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "...",
        "D1_DATABASE_ID": "...",
        "D1_API_TOKEN": "...",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Ganti path repo. Windows: gunakan slash `/`.

### Windows — jika `npx` gagal

```json
"command": "cmd",
"args": ["/c", "npx", "-y", "tsx", "D:/Apps/ratary/src/mcp/stdio.ts"]
```

### Lokasi config per client

| Client | File |
|--------|------|
| Cursor (project) | `.cursor/mcp.json` |
| Claude Code | `.mcp.json` |
| Roo Code | `.roo/mcp.json` |
| Gemini CLI | `.gemini/settings.json` — template: `docs/examples/gemini-settings.json.example` |
| VS Code Copilot | `.vscode/mcp.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |

### Verifikasi

```bash
npm run mcp          # tidak crash = D1 OK
npm run test:integration
```

Tools MCP: `save_memory`, `search_memory`, `get_context`, `build_prompt`, `get_graph_capabilities`, `traverse_relations`, `list_workspaces`, `list_agents`, `register_agent`, dan 10 lainnya (**19 total**).

### MCP vs REST

| | MCP | REST API |
|---|-----|----------|
| Auth | D1 di env | `Bearer aic_...` |
| Client | Cursor, Claude, Cline, … | curl, ChatGPT Actions |
| Deploy | Tidak perlu server | Vercel / `npm run dev` |

Keduanya menulis ke **D1 yang sama**.

### Transport & gRPC (Fase 10.5)

Semua protokol (REST, MCP, gRPC) memanggil **handler bersama yang sama** → service yang sama. Tidak ada logika bisnis di lapisan transport.

| Protokol | Untuk siapa | Default |
|----------|-------------|---------|
| REST `/api/v1` | Integrator publik, ChatGPT Actions | ✅ selalu aktif |
| MCP stdio | AI clients di IDE (Cursor, Claude, …) | ✅ selalu aktif |
| MCP remote (ChatGPT URL) | Cloud MCP hosts | ✅ opt-in — `REMOTE_MCP_ENABLED=true` · [13.1](../.ai/phases/13.1-remote-mcp-clients/README.md) |
| gRPC `ontorata.ratary.v1` | Backend internal / enterprise, streaming context | ❌ opsional |

gRPC **mati secara default**. Untuk mengaktifkan (butuh Node yang berjalan lama — K8s/VM, **bukan** Vercel):

```bash
# .env
GRPC_ENABLED=true
GRPC_PORT=50051        # 0 = port ephemeral dari OS
# GRPC_TLS_CERT_PATH=... dan GRPC_TLS_KEY_PATH=... untuk mTLS (isi keduanya)
```

Cek transport yang aktif lewat manifest: `GET /api/v1/capabilities` → field `transport`.

---

## 7. Opsional

| Perintah | Untuk apa |
|----------|-----------|
| `npm run dev` | REST API / Swagger |
| `npm run sync:backups:watch` | Sync folder chat ke D1 |
| `npm run db:backfill-embeddings` | Generate embedding untuk memory tanpa `embedding_id` (dry-run default) |
| `npm run db:backfill-embeddings:execute` | Jalankan backfill embedding (butuh provider) |

### Embedding (Fase 5)

Backfill **async** — CRUD tidak memanggil model embedding.

1. Default: `EMBEDDING_PROVIDER=noop` (tes lokal, vektor nol).
2. Produksi OpenAI: set di `.env`:
   - `EMBEDDING_PROVIDER=openai`
   - `EMBEDDING_API_KEY=sk-...`
   - `EMBEDDING_MODEL=text-embedding-3-small` (opsional)
3. Cek dulu: `npm run db:backfill-embeddings`
4. Jalankan: `npm run db:backfill-embeddings:execute`

Hapus memory lewat REST/MCP otomatis membersihkan vektor terkait.

### Hybrid & graph retrieval (Fase 6 + 8)

Retrieval multi-sumber diaktifkan lewat env (default: SQL-only).

| Variable | Default | Efek |
|----------|---------|------|
| `HYBRID_RETRIEVAL` | `false` | Gabung SQL + vector (RRF) — butuh embedding provider |
| `GRAPH_RETRIEVAL` | `false` | Tambah leg graph di composite retrieval |
| `GRAPH_MAX_DEPTH` | `2` | Kedalaman BFS (max 3) |
| `GRAPH_SEED_CAP` | `5` | Seed lexical per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Budget neighbor total |

Contoh graph-only recall:

```env
GRAPH_RETRIEVAL=true
```

Contoh full hybrid + graph:

```env
HYBRID_RETRIEVAL=true
GRAPH_RETRIEVAL=true
EMBEDDING_PROVIDER=openai
EMBEDDING_API_KEY=sk-...
```

API eksplorasi graph (tanpa flag di atas): MCP `get_graph_capabilities`, `traverse_relations`; REST `GET /api/v1/graph/capabilities`, `POST /api/v1/graph/traverse`.

#### Tiga jalur graph (desain intentional)

| Jalur | Kapan aktif | Kedalaman | Gunakan untuk |
|-------|-------------|-----------|---------------|
| Composite graph leg | `GRAPH_RETRIEVAL=true` | BFS terbatas (`GRAPH_MAX_*`) | Kandidat retrieval di rank |
| Relations stage (6.5) | `GRAPH_RETRIEVAL=true` + stage `relations` | **One-hop** saja | Ringkasan tetangga langsung di `get_context` |
| `traverse_relations` MCP/REST | Agent panggil eksplisit | Depth 1–3 | Eksplorasi dalam (handoff, audit) |

Deep BFS **tidak** di-inline otomatis ke setiap `get_context` — hot path tetap ringan; agent yang butuh multi-hop memanggil `traverse_relations`.

#### Tuning graph padat (ops)

Saat graph banyak relasi (mis. `RELATION_INFERENCE_ENABLED=true`) dan context terasa noisy:

| Variable | Default | Panduan |
|----------|---------|---------|
| `RETRIEVAL_RELATION_NEIGHBOR_CAP` | `5` | One-hop neighbors di relations stage. Graph tipis: 5 OK. Graph padat/noisy: turunkan ke **3**. Butuh lebih banyak tetangga langsung: naikkan ke **8–10** (max 30). |
| `GRAPH_MAX_NEIGHBORS` | `30` | Budget composite graph leg — turunkan jika recall terlalu lebar. |
| `GRAPH_SEED_CAP` | `5` | Seed lexical — turunkan untuk corpus besar. |
| `max_chars` / `limit` | MCP/REST | Batasi token terlepas dari neighbor count. |

Validasi praktis: bandingkan output `get_context` sebelum/sesudah ubah cap; jalankan `npm run benchmark:context-tokens` jika perlu bukti token.

---

## 8. Infrastruktur platform (Fase 10 + 11)

Adapter eksternal diaktifkan melalui variabel lingkungan di composition root. **Default tidak berubah** (D1, inline storage, tanpa cache/events/analytics eksternal).

| Variable | Default | Provider | Catatan |
|----------|---------|---------|---------|
| `SQL_PROVIDER` | `d1` | D1 · `postgres` | **Phase 11:** Postgres metadata via `DATABASE_URL` |
| `VECTOR_PROVIDER` | `d1` | D1 · `pgvector` | Vektor di tabel `memory_embeddings` |
| `OBJECT_STORAGE_PROVIDER` | `inline` | R2 · S3 | Content offload (Phase 13) |
| `SEARCH_PROVIDER` | `sql` | SQL · Meilisearch | Hybrid search (Phase 14) |
| `GRAPH_PROVIDER` | `d1` | D1 · Neo4j | Knowledge graph (Phase 14) |
| `CACHE_PROVIDER` | `none` | Redis | Opsional (Phase 12) |
| `EVENT_BUS_PROVIDER` | `none` | Redis | Audit fan-out (Phase 12) |
| `ANALYTICS_PROVIDER` | `none` | DuckDB | Dev analytics (Phase 12) |
| `ENTERPRISE_RBAC` | `false` | RBAC | Workspace RBAC (Phase 10) |
| `MEMORY_ACCESS_AUDIT` | `false` | Audit | `memory.accessed` trail (ADR-017) |
| `OTEL_ENABLED` | `false` | OTel | OpenTelemetry HTTP tracing |

Rincian ADR: [.ai/adr/README.md](adr/README.md). Contoh variabel: [.env.example](../.env.example).

### Postgres metadata (Phase 11)

**Strategy:** Quiesce + backfill + env flip (ADR-018 Option A). **Runbook:** [.ai/phases/11-production-ops/MIGRATION.md](../.ai/phases/11-production-ops/MIGRATION.md)

| Env | Value | Catatan |
|-----|-------|---------|
| `SQL_PROVIDER` | `postgres` | Flip saat cutover |
| `DATABASE_URL` | `postgresql://...` | Wajib — dari vault, jangan commit |

#### Apply schema Postgres (idempotent)

```bash
# via DATABASE_URL
npm run db:apply-postgres-schema

# via --database-url flag
npx tsx scripts/apply-postgres-schema.ts --database-url=postgresql://user:pass@host:5432/dbname
```

#### Backfill D1 → Postgres

```bash
# dry-run (default) — log saja, tidak tulis
npm run db:backfill-d1-to-postgres

# execute — tulis data
npm run db:backfill-d1-to-postgres -- --execute

# dengan --target-url override
npm run db:backfill-d1-to-postgres -- --target-url=postgresql://user:pass@host:5432/dbname --execute

# scope owner tertentu
npm run db:backfill-d1-to-postgres -- --owner=<uuid> --execute

# batch size kustom (default 100)
npm run db:backfill-d1-to-postgres -- --batch-size=500 --execute
```

#### Verifikasi parity (D1 ↔ Postgres)

```bash
npm run db:verify-postgres-parity

# dengan --target-url override
npm run db:verify-postgres-parity -- --target-url=postgresql://user:pass@host:5432/dbname
```

Exit code `0` = parity OK. `1` = mismatch — block flip sampai diperbaiki.

### Backfill provider eksternal

Semua perintah di bawah **dry-run** secara default; tambahkan `:execute` atau flag `--execute` untuk menulis data.

| Perintah | Prasyarat env |
|----------|---------------|
| `npm run db:backfill-pgvector` | `PGVECTOR_DATABASE_URL` atau `DATABASE_URL` |
| `npm run db:backfill-meilisearch` | `MEILISEARCH_HOST`, `MEILISEARCH_INDEX` |
| `npm run db:backfill-neo4j` | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |
| `npm run db:backfill-organizations` | Enterprise schema (D1) |
| `npm run db:backfill-workspaces` | Phase 9 workspace |

Opsi CLI: `--owner=<uuid>`, `--batch-size=100`, `--execute`.

---

## 10. Observability & OTel (Phase 12D / 19)

Enable structured telemetry without changing default deploy:

```env
OBSERVABILITY_ENABLED=true
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

- Metrics: `GET /metrics` (Prometheus format when enabled)
- Dashboards: import JSON from `observability/dashboards/`
- Full stack wiring: [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md)

Smoke: `npm test -- tests/observability`

---

## 11. Agent Ecosystem (Phase 15F)

Multi-agent workspace memory (Phase 9) + autonomous agent registration:

| Fitur | MCP / REST |
|-------|------------|
| Daftar agent | `list_agents`, `register_agent` |
| Workspace scope | header `x-workspace-id` atau env MCP |
| Federation (opt-in) | `FEDERATION_ENABLED=true` — lihat [ADR-029](../.ai/adr/029-federation-layer.md) |

E2E: `npm test -- tests/api/ecosystem.test.ts`

---

## 9. Migrasi lingkungan pengembangan

Apabila Anda memindahkan instalasi ke perangkat atau workstation baru, ikuti panduan formal:

**[README.md — Instalasi pada Lingkungan Pengembangan Baru](../README.md#instalasi-pada-lingkungan-pengembangan-baru)**

Ringkasan: salin `.env` (terutama `AUTH_SECRET`), jalankan `db:migrate`, verifikasi dengan `test:integration`, konfigurasi ulang MCP.

---

## Developer?

| Dokumen | Isi |
|---------|-----|
| [.ai/core/ai-rules/11-AI-RULES.md](.ai/core/ai-rules/11-AI-RULES.md) | Aturan agent + registry modul |
| [.ai/core/architecture/04-ARCHITECTURE.md](.ai/core/architecture/04-ARCHITECTURE.md) | Struktur, layer, extension points |
| [.ai/workflow/05-WORKFLOW.md](.ai/workflow/05-WORKFLOW.md) | Proses Principal Engineer & format analisis |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Status post–Phase 10 |
| [.ai/workflow/12-TASK-TEMPLATE.md](.ai/workflow/12-TASK-TEMPLATE.md) | Template task untuk fase berikutnya |
| [adr/POLICY.md](../.ai/adr/POLICY.md) | Kebijakan ADR — wajib untuk perubahan struktural |
| [archive/](../.ai/archive/) | Desain historis per fase |
