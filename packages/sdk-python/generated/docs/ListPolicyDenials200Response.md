# ListPolicyDenials200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**denials** | [**List[PolicyDenialEvent]**](PolicyDenialEvent.md) |  | [optional] 

## Example

```python
from ratary_sdk.models.list_policy_denials200_response import ListPolicyDenials200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ListPolicyDenials200Response from a JSON string
list_policy_denials200_response_instance = ListPolicyDenials200Response.from_json(json)
# print the JSON string representation of the object
print(ListPolicyDenials200Response.to_json())

# convert the object into a dict
list_policy_denials200_response_dict = list_policy_denials200_response_instance.to_dict()
# create an instance of ListPolicyDenials200Response from a dict
list_policy_denials200_response_from_dict = ListPolicyDenials200Response.from_dict(list_policy_denials200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


