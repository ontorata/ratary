# CreateGovernanceExceptionRequest201Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exception** | [**GovernanceExceptionRecord**](GovernanceExceptionRecord.md) |  | [optional] 

## Example

```python
from ratary_sdk.models.create_governance_exception_request201_response import CreateGovernanceExceptionRequest201Response

# TODO update the JSON string below
json = "{}"
# create an instance of CreateGovernanceExceptionRequest201Response from a JSON string
create_governance_exception_request201_response_instance = CreateGovernanceExceptionRequest201Response.from_json(json)
# print the JSON string representation of the object
print(CreateGovernanceExceptionRequest201Response.to_json())

# convert the object into a dict
create_governance_exception_request201_response_dict = create_governance_exception_request201_response_instance.to_dict()
# create an instance of CreateGovernanceExceptionRequest201Response from a dict
create_governance_exception_request201_response_from_dict = CreateGovernanceExceptionRequest201Response.from_dict(create_governance_exception_request201_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


