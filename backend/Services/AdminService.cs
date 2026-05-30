using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using backend.Configuration;
using backend.Constants;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class AdminService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    TranslationService translationService,
    AdminLogStore logStore
)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    private static readonly Regex UsernamePattern = new("^[a-zA-Z0-9_]{3,20}$", RegexOptions.Compiled);

    public async Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryProfilesAsync(cancellationToken);

        if (rows is null)
        {
            throw new AuthServiceException(
                "Could not load users.",
                StatusCodes.Status502BadGateway
            );
        }

        return rows
            .Select(r => new AdminUserResponse(
                r.Id ?? string.Empty,
                r.Email ?? string.Empty,
                r.Username ?? string.Empty,
                r.UsernameSet ?? false,
                string.IsNullOrWhiteSpace(r.Role) ? AppRoles.User : r.Role!,
                string.IsNullOrWhiteSpace(r.AvatarUrl) ? null : r.AvatarUrl,
                r.CreatedAt
            ))
            .ToList();
    }

    public async Task<AdminUserResponse> UpdateUserAsync(
        string userId,
        AdminUpdateUserRequest request,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var fields = new Dictionary<string, object?>();

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var normalized = request.Username.Trim().ToLowerInvariant();

            if (!UsernamePattern.IsMatch(normalized))
            {
                throw new AuthServiceException(
                    "Username must be 3–20 characters: letters, numbers, underscore."
                );
            }

            if (!await IsUsernameAvailableForUserAsync(normalized, userId, cancellationToken))
            {
                throw new AuthServiceException(
                    "This username is already taken.",
                    StatusCodes.Status409Conflict
                );
            }

            fields["username"] = normalized;
            fields["username_set"] = true;
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            fields["role"] = string.Equals(request.Role, AppRoles.Admin, StringComparison.OrdinalIgnoreCase)
                ? AppRoles.Admin
                : AppRoles.User;
        }

        if (request.ClearAvatar)
        {
            fields["avatar_url"] = null;
        }
        else if (!string.IsNullOrWhiteSpace(request.AvatarData))
        {
            fields["avatar_url"] = ValidateAvatarData(request.AvatarData);
        }

        if (fields.Count == 0)
        {
            throw new AuthServiceException("Nothing to update.");
        }

        using var patchRequest = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId)}",
            fields
        );
        patchRequest.Headers.Add("Prefer", "return=minimal");

        var patchResponse = await httpClient.SendAsync(patchRequest, cancellationToken);

        if (!patchResponse.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not update user.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add("info", "users", $"Updated user {userId}", actor);

        var updated = await GetUserByIdAsync(userId, cancellationToken);

        if (updated is null)
        {
            throw new AuthServiceException(
                "User updated but could not be loaded.",
                StatusCodes.Status502BadGateway
            );
        }

        return updated;
    }

    public async Task DeleteUserAsync(
        string userId,
        string actorUserId,
        string actor,
        CancellationToken cancellationToken
    )
    {
        if (string.Equals(userId, actorUserId, StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException("You cannot delete your own account.");
        }

        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/auth/v1/admin/users/{Uri.EscapeDataString(userId)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(error) ? "Could not delete user." : "Could not delete user.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add("warn", "users", $"Deleted user {userId}", actor);
    }

    private async Task<AdminUserResponse?> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryProfilesAsync(cancellationToken, userId);
        var row = rows?.FirstOrDefault();

        if (row is null)
        {
            return null;
        }

        return new AdminUserResponse(
            row.Id ?? string.Empty,
            row.Email ?? string.Empty,
            row.Username ?? string.Empty,
            row.UsernameSet ?? false,
            string.IsNullOrWhiteSpace(row.Role) ? AppRoles.User : row.Role!,
            string.IsNullOrWhiteSpace(row.AvatarUrl) ? null : row.AvatarUrl,
            row.CreatedAt
        );
    }

    private async Task<List<ProfileAdminRow>?> QueryProfilesAsync(
        CancellationToken cancellationToken,
        string? userId = null
    )
    {
        var filter = userId is null ? "" : $"&id=eq.{Uri.EscapeDataString(userId)}";
        var rows = await QueryAsync<ProfileAdminRow>(
            $"/rest/v1/profiles?select=id,email,username,username_set,role,avatar_url{filter}&order=email.asc",
            cancellationToken
        );

        if (rows is not null)
        {
            return rows;
        }

        rows = await QueryAsync<ProfileAdminRow>(
            $"/rest/v1/profiles?select=id,email,username,username_set,role{filter}&order=email.asc",
            cancellationToken
        );

        return rows;
    }

    private async Task<bool> IsUsernameAvailableForUserAsync(
        string username,
        string userId,
        CancellationToken cancellationToken
    )
    {
        var rows = await QueryAsync<ProfileAdminRow>(
            $"/rest/v1/profiles?username=eq.{Uri.EscapeDataString(username)}&select=id",
            cancellationToken
        );

        if (rows is null)
        {
            throw new AuthServiceException(
                "Could not check username availability.",
                StatusCodes.Status502BadGateway
            );
        }

        return rows.Count == 0
            || rows.All(r => string.Equals(r.Id, userId, StringComparison.OrdinalIgnoreCase));
    }

    private static string ValidateAvatarData(string avatarData)
    {
        if (string.IsNullOrWhiteSpace(avatarData))
        {
            throw new AuthServiceException("Avatar image is required.");
        }

        var trimmed = avatarData.Trim();

        if (trimmed.Length > 600_000)
        {
            throw new AuthServiceException("Image is too large. Use a smaller photo.");
        }

        if (!trimmed.StartsWith("data:image/jpeg;base64,", StringComparison.OrdinalIgnoreCase)
            && !trimmed.StartsWith("data:image/png;base64,", StringComparison.OrdinalIgnoreCase)
            && !trimmed.StartsWith("data:image/webp;base64,", StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException("Only JPEG, PNG, or WebP images are supported.");
        }

        return trimmed;
    }

    public async Task UpdateUserRoleAsync(
        string userId,
        string role,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var normalized = string.Equals(role, AppRoles.Admin, StringComparison.OrdinalIgnoreCase)
            ? AppRoles.Admin
            : AppRoles.User;

        using var request = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId)}",
            new { role = normalized }
        );
        request.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not update user role.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add(
            "info",
            "users",
            $"Role changed to '{normalized}' for user {userId}",
            actor
        );
    }

    public async Task<AdminStatsResponse> GetStatsAsync(CancellationToken cancellationToken)
    {
        var users = await CountAsync("profiles", cancellationToken);
        var admins = await CountAsync(
            "profiles",
            cancellationToken,
            "role=eq.admin"
        );
        var translationRows = await CountAsync("translations", cancellationToken);
        var liked = await CountAsync("liked_tracks", cancellationToken);
        var albums = await CountAsync("saved_albums", cancellationToken);
        var genres = await CountAsync("saved_genres", cancellationToken);
        var playlists = await CountAsync("saved_playlists", cancellationToken);

        var keys = await translationService.GetDistinctKeysAsync(cancellationToken);

        return new AdminStatsResponse(
            users,
            admins,
            keys,
            translationRows,
            liked,
            albums,
            genres,
            playlists
        );
    }

    public IReadOnlyList<AdminLogEntry> GetLogs(int limit = 100) =>
        logStore.GetRecent(limit);

    public void LogAccess(string actor, string section)
    {
        logStore.Add("info", "admin", $"Opened section: {section}", actor);
    }

    private async Task<int> CountAsync(
        string table,
        CancellationToken cancellationToken,
        string? filter = null
    )
    {
        var path = $"/rest/v1/{table}?select=id";
        if (!string.IsNullOrWhiteSpace(filter))
        {
            path += $"&{filter}";
        }

        using var request = CreateSecretRequest(HttpMethod.Get, $"{path}&limit=1");
        request.Headers.Add("Prefer", "count=exact");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return 0;
        }

        if (response.Headers.TryGetValues("Content-Range", out var values))
        {
            var header = values.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(header))
            {
                var slash = header.IndexOf('/');
                if (slash >= 0 && int.TryParse(header[(slash + 1)..], out var total))
                {
                    return total;
                }
            }
        }

        var rows = await QueryAsync<CountRow>($"{path}&limit=10000", cancellationToken);
        return rows?.Count ?? 0;
    }

    private sealed class CountRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }

    private async Task<List<T>?> QueryAsync<T>(string path, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(HttpMethod.Get, path);
        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<List<T>>(
            cancellationToken: cancellationToken
        );
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
                "Supabase secret key is required for admin operations.",
                StatusCodes.Status503ServiceUnavailable
            );
        }

        var request = new HttpRequestMessage(method, $"{_settings.Url.TrimEnd('/')}{path}");
        request.Headers.Add("apikey", _settings.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            _settings.SecretKey
        );

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return request;
    }

    private sealed class ProfileAdminRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("username_set")]
        public bool? UsernameSet { get; set; }

        [JsonPropertyName("role")]
        public string? Role { get; set; }

        [JsonPropertyName("avatar_url")]
        public string? AvatarUrl { get; set; }

        [JsonPropertyName("created_at")]
        public DateTimeOffset? CreatedAt { get; set; }
    }
}
