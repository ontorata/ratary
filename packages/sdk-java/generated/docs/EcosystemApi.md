# EcosystemApi

All URIs are relative to *http://localhost:3000/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getEcosystemClient**](EcosystemApi.md#getEcosystemClient) | **GET** /ecosystem/clients/{type} |  |
| [**listEcosystemClients**](EcosystemApi.md#listEcosystemClients) | **GET** /ecosystem/clients |  |


<a id="getEcosystemClient"></a>
# **getEcosystemClient**
> getEcosystemClient(type)



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EcosystemApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:3000/api/v1");

    EcosystemApi apiInstance = new EcosystemApi(defaultClient);
    String type = "type_example"; // String | 
    try {
      apiInstance.getEcosystemClient(type);
    } catch (ApiException e) {
      System.err.println("Exception when calling EcosystemApi#getEcosystemClient");
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
| **type** | **String**|  | |

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
| **200** | Client profile |  -  |

<a id="listEcosystemClients"></a>
# **listEcosystemClients**
> listEcosystemClients()



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.models.*;
import org.openapitools.client.api.EcosystemApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:3000/api/v1");

    EcosystemApi apiInstance = new EcosystemApi(defaultClient);
    try {
      apiInstance.listEcosystemClients();
    } catch (ApiException e) {
      System.err.println("Exception when calling EcosystemApi#listEcosystemClients");
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
| **200** | Client catalog |  -  |

