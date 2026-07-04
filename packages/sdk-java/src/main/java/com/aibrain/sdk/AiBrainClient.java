package com.aibrain.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/** Thin Java REST wrapper — no business logic (Phase 16). */
public final class AiBrainClient {
  private final String baseUrl;
  private final String apiKey;
  private final HttpClient http = HttpClient.newHttpClient();

  public AiBrainClient(String baseUrl, String apiKey) {
    this.baseUrl = baseUrl.replaceAll("/$", "");
    this.apiKey = apiKey;
  }

  public String getCapabilities() throws Exception {
    var req = HttpRequest.newBuilder(URI.create(baseUrl + "/api/v1/capabilities")).GET().build();
    return http.send(req, HttpResponse.BodyHandlers.ofString()).body();
  }

  public String searchMemories(String query) throws Exception {
    var req = HttpRequest.newBuilder(URI.create(baseUrl + "/api/v1/search?q=" + query))
        .header("Authorization", "Bearer " + apiKey)
        .header("X-API-Key", apiKey)
        .GET()
        .build();
    return http.send(req, HttpResponse.BodyHandlers.ofString()).body();
  }
}
