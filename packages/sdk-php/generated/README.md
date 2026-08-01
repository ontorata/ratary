# ratary_sdk

Curated OpenAPI SSOT for @ratary/sdk generation (Phase 16). Full spec at GET /docs/json.


## Installation & Usage

### Requirements

PHP 8.1 and later.

### Composer

To install the bindings via [Composer](https://getcomposer.org/), add the following to `composer.json`:

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "https://github.com/GIT_USER_ID/GIT_REPO_ID.git"
    }
  ],
  "require": {
    "GIT_USER_ID/GIT_REPO_ID": "*@dev"
  }
}
```

Then run `composer install`

### Manual Installation

Download the files and include `autoload.php`:

```php
<?php
require_once('/path/to/ratary_sdk/vendor/autoload.php');
```

## Getting Started

Please follow the [installation procedure](#installation--usage) and then run the following:

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');




$apiInstance = new OpenAPI\Client\Api\CapabilitiesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);

try {
    $apiInstance->getCapabilities();
} catch (Exception $e) {
    echo 'Exception when calling CapabilitiesApi->getCapabilities: ', $e->getMessage(), PHP_EOL;
}

```

## API Endpoints

All URIs are relative to *http://localhost:9876/api/v1*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*CapabilitiesApi* | [**getCapabilities**](docs/Api/CapabilitiesApi.md#getcapabilities) | **GET** /capabilities | 
*CapabilitiesApi* | [**negotiateCapabilities**](docs/Api/CapabilitiesApi.md#negotiatecapabilities) | **POST** /capabilities/negotiate | 
*ContextApi* | [**archiveContextPackage**](docs/Api/ContextApi.md#archivecontextpackage) | **POST** /context/packages/{packageId}/archive | Archive Context Package (active|retired → archived)
*ContextApi* | [**buildContext**](docs/Api/ContextApi.md#buildcontext) | **POST** /context | 
*ContextApi* | [**getContextPackageLifecycle**](docs/Api/ContextApi.md#getcontextpackagelifecycle) | **GET** /context/packages/{packageId} | Get Context Package lifecycle state (ADR-1013)
*ContextApi* | [**retireContextPackage**](docs/Api/ContextApi.md#retirecontextpackage) | **POST** /context/packages/{packageId}/retire | Retire Context Package (active → retired)
*DecisionIntelligenceApi* | [**fetchRecommendations**](docs/Api/DecisionIntelligenceApi.md#fetchrecommendations) | **POST** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)
*DecisionIntelligenceApi* | [**recordDecisionProvenance**](docs/Api/DecisionIntelligenceApi.md#recorddecisionprovenance) | **POST** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated)
*EcosystemApi* | [**getEcosystemClient**](docs/Api/EcosystemApi.md#getecosystemclient) | **GET** /ecosystem/clients/{type} | 
*EcosystemApi* | [**listEcosystemClients**](docs/Api/EcosystemApi.md#listecosystemclients) | **GET** /ecosystem/clients | 
*FederationApi* | [**listFederationPeers**](docs/Api/FederationApi.md#listfederationpeers) | **GET** /federation/peers | 
*GovernanceApi* | [**createGovernanceExceptionRequest**](docs/Api/GovernanceApi.md#creategovernanceexceptionrequest) | **POST** /governance/exceptions | Create exception request (pending — no auto-approve)
*GovernanceApi* | [**getGovernanceException**](docs/Api/GovernanceApi.md#getgovernanceexception) | **GET** /governance/exceptions/{exceptionId} | Governance exception request detail
*GovernanceApi* | [**getGovernanceManifest**](docs/Api/GovernanceApi.md#getgovernancemanifest) | **GET** /governance/manifest | Memory governance manifest (ADR-1020 / ADR-1021)
*GovernanceApi* | [**getPolicyDenialSummary**](docs/Api/GovernanceApi.md#getpolicydenialsummary) | **GET** /governance/denials/summary | Aggregated denial counts by evaluation point
*GovernanceApi* | [**getStewardshipRun**](docs/Api/GovernanceApi.md#getstewardshiprun) | **GET** /governance/stewardship/runs/{runId} | Stewardship run detail
*GovernanceApi* | [**listGovernanceExceptions**](docs/Api/GovernanceApi.md#listgovernanceexceptions) | **GET** /governance/exceptions | List governance exception requests (PI-1027-B / ADR-1029)
*GovernanceApi* | [**listPolicyDenials**](docs/Api/GovernanceApi.md#listpolicydenials) | **GET** /governance/denials | List policy denial events (PI-1027-C / ADR-1028 D4)
*GovernanceApi* | [**listStewardshipRuns**](docs/Api/GovernanceApi.md#liststewardshipruns) | **GET** /governance/stewardship/runs | List stewardship run history for authenticated owner
*HealthApi* | [**getHealth**](docs/Api/HealthApi.md#gethealth) | **GET** /health | 
*MemoryApi* | [**createMemory**](docs/Api/MemoryApi.md#creatememory) | **POST** /memory | 
*MemoryApi* | [**deleteMemory**](docs/Api/MemoryApi.md#deletememory) | **DELETE** /memory/{id} | 
*MemoryApi* | [**getMemory**](docs/Api/MemoryApi.md#getmemory) | **GET** /memory/{id} | 
*MemoryApi* | [**listMemories**](docs/Api/MemoryApi.md#listmemories) | **GET** /memory | 
*MemoryApi* | [**updateMemory**](docs/Api/MemoryApi.md#updatememory) | **PUT** /memory/{id} | 
*SearchApi* | [**searchMemories**](docs/Api/SearchApi.md#searchmemories) | **GET** /search | 

## Models

- [BuildContextRequest](docs/Model/BuildContextRequest.md)
- [BuildContextResponse](docs/Model/BuildContextResponse.md)
- [CapabilityMatchGroups](docs/Model/CapabilityMatchGroups.md)
- [CapabilityNegotiationResult](docs/Model/CapabilityNegotiationResult.md)
- [ClientCapabilityRequest](docs/Model/ClientCapabilityRequest.md)
- [ClientCapabilityRequestClientInfo](docs/Model/ClientCapabilityRequestClientInfo.md)
- [ContextPackageLifecycle](docs/Model/ContextPackageLifecycle.md)
- [CreateDecisionProvenanceRequest](docs/Model/CreateDecisionProvenanceRequest.md)
- [CreateGovernanceExceptionRequest](docs/Model/CreateGovernanceExceptionRequest.md)
- [CreateGovernanceExceptionRequest201Response](docs/Model/CreateGovernanceExceptionRequest201Response.md)
- [CreateMemoryRequest](docs/Model/CreateMemoryRequest.md)
- [DecisionProvenanceRecord](docs/Model/DecisionProvenanceRecord.md)
- [FetchRecommendationsRequest](docs/Model/FetchRecommendationsRequest.md)
- [FetchRecommendationsResponse](docs/Model/FetchRecommendationsResponse.md)
- [GetPolicyDenialSummary200Response](docs/Model/GetPolicyDenialSummary200Response.md)
- [GovernanceExceptionRecord](docs/Model/GovernanceExceptionRecord.md)
- [GovernanceExceptionRecordAuditLogInner](docs/Model/GovernanceExceptionRecordAuditLogInner.md)
- [ListGovernanceExceptions200Response](docs/Model/ListGovernanceExceptions200Response.md)
- [ListPolicyDenials200Response](docs/Model/ListPolicyDenials200Response.md)
- [Memory](docs/Model/Memory.md)
- [PolicyDenialEvent](docs/Model/PolicyDenialEvent.md)
- [PolicyDenialSummary](docs/Model/PolicyDenialSummary.md)
- [PolicyDenialSummaryByPoint](docs/Model/PolicyDenialSummaryByPoint.md)
- [RecommendationCard](docs/Model/RecommendationCard.md)
- [RecordDecisionProvenance201Response](docs/Model/RecordDecisionProvenance201Response.md)
- [UpdateMemoryRequest](docs/Model/UpdateMemoryRequest.md)

## Authorization

Authentication schemes defined for the API:
### BearerAuth

- **Type**: Bearer authentication

### ApiKeyAuth

- **Type**: API key
- **API key parameter name**: X-API-Key
- **Location**: HTTP header


## Tests

To run the tests, use:

```bash
composer install
vendor/bin/phpunit
```

## Author



## About this package

This PHP package is automatically generated by the [OpenAPI Generator](https://openapi-generator.tech) project:

- API version: `1.2.0`
    - Generator version: `7.23.0`
- Build package: `org.openapitools.codegen.languages.PhpClientCodegen`
