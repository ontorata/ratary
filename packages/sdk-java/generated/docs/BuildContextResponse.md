

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
|**updateMechanism** | **String** |  |  [optional] |
|**sourceLabels** | **List&lt;String&gt;** |  |  [optional] |
|**query** | **String** |  |  [optional] |



## Enum: ConfidenceEnum

| Name | Value |
|---- | -----|
| HIGH | &quot;high&quot; |
| MEDIUM | &quot;medium&quot; |
| LOW | &quot;low&quot; |



