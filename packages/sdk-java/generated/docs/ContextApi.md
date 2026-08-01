# ContextApi

All URIs are relative to *http://localhost:9876/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**archiveContextPackage**](ContextApi.md#archiveContextPackage) | **POST** /context/packages/{packageId}/archive | Archive Context Package (active|retired → archived) |
| [**buildContext**](ContextApi.md#buildContext) | **POST** /context |  |
| [**getContextPackageLifecycle**](ContextApi.md#getContextPackageLifecycle) | **GET** /context/packages/{packageId} | Get Context Package lifecycle state (ADR-1013) |
| [**retireContextPackage**](ContextApi.md#retireContextPackage) | **POST** /context/packages/{packageId}/retire | Retire Context Package (active → retired) |


<a id="archiveContextPackage"></a>
# **archiveContextPackage**
> ContextPackageLifecycle archiveContextPackage(packageId)

Archive Context Package (active|retired → archived)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ContextApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ContextApi apiInstance = new ContextApi(defaultClient);
    String packageId = "packageId_example"; // String | 
    try {
      ContextPackageLifecycle result = apiInstance.archiveContextPackage(packageId);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ContextApi#archiveContextPackage");
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
| **packageId** | **String**|  | |

### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated lifecycle record |  -  |

<a id="buildContext"></a>
# **buildContext**
> buildContext(buildContextRequest)



### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ContextApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ContextApi apiInstance = new ContextApi(defaultClient);
    BuildContextRequest buildContextRequest = new BuildContextRequest(); // BuildContextRequest | 
    try {
      apiInstance.buildContext(buildContextRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling ContextApi#buildContext");
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
| **buildContextRequest** | [**BuildContextRequest**](BuildContextRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Context bundle |  -  |

<a id="getContextPackageLifecycle"></a>
# **getContextPackageLifecycle**
> ContextPackageLifecycle getContextPackageLifecycle(packageId)

Get Context Package lifecycle state (ADR-1013)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ContextApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ContextApi apiInstance = new ContextApi(defaultClient);
    String packageId = "packageId_example"; // String | 
    try {
      ContextPackageLifecycle result = apiInstance.getContextPackageLifecycle(packageId);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ContextApi#getContextPackageLifecycle");
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
| **packageId** | **String**|  | |

### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Lifecycle record |  -  |

<a id="retireContextPackage"></a>
# **retireContextPackage**
> ContextPackageLifecycle retireContextPackage(packageId)

Retire Context Package (active → retired)

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.ContextApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("http://localhost:9876/api/v1");
    
    // Configure API key authorization: ApiKeyAuth
    ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
    ApiKeyAuth.setApiKey("YOUR API KEY");
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //ApiKeyAuth.setApiKeyPrefix("Token");

    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    ContextApi apiInstance = new ContextApi(defaultClient);
    String packageId = "packageId_example"; // String | 
    try {
      ContextPackageLifecycle result = apiInstance.retireContextPackage(packageId);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling ContextApi#retireContextPackage");
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
| **packageId** | **String**|  | |

### Return type

[**ContextPackageLifecycle**](ContextPackageLifecycle.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated lifecycle record |  -  |

