# BuildContextResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**context** | **str** |  | [optional] 
**prompt** | **str** |  | [optional] 
**system** | **str** |  | [optional] 
**user** | **str** |  | [optional] 
**memory_count** | **int** |  | [optional] 
**package_id** | **str** | ADR-1011 Ratary-issued Context Package id | [optional] 
**owner_id** | **str** |  | [optional] 
**created_at** | **datetime** |  | [optional] 
**confidence** | **str** |  | [optional] 
**confidence_model** | **str** | ADR-1016 confidence derivation model id | [optional] 
**update_mechanism** | **str** |  | [optional] 
**lifecycle_state** | **str** | ADR-1013 usage eligibility; mint is always active | [optional] 
**source_labels** | **List[str]** |  | [optional] 
**query** | **str** |  | [optional] 
**retrieval_memo** | **str** | ADR-1018 ranked-candidate memo status; package envelope always reminted | [optional] 

## Example

```python
from ratary_sdk.models.build_context_response import BuildContextResponse

# TODO update the JSON string below
json = "{}"
# create an instance of BuildContextResponse from a JSON string
build_context_response_instance = BuildContextResponse.from_json(json)
# print the JSON string representation of the object
print(BuildContextResponse.to_json())

# convert the object into a dict
build_context_response_dict = build_context_response_instance.to_dict()
# create an instance of BuildContextResponse from a dict
build_context_response_from_dict = BuildContextResponse.from_dict(build_context_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


