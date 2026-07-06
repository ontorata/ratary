# Memory


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**title** | **str** |  | [optional] 
**content** | **str** |  | [optional] 
**summary** | **str** |  | [optional] 
**project** | **str** |  | [optional] 
**tags** | **List[str]** |  | [optional] 
**favorite** | **bool** |  | [optional] 
**archived** | **bool** |  | [optional] 
**lifecycle_state** | **str** | Optional stewardship lifecycle hint when set | [optional] 
**created_at** | **datetime** |  | [optional] 
**updated_at** | **datetime** |  | [optional] 

## Example

```python
from ratary_sdk.models.memory import Memory

# TODO update the JSON string below
json = "{}"
# create an instance of Memory from a JSON string
memory_instance = Memory.from_json(json)
# print the JSON string representation of the object
print(Memory.to_json())

# convert the object into a dict
memory_dict = memory_instance.to_dict()
# create an instance of Memory from a dict
memory_from_dict = Memory.from_dict(memory_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


