# GetPolicyDenialSummary200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**summary** | [**PolicyDenialSummary**](PolicyDenialSummary.md) |  | [optional] 

## Example

```python
from ratary_sdk.models.get_policy_denial_summary200_response import GetPolicyDenialSummary200Response

# TODO update the JSON string below
json = "{}"
# create an instance of GetPolicyDenialSummary200Response from a JSON string
get_policy_denial_summary200_response_instance = GetPolicyDenialSummary200Response.from_json(json)
# print the JSON string representation of the object
print(GetPolicyDenialSummary200Response.to_json())

# convert the object into a dict
get_policy_denial_summary200_response_dict = get_policy_denial_summary200_response_instance.to_dict()
# create an instance of GetPolicyDenialSummary200Response from a dict
get_policy_denial_summary200_response_from_dict = GetPolicyDenialSummary200Response.from_dict(get_policy_denial_summary200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


