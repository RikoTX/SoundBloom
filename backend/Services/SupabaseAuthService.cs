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
    JwtTokenService jwtTokenService,
    SignupVerificationService signupVerification,
    SignupEmailService signupEmail)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task<RegisterResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (!string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            if (_settings.AutoConfirmEmail)
            {
                var createResult = await TryCreateUserViaAdminAsync(
                    email,
                    request.Password,
                    emailConfirm: true,
                    cancellationToken
                );

                return new RegisterResponse(
                    createResult == AdminCreateResult.AlreadyExists
                        ? "Аккаунт уже есть. Войдите с паролем."
                        : "Аккаунт создан. Войдите с вашим паролем.",
                    SkipVerification: true
                );
            }

            var createResultNormal = await TryCreateUserViaAdminAsync(
                email,
                request.Password,
                emailConfirm: false,
                cancellationToken
            );

            if (signupEmail.CanSend && signupVerification.IsAvailable)
            {
                await signupVerification.IssueAndSendAsync(
                    email,
                    request.Password,
                    cancellationToken
                );

                return new RegisterResponse(
                    createResultNormal == AdminCreateResult.AlreadyExists
                        ? "Новый код отправлен на вашу почту."
                        : "Код отправлен на вашу почту. Введите его на следующем шаге."
                );
            }

            try
            {
                await ResendSignupCodeAsync(email, cancellationToken);
            }
            catch (AuthServiceException ex) when (ex.StatusCode == StatusCodes.Status429TooManyRequests)
            {
                return new RegisterResponse(
                    createResultNormal == AdminCreateResult.AlreadyExists
                        ? "This email is already registered. Supabase email limit reached — wait 10-15 minutes, then tap Resend code or try Login."
                        : "Account created. Email limit reached — wait 10-15 minutes and tap Resend code on the site."
                );
            }
            catch (AuthServiceException ex) when (IsEmailDeliveryError(ex.Message))
            {
                throw new AuthServiceException(
                    "Не удалось отправить код. Добавьте Smtp в appsettings.local.json (Gmail) "
                    + "и выполните SQL create_signup_verification_codes.sql в Supabase.",
                    StatusCodes.Status503ServiceUnavailable
                );
            }

            return new RegisterResponse(
                createResultNormal == AdminCreateResult.AlreadyExists
                    ? "Код отправлен на вашу почту."
                    : "Код отправлен на вашу почту. Введите его на следующем шаге."
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
            return new RegisterResponse("Verification code sent to your email.");
        }

        if (response.IsSuccessStatusCode)
        {
            return new RegisterResponse("Verification code sent to your email.");
        }

        throw MapAuthError(response.StatusCode, payload);
    }

    private static bool IsEmailDeliveryError(string message) =>
        message.Contains("confirmation email", StringComparison.OrdinalIgnoreCase)
        || message.Contains("sending email", StringComparison.OrdinalIgnoreCase)
        || message.Contains("email rate limit", StringComparison.OrdinalIgnoreCase);

    public async Task<AuthResponse> VerifyEmailAsync(
        VerifyEmailRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var code = request.Code.Trim();

        var (appCodeValid, password) = await signupVerification.TryValidateAsync(
            email,
            code,
            cancellationToken);

        if (appCodeValid)
        {
            await ConfirmUserByEmailAsync(email, cancellationToken);
            await signupVerification.DeleteAsync(email, cancellationToken);
            var loginPayload = await LoginWithPasswordAsync(email, password, cancellationToken);
            return await BuildAuthResponseAsync(loginPayload, cancellationToken);
        }

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

        if (await signupVerification.HasPendingAsync(email, cancellationToken)
            && signupEmail.CanSend)
        {
            await signupVerification.ResendAsync(email, cancellationToken);
            return new MessageResponse("Новый код отправлен на вашу почту.");
        }

        await ResendSignupCodeAsync(email, cancellationToken);
        return new MessageResponse("Код отправлен повторно.");
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var payload = await LoginWithPasswordAsync(email, request.Password, cancellationToken);
        return await BuildAuthResponseAsync(payload, cancellationToken);
    }

    private async Task<SupabaseAuthPayload> LoginWithPasswordAsync(
        string email,
        string password,
        CancellationToken cancellationToken
    )
    {
        using var message = CreatePublicRequest(
            HttpMethod.Post,
            "/auth/v1/token?grant_type=password",
            new { email, password }
        );

        return await SendAsync(message, cancellationToken);
    }

    private async Task ConfirmUserByEmailAsync(string email, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return;
        }

        var userId = await FindAuthUserIdByEmailAsync(email, cancellationToken);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new AuthServiceException(
                "Пользователь не найден после подтверждения.",
                StatusCodes.Status502BadGateway
            );
        }

        using var updateRequest = CreateSecretRequest(
            HttpMethod.Put,
            $"/auth/v1/admin/users/{Uri.EscapeDataString(userId)}",
            new { email_confirm = true }
        );

        var updateResponse = await httpClient.SendAsync(updateRequest, cancellationToken);

        if (!updateResponse.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Не удалось подтвердить email.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    private async Task<string?> FindAuthUserIdByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        using var profileRequest = CreateSecretRequest(
            HttpMethod.Get,
            $"/rest/v1/profiles?email=eq.{Uri.EscapeDataString(email)}&select=id&limit=1"
        );

        var profileResponse = await httpClient.SendAsync(profileRequest, cancellationToken);

        if (profileResponse.IsSuccessStatusCode)
        {
            var profiles = await profileResponse.Content.ReadFromJsonAsync<List<ProfileIdRow>>(
                cancellationToken: cancellationToken
            );
            var profileId = profiles?.FirstOrDefault()?.Id;

            if (!string.IsNullOrWhiteSpace(profileId))
            {
                return profileId;
            }
        }

        using var listRequest = CreateSecretRequest(
            HttpMethod.Get,
            "/auth/v1/admin/users?per_page=1000"
        );

        var listResponse = await httpClient.SendAsync(listRequest, cancellationToken);

        if (!listResponse.IsSuccessStatusCode)
        {
            return null;
        }

        var wrapped = await listResponse.Content.ReadFromJsonAsync<AdminUsersListResponse>(
            cancellationToken: cancellationToken
        );

        return wrapped?.Users?
            .FirstOrDefault(u =>
                string.Equals(u.Email?.Trim(), email, StringComparison.OrdinalIgnoreCase))
            ?.Id;
    }

    public async Task<AuthResponse> ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken
    )
    {
        if (!string.Equals(request.NewPassword, request.ConfirmPassword, StringComparison.Ordinal))
        {
            throw new AuthServiceException("Passwords do not match.");
        }

        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            throw new AuthServiceException(
                "Password change is not available.",
                StatusCodes.Status503ServiceUnavailable
            );
        }

        using var updateRequest = CreateSecretRequest(
            HttpMethod.Put,
            $"/auth/v1/admin/users/{Uri.EscapeDataString(userId)}",
            new { password = request.NewPassword }
        );

        var updateResponse = await httpClient.SendAsync(updateRequest, cancellationToken);

        if (!updateResponse.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not update password.",
                StatusCodes.Status502BadGateway
            );
        }

        await PatchProfileAsync(
            userId,
            new Dictionary<string, object?>
            {
                ["must_change_password"] = false,
                ["temp_password_expires_at"] = null,
            },
            cancellationToken
        );

        var profile = await GetProfileAsync(userId, cancellationToken);
        var email = profile?.Email ?? string.Empty;
        var username = profile?.UsernameSet == true ? profile.Username ?? "" : "";
        var role = ResolveAppRole(profile?.Role);

        return IssueAppToken(userId, email, username, role, needsUsername: string.IsNullOrWhiteSpace(username));
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

        var mustChange = profile.MustChangePassword
            && (profile.TempPasswordExpiresAt is null
                || profile.TempPasswordExpiresAt >= DateTimeOffset.UtcNow);

        return new UserProfileResponse(
            userId,
            profile.Email,
            username,
            ResolveAppRole(profile.Role),
            string.IsNullOrWhiteSpace(profile.AvatarUrl) ? null : profile.AvatarUrl,
            mustChange
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
        bool needsUsername,
        bool mustChangePassword = false
    )
    {
        var token = jwtTokenService.CreateToken(userId, email, username, role);

        return new AuthResponse(token, username, email, needsUsername, mustChangePassword);
    }

    private static string ResolveAppRole(string? role)
    {
        if (string.Equals(role, AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
        {
            return AppRoles.Admin;
        }

        if (string.Equals(role, AppRoles.Operator, StringComparison.OrdinalIgnoreCase))
        {
            return AppRoles.Operator;
        }

        return AppRoles.User;
    }

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

        var mustChange = profile?.MustChangePassword == true;

        if (mustChange && profile?.TempPasswordExpiresAt is { } expires
            && expires < DateTimeOffset.UtcNow)
        {
            throw new AuthServiceException(
                "Temporary password has expired. Ask an administrator for a new invite.",
                StatusCodes.Status403Forbidden
            );
        }

        if (profile?.UsernameSet == true && !string.IsNullOrWhiteSpace(profile.Username))
        {
            return IssueAppToken(
                userId!,
                email,
                profile.Username,
                role,
                needsUsername: false,
                mustChangePassword: mustChange
            );
        }

        return IssueAppToken(
            userId!,
            email,
            string.Empty,
            role,
            needsUsername: true,
            mustChangePassword: mustChange
        );
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
        bool emailConfirm,
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
                email_confirm = emailConfirm,
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
            $"/rest/v1/profiles?id=eq.{userId}&select=email,username,username_set,role,avatar_url,must_change_password,temp_password_expires_at",
            cancellationToken
        );

        if (profiles is null)
        {
            profiles = await QueryProfilesAsync(
                $"/rest/v1/profiles?id=eq.{userId}&select=email,username,username_set,role,must_change_password,temp_password_expires_at",
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

        if (IsEmailDeliveryError(message))
        {
            message =
                "Не удалось отправить письмо с кодом. Для разработки добавьте в appsettings.local.json: "
                + "\"Supabase\": { \"AutoConfirmEmail\": true }. "
                + "Или настройте SMTP в Supabase → Authentication.";
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

    private sealed class AdminUserListItem
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }

    private sealed class AdminUsersListResponse
    {
        [JsonPropertyName("users")]
        public List<AdminUserListItem>? Users { get; set; }
    }

    private sealed class ProfileIdRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
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

        [JsonPropertyName("must_change_password")]
        public bool MustChangePassword { get; set; }

        [JsonPropertyName("temp_password_expires_at")]
        public DateTimeOffset? TempPasswordExpiresAt { get; set; }
    }
}

public class AuthServiceException(string message, int statusCode = StatusCodes.Status400BadRequest)
    : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
