# @ai-brain/sdk-python

Python client. Hand-written thin wrapper; regenerate full client: `npm run generate:sdks`.

```python
from ai_brain_sdk.client import AiBrainClient

client = AiBrainClient(api_key="aic_...")
print(client.get_capabilities())
```
