using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class UserLibraryService(HttpClient httpClient, IOptions<SupabaseSettings> supabaseOptions)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task<IReadOnlyList<LikedTrackResponse>> GetLikesAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<LikedTrackRow>(
            $"/rest/v1/liked_tracks?user_id=eq.{userId}&select=*&order=created_at.desc",
            cancellationToken
        );

        return rows?.Select(MapLike).ToList() ?? [];
    }

    public async Task<bool> IsLikedAsync(
        string userId,
        string source,
        string trackId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<LikedTrackRow>(
            $"/rest/v1/liked_tracks?user_id=eq.{userId}&source=eq.{Uri.EscapeDataString(source)}&track_id=eq.{Uri.EscapeDataString(trackId)}&select=id",
            cancellationToken
        );

        return rows is { Count: > 0 };
    }

    public async Task<LikedTrackResponse> AddLikeAsync(
        string userId,
        LikeTrackRequest request,
        CancellationToken cancellationToken
    )
    {
        ValidateSource(request.Source);

        var body = new
        {
            user_id = userId,
            track_id = request.TrackId.Trim(),
            source = request.Source.Trim().ToLowerInvariant(),
            title = request.Title.Trim(),
            artist = request.Artist?.Trim(),
            cover = request.Cover?.Trim(),
            audio_url = request.AudioUrl.Trim(),
            album = request.Album?.Trim(),
        };

        var row = await InsertAsync<LikedTrackRow>("/rest/v1/liked_tracks", body, cancellationToken);

        if (row is null)
        {
            throw new AuthServiceException(
                "Could not save liked track.",
                StatusCodes.Status502BadGateway
            );
        }

        return MapLike(row);
    }

    public async Task RemoveLikeAsync(
        string userId,
        string source,
        string trackId,
        CancellationToken cancellationToken
    )
    {
        ValidateSource(source);

        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/liked_tracks?user_id=eq.{userId}&source=eq.{Uri.EscapeDataString(source)}&track_id=eq.{Uri.EscapeDataString(trackId)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new AuthServiceException(
                "Could not remove liked track.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    public async Task<IReadOnlyList<SavedAlbumResponse>> GetSavedAlbumsAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<SavedAlbumRow>(
            $"/rest/v1/saved_albums?user_id=eq.{userId}&select=*&order=created_at.desc",
            cancellationToken
        );

        return rows?.Select(MapAlbum).ToList() ?? [];
    }

    public async Task<bool> IsAlbumSavedAsync(
        string userId,
        string albumId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<SavedAlbumRow>(
            $"/rest/v1/saved_albums?user_id=eq.{userId}&album_id=eq.{Uri.EscapeDataString(albumId)}&select=id",
            cancellationToken
        );

        return rows is { Count: > 0 };
    }

    public async Task<SavedAlbumResponse> SaveAlbumAsync(
        string userId,
        SaveAlbumRequest request,
        CancellationToken cancellationToken
    )
    {
        var body = new
        {
            user_id = userId,
            album_id = request.AlbumId.Trim(),
            title = request.Title.Trim(),
            artist = request.Artist?.Trim(),
            cover = request.Cover?.Trim(),
            track_count = request.TrackCount,
        };

        var row = await InsertAsync<SavedAlbumRow>("/rest/v1/saved_albums", body, cancellationToken);

        if (row is null)
        {
            throw new AuthServiceException(
                "Could not save album.",
                StatusCodes.Status502BadGateway
            );
        }

        return MapAlbum(row);
    }

    public async Task RemoveSavedAlbumAsync(
        string userId,
        string albumId,
        CancellationToken cancellationToken
    )
    {
        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/saved_albums?user_id=eq.{userId}&album_id=eq.{Uri.EscapeDataString(albumId)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new AuthServiceException(
                "Could not remove saved album.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    public async Task<IReadOnlyList<SavedGenreResponse>> GetSavedGenresAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<SavedGenreRow>(
            $"/rest/v1/saved_genres?user_id=eq.{userId}&select=*&order=created_at.desc",
            cancellationToken
        );

        return rows?.Select(MapGenre).ToList() ?? [];
    }

    public async Task<bool> IsGenreSavedAsync(
        string userId,
        string tag,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<SavedGenreRow>(
            $"/rest/v1/saved_genres?user_id=eq.{userId}&tag=eq.{Uri.EscapeDataString(tag)}&select=id",
            cancellationToken
        );

        return rows is { Count: > 0 };
    }

    public async Task<SavedGenreResponse> SaveGenreAsync(
        string userId,
        SaveGenreRequest request,
        CancellationToken cancellationToken
    )
    {
        var body = new
        {
            user_id = userId,
            tag = request.Tag.Trim().ToLowerInvariant(),
            label = request.Label.Trim(),
            cover = request.Cover?.Trim(),
        };

        var row = await InsertAsync<SavedGenreRow>("/rest/v1/saved_genres", body, cancellationToken);

        if (row is null)
        {
            throw new AuthServiceException(
                "Could not save genre.",
                StatusCodes.Status502BadGateway
            );
        }

        return MapGenre(row);
    }

    public async Task RemoveSavedGenreAsync(
        string userId,
        string tag,
        CancellationToken cancellationToken
    )
    {
        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/saved_genres?user_id=eq.{userId}&tag=eq.{Uri.EscapeDataString(tag)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new AuthServiceException(
                "Could not remove saved genre.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    public async Task<IReadOnlyList<SavedPlaylistResponse>> GetSavedPlaylistsAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<SavedPlaylistRow>(
            $"/rest/v1/saved_playlists?user_id=eq.{userId}&select=*&order=created_at.desc",
            cancellationToken
        );

        return rows?.Select(MapPlaylist).ToList() ?? [];
    }

    public async Task<bool> IsPlaylistSavedAsync(
        string userId,
        string playlistId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<SavedPlaylistRow>(
            $"/rest/v1/saved_playlists?user_id=eq.{userId}&playlist_id=eq.{Uri.EscapeDataString(playlistId)}&select=id",
            cancellationToken
        );

        return rows is { Count: > 0 };
    }

    public async Task<SavedPlaylistResponse> SavePlaylistAsync(
        string userId,
        SavePlaylistRequest request,
        CancellationToken cancellationToken
    )
    {
        var body = new
        {
            user_id = userId,
            playlist_id = request.PlaylistId.Trim(),
            title = request.Title.Trim(),
            cover = request.Cover?.Trim(),
            user_name = request.UserName?.Trim(),
        };

        var row = await InsertAsync<SavedPlaylistRow>(
            "/rest/v1/saved_playlists",
            body,
            cancellationToken
        );

        if (row is null)
        {
            throw new AuthServiceException(
                "Could not save playlist.",
                StatusCodes.Status502BadGateway
            );
        }

        return MapPlaylist(row);
    }

    public async Task RemoveSavedPlaylistAsync(
        string userId,
        string playlistId,
        CancellationToken cancellationToken
    )
    {
        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/saved_playlists?user_id=eq.{userId}&playlist_id=eq.{Uri.EscapeDataString(playlistId)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new AuthServiceException(
                "Could not remove saved playlist.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    private static void ValidateSource(string source)
    {
        if (source is not ("jamendo" or "itunes"))
        {
            throw new AuthServiceException("Track source must be jamendo or itunes.");
        }
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

    private async Task<T?> InsertAsync<T>(string path, object body, CancellationToken cancellationToken)
        where T : class
    {
        using var request = CreateSecretRequest(HttpMethod.Post, path, body);
        request.Headers.Add("Prefer", "return=representation");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            var rows = await response.Content.ReadFromJsonAsync<List<T>>(
                cancellationToken: cancellationToken
            );
            return rows?.FirstOrDefault();
        }

        if ((int)response.StatusCode == StatusCodes.Status409Conflict)
        {
            return null;
        }

        return null;
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
                "Supabase secret key is required for library operations.",
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

    private static LikedTrackResponse MapLike(LikedTrackRow row) =>
        new(
            row.Id ?? string.Empty,
            row.TrackId ?? string.Empty,
            row.Source ?? string.Empty,
            row.Title ?? string.Empty,
            row.Artist,
            row.Cover,
            row.AudioUrl ?? string.Empty,
            row.Album,
            row.CreatedAt ?? DateTime.UtcNow
        );

    private static SavedAlbumResponse MapAlbum(SavedAlbumRow row) =>
        new(
            row.Id ?? string.Empty,
            row.AlbumId ?? string.Empty,
            row.Title ?? string.Empty,
            row.Artist,
            row.Cover,
            row.TrackCount,
            row.CreatedAt ?? DateTime.UtcNow
        );

    private static SavedGenreResponse MapGenre(SavedGenreRow row) =>
        new(
            row.Id ?? string.Empty,
            row.Tag ?? string.Empty,
            row.Label ?? string.Empty,
            row.Cover,
            row.CreatedAt ?? DateTime.UtcNow
        );

    private static SavedPlaylistResponse MapPlaylist(SavedPlaylistRow row) =>
        new(
            row.Id ?? string.Empty,
            row.PlaylistId ?? string.Empty,
            row.Title ?? string.Empty,
            row.Cover,
            row.UserName,
            row.CreatedAt ?? DateTime.UtcNow
        );

    private sealed class LikedTrackRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("track_id")]
        public string? TrackId { get; set; }

        [JsonPropertyName("source")]
        public string? Source { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("artist")]
        public string? Artist { get; set; }

        [JsonPropertyName("cover")]
        public string? Cover { get; set; }

        [JsonPropertyName("audio_url")]
        public string? AudioUrl { get; set; }

        [JsonPropertyName("album")]
        public string? Album { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }
    }

    private sealed class SavedAlbumRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("album_id")]
        public string? AlbumId { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("artist")]
        public string? Artist { get; set; }

        [JsonPropertyName("cover")]
        public string? Cover { get; set; }

        [JsonPropertyName("track_count")]
        public int? TrackCount { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }
    }

    private sealed class SavedGenreRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("tag")]
        public string? Tag { get; set; }

        [JsonPropertyName("label")]
        public string? Label { get; set; }

        [JsonPropertyName("cover")]
        public string? Cover { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }
    }

    private sealed class SavedPlaylistRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("playlist_id")]
        public string? PlaylistId { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("cover")]
        public string? Cover { get; set; }

        [JsonPropertyName("user_name")]
        public string? UserName { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }
    }
}
