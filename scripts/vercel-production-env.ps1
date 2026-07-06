# Prereq: Tier 0–1 working locally (AUTH_SECRET, SQL_PROVIDER, DATABASE_URL) before fabric flags.
#         vercel CLI linked to ratary project (vercel link)
# Canonical host: https://ratary.ontorata.com
# Usage: .\scripts\vercel-production-env.ps1 [-EnvFile .env]

param(
  [string]$EnvFile = ".env",
  [ValidateSet('production', 'preview', 'development')]
  [string]$Target = 'production'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Install Vercel CLI: npm i -g vercel" -ForegroundColor Yellow
  exit 1
}

function Read-DotEnv([string]$path) {
  $map = @{}
  if (-not (Test-Path $path)) { return $map }
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $k, $v = $_ -split '=', 2
    $map[$k.Trim()] = $v.Trim().Trim('"')
  }
  return $map
}

$envMap = Read-DotEnv (Join-Path $root $EnvFile)
$keys = @(
  'KNOWLEDGE_FABRIC_ENABLED',
  'CONNECTOR_SYNC_ENABLED',
  'NOTION_API_TOKEN',
  'NOTION_API_VERSION'
)

Write-Host "`n=== Ratary Vercel env ($Target) ===" -ForegroundColor Cyan

foreach ($key in $keys) {
  $value = $envMap[$key]
  if (-not $value) {
    Write-Host "Skip $key (not in $EnvFile)" -ForegroundColor DarkYellow
    continue
  }
  Write-Host "Setting $key ..."
  $value | vercel env add $key $Target --force
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed on $key. Run: vercel link" -ForegroundColor Red
    exit 1
  }
}

Write-Host "`nDone. Redeploy: vercel --prod" -ForegroundColor Green
Write-Host "Guide: docs/PRODUCTION-ENABLE.md"
