

# DecisionModelCatalogEntry


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **String** |  |  |
|**version** | **String** |  |  |
|**displayName** | **String** |  |  |
|**description** | **String** |  |  [optional] |
|**stability** | [**StabilityEnum**](#StabilityEnum) |  |  |
|**executionProfileName** | **String** |  |  |
|**capabilities** | **List&lt;String&gt;** |  |  |
|**computedPlugin** | [**DecisionModelComputedPluginSummary**](DecisionModelComputedPluginSummary.md) |  |  [optional] |



## Enum: StabilityEnum

| Name | Value |
|---- | -----|
| EXPERIMENTAL | &quot;experimental&quot; |
| STABLE | &quot;stable&quot; |
| DEPRECATED | &quot;deprecated&quot; |



