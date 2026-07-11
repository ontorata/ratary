# ADR-1006: Provider Credential Management

**Status:** Accepted  
**Date:** 2026-07-11  
**Phase:** P2-B (Provider Architecture Validation)  
**Authority:** Chief Architect

---

## Context

Ontory must manage credentials for multiple AI providers (OpenAI, Anthropic, Gemini) without:
- Hardcoding credentials in source code
- Leaking credentials in logs or error messages
- Coupling business layer to credential source
- Preventing future migration to secret management systems (Vault, AWS Secrets Manager, etc.)

**Problem:** Credential management often fails at these boundaries:
1. **Credential Resolution** (where credentials come from) mixed with **Provider Initialization** (using credentials)
2. Credentials leaked in error messages or logs
3. Business layer aware of credential source (environment, vault, etc.)
4. Migration to new credential sources requires business logic changes

---

## Decision

Separate **Credential Resolution** from **Provider Initialization** with clear failure modes for each stage.

### Architecture

```
Credential Resolution
         ↓
  Environment Variables
  (OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY)
         ↓
   OntoryProviderConfig
         ↓
Provider Initialization
         ↓
   ProviderRuntime
```

### Separation of Concerns

1. **Credential Resolution** (`resolveOntoryProviderConfig`)
   - **Responsibility:** Load credentials from environment
   - **Failure Mode:** Missing or empty API key → config contains `undefined`
   - **Does NOT:** Validate credentials with provider, initialize SDK clients

2. **Provider Initialization** (`createProviderFromConfig`)
   - **Responsibility:** Create provider with validated credentials
   - **Failure Mode:** Missing credential → throws `ProviderError('configuration')`
   - **Does NOT:** Know where credentials came from (environment, vault, etc.)

### Contract

```typescript
// Credential resolution (pure policy, no side effects)
function resolveOntoryProviderConfig(env: EnvLike): OntoryProviderConfig;

// Provider initialization (validates and constructs)
function createProviderFromConfig(config: OntoryProviderConfig): ProviderRuntime;
```

### Rules

1. **No hardcoded credentials**
   - All credentials from environment variables
   - No default API keys

2. **Credential leak prevention**
   - Error messages MUST NOT contain API keys
   - Error format: `"ONTORY_PROVIDER={provider} requires {PROVIDER}_API_KEY"`
   - NO raw credential values in errors

3. **Business layer isolation**
   - RuntimeDispatcher receives `ProviderRuntime` (already initialized)
   - Business layer NEVER knows:
     - Credential source (environment, vault, etc.)
     - Credential format (API key structure)
     - Credential lifecycle (rotation, expiration)

4. **Provider-agnostic credential handling**
   - All providers follow same pattern
   - Missing credential → `ProviderError('configuration')`
   - Error messages consistent across providers

---

## Credential Sources

### Current: Environment Variables

**Primary:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

**Configuration:**
- `ONTORY_PROVIDER` (selects active provider)
- `{PROVIDER}_MODEL` (optional, defaults exist)
- `{PROVIDER}_BASE_URL` (optional, for custom endpoints)
- `{PROVIDER}_TIMEOUT_MS` (optional, for custom timeouts)

**Validation:**
- Whitespace-only values treated as missing
- Empty strings treated as missing
- `undefined` → config contains `undefined`, initialization fails

### Future: Credential Source Abstraction

**NOT in scope for VS#2:**
- ❌ Secret rotation
- ❌ Secret encryption
- ❌ Secret synchronization
- ❌ Secret leasing
- ❌ Vault integration
- ❌ AWS Secrets Manager
- ❌ Azure Key Vault
- ❌ GCP Secret Manager

**Future evolution:**
```typescript
// Contract (future)
interface CredentialSource {
  resolve(provider: string): ProviderCredential;
}

// Implementations (future)
class EnvironmentCredentialSource implements CredentialSource { ... }
class VaultCredentialSource implements CredentialSource { ... }
class AWSSecretsCredentialSource implements CredentialSource { ... }
```

Business layer remains unchanged when credential source changes.

---

## Consequences

### Positive

✅ **Clear separation of concerns**  
Credential resolution ≠ Provider initialization (different failure modes)

✅ **Credential leak prevention**  
Error messages validated to NOT contain API keys (EVD-002-F)

