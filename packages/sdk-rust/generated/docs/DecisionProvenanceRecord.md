# DecisionProvenanceRecord

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**record_id** | **String** |  | 
**owner_id** | **String** |  | 
**brief_id** | **String** |  | 
**package_id** | Option<**String**> |  | [optional]
**verdict** | **Verdict** |  (enum: accepted, rejected) | 
**rationale** | Option<**String**> |  | [optional]
**source_memory_ids** | **Vec<String>** |  | 
**decision_model_id** | Option<**String**> |  | [optional]
**decision_model_version** | Option<**String**> |  | [optional]
**decision_model_plugin_digest** | Option<**String**> |  | [optional]
**sandbox_outcome** | Option<**SandboxOutcome**> |  (enum: ok, timeout, error, denied, disabled) | [optional]
**recorded_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


