using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Constants;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class SupabaseAuthService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    JwtTokenService jwtTokenService)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task<MessageResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (!string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            var createResult = await TryCreateUserViaAdminAsync(
                email,
                request.Password,
                cancellationToken
            );

            try
            {
                await ResendSignupCodeAsync(email, cancellationToken);
            }
            catch (AuthServiceException ex) when (ex.StatusCode == StatusCodes.Status429TooManyRequests)
            {
                return new MessageResponse(
                    createResult == AdminCreateResult.AlreadyExists
                        ? "This email is already registered. Supabase email limit reached — wait 10-15 minutes, then tap Resend code or try Login."
                        : "Account created. Email limit reached — wait 10-15 minutes and tap Resend code on the site."
                );
            }

            return new MessageResponse(
                createResult == AdminCreateResult.AlreadyExists
                    ? "Account already exists. A new verification code was sent to your email."
                    : "Verification code sent to your email."
            );
        }

        using var message = CreatePublicRequest(
            HttpMethod.Post,
            "/auth/v1/signup",
            new { email, password = request.Password }
        );

        var response = await httpClient.SendAsync(message, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SupabaseAuthPayload>(
            cancellationToken: cancellationToken
        );

        if (response.IsSuccessStatusCode && !string.IsNullOrWhiteSpace(payload?.AccessToken))
        {
            return new MessageResponse("Verification code sent to your email.");
        }

        if (response.IsSuccessStatusCode)
        {
            return new MessageResponse("Verification code sent to your email.");
        }

        throw MapAuthError(response.StatusCode, payload);
    }

    public async Task<AuthResponse> VerifyEmailAsync(
        VerifyEmailRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var code = request.Code.Trim();

        using var message = CreatePublicRequest(
            HttpMethod.Post,
            "/auth/v1/verify",
            new
            {
                type = "signup",
                email,
                token = code,
            }
        );

        var payload = await SendAsync(message, cancellationToken);
        return await BuildAuthResponseAsync(payload, cancellationToken);
    }

    public async Task<MessageResponse> ResendCodeAsync(
        ResendCodeRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();
        await ResendSignupCodeAsync(email, cancellationToken);
        return new MessageResponse("Verification code sent again.");
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();

        using var message = CreatePublicRequest(
            HttpMethod.Post,
            "/auth/v1/token?grant_type=password",
            new { email, password = request.Password }
        );

        var payload = await SendAsync(message, cancellationToken);
        return await BuildAuthResponseAsync(payload, cancellationToken);
    }

    public async Task<UsernameAvailabilityResponse> CheckUsernameAsync(
        string username,
        CancellationToken cancellationToken
    )
    {
        var normalized = NormalizeUsername(username);

        if (!IsValidUsername(normalized))
        {
            return new UsernameAvailabilityResponse(false, normalized);
        }

        var available = await IsUsernameAvailableAsync(normalized, cancellationToken);
        return new UsernameAvailabilityResponse(available, normalized);
    }

    public async Task<AuthResponse> SetUsernameAsync(
        string userId,
        SetUsernameRequest request,
        CancellationToken cancellationToken
    )
    {
        var normalized = NormalizeUsername(request.Username);

        if (!IsValidUsername(normalized))
        {
            throw new AuthServiceException(
                "Username must be 3-20 characters: letters, numbers, underscore."
            );
        }

        if (!await IsUsernameAvailableAsync(normalized, cancellationToken))
        {
            throw new AuthServiceException(
                "This username is already taken.",
                StatusCodes.Status409Conflict
            );
        }

        var profile = await GetProfileAsync(userId, cancellationToken);
        var email = profile?.Email ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new AuthServiceException("User profile was not found.");
        }

        await UpsertProfileUsernameAsync(userId, normalized, email, cancellationToken);
        profile = await GetProfileAsync(userId, cancellationToken);
        var role = ResolveAppRole(profile?.Role);

        return IssueAppToken(userId, email, normalized, role, needsUsername: false);
    }

    public async Task<UserProfileResponse?> GetUserProfileAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var profile = await GetProfileAsync(userId, cancellationToken);

        if (profile is null || string.IsNullOrWhiteSpace(profile.Email))
        {
            return null;
        }

        var username = profile.UsernameSet && !string.IsNullOrWhiteSpace(profile.Username)
            ? profile.Username
            : string.Empty;

        return new UserProfileResponse(
            userId,
            profile.Email,
            username,
            ResolveAppRole(profile.Role),
            string.IsNullOrWhiteSpace(profile.AvatarUrl) ? null : profile.AvatarUrl
        );
    }

    public async Task<UserProfileResponse?> UpdateAvatarAsync(
        string userId,
        string avatarData,
        CancellationToken cancellationToken
    )
    {
        var normalized = ValidateAvatarData(avatarData);

        var updated = await PatchProfileAsync(
            userId,
            new Dictionary<string, object?> { ["avatar_url"] = normalized },
            cancellationToken
        );

        if (!updated)
        {
            throw new AuthServiceException("Failed to save avatar.", StatusCodes.Status502BadGateway);
        }

        return await GetUserProfileAsync(userId, cancellationToken);
    }

    public async Task<UserProfileResponse?> RemoveAvatarAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var updated = await PatchProfileAsync(
            userId,
            new Dictionary<string, object?> { ["avatar_url"] = null },
            cancellationToken
        );

        if (!updated)
        {
            throw new AuthServiceException("Failed to remove avatar.", StatusCodes.Status502BadGateway);
        }

        return await GetUserProfileAsync(userId, cancellationToken);
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

    private AuthResponse IssueAppToken(
        string userId,
        string email,
        string username,
        string role,
        bool needsUsername
    )
    {
        var token = jwtTokenService.CreateToken(userId, email, username, role);

        return new AuthResponse(token, username, email, needsUsername);
    }

    private static string ResolveAppRole(string? role) =>
        string.Equals(role, AppRoles.Admin, StringComparison.OrdinalIgnoreCase)
            ? AppRoles.Admin
            : AppRoles.User;

    private async Task<AuthResponse> BuildAuthResponseAsync(
        SupabaseAuthPayload payload,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(payload.AccessToken))
        {
            throw new AuthServiceException("Authentication token was not returned.");
        }

        var email = payload.User?.Email ?? string.Empty;
        var userId = payload.User?.Id;

        if (string.IsNullOrWhiteSpace(userId))
        {
            userId = await GetUserIdAsync(payload.AccessToken, cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            email = await GetUserEmailAsync(payload.AccessToken, cancellationToken);
        }

        var profile = await GetProfileAsync(userId!, cancellationToken);
        var role = ResolveAppRole(profile?.Role);

        if (profile?.UsernameSet == true && !string.IsNullOrWhiteSpace(profile.Username))
        {
            return IssueAppToken(userId!, email, profile.Username, role, needsUsername: false);
        }

        return IssueAppToken(userId!, email, string.Empty, role, needsUsername: true);
    }

    private async Task ResendSignupCodeAsync(string email, CancellationToken cancellationToken)
    {
        using var message = CreatePublicRequest(
            HttpMethod.Post,
            "/auth/v1/resend",
            new { type = "signup", email }
        );

        var response = await httpClient.SendAsync(message, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SupabaseAuthPayload>(
            cancellationToken: cancellationToken
        );

        if (!response.IsSuccessStatusCode)
        {
            throw MapAuthError(response.StatusCode, payload);
        }
    }

    private async Task<AdminCreateResult> TryCreateUserViaAdminAsync(
        string email,
        string password,
        CancellationToken cancellationToken
    )
    {
        using var message = CreateSecretRequest(
            HttpMethod.Post,
            "/auth/v1/admin/users",
            new
            {
                email,
                password,
                email_confirm = false,
            }
        );

        var response = await httpClient.SendAsync(message, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SupabaseAdminUserPayload>(
            cancellationToken: cancellationToken
        );

        if (response.IsSuccessStatusCode)
        {
            return AdminCreateResult.Created;
        }

        if (IsEmailAlreadyRegistered(payload, response.StatusCode))
        {
            return AdminCreateResult.AlreadyExists;
        }

        var messageText = ExtractAdminError(payload);

        if ((int)response.StatusCode == StatusCodes.Status401Unauthorized)
        {
            throw new AuthServiceException(
                "Invalid Supabase secret key. Use sb_secret_... from Dashboard → Settings → API.",
                StatusCodes.Status401Unauthorized
            );
        }

        throw new AuthServiceException(messageText, (int)response.StatusCode);
    }

    private static bool IsEmailAlreadyRegistered(
        SupabaseAdminUserPayload? payload,
        System.Net.HttpStatusCode statusCode
    )
    {
        if ((int)statusCode != StatusCodes.Status422UnprocessableEntity)
        {
            return false;
        }

        if (string.Equals(payload?.ErrorCode, "email_exists", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var message = ExtractAdminError(payload);

        return message.Contains("already", StringComparison.OrdinalIgnoreCase)
            || message.Contains("registered", StringComparison.OrdinalIgnoreCase);
    }

    private static string ExtractAdminError(SupabaseAdminUserPayload? payload) =>
        payload?.Msg
        ?? payload?.Message
        ?? payload?.ErrorDescription
        ?? payload?.Error
        ?? "Could not create the account.";

    private enum AdminCreateResult
    {
        Created,
        AlreadyExists,
    }

    private async Task<string> GetUserIdAsync(
        string accessToken,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_settings.Url.TrimEnd('/')}/auth/v1/user"
        );
        request.Headers.Add("apikey", _settings.PublishableKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SupabaseUserPayload>(
            cancellationToken: cancellationToken
        );

        if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(payload?.Id))
        {
            throw new AuthServiceException(
                "Invalid or expired session.",
                StatusCodes.Status401Unauthorized
            );
        }

        return payload.Id;
    }

    private async Task<string> GetUserEmailAsync(
        string accessToken,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_settings.Url.TrimEnd('/')}/auth/v1/user"
        );
        request.Headers.Add("apikey", _settings.PublishableKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SupabaseUserPayload>(
            cancellationToken: cancellationToken
        );

        return payload?.Email ?? string.Empty;
    }

    private async Task<ProfileRecord?> GetProfileAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        var profiles = await QueryProfilesAsync(
            $"/rest/v1/profiles?id=eq.{userId}&select=email,username,username_set,role,avatar_url",
            cancellationToken
        );

        if (profiles is null)
        {
            profiles = await QueryProfilesAsync(
                $"/rest/v1/profiles?id=eq.{userId}&select=email,username,username_set,role",
                cancellationToken
            );
        }

        if (profiles is null)
        {
            profiles = await QueryProfilesAsync(
                $"/rest/v1/profiles?id=eq.{userId}&select=email,username,username_set",
                cancellationToken
            );
        }

        if (profiles is null)
        {
            throw new AuthServiceException(
                "Could not load profile from the database.",
                StatusCodes.Status502BadGateway
            );
        }

        return profiles.FirstOrDefault();
    }

    private async Task<List<ProfileRecord>?> QueryProfilesAsync(
        string path,
        CancellationToken cancellationToken
    )
    {
        using var request = CreateSecretRequest(HttpMethod.Get, path);
        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<List<ProfileRecord>>(
            cancellationToken: cancellationToken
        );
    }

    private async Task<bool> IsUsernameAvailableAsync(
        string username,
        CancellationToken cancellationToken
    )
    {
        var payload = await QueryProfilesAsync(
            $"/rest/v1/profiles?username=eq.{Uri.EscapeDataString(username)}&select=id",
            cancellationToken
        );

        if (payload is null)
        {
            throw new AuthServiceException(
                "Could not check username availability.",
                StatusCodes.Status502BadGateway
            );
        }

        return payload.Count == 0;
    }

    private async Task UpsertProfileUsernameAsync(
        string userId,
        string username,
        string email,
        CancellationToken cancellationToken
    )
    {
        using var patchRequest = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/profiles?id=eq.{userId}",
            new
            {
                username,
                username_set = true,
            }
        );
        patchRequest.Headers.Add("Prefer", "return=minimal");

        var patchResponse = await httpClient.SendAsync(patchRequest, cancellationToken);

        if (patchResponse.IsSuccessStatusCode)
        {
            return;
        }

        using var insertRequest = CreateSecretRequest(
            HttpMethod.Post,
            "/rest/v1/profiles",
            new
            {
                id = userId,
                email,
                username,
                username_set = true,
            }
        );
        insertRequest.Headers.Add("Prefer", "return=minimal");

        var insertResponse = await httpClient.SendAsync(insertRequest, cancellationToken);

        if (!insertResponse.IsSuccessStatusCode)
        {
            var error = await insertResponse.Content.ReadAsStringAsync(cancellationToken);

            if (error.Contains("duplicate", StringComparison.OrdinalIgnoreCase)
                || error.Contains("unique", StringComparison.OrdinalIgnoreCase))
            {
                throw new AuthServiceException(
                    "This username is already taken.",
                    StatusCodes.Status409Conflict
                );
            }

            throw new AuthServiceException("Could not save username.");
        }
    }

    private async Task<bool> PatchProfileAsync(
        string userId,
        Dictionary<string, object?> fields,
        CancellationToken cancellationToken
    )
    {
        using var patchRequest = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/profiles?id=eq.{userId}",
            fields
        );
        patchRequest.Headers.Add("Prefer", "return=minimal");

        var patchResponse = await httpClient.SendAsync(patchRequest, cancellationToken);
        return patchResponse.IsSuccessStatusCode;
    }

    private HttpRequestMessage CreatePublicRequest(HttpMethod method, string path, object? body = null)
    {
        var request = new HttpRequestMessage(method, $"{_settings.Url.TrimEnd('/')}{path}");

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        request.Headers.Add("apikey", _settings.PublishableKey);
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            _settings.PublishableKey
        );

        return request;
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
                "Supabase secret key is required for profile operations."
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

    private async Task<SupabaseAuthPayload> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var response = await httpClient.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<SupabaseAuthPayload>(
            cancellationToken: cancellationToken
        );

        if (!response.IsSuccessStatusCode)
        {
            throw MapAuthError(response.StatusCode, payload);
        }

        if (payload is null)
        {
            throw new AuthServiceException("Empty response from authentication service.");
        }

        return payload;
    }

    private AuthServiceException MapAuthError(
        System.Net.HttpStatusCode statusCode,
        SupabaseAuthPayload? payload
    )
    {
        var message = payload?.ErrorDescription
            ?? payload?.Message
            ?? payload?.Error
            ?? payload?.Msg
            ?? "Authentication request failed.";

        if ((int)statusCode == StatusCodes.Status429TooManyRequests)
        {
            message = "Too many attempts. Wait a few minutes and try again.";
        }

        if ((int)statusCode == StatusCodes.Status400BadRequest
            && message.Contains("token", StringComparison.OrdinalIgnoreCase))
        {
            message = "Invalid or expired verification code.";
        }

        return new AuthServiceException(message, (int)statusCode);
    }

    private static string NormalizeUsername(string username) =>
        username.Trim().ToLowerInvariant();

    private static bool IsValidUsername(string username) =>
        username.Length is >= 3 and <= 20
        && System.Text.RegularExpressions.Regex.IsMatch(username, "^[a-z0-9_]+$");

    private sealed class SupabaseAuthPayload
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("error_description")]
        public string? ErrorDescription { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("msg")]
        public string? Msg { get; set; }

        [JsonPropertyName("user")]
        public SupabaseUser? User { get; set; }
    }

    private sealed class SupabaseAdminUserPayload
    {
        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("error_code")]
        public string? ErrorCode { get; set; }

        [JsonPropertyName("error_description")]
        public string? ErrorDescription { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("msg")]
        public string? Msg { get; set; }
    }

    private sealed class SupabaseUser
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }

    private sealed class SupabaseUserPayload
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }

    private sealed class ProfileRecord
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("username_set")]
        public bool UsernameSet { get; set; }

        [JsonPropertyName("role")]
        public string? Role { get; set; }

        [JsonPropertyName("avatar_url")]
        public string? AvatarUrl { get; set; }
    }
}

public class AuthServiceException(string message, int statusCode = StatusCodes.Status400BadRequest)
    : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
