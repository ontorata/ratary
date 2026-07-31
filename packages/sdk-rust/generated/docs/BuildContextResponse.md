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
**update_mechanism** | Option<**String**> |  | [optional]
**source_labels** | Option<**Vec<String>**> |  | [optional]
**query** | Option<**String**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


