

# BuildContextResponse


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**context** | **String** |  |  [optional] |
|**prompt** | **String** |  |  [optional] |
|**system** | **String** |  |  [optional] |
|**user** | **String** |  |  [optional] |
|**memoryCount** | **Integer** |  |  [optional] |
|**packageId** | **String** | ADR-1011 Ratary-issued Context Package id |  [optional] |
|**ownerId** | **String** |  |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  [optional] |
|**confidence** | [**ConfidenceEnum**](#ConfidenceEnum) |  |  [optional] |
|**confidenceModel** | [**ConfidenceModelEnum**](#ConfidenceModelEnum) | ADR-1016 confidence derivation model id |  [optional] |
|**updateMechanism** | **String** |  |  [optional] |
|**lifecycleState** | [**LifecycleStateEnum**](#LifecycleStateEnum) | ADR-1013 usage eligibility; mint is always active |  [optional] |
|**sourceLabels** | **List&lt;String&gt;** |  |  [optional] |
|**query** | **String** |  |  [optional] |
|**retrievalMemo** | [**RetrievalMemoEnum**](#RetrievalMemoEnum) | ADR-1018 ranked-candidate memo status; package envelope always reminted |  [optional] |



## Enum: ConfidenceEnum

| Name | Value |
|---- | -----|
| HIGH | &quot;high&quot; |
| MEDIUM | &quot;medium&quot; |
| LOW | &quot;low&quot; |



## Enum: ConfidenceModelEnum

| Name | Value |
|---- | -----|
| HEURISTIC_TOP_RELEVANCE_V1 | &quot;heuristic-top-relevance-v1&quot; |
| CONFIDENCE_PRODUCT_V1 | &quot;confidence-product-v1&quot; |



## Enum: LifecycleStateEnum

| Name | Value |
|---- | -----|
| ACTIVE | &quot;active&quot; |
| RETIRED | &quot;retired&quot; |
| ARCHIVED | &quot;archived&quot; |



## Enum: RetrievalMemoEnum

| Name | Value |
|---- | -----|
| HIT | &quot;hit&quot; |
| MISS | &quot;miss&quot; |
| BYPASS | &quot;bypass&quot; |



