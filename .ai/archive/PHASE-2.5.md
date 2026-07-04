# Phase 2.5 — Stabilization

Fase ini **bukan menambah fitur bisnis**, melainkan menguatkan fondasi sebelum Phase 3 (JWT/OAuth/permissions).

**Durasi disarankan:** 1–2 hari  
**Status:** ✅ Selesai (verifikasi lokal: lint, format:check, typecheck, **40 tests**)

---

## Tujuan (sesuai saran Anda)

1. Review struktur folder → [ARCHITECTURE.md](ARCHITECTURE.md)
2. Dokumentasi OpenAPI/Swagger lebih lengkap (tag Auth, security schemes)
3. Lint, format, dan test otomatis
4. CI/CD GitHub Actions (lint + format + typecheck + test)
5. Observability dasar (request ID, response time, audit context)
6. Rate limiting auth, health check D1, graceful shutdown

---

## Checklist Anda vs Status Repo

### Security

| Item | Status | Catatan |
|------|--------|---------|
| Tidak ada plaintext API key | ✅ | Hanya `secret_hash` di DB |
| HMAC + `AUTH_SECRET` | ✅ | `src/auth/crypto.ts` |
| Bootstrap hanya sekali | ✅ | + test E2E |
| Semua endpoint `/api/v1` | ✅ | Legacy routes dihapus Phase 3 |
| Audit log | ✅ | Auth events → `audit_logs` |
| Rate limiting (auth) | ✅ | Phase 2.5 — `@fastify/rate-limit` |

### Code Quality

| Item | Status |
|------|--------|
| Thin controller | ✅ |
| Tidak ada SQL di controller | ✅ |
| Repository hanya akses D1 | ✅ |
| Service tidak tahu HTTP | ✅ |
| Middleware tidak akses DB langsung | ✅ |

### Testing

| Item | Status | Catatan |
|------|--------|---------|
| Unit test Repository | ✅ | `tests/repositories/memory.repository.test.ts` |
| Unit test IdentityService | ✅ | `tests/auth/identity.service.test.ts` |
| Unit test AuthService | ✅ | `tests/auth/auth.service.test.ts` |
| Integration test REST API | ✅ | `tests/api.test.ts`, `tests/auth/api.test.ts` |
| Bootstrap test | ✅ | |
| Unauthorized test | ✅ | |
| Permission denied test | ✅ | `tests/auth/phase3.test.ts` |

### Deployment

| Item | Status | Catatan |
|------|--------|---------|
| Env vars tervalidasi startup | ✅ | Zod di `src/config/env.ts` |
| Health cek koneksi D1 | ✅ | `HealthService` → `503` jika gagal |
| Structured logging (Pino) | ✅ | |
| Error handler global | ✅ | |
| Graceful startup/shutdown | ✅ | `SIGINT`/`SIGTERM` di `dev-server.ts` |
| CI/CD | ✅ | `.github/workflows/ci.yml` |

---

## Checklist implementasi Phase 2.5

### Keamanan & deploy

- [x] Rate limiting pada auth endpoints sensitif
- [x] Health check dengan ping D1 (`503` jika gagal)
- [x] Graceful shutdown (`SIGTERM` / `SIGINT`) di dev server
- [x] Env vars tervalidasi saat startup (Zod — sudah dari Phase 2)

### Observability

- [x] Request ID (`x-request-id`, `genReqId`)
- [x] Response time di log (`onResponse` hook)
- [x] Audit event menyertakan `requestId`, IP, user-agent (sudah dari Phase 2)

### CI/CD

- [x] GitHub Actions: `lint` + `format:check` + `typecheck` + `test` pada push/PR ke `main`

### Dokumentasi

- [x] [docs/ARCHITECTURE.md](ARCHITECTURE.md) — struktur & alur request
- [x] Swagger: tag **Auth**, security scheme Bearer/`X-API-Key`
- [x] Panduan ini (`PHASE-2.5.md`)

### Testing

- [x] Unit test `MemoryRepository`
- [x] Unit test `IdentityService`
- [x] Unit test `AuthService`
- [x] Unit test `HealthService`
- [x] E2E: bootstrap, 401, client registry, owner isolation (dari Phase 2)

### Selesai di Phase 3

- [x] Permission granular (`memory.read`, `memory.write` enforcement)
- [x] JWT / OAuth providers
- [x] Hapus legacy routes (`/memory`, dll.)
- [x] Test coverage threshold di CI
- [x] Rate limit di Vercel edge (perlu KV / Upstash jika multi-instance)

---

## Rate limiting

Diterapkan per IP pada route auth (`src/plugins/rate-limit.ts`):

| Endpoint | Limit |
|----------|-------|
| `POST /api/v1/auth/bootstrap` | 5 / jam |
| `POST /api/v1/auth/identities` | 20 / menit |
| `POST /api/v1/auth/identities/:id/rotate` | 10 / menit |

> Rate limit per IP pada route auth (`src/plugins/rate-limit.ts`).
> **Local / single instance:** in-memory counter (default).
> **Vercel multi-instance:** set `RATE_LIMIT_REDIS_URL` atau `REDIS_URL` ke Upstash Redis — counter dibagi antar instance via ioredis (`src/plugins/rate-limit-redis.ts`, `skipOnError: true`).

---

## Health check

```bash
curl http://localhost:3001/health
```

Response sukses:

```json
{
  "status": "ok",
  "service": "ai-memory-cloud",
  "timestamp": "...",
  "checks": { "database": "ok" }
}
```

Jika D1 tidak bisa dijangkau → HTTP **503**, `"status": "degraded"`.

---

## Verifikasi lokal

```bash
npm run lint          # ✅
npm run format:check  # ✅
npm run typecheck     # ✅
npm run test          # ✅ 423 tests
npm run test:coverage # ✅ enforces src/ thresholds (80/75/85/80)
```

Sama dengan yang dijalankan GitHub Actions (`.github/workflows/ci.yml`).

---

## Graceful shutdown

`npm run dev` menangkap `SIGINT` / `SIGTERM` → `app.close()` sebelum exit.

---

## Langkah setelah Phase 2.5

1. Jalankan `npm run db:migrate` jika belum
2. Bootstrap production (sekali) jika belum
3. Set `AUTH_SECRET` + D1 vars di Vercel
4. Monitor `/health` di uptime checker
5. Lanjut **Phase 4** — Memory Intelligence

---

## Referensi

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [../PANDUAN.md](../PANDUAN.md)
- README → Instalasi pada Lingkungan Pengembangan Baru
