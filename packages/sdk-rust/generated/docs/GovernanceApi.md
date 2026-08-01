# \GovernanceApi

All URIs are relative to *http://localhost:9876/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_governance_exception_request**](GovernanceApi.md#create_governance_exception_request) | **POST** /governance/exceptions | Create exception request (pending — no auto-approve)
[**get_governance_exception**](GovernanceApi.md#get_governance_exception) | **GET** /governance/exceptions/{exceptionId} | Governance exception request detail
[**get_governance_manifest**](GovernanceApi.md#get_governance_manifest) | **GET** /governance/manifest | Memory governance manifest (ADR-1020 / ADR-1021)
[**get_policy_denial_summary**](GovernanceApi.md#get_policy_denial_summary) | **GET** /governance/denials/summary | Aggregated denial counts by evaluation point
[**get_stewardship_run**](GovernanceApi.md#get_stewardship_run) | **GET** /governance/stewardship/runs/{runId} | Stewardship run detail
[**list_governance_exceptions**](GovernanceApi.md#list_governance_exceptions) | **GET** /governance/exceptions | List governance exception requests (PI-1027-B / ADR-1029)
[**list_policy_denials**](GovernanceApi.md#list_policy_denials) | **GET** /governance/denials | List policy denial events (PI-1027-C / ADR-1028 D4)
[**list_stewardship_runs**](GovernanceApi.md#list_stewardship_runs) | **GET** /governance/stewardship/runs | List stewardship run history for authenticated owner



## create_governance_exception_request

> models::CreateGovernanceExceptionRequest201Response create_governance_exception_request(create_governance_exception_request)
Create exception request (pending — no auto-approve)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**create_governance_exception_request** | [**CreateGovernanceExceptionRequest**](CreateGovernanceExceptionRequest.md) |  | [required] |

### Return type

[**models::CreateGovernanceExceptionRequest201Response**](createGovernanceExceptionRequest_201_response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_governance_exception

> models::CreateGovernanceExceptionRequest201Response get_governance_exception(exception_id)
Governance exception request detail

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**exception_id** | **String** |  | [required] |

### Return type

[**models::CreateGovernanceExceptionRequest201Response**](createGovernanceExceptionRequest_201_response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_governance_manifest

> get_governance_manifest()
Memory governance manifest (ADR-1020 / ADR-1021)

### Parameters

This endpoint does not need any parameter.

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_policy_denial_summary

> models::GetPolicyDenialSummary200Response get_policy_denial_summary(since)
Aggregated denial counts by evaluation point

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**since** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  |  |

### Return type

[**models::GetPolicyDenialSummary200Response**](getPolicyDenialSummary_200_response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stewardship_run

> get_stewardship_run(run_id)
Stewardship run detail

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**run_id** | **String** |  | [required] |

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## list_governance_exceptions

> models::ListGovernanceExceptions200Response list_governance_exceptions(limit)
List governance exception requests (PI-1027-B / ADR-1029)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**limit** | Option<**i32**> |  |  |

### Return type

[**models::ListGovernanceExceptions200Response**](listGovernanceExceptions_200_response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## list_policy_denials

> models::ListPolicyDenials200Response list_policy_denials(limit, since)
List policy denial events (PI-1027-C / ADR-1028 D4)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**limit** | Option<**i32**> |  |  |
**since** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  |  |

### Return type

[**models::ListPolicyDenials200Response**](listPolicyDenials_200_response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## list_stewardship_runs

> list_stewardship_runs(limit)
List stewardship run history for authenticated owner

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**limit** | Option<**i32**> |  |  |

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth), [BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

