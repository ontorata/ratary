# OpenAPI\Client\CapabilitiesApi



All URIs are relative to http://localhost:3000/api/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**getCapabilities()**](CapabilitiesApi.md#getCapabilities) | **GET** /capabilities |  |
| [**negotiateCapabilities()**](CapabilitiesApi.md#negotiateCapabilities) | **POST** /capabilities/negotiate |  |


## `getCapabilities()`

```php
getCapabilities()
```



### Example

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

### Parameters

This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `negotiateCapabilities()`

```php
negotiateCapabilities($client_capability_request): \OpenAPI\Client\Model\CapabilityNegotiationResult
```



### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



$apiInstance = new OpenAPI\Client\Api\CapabilitiesApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client()
);
$client_capability_request = new \OpenAPI\Client\Model\ClientCapabilityRequest(); // \OpenAPI\Client\Model\ClientCapabilityRequest

try {
    $result = $apiInstance->negotiateCapabilities($client_capability_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling CapabilitiesApi->negotiateCapabilities: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **client_capability_request** | [**\OpenAPI\Client\Model\ClientCapabilityRequest**](../Model/ClientCapabilityRequest.md)|  | [optional] |

### Return type

[**\OpenAPI\Client\Model\CapabilityNegotiationResult**](../Model/CapabilityNegotiationResult.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
