# Push federation + universal fabric flags to Vercel production
# Usage: .\scripts\vercel-federation-env.ps1 [-EnvFile .env]

param(
  [string]$EnvFile = '.env',
  [ValidateSet('production', 'preview', 'development')]
  [string]$Target = 'production'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

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

$defaults = @{
  FEDERATION_ENABLED = 'true'
  UNIVERSAL_MEMORY_FABRIC_ENABLED = 'true'
  FEDERATION_NODE_BASE_URL = 'https://ratary.ontorata.com'
  FEDERATION_NODE_DISPLAY_NAME = 'ratary-prod'
  FEDERATION_METADATA_PROVIDER = 'sql'
  FEDERATION_PEERS_JSON = '[]'
}

$envMap = Read-DotEnv (Join-Path $root $EnvFile)
$keys = @(
  'FEDERATION_ENABLED',
  'UNIVERSAL_MEMORY_FABRIC_ENABLED',
  'FEDERATION_NODE_ID',
  'FEDERATION_NODE_BASE_URL',
  'FEDERATION_NODE_DISPLAY_NAME',
  'FEDERATION_METADATA_PROVIDER',
  'FEDERATION_PEERS_JSON'
)

Write-Host "`n=== Ratary federation env ($Target) ===" -ForegroundColor Cyan

foreach ($key in $keys) {
  $value = if ($envMap[$key]) { $envMap[$key] } else { $defaults[$key] }
  if (-not $value) {
    Write-Host "Skip $key (no value)" -ForegroundColor DarkYellow
    continue
  }
  Write-Host "Setting $key ..."
  $value | vercel env add $key $Target --force
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "`nDone. Redeploy: vercel --prod" -ForegroundColor Green
