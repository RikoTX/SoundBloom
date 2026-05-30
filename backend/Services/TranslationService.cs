using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class TranslationService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    AdminLogStore logStore
)
{
    private static readonly HashSet<string> SupportedLocales = new(StringComparer.OrdinalIgnoreCase)
    {
        "en",
        "ru",
        "kk",
    };

    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public IReadOnlyCollection<string> GetSupportedLocales() => SupportedLocales;

    public async Task<Dictionary<string, string>> GetTranslationsAsync(
        string locale,
        CancellationToken cancellationToken
    )
    {
        var normalized = NormalizeLocale(locale);

        var rows = await QueryAsync(
            $"/rest/v1/translations?locale=eq.{normalized}&select=translation_key,value&order=translation_key.asc",
            cancellationToken
        );

        if (rows is null || rows.Count == 0)
        {
            throw new AuthServiceException(
                $"Translations for locale '{normalized}' were not found.",
                StatusCodes.Status404NotFound
            );
        }

        return rows.ToDictionary(
            r => r.TranslationKey ?? string.Empty,
            r => r.Value ?? string.Empty,
            StringComparer.OrdinalIgnoreCase
        );
    }

    public async Task<int> GetDistinctKeysAsync(CancellationToken cancellationToken)
    {
        var rows = await QueryFullAsync(
            "/rest/v1/translations?select=translation_key",
            cancellationToken
        );

        return rows?.Select(r => r.TranslationKey).Distinct(StringComparer.OrdinalIgnoreCase).Count()
            ?? 0;
    }

    public async Task<IReadOnlyList<AdminTranslationRow>> GetAdminTranslationsAsync(
        string? search,
        CancellationToken cancellationToken
    )
    {
        var path =
            "/rest/v1/translations?select=translation_key,locale,value,namespace&order=translation_key.asc";

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = Uri.EscapeDataString(search.Trim());
            path +=
                $"&or=(translation_key.ilike.*{q}*,value.ilike.*{q}*)";
        }

        var rows = await QueryFullAsync(path, cancellationToken);

        if (rows is null)
        {
            throw new AuthServiceException(
                "Could not load translations.",
                StatusCodes.Status502BadGateway
            );
        }

        return rows
            .GroupBy(r => r.TranslationKey ?? string.Empty, StringComparer.OrdinalIgnoreCase)
            .Select(g =>
            {
                var first = g.First();
                return new AdminTranslationRow(
                    g.Key,
                    first.Namespace ?? g.Key.Split('.')[0],
                    g.FirstOrDefault(x => x.Locale == "en")?.Value,
                    g.FirstOrDefault(x => x.Locale == "ru")?.Value,
                    g.FirstOrDefault(x => x.Locale == "kk")?.Value
                );
            })
            .OrderBy(r => r.Key, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public async Task UpsertTranslationAsync(
        UpsertTranslationRequest request,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var key = request.Key.Trim();
        var locale = NormalizeLocale(request.Locale);
        var value = request.Value ?? string.Empty;
        var ns = string.IsNullOrWhiteSpace(request.Namespace)
            ? key.Split('.')[0]
            : request.Namespace!.Trim();

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new AuthServiceException("Translation key is required.", StatusCodes.Status400BadRequest);
        }

        using var httpRequest = CreateSecretRequest(
            HttpMethod.Post,
            "/rest/v1/translations",
            new[]
            {
                new
                {
                    translation_key = key,
                    locale,
                    value,
                    @namespace = ns,
                },
            }
        );
        httpRequest.Headers.Add("Prefer", "resolution=merge-duplicates");

        var response = await httpClient.SendAsync(httpRequest, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not save translation.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add(
            "info",
            "i18n",
            $"Updated {key} ({locale})",
            actor
        );
    }

    public async Task CreateTranslationKeyAsync(
        CreateTranslationKeyRequest request,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var key = request.Key.Trim();
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new AuthServiceException("Translation key is required.", StatusCodes.Status400BadRequest);
        }

        var ns = string.IsNullOrWhiteSpace(request.Namespace)
            ? key.Split('.')[0]
            : request.Namespace!.Trim();

        var rows = new List<object>();
        if (!string.IsNullOrWhiteSpace(request.En))
        {
            rows.Add(new { translation_key = key, locale = "en", value = request.En, @namespace = ns });
        }
        if (!string.IsNullOrWhiteSpace(request.Ru))
        {
            rows.Add(new { translation_key = key, locale = "ru", value = request.Ru, @namespace = ns });
        }
        if (!string.IsNullOrWhiteSpace(request.Kk))
        {
            rows.Add(new { translation_key = key, locale = "kk", value = request.Kk, @namespace = ns });
        }

        if (rows.Count == 0)
        {
            throw new AuthServiceException(
                "Provide at least one locale value.",
                StatusCodes.Status400BadRequest
            );
        }

        using var httpRequest = CreateSecretRequest(HttpMethod.Post, "/rest/v1/translations", rows);
        httpRequest.Headers.Add("Prefer", "resolution=merge-duplicates");

        var response = await httpClient.SendAsync(httpRequest, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not create translation key.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add("info", "i18n", $"Created key {key}", actor);
    }

    public async Task DeleteTranslationAsync(
        string key,
        string locale,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var normalized = NormalizeLocale(locale);
        var escapedKey = Uri.EscapeDataString(key);

        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/translations?translation_key=eq.{escapedKey}&locale=eq.{normalized}"
        );
        request.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Could not delete translation.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add("warn", "i18n", $"Deleted {key} ({normalized})", actor);
    }

    public static string NormalizeLocale(string locale)
    {
        var normalized = (locale ?? "en").Trim().ToLowerInvariant();

        if (!SupportedLocales.Contains(normalized))
        {
            throw new AuthServiceException(
                $"Locale '{locale}' is not supported. Use: en, ru, kk.",
                StatusCodes.Status400BadRequest
            );
        }

        return normalized;
    }

    private async Task<List<TranslationRow>?> QueryAsync(
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

        return await response.Content.ReadFromJsonAsync<List<TranslationRow>>(
            cancellationToken: cancellationToken
        );
    }

    private async Task<List<TranslationFullRow>?> QueryFullAsync(
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

        return await response.Content.ReadFromJsonAsync<List<TranslationFullRow>>(
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
                "Supabase secret key is required for translation operations.",
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

    private sealed class TranslationRow
    {
        [JsonPropertyName("translation_key")]
        public string? TranslationKey { get; set; }

        [JsonPropertyName("value")]
        public string? Value { get; set; }
    }

    private sealed class TranslationFullRow
    {
        [JsonPropertyName("translation_key")]
        public string? TranslationKey { get; set; }

        [JsonPropertyName("locale")]
        public string? Locale { get; set; }

        [JsonPropertyName("value")]
        public string? Value { get; set; }

        [JsonPropertyName("namespace")]
        public string? Namespace { get; set; }
    }
}
