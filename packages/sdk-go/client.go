package aibrain

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// Client is a thin REST wrapper — no business logic (Phase 16).
type Client struct {
	BaseURL string
	APIKey  string
	HTTP    *http.Client
}

func (c *Client) GetCapabilities() (map[string]any, error) {
	return c.getJSON("/api/v1/capabilities", false)
}

func (c *Client) SearchMemories(query string) (map[string]any, error) {
	return c.getJSON(fmt.Sprintf("/api/v1/search?q=%s", query), true)
}

func (c *Client) getJSON(path string, auth bool) (map[string]any, error) {
	req, err := http.NewRequest(http.MethodGet, c.BaseURL+path, nil)
	if err != nil {
		return nil, err
	}
	if auth && c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
		req.Header.Set("X-API-Key", c.APIKey)
	}
	client := c.HTTP
	if client == nil {
		client = http.DefaultClient
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var out map[string]any
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, err
	}
	return out, nil
}
