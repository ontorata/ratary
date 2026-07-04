<?php
declare(strict_types=1);

namespace AiBrain\Sdk;

/** Thin PHP REST wrapper — no business logic (Phase 16). */
final class AiBrainClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly ?string $apiKey = null,
    ) {}

    public function getCapabilities(): array
    {
        return $this->request('GET', '/api/v1/capabilities', auth: false);
    }

    public function searchMemories(string $query): array
    {
        return $this->request('GET', '/api/v1/search?q=' . urlencode($query));
    }

    /** @return array<string, mixed> */
    private function request(string $method, string $path, ?array $body = null, bool $auth = true): array
    {
        $url = rtrim($this->baseUrl, '/') . $path;
        $headers = ['Accept: application/json'];
        if ($auth && $this->apiKey) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
            $headers[] = 'X-API-Key: ' . $this->apiKey;
        }
        $opts = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers),
                'ignore_errors' => true,
            ],
        ];
        if ($body !== null) {
            $opts['http']['header'] .= "\r\nContent-Type: application/json";
            $opts['http']['content'] = json_encode($body);
        }
        $ctx = stream_context_create($opts);
        $raw = file_get_contents($url, false, $ctx);
        return json_decode($raw ?: '{}', true) ?? [];
    }
}
