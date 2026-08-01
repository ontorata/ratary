# CreateDecisionProvenanceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**brief_id** | **String** |  | 
**package_id** | Option<**String**> |  | [optional]
**verdict** | **Verdict** |  (enum: accepted, rejected) | 
**rationale** | Option<**String**> |  | [optional]
**source_memory_ids** | Option<**Vec<String>**> |  | [optional]
**decision_model_id** | Option<**String**> |  | [optional]
**decision_model_version** | Option<**String**> |  | [optional]
**decision_model_plugin_digest** | Option<**String**> |  | [optional]
**sandbox_outcome** | Option<**SandboxOutcome**> |  (enum: ok, timeout, error, denied, disabled) | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


