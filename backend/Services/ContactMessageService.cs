using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Configuration;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class ContactMessageService(HttpClient httpClient, IOptions<SupabaseSettings> supabaseOptions)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public async Task SaveAsync(
        string name,
        string email,
        string message,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            throw new ContactServiceException(
                "В appsettings.local.json не указан Supabase:SecretKey. Без него форма не сохраняется.",
                StatusCodes.Status503ServiceUnavailable);
        }

        var body = new
        {
            name = name.Trim(),
            email = email.Trim(),
            message = message.Trim(),
        };

        using var request = CreateSecretRequest(HttpMethod.Post, "/rest/v1/contact_messages", body);
        request.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var detail = await response.Content.ReadAsStringAsync(cancellationToken);

        if (detail.Contains("contact_messages", StringComparison.OrdinalIgnoreCase)
            && (detail.Contains("does not exist", StringComparison.OrdinalIgnoreCase)
                || detail.Contains("PGRST205", StringComparison.OrdinalIgnoreCase)))
        {
            throw new ContactServiceException(
                "Таблица contact_messages не создана. В Supabase → SQL Editor выполните файл backend/sql/create_contact_messages.sql",
                StatusCodes.Status503ServiceUnavailable);
        }

        throw new ContactServiceException(
            string.IsNullOrWhiteSpace(detail)
                ? "Не удалось сохранить сообщение в базе."
                : "Не удалось сохранить сообщение в базе.",
            StatusCodes.Status502BadGateway);
    }

    private HttpRequestMessage CreateSecretRequest(HttpMethod method, string path, object body)
    {
        var request = new HttpRequestMessage(method, $"{_settings.Url.TrimEnd('/')}{path}")
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("apikey", _settings.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            _settings.SecretKey
        );
        return request;
    }
}
