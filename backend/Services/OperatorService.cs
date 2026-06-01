using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class OperatorService(HttpClient httpClient, IOptions<SupabaseSettings> supabaseOptions)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task<IReadOnlyList<OperatorPendingTrackResponse>> GetPendingTracksAsync(
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<PendingTrackRow>(
            "/rest/v1/tracks?status=eq.pending&select=id,title,release_date,created_at,artist_id,authors&order=created_at.asc",
            cancellationToken
        );

        if (rows is null || rows.Count == 0)
        {
            return [];
        }

        var result = new List<OperatorPendingTrackResponse>();

        foreach (var row in rows)
        {
            if (string.IsNullOrWhiteSpace(row.Id) || string.IsNullOrWhiteSpace(row.ArtistId))
            {
                continue;
            }

            var (artistName, artistEmail) = await GetArtistContactAsync(row.ArtistId, cancellationToken);
            var coverUrl = await GetTrackCoverUrlAsync(row.Id, cancellationToken);

            result.Add(
                new OperatorPendingTrackResponse(
                    row.Id,
                    row.Title ?? "",
                    row.ReleaseDate ?? "",
                    row.CreatedAt?.ToString("o") ?? "",
                    artistName,
                    artistEmail,
                    row.Authors,
                    coverUrl
                )
            );
        }

        return result;
    }

    public async Task<OperatorTrackDetailResponse> GetTrackDetailAsync(
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var track = await QuerySingleAsync<TrackDetailRow>(
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&select=id,title,release_date,status,created_at,artist_id,authors,description,pro_code,pro_related,pro_membership,electric_acoustic,tempo,energy,mood",
            cancellationToken
        );

        if (track?.Id is null)
        {
            throw new AuthServiceException("Track not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(track.Status, "pending", StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException(
                "Track is not awaiting moderation.",
                StatusCodes.Status400BadRequest
            );
        }

        var (artistName, artistEmail) = await GetArtistContactAsync(track.ArtistId ?? "", cancellationToken);
        var coverUrl = await GetTrackCoverUrlAsync(track.Id, cancellationToken);
        var (audioUrl, audioFormat) = await GetTrackAudioAsync(track.Id, cancellationToken);
        var lyrics = await QuerySingleAsync<LyricsRow>(
            $"/rest/v1/track_lyrics?track_id=eq.{Uri.EscapeDataString(track.Id)}&select=is_instrumental,lyrics_text,language,explicit_language,vocal_type",
            cancellationToken
        );
        var license = await QuerySingleAsync<LicenseRow>(
            $"/rest/v1/track_licenses?track_id=eq.{Uri.EscapeDataString(track.Id)}&select=commercial_use,allow_derivatives",
            cancellationToken
        );
        var tagRows = await QueryAsync<TagRow>(
            $"/rest/v1/track_tags?track_id=eq.{Uri.EscapeDataString(track.Id)}&select=tag_value",
            cancellationToken
        );

        var tags = tagRows?.Select(t => t.TagValue ?? "").Where(v => v.Length > 0).ToList() ?? [];

        return new OperatorTrackDetailResponse(
            track.Id,
            track.Title ?? "",
            track.ReleaseDate ?? "",
            track.Status ?? "pending",
            track.CreatedAt?.ToString("o") ?? "",
            artistName,
            artistEmail,
            track.Authors,
            track.Description,
            coverUrl,
            audioUrl,
            audioFormat,
            lyrics?.IsInstrumental ?? false,
            lyrics?.LyricsText,
            lyrics?.Language,
            lyrics?.ExplicitLanguage ?? false,
            lyrics?.VocalType,
            track.ProCode,
            track.ProRelated ?? false,
            track.ProMembership,
            track.ElectricAcoustic,
            track.Tempo,
            track.Energy,
            track.Mood,
            license?.CommercialUse ?? false,
            license?.AllowDerivatives,
            tags
        );
    }

    public async Task ApproveTrackAsync(string trackId, CancellationToken cancellationToken)
    {
        await EnsurePendingTrackAsync(trackId, cancellationToken);

        await PatchTrackStatusAsync(trackId, "approved", rejectionReason: null, cancellationToken);
        await UpsertModerationRequestAsync(trackId, "approved", null, cancellationToken);
    }

    public async Task RejectTrackAsync(
        string trackId,
        string? reason,
        CancellationToken cancellationToken
    )
    {
        await EnsurePendingTrackAsync(trackId, cancellationToken);

        var rejectionReason = string.IsNullOrWhiteSpace(reason)
            ? "Трек не прошёл модерацию: не соответствует правилам платформы SoundBloom."
            : reason.Trim();

        await PatchTrackStatusAsync(trackId, "rejected", rejectionReason, cancellationToken);
        await UpsertModerationRequestAsync(trackId, "rejected", rejectionReason, cancellationToken);
    }

    private async Task PatchTrackStatusAsync(
        string trackId,
        string status,
        string? rejectionReason,
        CancellationToken cancellationToken
    )
    {
        var path = $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}";

        if (string.Equals(status, "approved", StringComparison.OrdinalIgnoreCase))
        {
            await PatchAsync(path, new { status }, cancellationToken);
            try
            {
                await PatchAsync(path, new { rejection_reason = (string?)null }, cancellationToken);
            }
            catch (AuthServiceException)
            {
                // rejection_reason column may be absent
            }

            return;
        }

        try
        {
            await PatchAsync(
                path,
                new { status, rejection_reason = rejectionReason },
                cancellationToken
            );
        }
        catch (AuthServiceException)
        {
            await PatchAsync(path, new { status }, cancellationToken);
        }
    }

    private async Task UpsertModerationRequestAsync(
        string trackId,
        string status,
        string? reviewerNotes,
        CancellationToken cancellationToken
    )
    {
        var existing = await QuerySingleAsync<IdRow>(
            $"/rest/v1/moderation_requests?track_id=eq.{Uri.EscapeDataString(trackId)}&select=id",
            cancellationToken
        );

        var body = new
        {
            status,
            reviewer_notes = reviewerNotes,
            reviewed_at = DateTime.UtcNow,
        };

        if (existing?.Id is not null)
        {
            await PatchAsync(
                $"/rest/v1/moderation_requests?track_id=eq.{Uri.EscapeDataString(trackId)}",
                body,
                cancellationToken
            );
            return;
        }

        await PostAsync(
            "/rest/v1/moderation_requests",
            new
            {
                track_id = trackId,
                status,
                reviewer_notes = reviewerNotes,
                reviewed_at = DateTime.UtcNow,
            },
            cancellationToken
        );
    }

    private async Task EnsurePendingTrackAsync(string trackId, CancellationToken cancellationToken)
    {
        var track = await QuerySingleAsync<TrackStatusRow>(
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&select=id,status",
            cancellationToken
        );

        if (track?.Id is null)
        {
            throw new AuthServiceException("Track not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(track.Status, "pending", StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException(
                "Track is not awaiting moderation.",
                StatusCodes.Status400BadRequest
            );
        }
    }

    private async Task<(string Name, string Email)> GetArtistContactAsync(
        string artistId,
        CancellationToken cancellationToken
    )
    {
        var artist = await QuerySingleAsync<ArtistContactRow>(
            $"/rest/v1/artists?id=eq.{Uri.EscapeDataString(artistId)}&select=name,user_id",
            cancellationToken
        );

        if (artist is null)
        {
            return ("—", "—");
        }

        var email = "—";

        if (!string.IsNullOrWhiteSpace(artist.UserId))
        {
            var profile = await QuerySingleAsync<ProfileRow>(
                $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(artist.UserId)}&select=email",
                cancellationToken
            );
            email = profile?.Email ?? "—";
        }

        return (artist.Name ?? "—", email);
    }

    private async Task<string?> GetTrackCoverUrlAsync(
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<CoverRow>(
            $"/rest/v1/track_covers?track_id=eq.{Uri.EscapeDataString(trackId)}&select=cover_url",
            cancellationToken
        );

        return rows?.FirstOrDefault()?.CoverUrl;
    }

    private async Task<(string? AudioUrl, string? Format)> GetTrackAudioAsync(
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var row = await QuerySingleAsync<FileRow>(
            $"/rest/v1/track_files?track_id=eq.{Uri.EscapeDataString(trackId)}&select=audio_url,file_format",
            cancellationToken
        );

        return (row?.AudioUrl, row?.FileFormat);
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

    private async Task<T?> QuerySingleAsync<T>(string path, CancellationToken cancellationToken)
        where T : class
    {
        var rows = await QueryAsync<T>(path, cancellationToken);
        return rows?.FirstOrDefault();
    }

    private async Task PatchAsync(
        string path,
        object body,
        CancellationToken cancellationToken
    )
    {
        using var request = CreateSecretRequest(HttpMethod.Patch, path, body);
        request.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(detail)
                    ? "Database update failed."
                    : $"Database update failed: {detail}",
                StatusCodes.Status502BadGateway
            );
        }
    }

    private async Task PostAsync(string path, object body, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(HttpMethod.Post, path, body);
        request.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(detail)
                    ? "Database insert failed."
                    : $"Database insert failed: {detail}",
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

    private sealed class IdRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }

    private sealed class PendingTrackRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("artist_id")]
        public string? ArtistId { get; set; }

        [JsonPropertyName("authors")]
        public string? Authors { get; set; }
    }

    private sealed class TrackDetailRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("artist_id")]
        public string? ArtistId { get; set; }

        [JsonPropertyName("authors")]
        public string? Authors { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("pro_code")]
        public string? ProCode { get; set; }

        [JsonPropertyName("pro_related")]
        public bool? ProRelated { get; set; }

        [JsonPropertyName("pro_membership")]
        public string? ProMembership { get; set; }

        [JsonPropertyName("electric_acoustic")]
        public string? ElectricAcoustic { get; set; }

        [JsonPropertyName("tempo")]
        public string? Tempo { get; set; }

        [JsonPropertyName("energy")]
        public string? Energy { get; set; }

        [JsonPropertyName("mood")]
        public string? Mood { get; set; }
    }

    private sealed class TrackStatusRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }

    private sealed class ArtistContactRow
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("user_id")]
        public string? UserId { get; set; }
    }

    private sealed class ProfileRow
    {
        [JsonPropertyName("email")]
        public string? Email { get; set; }
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

        [JsonPropertyName("file_format")]
        public string? FileFormat { get; set; }
    }

    private sealed class LyricsRow
    {
        [JsonPropertyName("is_instrumental")]
        public bool? IsInstrumental { get; set; }

        [JsonPropertyName("lyrics_text")]
        public string? LyricsText { get; set; }

        [JsonPropertyName("language")]
        public string? Language { get; set; }

        [JsonPropertyName("explicit_language")]
        public bool? ExplicitLanguage { get; set; }

        [JsonPropertyName("vocal_type")]
        public string? VocalType { get; set; }
    }

    private sealed class LicenseRow
    {
        [JsonPropertyName("commercial_use")]
        public bool? CommercialUse { get; set; }

        [JsonPropertyName("allow_derivatives")]
        public string? AllowDerivatives { get; set; }
    }

    private sealed class TagRow
    {
        [JsonPropertyName("tag_value")]
        public string? TagValue { get; set; }
    }
}
