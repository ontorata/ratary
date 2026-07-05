# Sets GitHub repository About (description, website, topics) via gh CLI.
# Prerequisite: gh auth login (once per machine)
#
# Usage:
#   pwsh scripts/set-github-about.ps1              # origin only (ontorata/ratary)
#   pwsh scripts/set-github-about.ps1 -Legacy      # ai-brain-legacy dev mirror too

param(
    [switch]$Legacy
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error 'GitHub CLI (gh) not found. Install: winget install GitHub.cli'
}

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Not logged in. Run: gh auth login' -ForegroundColor Yellow
    exit 1
}

$description = @'
AI Brain Platform — persistent memory, structured knowledge, hybrid retrieval, and MCP-native access for Cursor, Claude Code, and custom agents. Self-host on Cloudflare D1 or Postgres.
'@.Trim()

$homepage = 'https://ontorata.com'

$topics = @(
    'ai',
    'ai-memory',
    'mcp',
    'model-context-protocol',
    'knowledge-graph',
    'rag',
    'typescript',
    'nodejs',
    'self-hosted',
    'cursor',
    'fastify',
    'cloudflare-d1',
    'postgresql',
    'developer-tools',
    'open-source'
) -join ','

function Set-RepoAbout {
    param([string]$Repo)

    Write-Host "Updating $Repo ..." -ForegroundColor Cyan
    gh repo edit $Repo `
        --description $description `
        --homepage $homepage `
        --add-topic ($topics -split ',')
    if ($LASTEXITCODE -ne 0) { throw "gh repo edit failed for $Repo" }
    gh repo view $Repo --json description,homepageUrl,repositoryTopics --jq '{description, homepage: .homepageUrl, topics: [.repositoryTopics[].name]}'
}

Set-RepoAbout 'ontorata/ratary'

if ($Legacy) {
    $legacyDescription = @'
Development mirror of Ratary — full test suite, .ai governance corpus, and Agent Forge workflow. Production release: github.com/ontorata/ratary
'@.Trim()
    Write-Host 'Updating lutfi04/ai-brain ...' -ForegroundColor Cyan
    gh repo edit 'lutfi04/ai-brain' `
        --description $legacyDescription `
        --homepage 'https://ontorata.com' `
        --add-topic @('ai-memory', 'mcp', 'typescript', 'developer-tools', 'internal-dev')
    gh repo view 'lutfi04/ai-brain' --json description,homepageUrl,repositoryTopics --jq '{description, homepage: .homepageUrl, topics: [.repositoryTopics[].name]}'
}

Write-Host 'Done.' -ForegroundColor Green