✅ **Business layer isolation**  
RuntimeDispatcher unaware of credential source (EVD-002-E)

✅ **Consistent error handling**  
All providers throw `ProviderError('configuration')` for missing credentials (validated)

✅ **Future-proof for credential source migration**  
Current: Environment → Future: Vault (business layer unchanged)

### Negative

⚠️ **Environment-only credential source**  
Current implementation only supports environment variables (acceptable for VS#2)

⚠️ **No credential rotation without restart**  
Credential changes require process restart (acceptable for current scope)

⚠️ **Config serialization exposes credentials**  
`JSON.stringify(config)` exposes API keys (documented limitation, not used in production logs)

### Trade-offs

**Accepted:**
- Credential rotation requires restart (simple, predictable)
- Environment variables only (sufficient for current deployment)
- No credential caching (stateless, no expiration tracking needed)

**Deferred to future ADRs:**
- Dynamic credential refresh (ADR-1007, if needed)
- Vault integration (ADR-1008, if needed)
- Credential encryption at rest (ADR-1009, if needed)

---

## Implementation Evidence

**Commit:** `e722346c56aa03fdf83a50ae5bb307d42a2d5cb5`  
**Test:** `tests/config/credential-management.test.ts`  
**Result:** ✅ PASS (13/13 tests)

### Exit Criteria Validated

✅ **EVD-002-A:** Missing credentials detected (OpenAI, Anthropic, Gemini)  
✅ **EVD-002-B:** Empty/whitespace credentials detected  
✅ **EVD-002-C:** Credentials resolved from environment  
✅ **EVD-002-D:** Multi-provider configuration works  
✅ **EVD-002-E:** Business layer isolated from credential source  
✅ **EVD-002-F:** Credentials NOT leaked in error messages  
✅ **Error consistency:** All providers throw same error type

---

## Security Considerations

### Credential Exposure Prevention

**Validated:**
- ✅ Error messages do NOT contain API keys
- ✅ Error format: `"requires OPENAI_API_KEY"` (no key value)
- ✅ No hardcoded credentials in source code

**Known Limitation:**
- ⚠️ `JSON.stringify(config)` exposes credentials
- **Mitigation:** Config not serialized in production logs
- **Future:** Implement credential sanitization (custom `toJSON()`)

### Credential Storage

**Current:**
- Environment variables (process environment)
- Not encrypted at rest (OS-level responsibility)
- Not persisted to disk by application

**Recommendation:**
- Use secret management system for production (Vault, AWS Secrets Manager)
- Rotate credentials regularly (external to Ontory)
- Monitor credential access (external to Ontory)

---

## Related Documents

- **Architecture Principle:** AP-004 (Provider Abstraction Before Provider Lock-In)
- **Success Criteria:** Security (P2-B Cross-Cutting)
- **Quality Attribute:** QA-SEC-001 (No Secrets in Code/Logs)
- **Evidence:** EVD-002-L3-credential-management.md

---

## Non-Goals

Explicitly **NOT** in scope for ADR-1006:

❌ Secret rotation (credential changes require restart)  
❌ Secret encryption (OS/environment responsibility)  
❌ Secret synchronization (external tool responsibility)  
❌ Secret leasing (no expiration tracking)  
❌ Vault integration (future ADR if needed)  
❌ AWS/Azure/GCP secret managers (future ADR if needed)

---

## Review Notes

**Reviewer:** Chief Architect  
**Review Date:** 2026-07-11  
**Status:** Accepted

**Key Findings:**
- Credential management implementation already exists and is solid
- Separation of concerns (resolution vs. initialization) validated
- Credential leak prevention verified (error messages safe)
- Business layer isolation confirmed (dispatcher unaware of source)

**Architectural Impact:**
- Stage 1.0 baseline validated (credential management works in practice)
- No ACR required (implementation aligns with security principles)
- Foundation ready for future secret management integration

**Security Assessment:**
- No hardcoded credentials: ✅ Validated
- No credential leaks: ✅ Validated (error messages)
- Business layer isolation: ✅ Validated
- Config serialization: ⚠️ Known limitation (acceptable, not used in prod logs)

---

**Document Version:** 1.0  
**Date:** 2026-07-11  
**Status:** Accepted  
**Evidence Quality:** L3 (Automated Test)
