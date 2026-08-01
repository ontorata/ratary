# GovernanceExceptionRecord

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exception_id** | **String** |  | 
**owner_id** | **String** |  | 
**exception_class** | **ExceptionClass** |  (enum: decay_protection, feature_flag_off, ops_maintenance) | 
**rationale** | **String** |  | 
**status** | **Status** |  (enum: pending, approved, rejected, expired) | 
**requested_by** | **String** |  | 
**requested_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 
**expires_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]
**audit_log** | [**Vec<models::GovernanceExceptionRecordAuditLogInner>**](GovernanceExceptionRecordAuditLogInner.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


