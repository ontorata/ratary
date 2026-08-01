# DecisionProvenanceRecord


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**record_id** | **str** |  | 
**owner_id** | **str** |  | 
**brief_id** | **str** |  | 
**package_id** | **str** |  | [optional] 
**verdict** | **str** |  | 
**rationale** | **str** |  | [optional] 
**source_memory_ids** | **List[str]** |  | 
**decision_model_id** | **str** |  | [optional] 
**decision_model_version** | **str** |  | [optional] 
**decision_model_plugin_digest** | **str** |  | [optional] 
**sandbox_outcome** | **str** |  | [optional] 
**recorded_at** | **datetime** |  | 

## Example

```python
from ratary_sdk.models.decision_provenance_record import DecisionProvenanceRecord

# TODO update the JSON string below
json = "{}"
# create an instance of DecisionProvenanceRecord from a JSON string
decision_provenance_record_instance = DecisionProvenanceRecord.from_json(json)
# print the JSON string representation of the object
print(DecisionProvenanceRecord.to_json())

# convert the object into a dict
decision_provenance_record_dict = decision_provenance_record_instance.to_dict()
# create an instance of DecisionProvenanceRecord from a dict
decision_provenance_record_from_dict = DecisionProvenanceRecord.from_dict(decision_provenance_record_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


