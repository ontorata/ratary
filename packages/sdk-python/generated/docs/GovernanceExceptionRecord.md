# GovernanceExceptionRecord


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exception_id** | **str** |  | 
**owner_id** | **str** |  | 
**exception_class** | **str** |  | 
**rationale** | **str** |  | 
**status** | **str** |  | 
**requested_by** | **str** |  | 
**requested_at** | **datetime** |  | 
**expires_at** | **datetime** |  | [optional] 
**audit_log** | [**List[GovernanceExceptionRecordAuditLogInner]**](GovernanceExceptionRecordAuditLogInner.md) |  | 

## Example

```python
from ratary_sdk.models.governance_exception_record import GovernanceExceptionRecord

# TODO update the JSON string below
json = "{}"
# create an instance of GovernanceExceptionRecord from a JSON string
governance_exception_record_instance = GovernanceExceptionRecord.from_json(json)
# print the JSON string representation of the object
print(GovernanceExceptionRecord.to_json())

# convert the object into a dict
governance_exception_record_dict = governance_exception_record_instance.to_dict()
# create an instance of GovernanceExceptionRecord from a dict
governance_exception_record_from_dict = GovernanceExceptionRecord.from_dict(governance_exception_record_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


