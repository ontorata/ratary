# CapabilitiesApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getCapabilities**](CapabilitiesApi.md#getCapabilities) | **GET** /capabilities |  |
| [**negotiateCapabilities**](CapabilitiesApi.md#negotiateCapabilities) | **POST** /capabilities/negotiate |  |


<a id="getCapabilities"></a>
# **getCapabilities**
> getCapabilities()



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CapabilitiesApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");

    CapabilitiesApi apiInstance = new CapabilitiesApi(defaultClient);
    try {
      apiInstance.getCapabilities();
    } catch (ApiException e) {
      System.err.println("Exception when calling CapabilitiesApi#getCapabilities");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Capability manifest |  -  |

<a id="negotiateCapabilities"></a>
# **negotiateCapabilities**
> CapabilityNegotiationResult negotiateCapabilities(clientCapabilityRequest)



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.CapabilitiesApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");

    CapabilitiesApi apiInstance = new CapabilitiesApi(defaultClient);
    ClientCapabilityRequest clientCapabilityRequest = new ClientCapabilityRequest(); // ClientCapabilityRequest | 
    try {
      CapabilityNegotiationResult result = apiInstance.negotiateCapabilities(clientCapabilityRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling CapabilitiesApi#negotiateCapabilities");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **clientCapabilityRequest** | [**ClientCapabilityRequest**](ClientCapabilityRequest.md)|  | [optional] |

### Return type

[**CapabilityNegotiationResult**](CapabilityNegotiationResult.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Negotiation result matrix |  -  |

