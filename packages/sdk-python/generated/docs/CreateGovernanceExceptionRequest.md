# CreateGovernanceExceptionRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exception_class** | **str** |  | 
**rationale** | **str** |  | 
**expires_at** | **datetime** |  | [optional] 

## Example

```python
from ratary_sdk.models.create_governance_exception_request import CreateGovernanceExceptionRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateGovernanceExceptionRequest from a JSON string
create_governance_exception_request_instance = CreateGovernanceExceptionRequest.from_json(json)
# print the JSON string representation of the object
print(CreateGovernanceExceptionRequest.to_json())

# convert the object into a dict
create_governance_exception_request_dict = create_governance_exception_request_instance.to_dict()
# create an instance of CreateGovernanceExceptionRequest from a dict
create_governance_exception_request_from_dict = CreateGovernanceExceptionRequest.from_dict(create_governance_exception_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


