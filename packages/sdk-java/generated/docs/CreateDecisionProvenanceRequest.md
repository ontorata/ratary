

# CreateDecisionProvenanceRequest


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**briefId** | **String** |  |  |
|**packageId** | **String** |  |  [optional] |
|**verdict** | [**VerdictEnum**](#VerdictEnum) |  |  |
|**rationale** | **String** |  |  [optional] |
|**sourceMemoryIds** | **List&lt;String&gt;** |  |  [optional] |
|**decisionModelId** | **String** |  |  [optional] |
|**decisionModelVersion** | **String** |  |  [optional] |



## Enum: VerdictEnum

| Name | Value |
|---- | -----|
| ACCEPTED | &quot;accepted&quot; |
| REJECTED | &quot;rejected&quot; |



