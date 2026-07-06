# FederationApi

All URIs are relative to *http://localhost:3000/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listFederationPeers**](FederationApi.md#listFederationPeers) | **GET** /federation/peers |  |


<a id="listFederationPeers"></a>
# **listFederationPeers**
> listFederationPeers()



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.FederationApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:3000/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    FederationApi apiInstance = new FederationApi(defaultClient);
    try {
      apiInstance.listFederationPeers();
    } catch (ApiException e) {
      System.err.println("Exception when calling FederationApi#listFederationPeers");
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

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Peer list |  -  |

