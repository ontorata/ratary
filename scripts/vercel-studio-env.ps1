# Set Ontorata Studio Vercel Production env
# Usage: .\scripts\vercel-studio-env.ps1 [-StudioRoot d:\Apps\Ontorata-Studio]

param(
  [string]$StudioRoot = "d:\Apps\Ontorata-Studio",
  [string]$EnvFile = ".env"
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Install Vercel CLI: npm i -g vercel" -ForegroundColor Yellow
  exit 1
}

function Read-DotEnv([string]$path): [hashtable] {
  $map = @{}
  if (-not (Test-Path $path)) { return $map }
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $k, $v = $_ -split '=', 2
    $map[$k.Trim()] = $v.Trim().Trim('"')
  }
  return $map
}

$envPath = Join-Path $StudioRoot $EnvFile
$map = Read-DotEnv $envPath

$baseUrl = if ($map['VITE_RATARY_BASE_URL']) { $map['VITE_RATARY_BASE_URL'] } else { 'https://ratary.ontorata.com' }
$apiKey = $map['VITE_RATARY_API_KEY']
if (-not $apiKey) {
  Write-Host "VITE_RATARY_API_KEY missing in $envPath" -ForegroundColor Red
  exit 1
}

Push-Location $StudioRoot
try {
  Write-Host "`n=== Ontorata Studio Vercel env (production) ===" -ForegroundColor Cyan
  $baseUrl | vercel env add VITE_RATARY_BASE_URL production --force
  $apiKey | vercel env add VITE_RATARY_API_KEY production --force
  Write-Host "`nDone. Redeploy Studio: vercel --prod" -ForegroundColor Green
} finally {
  Pop-Location
}
