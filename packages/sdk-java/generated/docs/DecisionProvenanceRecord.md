

# DecisionProvenanceRecord


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**recordId** | **String** |  |  |
|**ownerId** | **String** |  |  |
|**briefId** | **String** |  |  |
|**packageId** | **String** |  |  [optional] |
|**verdict** | [**VerdictEnum**](#VerdictEnum) |  |  |
|**rationale** | **String** |  |  [optional] |
|**sourceMemoryIds** | **List&lt;String&gt;** |  |  |
|**recordedAt** | **OffsetDateTime** |  |  |



## Enum: VerdictEnum

| Name | Value |
|---- | -----|
| ACCEPTED | &quot;accepted&quot; |
| REJECTED | &quot;rejected&quot; |



