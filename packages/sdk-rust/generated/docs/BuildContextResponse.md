# BuildContextResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**context** | Option<**String**> |  | [optional]
**prompt** | Option<**String**> |  | [optional]
**system** | Option<**String**> |  | [optional]
**user** | Option<**String**> |  | [optional]
**memory_count** | Option<**i32**> |  | [optional]
**package_id** | Option<**String**> | ADR-1011 Ratary-issued Context Package id | [optional]
**owner_id** | Option<**String**> |  | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]
**confidence** | Option<**Confidence**> |  (enum: high, medium, low) | [optional]
**confidence_model** | Option<**ConfidenceModel**> | ADR-1016 confidence derivation model id (enum: heuristic-top-relevance-v1, confidence-product-v1) | [optional]
**update_mechanism** | Option<**String**> |  | [optional]
**lifecycle_state** | Option<**LifecycleState**> | ADR-1013 usage eligibility; mint is always active (enum: active, retired, archived) | [optional]
**source_labels** | Option<**Vec<String>**> |  | [optional]
**query** | Option<**String**> |  | [optional]
**retrieval_memo** | Option<**RetrievalMemo**> | ADR-1018 ranked-candidate memo status; package envelope always reminted (enum: hit, miss, bypass) | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


