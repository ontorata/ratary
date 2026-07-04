using System.Net.Http.Headers;
using System.Text.Json;

namespace AiBrain.Sdk;

/// <summary>Thin C# REST wrapper — no business logic (Phase 16).</summary>
public sealed class AiBrainClient : IDisposable
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;

    public AiBrainClient(string baseUrl, string? apiKey = null)
    {
        _baseUrl = baseUrl.TrimEnd('/');
        _http = new HttpClient();
        if (!string.IsNullOrEmpty(apiKey))
        {
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            _http.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        }
    }

    public async Task<JsonDocument> GetCapabilitiesAsync(CancellationToken ct = default)
    {
        var json = await _http.GetStringAsync($"{_baseUrl}/api/v1/capabilities", ct);
        return JsonDocument.Parse(json);
    }

    public async Task<JsonDocument> SearchMemoriesAsync(string query, CancellationToken ct = default)
    {
        var json = await _http.GetStringAsync($"{_baseUrl}/api/v1/search?q={Uri.EscapeDataString(query)}", ct);
        return JsonDocument.Parse(json);
    }

    public void Dispose() => _http.Dispose();
}
