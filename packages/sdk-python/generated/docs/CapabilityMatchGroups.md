# CapabilityMatchGroups


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**required** | **List[str]** |  | 
**preferred** | **List[str]** |  | 
**transports** | **List[str]** |  | 

## Example

```python
from ratary_sdk.models.capability_match_groups import CapabilityMatchGroups

# TODO update the JSON string below
json = "{}"
# create an instance of CapabilityMatchGroups from a JSON string
capability_match_groups_instance = CapabilityMatchGroups.from_json(json)
# print the JSON string representation of the object
print(CapabilityMatchGroups.to_json())

# convert the object into a dict
capability_match_groups_dict = capability_match_groups_instance.to_dict()
# create an instance of CapabilityMatchGroups from a dict
capability_match_groups_from_dict = CapabilityMatchGroups.from_dict(capability_match_groups_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


