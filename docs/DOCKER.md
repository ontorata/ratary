# Ratary — Docker & Compose

Run **Ratary Server** in a container alongside optional Postgres for self-hosted deployments.

**Default OSS path** remains `npm run dev` with Cloudflare D1 — Docker is an additive distribution option.

---

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- `AUTH_SECRET` (min 32 characters): `openssl rand -hex 32`

---

## Quick start (Postgres profile)

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
export AUTH_SECRET="$(openssl rand -hex 32)"
docker compose --profile postgres up --build
```

Wait until health checks pass, then:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"docker-local"}'
```

Save the returned `apiKey` (`aic_...`) for REST and `@ratary/mcp-server`.

**MCP stdio for IDE** still runs on your workstation — clone the repo or use `@ratary/mcp-server` pointing at this server. See [Installation](install/README.md).

---

## Environment

| Variable | Required | Notes |
|----------|----------|-------|
| `AUTH_SECRET` | Yes | Session signing — never bake into the image |
| `POSTGRES_PASSWORD` | No | Default `ratary` — change in production |
| `PORT` | No | Host port mapping (default `3000`) |

Compose sets `SQL_PROVIDER=postgres` and `DATABASE_URL` automatically for the `postgres` profile.

For Cloudflare D1 inside a container, build the image and run with your `.env` mounted — not covered by the bundled compose profile.

Full variable reference: [CONFIGURATION.md](CONFIGURATION.md).

---

## Profiles

| Profile | Stack | When to use |
|---------|-------|-------------|
| `postgres` | Ratary + Postgres 16 | Self-host without D1 |
| `enterprise` | Ratary + MariaDB + MinIO + Redis | On-prem enterprise stack (MariaDB metadata + MinIO object storage) |

```bash
docker compose --profile postgres up --build -d
docker compose --profile enterprise up --build -d
```

The `enterprise` profile runs `ratary-enterprise` with `SQL_PROVIDER=mariadb` and `OBJECT_STORAGE_PROVIDER=minio` pre-wired. Override credentials via `.env` — see [CONFIGURATION — Tier 2](CONFIGURATION.md#tier-2--platform-adapters).

---

## Pull from GHCR (releases)

When published:

```bash
docker pull ghcr.io/ontorata/ratary:latest
docker run --rm -p 3000:3000 \
  -e AUTH_SECRET="your-secret-min-32-chars" \
  -e CLOUDFLARE_ACCOUNT_ID=... \
  -e D1_DATABASE_ID=... \
  -e D1_API_TOKEN=... \
  ghcr.io/ontorata/ratary:latest
```

Tagged images match GitHub release tags.

---

## Upgrade & backup

**Upgrade:** pull or rebuild the image, restart the stack. Migrations run automatically on container start.

**Postgres backup:**

```bash
docker compose --profile postgres exec postgres \
  pg_dump -U ratary ratary > ratary-backup.sql
```

**Restore:** stop Ratary, restore into Postgres, restart.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Container exits immediately | Check logs — `AUTH_SECRET` missing or too short |
| `/health` not ready | Wait for migrations; Postgres health must be green first |
| Remote MCP on serverless | Use a persistent host — see [CONFIGURATION — Remote MCP](CONFIGURATION.md#remote-mcp-streamable-http) |

More: [GUIDE — Troubleshooting](GUIDE.md#5-troubleshooting).
