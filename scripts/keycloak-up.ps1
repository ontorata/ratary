# Start Keycloak IdP for Ratary MCP OAuth (local / tunnel / Render host)
# Usage: .\scripts\keycloak-up.ps1 [-Port 8080]

param(
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$compose = Join-Path $root 'infra\keycloak\docker-compose.yml'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host 'Docker required. Install Docker Desktop.' -ForegroundColor Red
  exit 1
}

$env:KC_HTTP_PORT = "$Port"
$envFile = Join-Path (Split-Path $compose) '.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $k, $v = $_ -split '=', 2
    Set-Item -Path "env:$($k.Trim())" -Value $v.Trim().Trim('"')
  }
}
if (-not $env:KC_ADMIN_PASSWORD) {
  Write-Host 'Missing KC_ADMIN_PASSWORD. Copy infra/keycloak/.env.example to infra/keycloak/.env' -ForegroundColor Red
  exit 1
}
Push-Location (Split-Path $compose)
try {
  docker compose up -d
  Write-Host "`nWaiting for Keycloak on http://localhost:$Port ..." -ForegroundColor Cyan
  $deadline = (Get-Date).AddMinutes(3)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri "http://localhost:$Port/realms/ratary/.well-known/openid-configuration" -UseBasicParsing -TimeoutSec 5
      if ($r.StatusCode -eq 200) {
        & (Join-Path $root 'scripts\keycloak-enable-dcr.ps1') -BaseUrl "http://localhost:$Port"
        if (Test-Path (Join-Path $root 'scripts\keycloak-create-demo-user.ps1')) {
          & (Join-Path $root 'scripts\keycloak-create-demo-user.ps1') -BaseUrl "http://localhost:$Port"
        }
        Write-Host "Keycloak ready. Issuer: http://localhost:$Port/realms/ratary" -ForegroundColor Green
        Write-Host "Admin console: http://localhost:$Port/admin (credentials from infra/keycloak/.env)" -ForegroundColor DarkGray
        Write-Host "DCR: POST http://localhost:$Port/realms/ratary/clients-registrations/openid-connect" -ForegroundColor DarkGray
        exit 0
      }
    } catch {
      Start-Sleep -Seconds 5
    }
  }
  Write-Host 'Keycloak did not become ready in time. Check: docker compose -f infra/keycloak/docker-compose.yml logs' -ForegroundColor Yellow
  exit 1
} finally {
  Pop-Location
}
