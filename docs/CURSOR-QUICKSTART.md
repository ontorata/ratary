# Cursor — Setup 2 Menit (User Biasa)

Untuk pemakaian sehari-hari di **Cursor**, cukup MCP. Tidak perlu REST API, API key, atau handoff manual.

## Yang Anda butuhkan

1. Clone repo + `npm install`
2. File `.env` berisi credential D1 (sama seperti Quick Start)
3. `npm run db:migrate` (sekali)

**Tidak perlu:** `npm start`, `aic_...` API key, curl, file `CONTEXT-HANDOFF.md`.

---

## Setup MCP (sekali)

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edit **hanya path** repo Anda:

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
      "command": "npx",
      "args": ["-y", "tsx", "D:/Apps/ai-brain/src/mcp/stdio.ts"],
      "cwd": "D:/Apps/ai-brain"
    }
  }
}
```

Credential D1 dibaca otomatis dari `.env` di folder repo — **jangan** salin lagi ke `mcp.json`.

**Cursor → Settings → MCP** → pastikan `ai-memory-cloud` hijau → Reload Window.

---

## Cara pakai

| Anda bilang di chat | AI otomatis |
|---------------------|-------------|
| Mulai kerja / lanjut project | `search_memory` → baca konteks lama |
| Selesai / tutup chat | `save_memory` → simpan handoff ke D1 |
| Cari catatan lama | `search_memory` atau `get_memory` |

Contoh kalimat:

```
Lanjut kerja ai-brain
```

```
Simpan handoff sebelum tutup
```

```
Cari memory tentang backup sync
```

---

## MCP vs REST API

```
Cursor (Anda)
    │
    └── MCP ai-memory-cloud ──► Cloudflare D1
         (langsung, tanpa API key)

REST API (aic_...) ──► untuk script, Postman, app lain — BUKAN untuk Cursor sehari-hari
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| MCP merah | Cek path `tsx` + `cwd` di `mcp.json` |
| MCP error env | Pastikan `.env` ada di root repo, isi `CLOUDFLARE_*` + `D1_*` |
| Memory kosong | Normal di DB baru — mulai `save_memory` dari chat |
| Windows `npx` gagal | Lihat [MCP-SETUP.md](MCP-SETUP.md) — pakai `cmd /c` |

---

## Opsional (bukan wajib)

- `npm run sync:backups:watch` — sinkron folder chat markdown ke D1
- `npm run dev` — hanya jika mau uji Swagger / REST API manual
