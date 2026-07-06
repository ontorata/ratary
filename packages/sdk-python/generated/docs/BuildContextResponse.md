# BuildContextResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**context** | **str** |  | [optional] 
**prompt** | **str** |  | [optional] 
**memory_count** | **int** |  | [optional] 

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


