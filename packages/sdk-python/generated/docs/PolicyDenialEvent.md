# PolicyDenialEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**denial_id** | **str** |  | 
**owner_id** | **str** |  | 
**point** | **str** |  | 
**policy_module_id** | **str** |  | [optional] 
**reason_code** | **str** |  | 
**occurred_at** | **datetime** |  | 
**memory_id** | **str** |  | [optional] 
**resource** | **str** |  | [optional] 

## Example

```python
from ratary_sdk.models.policy_denial_event import PolicyDenialEvent

# TODO update the JSON string below
json = "{}"
# create an instance of PolicyDenialEvent from a JSON string
policy_denial_event_instance = PolicyDenialEvent.from_json(json)
# print the JSON string representation of the object
print(PolicyDenialEvent.to_json())

# convert the object into a dict
policy_denial_event_dict = policy_denial_event_instance.to_dict()
# create an instance of PolicyDenialEvent from a dict
policy_denial_event_from_dict = PolicyDenialEvent.from_dict(policy_denial_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


