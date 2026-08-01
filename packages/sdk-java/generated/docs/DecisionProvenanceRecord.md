

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
|**decisionModelId** | **String** |  |  [optional] |
|**decisionModelVersion** | **String** |  |  [optional] |
|**decisionModelPluginDigest** | **String** |  |  [optional] |
|**sandboxOutcome** | [**SandboxOutcomeEnum**](#SandboxOutcomeEnum) |  |  [optional] |
|**recordedAt** | **OffsetDateTime** |  |  |



## Enum: VerdictEnum

| Name | Value |
|---- | -----|
| ACCEPTED | &quot;accepted&quot; |
| REJECTED | &quot;rejected&quot; |



## Enum: SandboxOutcomeEnum

| Name | Value |
|---- | -----|
| OK | &quot;ok&quot; |
| TIMEOUT | &quot;timeout&quot; |
| ERROR | &quot;error&quot; |
| DENIED | &quot;denied&quot; |
| DISABLED | &quot;disabled&quot; |



