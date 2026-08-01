

# RecommendationRerankMetadata


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**applied** | **Boolean** |  |  |
|**decisionModelId** | **String** |  |  [optional] |
|**decisionModelVersion** | **String** |  |  [optional] |
|**sandboxOutcome** | [**SandboxOutcomeEnum**](#SandboxOutcomeEnum) |  |  [optional] |
|**pluginDigestPrefix** | **String** |  |  [optional] |
|**reason** | **String** |  |  [optional] |



## Enum: SandboxOutcomeEnum

| Name | Value |
|---- | -----|
| OK | &quot;ok&quot; |
| TIMEOUT | &quot;timeout&quot; |
| ERROR | &quot;error&quot; |
| DENIED | &quot;denied&quot; |
| DISABLED | &quot;disabled&quot; |



