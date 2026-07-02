# Mulai Di Sini — 3 Langkah

Panduan paling singkat untuk **Cursor** dan **Claude Code**.  
Tidak perlu API key, `npm start`, atau curl.

---

## 1. Install

```bash
git clone https://github.com/lutfi04/ai-brain.git
cd ai-brain
npm install
```

## 2. Isi `.env`

```bash
cp .env.example .env
```

Buka `.env`, isi 3 baris D1 dari [Cloudflare Dashboard](https://dash.cloudflare.com):

- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `D1_API_TOKEN`

```bash
npm run db:migrate
```

## 3. Setup MCP (otomatis)

```bash
npm run setup
```

Script ini membuat `.mcp.json` dan `.cursor/mcp.json` dengan path yang benar.  
**Jangan** salin credential D1 ke file MCP — sudah dibaca dari `.env`.

---

## Selesai — pilih client

### Cursor

1. **Settings → MCP** → `ai-memory-cloud` hijau
2. **Reload Window**
3. Coba chat: `cari memory tentang ai-brain`

### Claude Code

```bash
cd path/ke/ai-brain
claude
```

Approve `ai-memory-cloud` saat diminta → chat: `cari memory tentang ai-brain`

---

## Cara pakai sehari-hari

| Bilang di chat | AI otomatis |
|----------------|-------------|
| Lanjut kerja [proyek] | Baca memory lama |
| Simpan handoff | Simpan ringkasan ke D1 |
| Cari catatan tentang X | Search memory |

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| MCP merah / error | `npm run setup` lagi, lalu reload |
| Claude "Pending approval" | Jalankan `claude` di folder repo → approve |
| Jangan pakai `claude mcp add-json` | Pakai `npm run setup` saja |
| Memory kosong | Normal di DB baru — mulai chat & simpan |

---

## Opsional (bukan wajib)

| Perintah | Untuk apa |
|----------|-----------|
| `npm run dev` | Uji REST API / Swagger |
| `npm run sync:backups:watch` | Sync folder chat ke D1 |

Detail lengkap: [MCP-SETUP.md](MCP-SETUP.md)
