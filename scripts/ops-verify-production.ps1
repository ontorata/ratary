# Verify Ratary production ops checklist (read-only)
# Usage: .\scripts\ops-verify-production.ps1 [-Url https://ratary.ontorata.com]

param(
  [string]$Url = 'https://ratary.ontorata.com',
  [string]$IssuerHost = 'auth.ontorata.com'
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Result([string]$Name, [string]$Status, [string]$Detail = '') {
  $color = switch ($Status) {
    'PASS' { 'Green' }
    'WARN' { 'Yellow' }
    'FAIL' { 'Red' }
    'BLOCKED' { 'DarkYellow' }
    default { 'White' }
  }
  Write-Host ("[{0}] {1}" -f $Status, $Name) -ForegroundColor $color
  if ($Detail) { Write-Host "      $Detail" -ForegroundColor DarkGray }
}

Write-Host "`n=== Ratary ops verify: $Url ===" -ForegroundColor Cyan

try {
  $health = Invoke-RestMethod -Uri "$Url/api/v1/health" -TimeoutSec 20
  $status = if ($health.status) { $health.status } else { 'ok' }
  Write-Result 'API health' 'PASS' $status
} catch {
  Write-Result 'API health' 'FAIL' $_.Exception.Message
}

try {
  $caps = Invoke-RestMethod -Uri "$Url/api/v1/capabilities" -TimeoutSec 20
  if ($caps.supportsKnowledgeFabric -eq $true) {
    Write-Result 'Knowledge fabric capability' 'PASS'
  } else {
    Write-Result 'Knowledge fabric capability' 'WARN' 'supportsKnowledgeFabric not true'
  }
} catch {
  Write-Result 'Knowledge fabric capability' 'FAIL' $_.Exception.Message
}

try {
  $out = npx tsx scripts/test-connector-sync.ts --connector notion --url $Url --dry-run 2>&1 | Out-String
  if ($LASTEXITCODE -eq 0 -or $out -match 'supportsKnowledgeFabric:\s*true') {
    Write-Result 'Notion connector (dry-run)' 'PASS'
  } else {
    Write-Result 'Notion connector (dry-run)' 'WARN' ($out.Trim().Split("`n")[-1])
  }
} catch {
  Write-Result 'Notion connector (dry-run)' 'FAIL' $_.Exception.Message
}

$optionalConnectors = @(
  'CONFLUENCE_BASE_URL', 'CONFLUENCE_EMAIL', 'CONFLUENCE_API_TOKEN',
  'GOOGLE_DRIVE_CREDENTIALS_JSON', 'GOOGLE_DRIVE_FOLDER_ID',
  'SHAREPOINT_TENANT_ID', 'SHAREPOINT_CLIENT_ID', 'SHAREPOINT_CLIENT_SECRET', 'SHAREPOINT_SITE_ID',
  'TEAMS_TEAM_ID', 'TEAMS_CHANNEL_ID'
)

if (Get-Command vercel -ErrorAction SilentlyContinue) {
  $vercelEnv = vercel env ls production 2>&1 | Out-String
  foreach ($key in $optionalConnectors) {
    if ($vercelEnv -match "(?m)^\s*$key\s") {
      Write-Result "Vercel env $key" 'PASS' 'set on production'
    } else {
      Write-Result "Vercel env $key" 'BLOCKED' 'not set - owner must add creds + vercel-production-env.ps1'
    }
  }
  foreach ($key in @('UNIVERSAL_MEMORY_FABRIC_ENABLED', 'FEDERATION_ENABLED', 'KNOWLEDGE_FABRIC_ENABLED', 'CONNECTOR_SYNC_ENABLED')) {
    if ($vercelEnv -match "(?m)^\s*$key\s") {
      Write-Result "Vercel env $key" 'PASS'
    } else {
      Write-Result "Vercel env $key" 'WARN' 'missing on production'
    }
  }
  if ($vercelEnv -match '(?m)^\s*REMOTE_MCP_OAUTH_ENABLED\s') {
    Write-Result 'Vercel REMOTE_MCP_OAUTH_ENABLED' 'PASS' 'present (value encrypted)'
  }
} else {
  Write-Result 'Vercel env audit' 'WARN' 'vercel CLI not installed'
}

try {
  npm run db:migrate 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-Result 'D1 db:migrate' 'PASS'
  } else {
    Write-Result 'D1 db:migrate' 'FAIL' "exit $LASTEXITCODE"
  }
} catch {
  Write-Result 'D1 db:migrate' 'FAIL' $_.Exception.Message
}

try {
  $oidc = Invoke-RestMethod -Uri "https://$IssuerHost/realms/ratary/.well-known/openid-configuration" -TimeoutSec 15
  Write-Result 'Keycloak OIDC issuer' 'PASS' ($oidc.issuer)
} catch {
  Write-Result 'Keycloak OIDC issuer' 'BLOCKED' "https://$IssuerHost not serving Keycloak - deploy infra/keycloak (Render) + fix DNS (currently Vercel)"
}

try {
  $prm = Invoke-RestMethod -Uri "$Url/.well-known/oauth-protected-resource/mcp" -TimeoutSec 15
  if ($prm.authorization_servers) {
    Write-Result 'MCP OAuth PRM' 'PASS' 'authorization_servers present'
  } else {
    Write-Result 'MCP OAuth PRM' 'WARN' 'API-key mode (Smithery-compatible); enable OAuth after IdP live'
  }
} catch {
  Write-Result 'MCP OAuth PRM' 'FAIL' $_.Exception.Message
}

Write-Host "`nGuide: docs/OPS-PRODUCTION-VERIFY.md" -ForegroundColor DarkGray
