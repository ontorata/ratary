# Push ChatGPT / MCP OAuth env to Vercel
# Usage: .\scripts\vercel-mcp-oauth-env.ps1 -IssuerUrl https://auth.example.com/realms/ratary [-OwnerId uuid]

param(
  [Parameter(Mandatory = $true)]
  [string]$IssuerUrl,
  [string]$OwnerId = '3d7a5c31-8e16-4855-bc13-83bd1b1d89c3',
  [ValidateSet('production', 'preview', 'development')]
  [string]$Target = 'production'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host 'Install Vercel CLI: npm i -g vercel' -ForegroundColor Yellow
  exit 1
}

$issuer = $IssuerUrl.Trim().TrimEnd('/')
$pairs = @{
  REMOTE_MCP_OAUTH_ENABLED = 'true'
  OIDC_ISSUER_URL = $issuer
  OIDC_MCP_OWNER_ID = $OwnerId
}

Write-Host "`n=== Ratary MCP OAuth env ($Target) ===" -ForegroundColor Cyan
Write-Host "Issuer: $issuer" -ForegroundColor DarkGray
Write-Host "Owner:  $OwnerId" -ForegroundColor DarkGray
Write-Host 'Note: Smithery API-key path expects REMOTE_MCP_OAUTH_ENABLED=false — see MCP/submission/smithery.md' -ForegroundColor Yellow

foreach ($entry in $pairs.GetEnumerator()) {
  Write-Host "Setting $($entry.Key) ..."
  $entry.Value | vercel env add $entry.Key $Target --force
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "`nDone. Redeploy: vercel --prod" -ForegroundColor Green
Write-Host 'Verify: Invoke-RestMethod https://ratary.ontorata.com/.well-known/oauth-protected-resource/mcp' -ForegroundColor DarkGray
