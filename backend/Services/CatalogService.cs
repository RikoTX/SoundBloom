using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class CatalogService(HttpClient httpClient, IOptions<SupabaseSettings> supabaseOptions)
{
    private const string Source = "soundbloom";

    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public Task<IReadOnlyList<CatalogTrackResponse>> SearchAsync(
        string query,
        int limit,
        CancellationToken cancellationToken
    ) => ListApprovedAsync(query, tag: null, order: "popular", limit, cancellationToken);

    public Task<IReadOnlyList<CatalogTrackResponse>> ListFeaturedAsync(
        string order,
        int limit,
        CancellationToken cancellationToken
    ) => ListApprovedAsync(search: null, tag: null, order, limit, cancellationToken);

    public Task<IReadOnlyList<CatalogTrackResponse>> ListByTagAsync(
        string tag,
        int limit,
        CancellationToken cancellationToken
    ) => ListApprovedAsync(search: null, tag, order: "popular", limit, cancellationToken);

    private async Task<IReadOnlyList<CatalogTrackResponse>> ListApprovedAsync(
        string? search,
        string? tag,
        string order,
        int limit,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return [];
        }

        limit = Math.Clamp(limit, 1, 50);
        var rows = await LoadTrackRowsAsync(search, tag, order, limit, cancellationToken);

        if (rows.Count == 0)
        {
            return [];
        }

        return await MapToCatalogAsync(rows, cancellationToken);
    }

    private async Task<List<TrackRow>> LoadTrackRowsAsync(
        string? search,
        string? tag,
        string order,
        int limit,
        CancellationToken cancellationToken
    )
    {
        if (!string.IsNullOrWhiteSpace(tag))
        {
            var tagPattern = $"*{tag.Trim()}*";
            var tagRows = await QueryAsync<TagTrackRow>(
                $"/rest/v1/track_tags?tag_value=ilike.{EncodeFilter(tagPattern)}&select=track_id",
                cancellationToken
            );

            var trackIds = tagRows?
                .Select(t => t.TrackId)
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .Take(limit * 3)
                .ToList() ?? [];

            if (trackIds.Count == 0)
            {
                return [];
            }

            var inList = string.Join(",", trackIds.Select(id => Uri.EscapeDataString(id!)));
            var orderClause = order == "recent" ? "created_at.desc" : "play_count.desc";
            return await QueryAsync<TrackRow>(
                    $"/rest/v1/tracks?status=eq.approved&id=in.({inList})&select=id,title,authors,artist_id,play_count,created_at&order={orderClause}&limit={limit}",
                    cancellationToken
                ) ?? [];
        }

        var orderBy = order == "recent" ? "created_at.desc" : "play_count.desc";
        var path =
            $"/rest/v1/tracks?status=eq.approved&select=id,title,authors,artist_id,play_count,created_at&order={orderBy}&limit={limit}";

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = EncodeFilter($"*{search.Trim()}*");
            path =
                $"/rest/v1/tracks?status=eq.approved&or=(title.ilike.{pattern},authors.ilike.{pattern})&select=id,title,authors,artist_id,play_count,created_at&order={orderBy}&limit={limit}";
        }

        return await QueryAsync<TrackRow>(path, cancellationToken) ?? [];
    }

    private async Task<IReadOnlyList<CatalogTrackResponse>> MapToCatalogAsync(
        List<TrackRow> rows,
        CancellationToken cancellationToken
    )
    {
        var trackIds = rows.Select(r => r.Id!).Where(id => !string.IsNullOrWhiteSpace(id)).ToList();
        var artistIds = rows
            .Select(r => r.ArtistId)
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct()
            .ToList();

        var covers = await LoadCoversAsync(trackIds, cancellationToken);
        var files = await LoadFilesAsync(trackIds, cancellationToken);
        var artists = await LoadArtistsAsync(artistIds, cancellationToken);

        var result = new List<CatalogTrackResponse>();

        foreach (var row in rows)
        {
            if (string.IsNullOrWhiteSpace(row.Id))
            {
                continue;
            }

            if (!files.TryGetValue(row.Id, out var file) || string.IsNullOrWhiteSpace(file.AudioUrl))
            {
                continue;
            }

            var artistName = !string.IsNullOrWhiteSpace(row.Authors)
                ? row.Authors
                : artists.GetValueOrDefault(row.ArtistId ?? "", "SoundBloom Artist");

            covers.TryGetValue(row.Id, out var coverUrl);

            result.Add(
                new CatalogTrackResponse(
                    row.Id,
                    row.Title ?? "Untitled",
                    artistName,
                    coverUrl,
                    file.AudioUrl,
                    Source,
                    0,
                    "—",
                    "SoundBloom"
                )
            );
        }

        return result;
    }

    private async Task<Dictionary<string, string>> LoadCoversAsync(
        List<string> trackIds,
        CancellationToken cancellationToken
    )
    {
        if (trackIds.Count == 0)
        {
            return [];
        }

        var inList = string.Join(",", trackIds.Select(Uri.EscapeDataString));
        var rows = await QueryAsync<CoverRow>(
            $"/rest/v1/track_covers?track_id=in.({inList})&select=track_id,cover_url",
            cancellationToken
        );

        return (rows ?? [])
            .Where(r => !string.IsNullOrWhiteSpace(r.TrackId) && !string.IsNullOrWhiteSpace(r.CoverUrl))
            .GroupBy(r => r.TrackId!)
            .ToDictionary(g => g.Key, g => g.First().CoverUrl!);
    }

    private async Task<Dictionary<string, FileRow>> LoadFilesAsync(
        List<string> trackIds,
        CancellationToken cancellationToken
    )
    {
        if (trackIds.Count == 0)
        {
            return [];
        }

        var inList = string.Join(",", trackIds.Select(Uri.EscapeDataString));
        var rows = await QueryAsync<FileRow>(
            $"/rest/v1/track_files?track_id=in.({inList})&select=track_id,audio_url",
            cancellationToken
        );

        return (rows ?? [])
            .Where(r => !string.IsNullOrWhiteSpace(r.TrackId))
            .GroupBy(r => r.TrackId!)
            .ToDictionary(g => g.Key, g => g.First());
    }

    private async Task<Dictionary<string, string>> LoadArtistsAsync(
        List<string> artistIds,
        CancellationToken cancellationToken
    )
    {
        if (artistIds.Count == 0)
        {
            return [];
        }

        var inList = string.Join(",", artistIds.Select(Uri.EscapeDataString));
        var rows = await QueryAsync<ArtistRow>(
            $"/rest/v1/artists?id=in.({inList})&select=id,name",
            cancellationToken
        );

        return (rows ?? [])
            .Where(r => !string.IsNullOrWhiteSpace(r.Id))
            .ToDictionary(r => r.Id!, r => r.Name ?? "Artist");
    }

    private static string EncodeFilter(string value) =>
        Uri.EscapeDataString(value).Replace("%2a", "*");

    private async Task<List<T>?> QueryAsync<T>(string path, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(HttpMethod.Get, path);
        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<List<T>>(cancellationToken: cancellationToken);
    }

    private HttpRequestMessage CreateSecretRequest(HttpMethod method, string path)
    {
        var request = new HttpRequestMessage(method, $"{_settings.Url.TrimEnd('/')}{path}");
        request.Headers.Add("apikey", _settings.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            _settings.SecretKey
        );
        return request;
    }

    private sealed class TrackRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("authors")]
        public string? Authors { get; set; }

        [JsonPropertyName("artist_id")]
        public string? ArtistId { get; set; }

        [JsonPropertyName("play_count")]
        public int? PlayCount { get; set; }
    }

    private sealed class TagTrackRow
    {
        [JsonPropertyName("track_id")]
        public string? TrackId { get; set; }
    }

    private sealed class CoverRow
    {
        [JsonPropertyName("track_id")]
        public string? TrackId { get; set; }

        [JsonPropertyName("cover_url")]
        public string? CoverUrl { get; set; }
    }

    private sealed class FileRow
    {
        [JsonPropertyName("track_id")]
        public string? TrackId { get; set; }

        [JsonPropertyName("audio_url")]
        public string? AudioUrl { get; set; }
    }

    private sealed class ArtistRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }
}
