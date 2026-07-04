//! Thin Rust REST wrapper — no business logic (Phase 16).

use reqwest::header::{AUTHORIZATION, HeaderMap, HeaderValue};
use serde_json::Value;

pub struct AiBrainClient {
    base_url: String,
    api_key: Option<String>,
    client: reqwest::Client,
}

impl AiBrainClient {
    pub fn new(base_url: impl Into<String>, api_key: Option<String>) -> Self {
        Self {
            base_url: base_url.into().trim_end_matches('/').to_string(),
            api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn get_capabilities(&self) -> Result<Value, reqwest::Error> {
        let url = format!("{}/api/v1/capabilities", self.base_url);
        self.client.get(url).send().await?.json().await
    }

    pub async fn search_memories(&self, query: &str) -> Result<Value, reqwest::Error> {
        let url = format!("{}/api/v1/search?q={}", self.base_url, query);
        let mut req = self.client.get(url);
        if let Some(key) = &self.api_key {
            let mut headers = HeaderMap::new();
            headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {key}")).unwrap());
            req = req.headers(headers);
        }
        req.send().await?.json().await
    }
}
