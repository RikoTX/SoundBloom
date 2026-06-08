using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed record PromoComputation(
    string PromoId,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    int AmountBefore,
    int AmountAfter,
    int BonusMonths,
    int RedeemedCount
);

public class PromoService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    AdminLogStore logStore,
    ILogger<PromoService> logger
)
{
    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    private static readonly string[] ValidTypes = ["percent", "fixed", "free_months"];
    private static readonly string[] ValidScopes = ["all", "premium", "family"];

    // ---------- Admin: list / create / update / delete ----------

    public async Task<IReadOnlyList<PromoCodeDto>> GetPromosAsync(CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<PromoRow>(
            "/rest/v1/promo_codes?select=*&order=created_at.desc",
            cancellationToken
        );

        if (rows is null)
        {
            throw new AuthServiceException(
                "Не удалось загрузить промокоды. Выполните SQL add_promo_codes.sql в Supabase.",
                StatusCodes.Status502BadGateway
            );
        }

        return rows.Select(MapPromo).ToList();
    }

    public async Task<PromoCodeDto> CreatePromoAsync(
        CreatePromoRequest request,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var code = (request.Code ?? "").Trim().ToUpperInvariant();

        if (code.Length is < 3 or > 32 || !code.All(c => char.IsLetterOrDigit(c) || c is '-' or '_'))
        {
            throw new AuthServiceException(
                "Код: 3–32 символа, латиница/цифры/-/_."
            );
        }

        var type = (request.DiscountType ?? "").Trim().ToLowerInvariant();
        if (!ValidTypes.Contains(type))
        {
            throw new AuthServiceException("Тип скидки: percent, fixed или free_months.");
        }

        var value = request.DiscountValue;
        switch (type)
        {
            case "percent" when value is < 1 or > 100:
                throw new AuthServiceException("Процент должен быть от 1 до 100.");
            case "fixed" when value < 1:
                throw new AuthServiceException("Сумма скидки должна быть больше 0.");
            case "free_months" when value is < 1 or > 24:
                throw new AuthServiceException("Бесплатные месяцы: от 1 до 24.");
        }

        var scope = (request.AppliesTo ?? "all").Trim().ToLowerInvariant();
        if (!ValidScopes.Contains(scope))
        {
            scope = "all";
        }

        if (request.MaxRedemptions is < 1)
        {
            throw new AuthServiceException("Лимит активаций должен быть больше 0 или пустым.");
        }

        var body = new Dictionary<string, object?>
        {
            ["code"] = code,
            ["description"] = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description!.Trim(),
            ["discount_type"] = type,
            ["discount_value"] = value,
            ["applies_to"] = scope,
            ["max_redemptions"] = request.MaxRedemptions,
            ["redeemed_count"] = 0,
            ["per_user_limit"] = 1,
            ["starts_at"] = request.StartsAt,
            ["expires_at"] = request.ExpiresAt,
            ["is_active"] = true,
            ["created_by"] = actor,
        };

        using var insert = CreateSecretRequest(HttpMethod.Post, "/rest/v1/promo_codes", body);
        insert.Headers.Add("Prefer", "return=representation");

        var response = await httpClient.SendAsync(insert, cancellationToken);

        if (response.StatusCode == HttpStatusCode.Conflict)
        {
            throw new AuthServiceException(
                "Такой промокод уже существует.",
                StatusCodes.Status409Conflict
            );
        }

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Create promo failed {Status}: {Error}", (int)response.StatusCode, error);
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(error)
                    ? "Не удалось создать промокод."
                    : $"Не удалось создать промокод: {error}",
                StatusCodes.Status502BadGateway
            );
        }

        var created = await response.Content.ReadFromJsonAsync<List<PromoRow>>(
            cancellationToken: cancellationToken
        );

        logStore.Add("info", "promo", $"Created promo {code} ({type} {value})", actor);

        return MapPromo(created!.First());
    }

    public async Task UpdatePromoAsync(
        string id,
        UpdatePromoRequest request,
        string actor,
        CancellationToken cancellationToken
    )
    {
        var fields = new Dictionary<string, object?>();

        if (request.IsActive is not null)
        {
            fields["is_active"] = request.IsActive;
        }

        if (request.Description is not null)
        {
            fields["description"] = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();
        }

        if (request.ExpiresAt is not null)
        {
            fields["expires_at"] = request.ExpiresAt;
        }

        if (request.MaxRedemptions is not null)
        {
            fields["max_redemptions"] = request.MaxRedemptions;
        }

        if (fields.Count == 0)
        {
            throw new AuthServiceException("Нечего обновлять.");
        }

        using var patch = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/promo_codes?id=eq.{Uri.EscapeDataString(id)}",
            fields
        );
        patch.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(patch, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Не удалось обновить промокод.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add("info", "promo", $"Updated promo {id}", actor);
    }

    public async Task DeletePromoAsync(string id, string actor, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/promo_codes?id=eq.{Uri.EscapeDataString(id)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Не удалось удалить промокод.",
                StatusCodes.Status502BadGateway
            );
        }

        logStore.Add("warn", "promo", $"Deleted promo {id}", actor);
    }

    // ---------- Validation / redemption ----------

    public async Task<PromoComputation> ValidateAsync(
        string userId,
        string code,
        string plan,
        int months,
        CancellationToken cancellationToken
    )
    {
        var normalized = (code ?? "").Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new AuthServiceException("Введите промокод.");
        }

        if (plan is not ("premium" or "family"))
        {
            throw new AuthServiceException("Промокод применяется только к платным тарифам.");
        }

        var rows = await QueryAsync<PromoRow>(
            $"/rest/v1/promo_codes?code=eq.{Uri.EscapeDataString(normalized)}&select=*&limit=1",
            cancellationToken
        );

        var promo = rows?.FirstOrDefault()
            ?? throw new AuthServiceException(
                "Промокод не найден.",
                StatusCodes.Status404NotFound
            );

        if (!promo.IsActive)
        {
            throw new AuthServiceException("Промокод неактивен.");
        }

        var now = DateTimeOffset.UtcNow;

        if (promo.StartsAt is not null && promo.StartsAt > now)
        {
            throw new AuthServiceException("Промокод ещё не действует.");
        }

        if (promo.ExpiresAt is not null && promo.ExpiresAt < now)
        {
            throw new AuthServiceException("Срок действия промокода истёк.");
        }

        var scope = (promo.AppliesTo ?? "all").ToLowerInvariant();
        if (scope is not "all" && scope != plan)
        {
            throw new AuthServiceException(
                $"Промокод действует только для тарифа {scope}."
            );
        }

        if (promo.MaxRedemptions is not null && promo.RedeemedCount >= promo.MaxRedemptions)
        {
            throw new AuthServiceException("Лимит активаций промокода исчерпан.");
        }

        var already = await QueryAsync<RedemptionRow>(
            $"/rest/v1/promo_redemptions?promo_id=eq.{Uri.EscapeDataString(promo.Id!)}"
            + $"&user_id=eq.{Uri.EscapeDataString(userId)}&select=id&limit=1",
            cancellationToken
        );

        if (already is { Count: > 0 })
        {
            throw new AuthServiceException(
                "Вы уже использовали этот промокод.",
                StatusCodes.Status409Conflict
            );
        }

        var amountBefore = SubscriptionService.MonthlyPriceKzt(plan) * months;
        var (amountAfter, bonusMonths) = Compute(
            promo.DiscountType ?? "percent",
            promo.DiscountValue,
            amountBefore
        );

        return new PromoComputation(
            promo.Id!,
            normalized,
            (promo.DiscountType ?? "percent").ToLowerInvariant(),
            promo.DiscountValue,
            amountBefore,
            amountAfter,
            bonusMonths,
            promo.RedeemedCount
        );
    }

    public async Task RedeemAsync(
        string userId,
        string plan,
        PromoComputation comp,
        CancellationToken cancellationToken
    )
    {
        var body = new
        {
            promo_id = comp.PromoId,
            promo_code = comp.Code,
            user_id = userId,
            plan,
            discount_type = comp.DiscountType,
            discount_value = comp.DiscountValue,
            amount_before = comp.AmountBefore,
            amount_after = comp.AmountAfter,
        };

        using var insert = CreateSecretRequest(HttpMethod.Post, "/rest/v1/promo_redemptions", body);
        insert.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(insert, cancellationToken);

        if (response.StatusCode == HttpStatusCode.Conflict)
        {
            throw new AuthServiceException(
                "Вы уже использовали этот промокод.",
                StatusCodes.Status409Conflict
            );
        }

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Redeem promo failed {Status}: {Error}", (int)response.StatusCode, error);
            throw new AuthServiceException(
                "Не удалось применить промокод.",
                StatusCodes.Status502BadGateway
            );
        }

        // Best-effort usage counter for max_redemptions checks.
        using var patch = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/promo_codes?id=eq.{Uri.EscapeDataString(comp.PromoId)}",
            new { redeemed_count = comp.RedeemedCount + 1 }
        );
        patch.Headers.Add("Prefer", "return=minimal");
        await httpClient.SendAsync(patch, cancellationToken);
    }

    private static (int AmountAfter, int BonusMonths) Compute(
        string type,
        decimal value,
        int amountBefore
    )
    {
        return type.ToLowerInvariant() switch
        {
            "percent" => ((int)Math.Round(amountBefore * (1 - value / 100m), MidpointRounding.AwayFromZero), 0),
            "fixed" => (Math.Max(0, amountBefore - (int)value), 0),
            "free_months" => (amountBefore, (int)value),
            _ => (amountBefore, 0),
        };
    }

    private static PromoCodeDto MapPromo(PromoRow r) =>
        new(
            r.Id ?? "",
            r.Code ?? "",
            r.Description,
            (r.DiscountType ?? "percent").ToLowerInvariant(),
            r.DiscountValue,
            (r.AppliesTo ?? "all").ToLowerInvariant(),
            r.MaxRedemptions,
            r.RedeemedCount,
            r.StartsAt,
            r.ExpiresAt,
            r.IsActive,
            r.CreatedAt
        );

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

    private HttpRequestMessage CreateSecretRequest(HttpMethod method, string path, object? body = null)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            throw new AuthServiceException(
                "Supabase SecretKey required for promo operations.",
                StatusCodes.Status503ServiceUnavailable
            );
        }

        var request = new HttpRequestMessage(method, $"{_settings.Url.TrimEnd('/')}{path}");

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        request.Headers.Add("apikey", _settings.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.SecretKey);
        return request;
    }

    private sealed class PromoRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("discount_type")]
        public string? DiscountType { get; set; }

        [JsonPropertyName("discount_value")]
        public decimal DiscountValue { get; set; }

        [JsonPropertyName("applies_to")]
        public string? AppliesTo { get; set; }

        [JsonPropertyName("max_redemptions")]
        public int? MaxRedemptions { get; set; }

        [JsonPropertyName("redeemed_count")]
        public int RedeemedCount { get; set; }

        [JsonPropertyName("starts_at")]
        public DateTimeOffset? StartsAt { get; set; }

        [JsonPropertyName("expires_at")]
        public DateTimeOffset? ExpiresAt { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTimeOffset? CreatedAt { get; set; }
    }

    private sealed class RedemptionRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }
}
