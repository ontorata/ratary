# OpenAPI\Client\DecisionIntelligenceApi



All URIs are relative to http://localhost:9876/api/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**fetchRecommendations()**](DecisionIntelligenceApi.md#fetchRecommendations) | **POST** /decisions/recommendations | Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042) |
| [**recordDecisionProvenance()**](DecisionIntelligenceApi.md#recordDecisionProvenance) | **POST** /decisions/provenance | Record human Accept/Reject provenance (ADR-069, flag-gated) |


## `fetchRecommendations()`

```php
fetchRecommendations($fetch_recommendations_request): \OpenAPI\Client\Model\FetchRecommendationsResponse
```

Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure API key authorization: ApiKeyAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setApiKey('X-API-Key', 'YOUR_API_KEY');
// Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
// $config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setApiKeyPrefix('X-API-Key', 'Bearer');

// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\DecisionIntelligenceApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$fetch_recommendations_request = new \OpenAPI\Client\Model\FetchRecommendationsRequest(); // \OpenAPI\Client\Model\FetchRecommendationsRequest

try {
    $result = $apiInstance->fetchRecommendations($fetch_recommendations_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DecisionIntelligenceApi->fetchRecommendations: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **fetch_recommendations_request** | [**\OpenAPI\Client\Model\FetchRecommendationsRequest**](../Model/FetchRecommendationsRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\FetchRecommendationsResponse**](../Model/FetchRecommendationsResponse.md)

### Authorization

[ApiKeyAuth](../../README.md#ApiKeyAuth), [BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `recordDecisionProvenance()`

```php
recordDecisionProvenance($create_decision_provenance_request): \OpenAPI\Client\Model\RecordDecisionProvenance201Response
```

Record human Accept/Reject provenance (ADR-069, flag-gated)

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure API key authorization: ApiKeyAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setApiKey('X-API-Key', 'YOUR_API_KEY');
// Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
// $config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setApiKeyPrefix('X-API-Key', 'Bearer');

// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\DecisionIntelligenceApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$create_decision_provenance_request = new \OpenAPI\Client\Model\CreateDecisionProvenanceRequest(); // \OpenAPI\Client\Model\CreateDecisionProvenanceRequest

try {
    $result = $apiInstance->recordDecisionProvenance($create_decision_provenance_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DecisionIntelligenceApi->recordDecisionProvenance: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **create_decision_provenance_request** | [**\OpenAPI\Client\Model\CreateDecisionProvenanceRequest**](../Model/CreateDecisionProvenanceRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\RecordDecisionProvenance201Response**](../Model/RecordDecisionProvenance201Response.md)

### Authorization

[ApiKeyAuth](../../README.md#ApiKeyAuth), [BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
