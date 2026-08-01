# GovernanceExceptionRecordAuditLogInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**at** | **datetime** |  | 
**action** | **str** |  | 
**actor** | **str** |  | [optional] 
**note** | **str** |  | [optional] 

## Example

```python
from ratary_sdk.models.governance_exception_record_audit_log_inner import GovernanceExceptionRecordAuditLogInner

# TODO update the JSON string below
json = "{}"
# create an instance of GovernanceExceptionRecordAuditLogInner from a JSON string
governance_exception_record_audit_log_inner_instance = GovernanceExceptionRecordAuditLogInner.from_json(json)
# print the JSON string representation of the object
print(GovernanceExceptionRecordAuditLogInner.to_json())

# convert the object into a dict
governance_exception_record_audit_log_inner_dict = governance_exception_record_audit_log_inner_instance.to_dict()
# create an instance of GovernanceExceptionRecordAuditLogInner from a dict
governance_exception_record_audit_log_inner_from_dict = GovernanceExceptionRecordAuditLogInner.from_dict(governance_exception_record_audit_log_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


