# UpdateMemoryRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** |  | [optional] 
**content** | **str** |  | [optional] 
**summary** | **str** |  | [optional] 
**tags** | **List[str]** |  | [optional] 

## Example

```python
from ratary_sdk.models.update_memory_request import UpdateMemoryRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateMemoryRequest from a JSON string
update_memory_request_instance = UpdateMemoryRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateMemoryRequest.to_json())

# convert the object into a dict
update_memory_request_dict = update_memory_request_instance.to_dict()
# create an instance of UpdateMemoryRequest from a dict
update_memory_request_from_dict = UpdateMemoryRequest.from_dict(update_memory_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


