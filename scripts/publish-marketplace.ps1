# Publish harness/marketplace to ontorata/ratary-marketplace (one-time or refresh)
# Requires: gh auth login, repo create permission on ontorata org

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'harness\marketplace'
$tmp = Join-Path $env:TEMP 'ratary-marketplace-publish'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Install GitHub CLI and run: gh auth login" -ForegroundColor Yellow
  exit 1
}

if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
New-Item -ItemType Directory -Path $tmp | Out-Null

Copy-Item (Join-Path $src 'ratary-marketplace.json') $tmp
Copy-Item (Join-Path $root 'harness\claude-code\plugin.json') $tmp
Copy-Item (Join-Path $src 'README.md') $tmp

@"
# ratary-marketplace

Claude Code / harness marketplace manifest for [Ratary Memory MCP](https://github.com/ontorata/ratary).

\`\`\`text
/plugin marketplace add ontorata/ratary-marketplace
/plugin install ratary@ratary-marketplace
\`\`\`

Source: [ontorata/ratary/harness/marketplace](https://github.com/ontorata/ratary/tree/main/harness/marketplace)
"@ | Set-Content (Join-Path $tmp 'README.md') -Encoding utf8

Push-Location $tmp
git init -b main | Out-Null
git add .
git commit -m "chore: sync marketplace manifest from ontorata/ratary" | Out-Null

$repo = 'ontorata/ratary-marketplace'
$repoExists = $false
try {
  gh repo view $repo --json name -q .name 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $repoExists = $true }
} catch {
  $repoExists = $false
}

if ($repoExists) {
  git remote add origin "https://github.com/$repo.git"
  git push -u origin main --force
  Write-Host "Updated https://github.com/$repo" -ForegroundColor Green
} else {
  gh repo create $repo --public --source=. --remote=origin --push
  Write-Host "Created https://github.com/$repo" -ForegroundColor Green
}
Pop-Location

Write-Host "Users: /plugin marketplace add ontorata/ratary-marketplace"
