# ratary_sdk.Model.BuildContextResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Context** | **string** |  | [optional] 
**Prompt** | **string** |  | [optional] 
**System** | **string** |  | [optional] 
**User** | **string** |  | [optional] 
**MemoryCount** | **int** |  | [optional] 
**PackageId** | **string** | ADR-1011 Ratary-issued Context Package id | [optional] 
**OwnerId** | **string** |  | [optional] 
**CreatedAt** | **DateTime** |  | [optional] 
**Confidence** | **string** |  | [optional] 
**ConfidenceModel** | **string** | ADR-1016 confidence derivation model id | [optional] 
**UpdateMechanism** | **string** |  | [optional] 
**LifecycleState** | **string** | ADR-1013 usage eligibility; mint is always active | [optional] 
**SourceLabels** | **List&lt;string&gt;** |  | [optional] 
**Query** | **string** |  | [optional] 
**RetrievalMemo** | **string** | ADR-1018 ranked-candidate memo status; package envelope always reminted | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

