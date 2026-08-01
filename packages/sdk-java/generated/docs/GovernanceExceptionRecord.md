

# GovernanceExceptionRecord


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**exceptionId** | **String** |  |  |
|**ownerId** | **String** |  |  |
|**exceptionClass** | [**ExceptionClassEnum**](#ExceptionClassEnum) |  |  |
|**rationale** | **String** |  |  |
|**status** | [**StatusEnum**](#StatusEnum) |  |  |
|**requestedBy** | **String** |  |  |
|**requestedAt** | **OffsetDateTime** |  |  |
|**expiresAt** | **OffsetDateTime** |  |  [optional] |
|**auditLog** | [**List&lt;GovernanceExceptionRecordAuditLogInner&gt;**](GovernanceExceptionRecordAuditLogInner.md) |  |  |



## Enum: ExceptionClassEnum

| Name | Value |
|---- | -----|
| DECAY_PROTECTION | &quot;decay_protection&quot; |
| FEATURE_FLAG_OFF | &quot;feature_flag_off&quot; |
| OPS_MAINTENANCE | &quot;ops_maintenance&quot; |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| PENDING | &quot;pending&quot; |
| APPROVED | &quot;approved&quot; |
| REJECTED | &quot;rejected&quot; |
| EXPIRED | &quot;expired&quot; |



