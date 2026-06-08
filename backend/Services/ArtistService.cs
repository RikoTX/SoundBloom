using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class ArtistService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    ILogger<ArtistService> logger
)
{
    private const int MaxAudioBytes = 20 * 1024 * 1024;
    private const int MaxCoverBytes = 15 * 1024 * 1024;

    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task<ArtistStudioStateResponse> GetStudioStateAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var artist = await GetArtistByUserIdAsync(userId, cancellationToken);

        if (artist is null)
        {
            return new ArtistStudioStateResponse(false, null, []);
        }

        var tracks = await GetTracksForArtistAsync(artist.Id, cancellationToken);
        return new ArtistStudioStateResponse(true, artist, tracks);
    }

    public async Task<ArtistProfileResponse> CreateArtistAsync(
        string userId,
        CreateArtistRequest request,
        CancellationToken cancellationToken
    )
    {
        if (!request.TermsAccepted)
        {
            throw new AuthServiceException("You must accept the terms of use.");
        }

        var existing = await GetArtistByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
        {
            throw new AuthServiceException(
                "Artist profile already exists.",
                StatusCodes.Status409Conflict
            );
        }

        if (request.CareerStartYear < 1950 || request.CareerStartYear > DateTime.UtcNow.Year)
        {
            throw new AuthServiceException("Invalid career start year.");
        }

        var imageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : ValidateImageData(request.ImageUrl);

        var artistBody = new
        {
            user_id = userId,
            name = request.Name.Trim(),
            genre = request.Genre.Trim(),
            country = request.Country.Trim(),
            city = request.City.Trim(),
            pro_society = request.ProSociety.Trim(),
            terms_accepted = true,
            description = request.Description.Trim(),
            image_url = imageUrl,
            career_start_year = request.CareerStartYear,
        };

        var artistRow = await InsertAsync<ArtistRow>("/rest/v1/artists", artistBody, cancellationToken);

        if (artistRow?.Id is null)
        {
            throw new AuthServiceException(
                "Could not create artist profile.",
                StatusCodes.Status502BadGateway
            );
        }

        var socialBody = new
        {
            artist_id = artistRow.Id,
            facebook = NullIfEmpty(request.Facebook),
            spotify = NullIfEmpty(request.Spotify),
            twitter = NullIfEmpty(request.Twitter),
        };

        await InsertAsync<SocialRow>("/rest/v1/artist_social_links", socialBody, cancellationToken);

        return (await GetArtistByUserIdAsync(userId, cancellationToken))!;
    }

    public async Task<ArtistTrackListItemResponse> CreateTrackAsync(
        string userId,
        CreateArtistTrackRequest request,
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

        if (!DateOnly.TryParse(request.ReleaseDate, out var releaseDate))
        {
            throw new AuthServiceException("Invalid release date.");
        }

        var audioUrl = ValidateAudioData(request.AudioData, request.AudioFormat);
        var coverUrl = string.IsNullOrWhiteSpace(request.CoverData)
            ? artist.ImageUrl ?? ""
            : ValidateImageData(request.CoverData);

        if (string.IsNullOrWhiteSpace(coverUrl))
        {
            throw new AuthServiceException("Track cover is required.");
        }

        var allowDerivatives = request.AllowDerivatives switch
        {
            "yes" => "yes",
            "share_alike" => "share_alike",
            _ => "no",
        };

        var trackBody = new
        {
            artist_id = artist.Id,
            title = request.Title.Trim(),
            release_date = releaseDate.ToString("yyyy-MM-dd"),
            pro_code = NullIfEmpty(request.ProCode),
            pro_related = request.ProRelated,
            pro_membership = request.ProRelated ? NullIfEmpty(request.ProMembership) : null,
            description = NullIfEmpty(request.Description),
            authors = request.Authors.Trim(),
            electric_acoustic = NullIfEmpty(request.ElectricAcoustic),
            tempo = NullIfEmpty(request.Tempo),
            energy = NullIfEmpty(request.Energy),
            mood = NullIfEmpty(request.Mood),
            status = "pending",
        };

        var trackRow = await InsertAsync<TrackRow>("/rest/v1/tracks", trackBody, cancellationToken);

        if (trackRow?.Id is null)
        {
            throw new AuthServiceException(
                "Could not create track.",
                StatusCodes.Status502BadGateway
            );
        }

        var trackId = trackRow.Id;

        await InsertAsync<object>(
            "/rest/v1/track_files",
            new
            {
                track_id = trackId,
                audio_url = audioUrl,
                file_format = request.AudioFormat.Trim().ToLowerInvariant(),
                file_size_bytes = EstimateBase64Size(request.AudioData),
            },
            cancellationToken
        );

        await InsertAsync<object>(
            "/rest/v1/track_covers",
            new { track_id = trackId, cover_url = coverUrl },
            cancellationToken
        );

        await InsertAsync<object>(
            "/rest/v1/track_lyrics",
            new
            {
                track_id = trackId,
                is_instrumental = request.IsInstrumental,
                lyrics_text = request.IsInstrumental ? null : NullIfEmpty(request.LyricsText),
                language = request.IsInstrumental ? null : NullIfEmpty(request.Language),
                explicit_language = request.ExplicitLanguage,
                vocal_type = request.IsInstrumental ? null : NullIfEmpty(request.VocalType),
            },
            cancellationToken
        );

        await InsertAsync<object>(
            "/rest/v1/track_authors",
            new { track_id = trackId, authors_text = request.Authors.Trim() },
            cancellationToken
        );

        await InsertAsync<object>(
            "/rest/v1/track_licenses",
            new
            {
                track_id = trackId,
                commercial_use = request.CommercialUse,
                allow_derivatives = allowDerivatives,
            },
            cancellationToken
        );

        await InsertAsync<object>(
            "/rest/v1/moderation_requests",
            new { track_id = trackId, status = "pending" },
            cancellationToken
        );

        foreach (var tag in request.Tags.Take(4))
        {
            var tagType = ClassifyTag(tag);
            await InsertAsync<object>(
                "/rest/v1/track_tags",
                new { track_id = trackId, tag_type = tagType, tag_value = tag.Trim() },
                cancellationToken
            );
        }

        return new ArtistTrackListItemResponse(
            trackId,
            request.Title.Trim(),
            releaseDate.ToString("yyyy-MM-dd"),
            "pending",
            0,
            0,
            DateTime.UtcNow.ToString("o"),
            coverUrl,
            request.AudioFormat.Trim().ToLowerInvariant(),
            null
        );
    }

    private static readonly string[] TrackChildTables =
    [
        "track_play_events",
        "liked_tracks",
        "track_tags",
        "track_licenses",
        "track_authors",
        "track_lyrics",
        "track_covers",
        "track_files",
        "moderation_requests",
    ];

    public async Task DeleteTrackAsync(
        string userId,
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var artist = await GetArtistByUserIdAsync(userId, cancellationToken);

        if (artist is null)
        {
            throw new AuthServiceException("Artist profile not found.");
        }

        var owned = await QueryAsync<TrackRow>(
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&artist_id=eq.{Uri.EscapeDataString(artist.Id)}&select=id",
            cancellationToken
        );

        if (owned is null || owned.Count == 0)
        {
            throw new AuthServiceException(
                "Track not found or you do not have permission to delete it.",
                StatusCodes.Status404NotFound
            );
        }

        foreach (var table in TrackChildTables)
        {
            await DeleteByTrackIdAsync(table, trackId, cancellationToken);
        }

        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&artist_id=eq.{Uri.EscapeDataString(artist.Id)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError(
                "Supabase delete track {TrackId} failed with {StatusCode}: {Error}",
                trackId,
                (int)response.StatusCode,
                error
            );
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(error)
                    ? "Could not delete track."
                    : $"Could not delete track: {error}",
                StatusCodes.Status502BadGateway
            );
        }
    }

    private async Task DeleteByTrackIdAsync(
        string table,
        string trackId,
        CancellationToken cancellationToken
    )
    {
        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/{table}?track_id=eq.{Uri.EscapeDataString(trackId)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return;
        }

        var error = await response.Content.ReadAsStringAsync(cancellationToken);
        logger.LogError(
            "Supabase delete from {Table} for track {TrackId} failed with {StatusCode}: {Error}",
            table,
            trackId,
            (int)response.StatusCode,
            error
        );
        throw new AuthServiceException(
            string.IsNullOrWhiteSpace(error)
                ? "Could not delete track dependencies."
                : $"Could not delete track dependencies ({table}): {error}",
            StatusCodes.Status502BadGateway
        );
    }

    private async Task<ArtistProfileResponse?> GetArtistByUserIdAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<ArtistRow>(
            $"/rest/v1/artists?user_id=eq.{Uri.EscapeDataString(userId)}&select=*",
            cancellationToken
        );

        var row = rows?.FirstOrDefault();
        if (row?.Id is null)
        {
            return null;
        }

        var socialRows = await QueryAsync<SocialRow>(
            $"/rest/v1/artist_social_links?artist_id=eq.{Uri.EscapeDataString(row.Id)}&select=*",
            cancellationToken
        );

        var social = socialRows?.FirstOrDefault();

        return new ArtistProfileResponse(
            row.Id,
            row.UserId ?? userId,
            row.Name ?? "",
            row.Genre ?? "",
            row.Country ?? "",
            row.City ?? "",
            row.ProSociety ?? "",
            row.Description,
            row.ImageUrl,
            row.CareerStartYear,
            social is null
                ? null
                : new ArtistSocialLinksResponse(social.Facebook, social.Spotify, social.Twitter)
        );
    }

    private async Task<IReadOnlyList<ArtistTrackListItemResponse>> GetTracksForArtistAsync(
        string artistId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<TrackListRow>(
            $"/rest/v1/tracks?artist_id=eq.{Uri.EscapeDataString(artistId)}&select=id,title,release_date,status,play_count,download_count,created_at,rejection_reason&order=created_at.desc",
            cancellationToken
        );

        if (rows is null)
        {
            return [];
        }

        var result = new List<ArtistTrackListItemResponse>();

        foreach (var r in rows)
        {
            if (string.IsNullOrWhiteSpace(r.Id))
            {
                continue;
            }

            var coverUrl = await GetTrackCoverUrlAsync(r.Id, cancellationToken);
            var audioFormat = await GetTrackAudioFormatAsync(r.Id, cancellationToken);

            result.Add(
                new ArtistTrackListItemResponse(
                    r.Id,
                    r.Title ?? "",
                    r.ReleaseDate ?? "",
                    r.Status ?? "pending",
                    r.PlayCount ?? 0,
                    r.DownloadCount ?? 0,
                    r.CreatedAt?.ToString("o") ?? "",
                    coverUrl,
                    audioFormat,
                    r.RejectionReason
                )
            );
        }

        return result;
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

    private async Task<string?> GetTrackAudioFormatAsync(
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<FileRow>(
            $"/rest/v1/track_files?track_id=eq.{Uri.EscapeDataString(trackId)}&select=file_format",
            cancellationToken
        );

        return rows?.FirstOrDefault()?.FileFormat;
    }

    private static string ClassifyTag(string tag)
    {
        var instruments = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "guitar",
            "piano",
            "drums",
            "synth",
            "bass",
            "violin",
            "saxophone",
        };

        return instruments.Contains(tag) ? "instrument" : "genre";
    }

    private static string ValidateAudioData(string data, string format)
    {
        var trimmed = data.Trim();
        var fmt = format.Trim().ToLowerInvariant();

        if (fmt is not ("mp3" or "wav" or "flac"))
        {
            throw new AuthServiceException("Audio format must be mp3, wav, or flac.");
        }

        var prefix = fmt switch
        {
            "mp3" => "data:audio/mpeg;base64,",
            "wav" => "data:audio/wav;base64,",
            _ => "data:audio/flac;base64,",
        };

        if (!trimmed.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            && !trimmed.StartsWith("data:audio/", StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException("Invalid audio file encoding.");
        }

        if (EstimateBase64Size(trimmed) > MaxAudioBytes)
        {
            throw new AuthServiceException("Audio file exceeds 20 MB limit.");
        }

        return trimmed;
    }

    private static string ValidateImageData(string data)
    {
        var trimmed = data.Trim();

        if (!trimmed.StartsWith("data:image/jpeg;base64,", StringComparison.OrdinalIgnoreCase)
            && !trimmed.StartsWith("data:image/png;base64,", StringComparison.OrdinalIgnoreCase)
            && !trimmed.StartsWith("data:image/gif;base64,", StringComparison.OrdinalIgnoreCase)
            && !trimmed.StartsWith("data:image/webp;base64,", StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException("Cover must be JPEG, PNG, GIF, or WebP.");
        }

        if (EstimateBase64Size(trimmed) > MaxCoverBytes)
        {
            throw new AuthServiceException("Cover image exceeds 15 MB limit.");
        }

        return trimmed;
    }

    private static long EstimateBase64Size(string dataUrl)
    {
        var comma = dataUrl.IndexOf(',');
        var payload = comma >= 0 ? dataUrl[(comma + 1)..] : dataUrl;
        return (long)(payload.Length * 0.75);
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

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

    private async Task<T?> InsertAsync<T>(string path, object body, CancellationToken cancellationToken)
        where T : class
    {
        using var request = CreateSecretRequest(HttpMethod.Post, path, body);
        request.Headers.Add("Prefer", "return=representation");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError(
                "Supabase insert into {Path} failed with {StatusCode}: {Error}",
                path,
                (int)response.StatusCode,
                error
            );
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(error)
                    ? "Database write failed."
                    : $"Database write failed: {error}",
                StatusCodes.Status502BadGateway
            );
        }

        var rows = await response.Content.ReadFromJsonAsync<List<T>>(
            cancellationToken: cancellationToken
        );
        return rows?.FirstOrDefault();
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

    private sealed class ArtistRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("user_id")]
        public string? UserId { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("genre")]
        public string? Genre { get; set; }

        [JsonPropertyName("country")]
        public string? Country { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("pro_society")]
        public string? ProSociety { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("image_url")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("career_start_year")]
        public int? CareerStartYear { get; set; }
    }

    private sealed class SocialRow
    {
        [JsonPropertyName("facebook")]
        public string? Facebook { get; set; }

        [JsonPropertyName("spotify")]
        public string? Spotify { get; set; }

        [JsonPropertyName("twitter")]
        public string? Twitter { get; set; }
    }

    private sealed class TrackRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }

    private sealed class TrackListRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("play_count")]
        public int? PlayCount { get; set; }

        [JsonPropertyName("download_count")]
        public int? DownloadCount { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("rejection_reason")]
        public string? RejectionReason { get; set; }
    }

    private sealed class CoverRow
    {
        [JsonPropertyName("cover_url")]
        public string? CoverUrl { get; set; }
    }

    private sealed class FileRow
    {
        [JsonPropertyName("file_format")]
        public string? FileFormat { get; set; }
    }
}
