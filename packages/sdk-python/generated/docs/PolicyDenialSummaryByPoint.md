# PolicyDenialSummaryByPoint


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**write** | **int** |  | 
**recall** | **int** |  | 
**stewardship** | **int** |  | 

## Example

```python
from ratary_sdk.models.policy_denial_summary_by_point import PolicyDenialSummaryByPoint

# TODO update the JSON string below
json = "{}"
# create an instance of PolicyDenialSummaryByPoint from a JSON string
policy_denial_summary_by_point_instance = PolicyDenialSummaryByPoint.from_json(json)
# print the JSON string representation of the object
print(PolicyDenialSummaryByPoint.to_json())

# convert the object into a dict
policy_denial_summary_by_point_dict = policy_denial_summary_by_point_instance.to_dict()
# create an instance of PolicyDenialSummaryByPoint from a dict
policy_denial_summary_by_point_from_dict = PolicyDenialSummaryByPoint.from_dict(policy_denial_summary_by_point_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


