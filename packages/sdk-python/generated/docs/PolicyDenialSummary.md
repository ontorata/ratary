# PolicyDenialSummary


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**since** | **datetime** |  | 
**by_point** | [**PolicyDenialSummaryByPoint**](PolicyDenialSummaryByPoint.md) |  | 
**total** | **int** |  | 

## Example

```python
from ratary_sdk.models.policy_denial_summary import PolicyDenialSummary

# TODO update the JSON string below
json = "{}"
# create an instance of PolicyDenialSummary from a JSON string
policy_denial_summary_instance = PolicyDenialSummary.from_json(json)
# print the JSON string representation of the object
print(PolicyDenialSummary.to_json())

# convert the object into a dict
policy_denial_summary_dict = policy_denial_summary_instance.to_dict()
# create an instance of PolicyDenialSummary from a dict
policy_denial_summary_from_dict = PolicyDenialSummary.from_dict(policy_denial_summary_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


