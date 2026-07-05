# @ratary/sdk-go

**Aligned with OpenAPI SSOT v1.1.0** (`packages/openapi/ratary-v1.openapi.json`). Regenerate: `npm run generate:sdks` (requires Java 11+).

Hand-written thin wrapper until CI generator runs:

```go
package aibrain

import (
    "net/http"
    "encoding/json"
    "fmt"
)

type Client struct {
    BaseURL string
    APIKey  string
    HTTP    *http.Client
}

func (c *Client) GetCapabilities() (map[string]interface{}, error) {
    req, _ := http.NewRequest("GET", c.BaseURL+"/api/v1/capabilities", nil)
    resp, err := c.do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()
    var out map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&out)
    return out, nil
}

func (c *Client) do(req *http.Request) (*http.Response, error) {
    if c.APIKey != "" {
        req.Header.Set("Authorization", "Bearer "+c.APIKey)
        req.Header.Set("X-API-Key", c.APIKey)
    }
    client := c.HTTP
    if client == nil { client = http.DefaultClient }
    return client.Do(req)
}
```

See `generated/` after running OpenAPI Generator with `-g go`.
