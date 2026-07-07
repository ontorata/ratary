# Create optional MCP demo user from infra/keycloak/.env (never commit real passwords).
param(
  [string]$BaseUrl = 'http://localhost:8080',
  [string]$AdminUser = $env:KC_ADMIN_USER,
  [string]$AdminPassword = $env:KC_ADMIN_PASSWORD,
  [string]$Realm = 'ratary',
  [string]$DemoUsername = $env:KC_DEMO_USERNAME,
  [string]$DemoEmail = $env:KC_DEMO_EMAIL,
  [string]$DemoPassword = $env:KC_DEMO_PASSWORD
)

$ErrorActionPreference = 'Stop'
if (-not $AdminUser) { $AdminUser = 'admin' }
if (-not $AdminPassword) {
  Write-Error 'KC_ADMIN_PASSWORD is required.'
}
if (-not $DemoUsername -or -not $DemoPassword) {
  Write-Host 'Skip demo user (set KC_DEMO_USERNAME and KC_DEMO_PASSWORD in infra/keycloak/.env to create one).' -ForegroundColor DarkYellow
  exit 0
}
if (-not $DemoEmail) { $DemoEmail = "$DemoUsername@example.local" }

$token = Invoke-RestMethod -Method Post -Uri "$BaseUrl/realms/master/protocol/openid-connect/token" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{
    grant_type = 'password'
    client_id = 'admin-cli'
    username = $AdminUser
    password = $AdminPassword
  }

$headers = @{ Authorization = "Bearer $($token.access_token)"; 'Content-Type' = 'application/json' }
$usersUrl = "$BaseUrl/admin/realms/$Realm/users"
$existing = Invoke-RestMethod -Uri "$usersUrl?username=$([uri]::EscapeDataString($DemoUsername))" -Headers $headers
if ($existing.Count -gt 0) {
  Write-Host "Demo user '$DemoUsername' already exists — skipped." -ForegroundColor DarkGray
  exit 0
}

$userId = Invoke-RestMethod -Method Post -Uri $usersUrl -Headers $headers -Body (@{
  username = $DemoUsername
  email = $DemoEmail
  enabled = $true
  emailVerified = $true
  firstName = 'MCP'
  lastName = 'Demo'
} | ConvertTo-Json)

Invoke-RestMethod -Method Put -Uri "$usersUrl/$userId/reset-password" -Headers $headers -Body (@{
  type = 'password'
  value = $DemoPassword
  temporary = $false
} | ConvertTo-Json) | Out-Null

Write-Host "Demo user '$DemoUsername' created (password from KC_DEMO_PASSWORD env)." -ForegroundColor Green
