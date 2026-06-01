using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class TrackAnalyticsService(HttpClient httpClient, IOptions<SupabaseSettings> supabaseOptions)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task RecordListenAsync(
        string trackId,
        string? userId,
        string listenerKey,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return;
        }

        var key = listenerKey.Trim();
        if (key.Length < 8)
        {
            throw new AuthServiceException("Invalid listener key.");
        }

        var track = await GetApprovedTrackRowAsync(trackId, cancellationToken);
        if (track is null)
        {
            throw new AuthServiceException("Track not found.", StatusCodes.Status404NotFound);
        }

        var since = DateTimeOffset.UtcNow.AddMinutes(-2);
        var recent = await QueryAsync<PlayEventRow>(
            $"/rest/v1/track_play_events?track_id=eq.{Uri.EscapeDataString(trackId)}&listener_key=eq.{Uri.EscapeDataString(key)}&played_at=gte.{since:o}&select=id&limit=1",
            cancellationToken
        );

        if (recent is { Count: > 0 })
        {
            return;
        }

        await InsertAsync(
            "/rest/v1/track_play_events",
            new
            {
                track_id = trackId,
                user_id = string.IsNullOrWhiteSpace(userId) ? null : userId,
                listener_key = key,
            },
            cancellationToken
        );

        var newCount = (track.PlayCount ?? 0) + 1;
        using var patch = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}",
            new { play_count = newCount }
        );
        patch.Headers.Add("Prefer", "return=minimal");
        await httpClient.SendAsync(patch, cancellationToken);
    }

    public async Task<TrackAnalyticsResponse> GetArtistTrackAnalyticsAsync(
        string trackId,
        string userId,
        CancellationToken cancellationToken
    )
    {
        var artist = await GetArtistByUserIdAsync(userId, cancellationToken);
        if (artist is null)
        {
            throw new AuthServiceException(
                "Create an artist profile first.",
                StatusCodes.Status400BadRequest
            );
        }

        var track = await GetTrackDetailRowAsync(trackId, cancellationToken);
        if (track is null || !string.Equals(track.ArtistId, artist.Id, StringComparison.Ordinal))
        {
            throw new AuthServiceException("Track not found.", StatusCodes.Status404NotFound);
        }

        return await BuildAnalyticsAsync(track, cancellationToken);
    }

    private async Task<TrackAnalyticsResponse> BuildAnalyticsAsync(
        TrackDetailRow track,
        CancellationToken cancellationToken
    )
    {
        var trackId = track.Id!;
        var coverUrl = await GetCoverUrlAsync(trackId, cancellationToken);
        var audioUrl = await GetAudioUrlAsync(trackId, cancellationToken);
        var tags = await GetTagsAsync(trackId, cancellationToken);
        var (artistName, artistGenre) = await GetArtistInfoAsync(track.ArtistId!, cancellationToken);

        var likeCount = await CountLikesAsync(trackId, cancellationToken);
        var events = await QueryAsync<PlayEventRow>(
            $"/rest/v1/track_play_events?track_id=eq.{Uri.EscapeDataString(trackId)}&select=listener_key,played_at&order=played_at.desc&limit=5000",
            cancellationToken
        ) ?? [];

        var weekAgo = DateTimeOffset.UtcNow.AddDays(-7);
        var playsLast7 = events.Count(e => e.PlayedAt >= weekAgo);
        var uniqueListeners = events
            .Select(e => e.ListenerKey)
            .Where(k => !string.IsNullOrWhiteSpace(k))
            .Distinct(StringComparer.Ordinal)
            .Count();

        var playsByDay = events
            .Where(e => e.PlayedAt >= weekAgo)
            .GroupBy(e => e.PlayedAt.UtcDateTime.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TrackDailyPlaysResponse(
                g.Key.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                g.Count()
            ))
            .ToList();

        for (var i = 6; i >= 0; i--)
        {
            var day = DateTime.UtcNow.Date.AddDays(-i);
            var key = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            if (playsByDay.All(p => p.Date != key))
            {
                playsByDay.Add(new TrackDailyPlaysResponse(key, 0));
            }
        }

        playsByDay = playsByDay.OrderBy(p => p.Date).ToList();

        return new TrackAnalyticsResponse(
            trackId,
            track.Title ?? "Untitled",
            track.Status ?? "pending",
            coverUrl,
            audioUrl,
            artistName,
            track.PlayCount ?? 0,
            track.DownloadCount ?? 0,
            likeCount,
            uniqueListeners,
            playsLast7,
            track.ReleaseDate ?? "",
            track.CreatedAt?.ToString("o") ?? "",
            track.Description,
            track.Authors ?? "",
            artistGenre,
            track.Mood,
            track.Energy,
            track.Tempo,
            tags,
            track.RejectionReason,
            playsByDay
        );
    }

    private async Task<TrackDetailRow?> GetApprovedTrackRowAsync(
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<TrackDetailRow>(
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&status=eq.approved&select=id,play_count",
            cancellationToken
        );
        return rows?.FirstOrDefault();
    }

    private async Task<TrackDetailRow?> GetTrackDetailRowAsync(
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<TrackDetailRow>(
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&select=id,artist_id,title,status,play_count,download_count,release_date,created_at,description,authors,mood,energy,tempo,rejection_reason",
            cancellationToken
        );
        return rows?.FirstOrDefault();
    }

    private async Task<(string Name, string? Genre)> GetArtistInfoAsync(
        string artistId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<ArtistNameRow>(
            $"/rest/v1/artists?id=eq.{Uri.EscapeDataString(artistId)}&select=name,genre",
            cancellationToken
        );
        var row = rows?.FirstOrDefault();
        return (row?.Name ?? "SoundBloom Artist", row?.Genre);
    }

    private async Task<string?> GetCoverUrlAsync(string trackId, CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<CoverRow>(
            $"/rest/v1/track_covers?track_id=eq.{Uri.EscapeDataString(trackId)}&select=cover_url",
            cancellationToken
        );
        return rows?.FirstOrDefault()?.CoverUrl;
    }

    private async Task<string?> GetAudioUrlAsync(string trackId, CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<FileRow>(
            $"/rest/v1/track_files?track_id=eq.{Uri.EscapeDataString(trackId)}&select=audio_url",
            cancellationToken
        );
        return rows?.FirstOrDefault()?.AudioUrl;
    }

    private async Task<List<string>> GetTagsAsync(string trackId, CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<TagRow>(
            $"/rest/v1/track_tags?track_id=eq.{Uri.EscapeDataString(trackId)}&select=tag_value",
            cancellationToken
        );
        return rows?
            .Select(r => r.TagValue)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Cast<string>()
            .ToList() ?? [];
    }

    private async Task<int> CountLikesAsync(string trackId, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(
            HttpMethod.Get,
            $"/rest/v1/liked_tracks?source=eq.soundbloom&track_id=eq.{Uri.EscapeDataString(trackId)}&select=id"
        );
        request.Headers.Add("Prefer", "count=exact");

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return 0;
        }

        if (response.Headers.TryGetValues("Content-Range", out var values))
        {
            var range = values.FirstOrDefault();
            if (!string.IsNullOrEmpty(range))
            {
                var slash = range.LastIndexOf('/');
                if (slash >= 0 && int.TryParse(range[(slash + 1)..], out var total))
                {
                    return total;
                }
            }
        }

        var rows = await response.Content.ReadFromJsonAsync<List<IdRow>>(
            cancellationToken: cancellationToken
        );
        return rows?.Count ?? 0;
    }

    private async Task<ArtistOwnerRow?> GetArtistByUserIdAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<ArtistOwnerRow>(
            $"/rest/v1/artists?user_id=eq.{Uri.EscapeDataString(userId)}&select=id",
            cancellationToken
        );
        return rows?.FirstOrDefault();
    }

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

    private async Task InsertAsync(string path, object body, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(HttpMethod.Post, path, body);
        request.Headers.Add("Prefer", "return=minimal");
        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not record play.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    private HttpRequestMessage CreateSecretRequest(
        HttpMethod method,
        string path,
        object? body = null
    )
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            throw new AuthServiceException(
                "Supabase secret key is required.",
                StatusCodes.Status503ServiceUnavailable
            );
        }

        var request = new HttpRequestMessage(method, $"{_settings.Url.TrimEnd('/')}{path}");
        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        request.Headers.Add("apikey", _settings.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            _settings.SecretKey
        );
        return request;
    }

    private sealed class TrackDetailRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("artist_id")]
        public string? ArtistId { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("play_count")]
        public int? PlayCount { get; set; }

        [JsonPropertyName("download_count")]
        public int? DownloadCount { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("created_at")]
        public DateTimeOffset? CreatedAt { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("authors")]
        public string? Authors { get; set; }

        [JsonPropertyName("mood")]
        public string? Mood { get; set; }

        [JsonPropertyName("energy")]
        public string? Energy { get; set; }

        [JsonPropertyName("tempo")]
        public string? Tempo { get; set; }

        [JsonPropertyName("rejection_reason")]
        public string? RejectionReason { get; set; }
    }

    private sealed class PlayEventRow
    {
        [JsonPropertyName("listener_key")]
        public string? ListenerKey { get; set; }

        [JsonPropertyName("played_at")]
        public DateTimeOffset PlayedAt { get; set; }
    }

    private sealed class CoverRow
    {
        [JsonPropertyName("cover_url")]
        public string? CoverUrl { get; set; }
    }

    private sealed class FileRow
    {
        [JsonPropertyName("audio_url")]
        public string? AudioUrl { get; set; }
    }

    private sealed class TagRow
    {
        [JsonPropertyName("tag_value")]
        public string? TagValue { get; set; }
    }

    private sealed class ArtistNameRow
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("genre")]
        public string? Genre { get; set; }
    }

    private sealed class ArtistOwnerRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }

    private sealed class IdRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }
}
