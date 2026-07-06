"""Thin Python SDK wrapper for AI Memory Cloud REST API (Phase 16)."""

from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from typing import Any


class AiBrainClient:
    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        workspace_id: str | None = None,
    ) -> None:
        self.base_url = (base_url or os.environ.get("AI_BRAIN_BASE_URL", "http://localhost:9876")).rstrip("/")
        self.api_key = api_key or os.environ.get("AI_BRAIN_API_KEY")
        self.workspace_id = workspace_id or os.environ.get("AI_BRAIN_WORKSPACE_ID")

    def _request(self, method: str, path: str, body: dict[str, Any] | None = None, auth: bool = True) -> Any:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Accept", "application/json")
        if body is not None:
            req.add_header("Content-Type", "application/json")
        if auth and self.api_key:
            req.add_header("Authorization", f"Bearer {self.api_key}")
            req.add_header("X-API-Key", self.api_key)
        if self.workspace_id:
            req.add_header("X-Workspace-Id", self.workspace_id)
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def get_capabilities(self) -> Any:
        return self._request("GET", "/api/v1/capabilities", auth=False)

    def search_memories(self, query: str, limit: int | None = None) -> Any:
        q = f"/api/v1/search?q={urllib.parse.quote(query)}"
        if limit is not None:
            q += f"&limit={limit}"
        return self._request("GET", q)

    def build_context(self, task: str, project: str | None = None) -> Any:
        body: dict[str, Any] = {"task": task}
        if project:
            body["project"] = project
        return self._request("POST", "/api/v1/context", body=body)
