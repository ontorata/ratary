# Memory

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**title** | Option<**String**> |  | [optional]
**content** | Option<**String**> |  | [optional]
**summary** | Option<**String**> |  | [optional]
**project** | Option<**String**> |  | [optional]
**tags** | Option<**Vec<String>**> |  | [optional]
**favorite** | Option<**bool**> |  | [optional]
**archived** | Option<**bool**> |  | [optional]
**lifecycle_state** | Option<**LifecycleState**> | Optional stewardship lifecycle hint when set (enum: active, stale, candidate_compress) | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]
**updated_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


