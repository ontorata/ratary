# ListGovernanceExceptions200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exceptions** | [**List[GovernanceExceptionRecord]**](GovernanceExceptionRecord.md) |  | [optional] 

## Example

```python
from ratary_sdk.models.list_governance_exceptions200_response import ListGovernanceExceptions200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ListGovernanceExceptions200Response from a JSON string
list_governance_exceptions200_response_instance = ListGovernanceExceptions200Response.from_json(json)
# print the JSON string representation of the object
print(ListGovernanceExceptions200Response.to_json())

# convert the object into a dict
list_governance_exceptions200_response_dict = list_governance_exceptions200_response_instance.to_dict()
# create an instance of ListGovernanceExceptions200Response from a dict
list_governance_exceptions200_response_from_dict = ListGovernanceExceptions200Response.from_dict(list_governance_exceptions200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


