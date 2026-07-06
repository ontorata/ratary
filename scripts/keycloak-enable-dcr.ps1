# Enable Keycloak dynamic client registration for realm ratary (ChatGPT DCR)
param(
  [string]$BaseUrl = 'http://localhost:8080',
  [string]$AdminUser = 'admin',
  [string]$AdminPassword = '***REDACTED***',
  [string]$Realm = 'ratary'
)

$ErrorActionPreference = 'Stop'
$token = Invoke-RestMethod -Method Post -Uri "$BaseUrl/realms/master/protocol/openid-connect/token" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{
    grant_type = 'password'
    client_id = 'admin-cli'
    username = $AdminUser
    password = $AdminPassword
  }

$headers = @{ Authorization = "Bearer $($token.access_token)" }

# Anonymous client registration policy (trusted hosts with host match ON)
$policyUrl = "$BaseUrl/admin/realms/$Realm/client-registration-policy"
$existing = Invoke-RestMethod -Uri $policyUrl -Headers $headers
$trusted = $existing | Where-Object { $_.name -eq 'Trusted Hosts' }
if (-not $trusted) {
  Invoke-RestMethod -Method Post -Uri $policyUrl -Headers $headers -ContentType 'application/json' -Body (@{
    name = 'Trusted Hosts'
    providerId = 'trusted-hosts'
    subType = 'anonymous'
    config = @{
      'host-sending-registration-request-must-match' = @('true')
      'client-uris-must-match' = @('true')
    }
  } | ConvertTo-Json -Depth 5)
}

$realm = Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$Realm" -Headers $headers
if ($realm.attributes.'clientRegistrationAllowed' -ne 'true') {
  $realm.attributes = @{}
  $realm.attributes.'clientRegistrationAllowed' = 'true'
  Invoke-RestMethod -Method Put -Uri "$BaseUrl/admin/realms/$Realm" -Headers $headers -ContentType 'application/json' -Body ($realm | ConvertTo-Json -Depth 8)
}

$oidc = Invoke-RestMethod -Uri "$BaseUrl/realms/$Realm/.well-known/openid-configuration"
Write-Host "DCR endpoint: $($oidc.registration_endpoint)" -ForegroundColor Green
Write-Host "Issuer:       $($oidc.issuer)" -ForegroundColor Green
