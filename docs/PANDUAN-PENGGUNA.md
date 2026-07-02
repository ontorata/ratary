# Panduan Pengguna — AI Memory Cloud

Panduan ini untuk **Anda yang memakai AI Memory Cloud lewat Cursor atau Claude Code** — tanpa perlu jadi developer.

**Tujuan:** memory coding Anda tersimpan di cloud, bisa diambil AI kapan saja, dari laptop mana saja.

---

## Apa itu AI Memory Cloud?

| Istilah | Arti sederhana |
|---------|----------------|
| **Memory** | Catatan yang disimpan (judul, isi, proyek, tag) |
| **Second brain** | AI ingat keputusan, handoff, dan catatan proyek untuk Anda |
| **MCP** | Jembatan antara Cursor/Claude dan database memory Anda |
| **Proyek** | Label grup memory, misalnya `ai-brain`, `mangroveapps` |

Anda **cukup chat** — AI yang memanggil tool simpan/cari/baca memory di belakang layar.

---

## Setup pertama kali

Ikuti **[MULAI-DISINI.md](MULAI-DISINI.md)** (3 langkah):

1. `npm install`
2. Isi `.env` (credential Cloudflare D1) → `npm run db:migrate`
3. `npm run setup` → reload Cursor / approve di Claude Code

**Cek berhasil:** Settings → MCP → `ai-memory-cloud` **hijau**.

---

## Cara pakai sehari-hari

Anda **tidak perlu** mengetik nama tool. Bilang saja dengan bahasa natural:

### Lanjut kerja

```
Lanjut kerja ai-brain — fokus dokumentasi
```

```
Baca dulu memory tentang auth sebelum kita coding
```

AI akan mengambil memory yang relevan (Fase 4: otomatis memilih cuplikan terbaik, bukan dump semua catatan).

### Simpan catatan / handoff

```
Simpan handoff: hari ini selesai fix MCP, besok lanjut test
```

```
Catat keputusan: pakai JWT HS256 untuk API internal
```

### Cari catatan tertentu

```
Cari memory tentang deployment Vercel
```

```
Ada catatan soal hydration bug?
```

### Buka catatan by codename (jika tahu)

```
Buka memory NOTE-0042
```

---

## Tips agar memory lebih berguna

1. **Sebut nama proyek** — `ai-brain`, `mangroveapps`, dll.
2. **Sebut topik** — `auth`, `hydration`, `deploy`.
3. **Akhiri sesi dengan handoff** — ringkasan singkat agar besok bisa lanjut tanpa menjelaskan ulang.
4. **Pakai tag konsisten** — misalnya `handoff`, `decision`, `bug`.
5. **Satu memory = satu topik** — lebih mudah dicari daripada satu catatan panjang berisi banyak hal.

---

## Kapan pakai apa?

| Anda ingin… | Bilang di chat… |
|-------------|-----------------|
| AI baca konteks proyek sebelum coding | "Lanjut kerja [proyek]" |
| Simpan ringkasan akhir sesi | "Simpan handoff …" |
| Cari satu topik | "Cari memory tentang …" |
| Ringkas keputusan yang sudah tersimpan | "Ringkas apa yang sudah kita putuskan untuk [proyek]" |

Panduan lebih detail Fase 4: **[FASE-4-PANDUAN.md](FASE-4-PANDUAN.md)**

---

## Privasi & keamanan (penting)

### Penggunaan pribadi (satu orang, satu laptop)

- Isi `.env` dengan credential D1 Anda.
- `MCP_OWNER_ID` **boleh kosong** untuk development — memory masuk ke pool legacy bersama.
- Jangan commit atau share file `.env`.

### Production / tim / lebih dari satu user

Set **`MCP_OWNER_ID`** di `.env` ke ID owner Anda (dari bootstrap REST API):

```env
MCP_OWNER_ID=uuid-owner-anda
```

**Kenapa?** Tanpa ini, semua memory MCP bisa tercampur di pool yang sama. Di production, sistem **menolak start MCP** jika `MCP_OWNER_ID` kosong.

| Situasi | `MCP_OWNER_ID` |
|---------|----------------|
| Dev lokal, solo | Opsional |
| Production / shared server | **Wajib** |
| REST API dengan login | Owner dari JWT — terpisah dari MCP |

---

## Apa yang TIDAK perlu Anda lakukan

- Tidak perlu `npm start` untuk chat sehari-hari
- Tidak perlu API key di Cursor (MCP langsung ke D1)
- Tidak perlu curl atau Postman
- Tidak perlu menjalankan script `consolidate` atau `backfill` — itu untuk pengelola sistem

---

## Setelah update repo (`git pull`)

1. `npm install` (jika ada dependency baru)
2. `npm run setup` (refresh config MCP)
3. Reload window di Cursor
4. Cek MCP masih hijau

Opsional untuk pengelola DB:

```bash
npm run db:migrate
```

---

## Masalah umum

| Gejala | Coba ini |
|--------|----------|
| MCP merah | `npm run setup` → reload Cursor |
| AI tidak pakai memory | Sebut proyek + topik; atau: "Cari dulu di memory cloud tentang X" |
| Memory kosong | Normal di DB baru — simpan beberapa catatan dulu |
| AI jawaban terlalu umum | "Lanjut kerja [proyek]" atau handoff dulu |
| MCP error di production | Pastikan `MCP_OWNER_ID` terisi di `.env` |
| Pindah laptop | Clone repo → `.env` → `npm run setup` — lihat README bagian setup laptop baru |

---

## Contoh alur kerja mingguan

**Senin pagi**
> Lanjut kerja mangroveapps dari handoff terakhir

**Senin sore**
> Simpan handoff: selesai fix hydration, besok lanjut E2E

**Selasa**
> Lanjut kerja mangroveapps — lanjut E2E hydration

**Jumat**
> Ringkas keputusan penting mangroveapps minggu ini

---

## Dokumen lain

| Dokumen | Untuk siapa |
|---------|-------------|
| [MULAI-DISINI.md](MULAI-DISINI.md) | Setup pertama — 3 langkah |
| [FASE-4-PANDUAN.md](FASE-4-PANDUAN.md) | Cara pakai fitur memory pintar (Fase 4) |
| [MCP-SETUP.md](MCP-SETUP.md) | Detail teknis MCP & multi-client |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Developer |
| [PHASE-5-EMBEDDING-DESIGN.md](PHASE-5-EMBEDDING-DESIGN.md) | Rencana fase berikutnya (developer) |

---

**Ringkas:** Setup sekali lewat MULAI-DISINI, lalu chat natural dengan menyebut **proyek** dan **topik**. Simpan handoff di akhir sesi. Untuk production, set `MCP_OWNER_ID`.
