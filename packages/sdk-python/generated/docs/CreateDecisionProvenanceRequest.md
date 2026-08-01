# CreateDecisionProvenanceRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**brief_id** | **str** |  | 
**package_id** | **str** |  | [optional] 
**verdict** | **str** |  | 
**rationale** | **str** |  | [optional] 
**source_memory_ids** | **List[str]** |  | [optional] 
**decision_model_id** | **str** |  | [optional] 
**decision_model_version** | **str** |  | [optional] 
**decision_model_plugin_digest** | **str** |  | [optional] 
**sandbox_outcome** | **str** |  | [optional] 

## Example

```python
from ratary_sdk.models.create_decision_provenance_request import CreateDecisionProvenanceRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateDecisionProvenanceRequest from a JSON string
create_decision_provenance_request_instance = CreateDecisionProvenanceRequest.from_json(json)
# print the JSON string representation of the object
print(CreateDecisionProvenanceRequest.to_json())

# convert the object into a dict
create_decision_provenance_request_dict = create_decision_provenance_request_instance.to_dict()
# create an instance of CreateDecisionProvenanceRequest from a dict
create_decision_provenance_request_from_dict = CreateDecisionProvenanceRequest.from_dict(create_decision_provenance_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


