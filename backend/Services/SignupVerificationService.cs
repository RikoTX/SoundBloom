using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using backend.Configuration;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class SignupVerificationService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    SignupEmailService signupEmail)
{
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(15);

    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public bool IsAvailable => !string.IsNullOrWhiteSpace(_settings.SecretKey);

    public async Task IssueAndSendAsync(
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        var code = GenerateCode();
        var expiresAt = DateTimeOffset.UtcNow.Add(CodeLifetime);

        await UpsertAsync(email, code, password, expiresAt, cancellationToken);
        await signupEmail.SendVerificationCodeAsync(email, code, cancellationToken);
    }

    public async Task<(bool Success, string Password)> TryValidateAsync(
        string email,
        string code,
        CancellationToken cancellationToken)
    {
        var row = await GetAsync(email, cancellationToken);

        if (row is null)
        {
            return (false, string.Empty);
        }

        if (row.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return (false, string.Empty);
        }

        if (!string.Equals(row.Code.Trim(), code.Trim(), StringComparison.Ordinal))
        {
            return (false, string.Empty);
        }

        return (true, row.Password ?? string.Empty);
    }

    public async Task DeleteAsync(string email, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return;
        }

        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/signup_verification_codes?email=eq.{Uri.EscapeDataString(email)}"
        );
        await httpClient.SendAsync(request, cancellationToken);
    }

    public async Task<bool> HasPendingAsync(string email, CancellationToken cancellationToken) =>
        await GetAsync(email, cancellationToken) is not null;

    public async Task ResendAsync(string email, CancellationToken cancellationToken)
    {
        var row = await GetAsync(email, cancellationToken);

        if (row is null || string.IsNullOrWhiteSpace(row.Password))
        {
            throw new AuthServiceException(
                "Сначала пройдите регистрацию с email и паролем.",
                StatusCodes.Status400BadRequest
            );
        }

        var code = GenerateCode();
        await UpsertAsync(
            email,
            code,
            row.Password,
            DateTimeOffset.UtcNow.Add(CodeLifetime),
            cancellationToken
        );
        await signupEmail.SendVerificationCodeAsync(email, code, cancellationToken);
    }

    private static string GenerateCode()
    {
        var value = RandomNumberGenerator.GetInt32(0, 1_000_000);
        return value.ToString("D6");
    }

    private async Task UpsertAsync(
        string email,
        string code,
        string password,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken)
    {
        await DeleteAsync(email, cancellationToken);

        using var request = CreateSecretRequest(
            HttpMethod.Post,
            "/rest/v1/signup_verification_codes",
            new
            {
                email,
                code,
                password,
                expires_at = expiresAt,
            }
        );
        request.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var detail = await response.Content.ReadAsStringAsync(cancellationToken);

        if (detail.Contains("signup_verification_codes", StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException(
                "Таблица signup_verification_codes не создана. Выполните backend/sql/create_signup_verification_codes.sql в Supabase.",
                StatusCodes.Status503ServiceUnavailable);
        }

        throw new AuthServiceException(
            "Не удалось сохранить код подтверждения.",
            StatusCodes.Status502BadGateway);
    }

    private async Task<VerificationRow?> GetAsync(string email, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return null;
        }

        using var request = CreateSecretRequest(
            HttpMethod.Get,
            $"/rest/v1/signup_verification_codes?email=eq.{Uri.EscapeDataString(email)}&select=email,code,password,expires_at&limit=1"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var rows = await response.Content.ReadFromJsonAsync<List<VerificationRow>>(
            cancellationToken: cancellationToken
        );

        return rows?.FirstOrDefault();
    }

    private HttpRequestMessage CreateSecretRequest(HttpMethod method, string path, object? body = null)
    {
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

    private sealed class VerificationRow
    {
        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("password")]
        public string? Password { get; set; }

        [JsonPropertyName("expires_at")]
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
