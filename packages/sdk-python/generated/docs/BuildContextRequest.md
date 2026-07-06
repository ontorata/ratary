# BuildContextRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**task** | **str** |  | 
**max_tokens** | **int** |  | [optional] 
**project** | **str** |  | [optional] 

## Example

```python
from ratary_sdk.models.build_context_request import BuildContextRequest

# TODO update the JSON string below
json = "{}"
# create an instance of BuildContextRequest from a JSON string
build_context_request_instance = BuildContextRequest.from_json(json)
# print the JSON string representation of the object
print(BuildContextRequest.to_json())

# convert the object into a dict
build_context_request_dict = build_context_request_instance.to_dict()
# create an instance of BuildContextRequest from a dict
build_context_request_from_dict = BuildContextRequest.from_dict(build_context_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


