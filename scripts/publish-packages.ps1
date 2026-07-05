# Publish @ratary/* to npm (requires npm 2FA browser auth once per session)
# Run from repo root after: npm run build:packages

$ErrorActionPreference = 'Stop'
$packages = @('sdk', 'cli', 'mcp-server')

foreach ($p in $packages) {
  Write-Host "`n=== Publishing @ratary/$p ===" -ForegroundColor Cyan
  Push-Location "packages/$p"
  npm publish --access public
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Publish failed. If EOTP: open the npm auth URL in your browser, then re-run this script." -ForegroundColor Yellow
    Pop-Location
    exit 1
  }
  Pop-Location
}

Write-Host "`nDone. Verify:" -ForegroundColor Green
npm view @ratary/sdk version
npm view @ratary/cli version
npm view @ratary/mcp-server version
