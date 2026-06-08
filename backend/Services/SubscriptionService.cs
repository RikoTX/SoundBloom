using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Configuration;
using backend.Dtos;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class SubscriptionService(
    HttpClient httpClient,
    IOptions<SupabaseSettings> supabaseOptions,
    PromoService promo
)
{
    public const int FreeSkipLimit = 3;
    public const int DefaultAdSeconds = 30;
    public const int PremiumMonthlyKzt = 3990;
    public const int FamilyMonthlyKzt = 5990;
    public const int FamilyMaxMembers = 6;

    private readonly SupabaseSettings _settings = supabaseOptions.Value;

    public static int MonthlyPriceKzt(string plan) =>
        (plan ?? "").Trim().ToLowerInvariant() switch
        {
            "family" => FamilyMonthlyKzt,
            "premium" => PremiumMonthlyKzt,
            _ => 0,
        };

    private static readonly JsonSerializerOptions SupabasePatchJsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    public async Task<SubscriptionStatusResponse> GetStatusAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var row = await GetProfileSubscriptionRowAsync(userId, cancellationToken)
            ?? throw new AuthServiceException("Profile not found.", StatusCodes.Status404NotFound);

        return await ResolveStatusAsync(userId, row, cancellationToken);
    }

    private async Task<SubscriptionStatusResponse> ResolveStatusAsync(
        string userId,
        ProfileSubscriptionRow row,
        CancellationToken cancellationToken)
    {
        var status = BuildStatus(row);

        if (status.Plan != "free")
        {
            return status;
        }

        var owner = await GetActiveFamilyOwnerAsync(userId, cancellationToken);
        return owner is null ? status : BuildFamilyMemberStatus(owner.SubscriptionExpiresAt);
    }

    private SubscriptionStatusResponse BuildFamilyMemberStatus(DateTimeOffset? expiresAt) =>
        new(
            Plan: "family",
            IsActive: true,
            CanCancel: false,
            ExpiresAt: expiresAt,
            SkipsToday: 0,
            SkipsLimit: FreeSkipLimit,
            SkipsRemaining: 999,
            UnlimitedSkips: true,
            NoAds: true,
            CanDownload: true,
            LosslessAudio: true,
            ExclusiveMixes: true,
            FamilySlots: 0,
            FamilyMixPlaylists: "enabled"
        );

    private async Task<ProfileSubscriptionRow?> GetActiveFamilyOwnerAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var membership = await QueryAsync<FamilyMemberRow>(
            $"/rest/v1/family_members?member_id=eq.{Uri.EscapeDataString(userId)}&select=owner_id&limit=1",
            cancellationToken
        );

        var ownerId = membership?.FirstOrDefault()?.OwnerId;
        if (string.IsNullOrWhiteSpace(ownerId))
        {
            return null;
        }

        var owner = await GetProfileSubscriptionRowAsync(ownerId, cancellationToken);
        if (owner is null)
        {
            return null;
        }

        var plan = NormalizePlan(owner.SubscriptionPlan);
        return plan == "family" && IsPlanActive(plan, owner.SubscriptionExpiresAt) ? owner : null;
    }

    public async Task<FamilyInfoDto> GetFamilyAsync(string userId, CancellationToken cancellationToken)
    {
        var row = await GetProfileSubscriptionRowAsync(userId, cancellationToken)
            ?? throw new AuthServiceException("Profile not found.", StatusCodes.Status404NotFound);

        var ownPlan = NormalizePlan(row.SubscriptionPlan);
        var isOwner = ownPlan == "family" && IsPlanActive(ownPlan, row.SubscriptionExpiresAt);

        IReadOnlyList<FamilyMemberDto> members = isOwner
            ? await LoadFamilyMembersAsync(userId, cancellationToken)
            : [];

        string? managedBy = null;
        var owner = await GetActiveFamilyOwnerAsync(userId, cancellationToken);
        if (owner?.Id is not null)
        {
            var ownerProfile = await GetProfileLookupAsync(owner.Id, cancellationToken);
            managedBy = ownerProfile?.Username ?? "—";
        }

        return new FamilyInfoDto(
            IsOwner: isOwner,
            IsMember: managedBy is not null,
            Plan: ownPlan,
            Slots: FamilyMaxMembers,
            Used: members.Count,
            ManagedByUsername: managedBy,
            Members: members
        );
    }

    public async Task<FamilyMemberDto> AddFamilyMemberAsync(
        string userId,
        string username,
        CancellationToken cancellationToken)
    {
        var row = await GetProfileSubscriptionRowAsync(userId, cancellationToken)
            ?? throw new AuthServiceException("Profile not found.", StatusCodes.Status404NotFound);

        var ownPlan = NormalizePlan(row.SubscriptionPlan);
        if (ownPlan != "family" || !IsPlanActive(ownPlan, row.SubscriptionExpiresAt))
        {
            throw new AuthServiceException(
                "Добавлять участников может только владелец активной Family-подписки.",
                StatusCodes.Status403Forbidden
            );
        }

        var name = (username ?? "").Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new AuthServiceException("Введите никнейм пользователя.");
        }

        var target = await FindProfileByUsernameAsync(name, cancellationToken)
            ?? throw new AuthServiceException(
                $"Пользователь @{name} не найден.",
                StatusCodes.Status404NotFound
            );

        if (string.Equals(target.Id, userId, StringComparison.OrdinalIgnoreCase))
        {
            throw new AuthServiceException("Нельзя добавить самого себя.");
        }

        var existing = await QueryAsync<FamilyMemberRow>(
            $"/rest/v1/family_members?member_id=eq.{Uri.EscapeDataString(target.Id!)}&select=owner_id&limit=1",
            cancellationToken
        );

        if (existing is { Count: > 0 })
        {
            var ownedByMe = string.Equals(
                existing[0].OwnerId,
                userId,
                StringComparison.OrdinalIgnoreCase
            );
            throw new AuthServiceException(
                ownedByMe
                    ? "Этот пользователь уже в вашей семье."
                    : "Этот пользователь уже состоит в другой семейной подписке.",
                StatusCodes.Status409Conflict
            );
        }

        var current = await LoadFamilyMembersAsync(userId, cancellationToken);
        if (current.Count >= FamilyMaxMembers)
        {
            throw new AuthServiceException(
                $"Достигнут лимит участников ({FamilyMaxMembers}).",
                StatusCodes.Status409Conflict
            );
        }

        using var insert = CreateSecretRequest(
            HttpMethod.Post,
            "/rest/v1/family_members",
            new
            {
                owner_id = userId,
                member_id = target.Id,
                member_username = target.Username,
            }
        );
        insert.Headers.Add("Prefer", "return=minimal");

        var response = await httpClient.SendAsync(insert, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);

            var tableMissing =
                detail.Contains("family_members", StringComparison.OrdinalIgnoreCase)
                && (
                    detail.Contains("does not exist", StringComparison.OrdinalIgnoreCase)
                    || detail.Contains("schema cache", StringComparison.OrdinalIgnoreCase)
                    || detail.Contains("Could not find", StringComparison.OrdinalIgnoreCase)
                );

            if (tableMissing)
            {
                throw new AuthServiceException(
                    "Выполните SQL: backend/sql/add_family_sharing.sql в Supabase.",
                    StatusCodes.Status503ServiceUnavailable
                );
            }

            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(detail)
                    ? "Не удалось добавить участника."
                    : $"Не удалось добавить участника: {detail}",
                StatusCodes.Status502BadGateway
            );
        }

        return new FamilyMemberDto(
            target.Id!,
            target.Username ?? name,
            target.AvatarUrl,
            DateTimeOffset.UtcNow
        );
    }

    public async Task RemoveFamilyMemberAsync(
        string userId,
        string memberId,
        CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(
            HttpMethod.Delete,
            $"/rest/v1/family_members?owner_id=eq.{Uri.EscapeDataString(userId)}"
            + $"&member_id=eq.{Uri.EscapeDataString(memberId)}"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AuthServiceException(
                "Не удалось удалить участника.",
                StatusCodes.Status502BadGateway
            );
        }
    }

    public async Task<IReadOnlyList<UserSearchDto>> SearchUsersForFamilyAsync(
        string userId,
        string query,
        CancellationToken cancellationToken)
    {
        var term = (query ?? "").Trim();
        if (term.Length < 1)
        {
            return [];
        }

        var pattern = $"*{term}*";
        var rows = await QueryAsync<ProfileLookupRow>(
            $"/rest/v1/profiles?username=ilike.{Uri.EscapeDataString(pattern)}"
            + "&select=id,username,avatar_url&order=username.asc&limit=8",
            cancellationToken
        );

        if (rows is null)
        {
            return [];
        }

        return rows
            .Where(r =>
                !string.IsNullOrWhiteSpace(r.Id)
                && !string.IsNullOrWhiteSpace(r.Username)
                && !string.Equals(r.Id, userId, StringComparison.OrdinalIgnoreCase))
            .Select(r => new UserSearchDto(r.Id!, r.Username!, r.AvatarUrl))
            .ToList();
    }

    private async Task<List<FamilyMemberDto>> LoadFamilyMembersAsync(
        string ownerId,
        CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<FamilyMemberRow>(
            $"/rest/v1/family_members?owner_id=eq.{Uri.EscapeDataString(ownerId)}"
            + "&select=member_id,member_username,added_at&order=added_at.asc",
            cancellationToken
        );

        if (rows is null || rows.Count == 0)
        {
            return [];
        }

        var ids = rows
            .Where(r => !string.IsNullOrWhiteSpace(r.MemberId))
            .Select(r => r.MemberId!)
            .ToList();

        var profiles = new Dictionary<string, ProfileLookupRow>(StringComparer.OrdinalIgnoreCase);

        if (ids.Count > 0)
        {
            var inList = string.Join(",", ids.Select(Uri.EscapeDataString));
            var profileRows = await QueryAsync<ProfileLookupRow>(
                $"/rest/v1/profiles?id=in.({inList})&select=id,username,avatar_url",
                cancellationToken
            );

            foreach (var p in profileRows ?? [])
            {
                if (!string.IsNullOrWhiteSpace(p.Id))
                {
                    profiles[p.Id!] = p;
                }
            }
        }

        return rows
            .Where(r => !string.IsNullOrWhiteSpace(r.MemberId))
            .Select(r =>
            {
                profiles.TryGetValue(r.MemberId!, out var p);
                return new FamilyMemberDto(
                    r.MemberId!,
                    p?.Username ?? r.MemberUsername ?? "—",
                    p?.AvatarUrl,
                    r.AddedAt
                );
            })
            .ToList();
    }

    private async Task<ProfileLookupRow?> FindProfileByUsernameAsync(
        string username,
        CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<ProfileLookupRow>(
            $"/rest/v1/profiles?username=ilike.{Uri.EscapeDataString(username)}"
            + "&select=id,username,avatar_url&limit=1",
            cancellationToken
        );

        return rows?.FirstOrDefault();
    }

    private async Task<ProfileLookupRow?> GetProfileLookupAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<ProfileLookupRow>(
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId)}&select=id,username,avatar_url&limit=1",
            cancellationToken
        );

        return rows?.FirstOrDefault();
    }

    public async Task<SkipTrackResponse> RecordSkipAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var row = await GetProfileSubscriptionRowAsync(userId, cancellationToken)
            ?? throw new AuthServiceException("Profile not found.", StatusCodes.Status404NotFound);

        var status = BuildStatus(row);

        if (status.UnlimitedSkips)
        {
            return new SkipTrackResponse(
                Allowed: true,
                ShowAd: false,
                SkipsToday: row.SkipsToday,
                SkipsLimit: FreeSkipLimit,
                Ad: null
            );
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var resetDate = ParseResetDate(row);
        var skips = resetDate == today ? row.SkipsToday : 0;

        if (skips < FreeSkipLimit)
        {
            skips += 1;
            await PatchProfileSubscriptionAsync(
                userId,
                new
                {
                    skips_today = skips,
                    skips_reset_date = today.ToString("yyyy-MM-dd"),
                    subscription_plan = string.IsNullOrWhiteSpace(row.SubscriptionPlan)
                        ? "free"
                        : row.SubscriptionPlan,
                },
                cancellationToken
            );

            return new SkipTrackResponse(
                Allowed: true,
                ShowAd: false,
                SkipsToday: skips,
                SkipsLimit: FreeSkipLimit,
                Ad: null
            );
        }

        var ad = await PickRandomAdAsync(cancellationToken);

        return new SkipTrackResponse(
            Allowed: true,
            ShowAd: true,
            SkipsToday: skips,
            SkipsLimit: FreeSkipLimit,
            Ad: ad
        );
    }

    public async Task<IReadOnlyList<PaymentMethodDto>> GetPaymentMethodsAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<PaymentMethodRow>(
            $"/rest/v1/user_payment_methods?user_id=eq.{Uri.EscapeDataString(userId)}"
            + "&select=id,card_brand,last_four,exp_month,exp_year,cardholder_name,is_default"
            + "&order=is_default.desc,created_at.desc",
            cancellationToken
        );

        if (rows is null)
        {
            return Array.Empty<PaymentMethodDto>();
        }

        return rows
            .Select(MapPaymentMethod)
            .Where(m => m is not null)
            .Cast<PaymentMethodDto>()
            .ToList();
    }

    public async Task<CancelSubscriptionResponse> CancelSubscriptionAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var row = await GetProfileSubscriptionRowAsync(userId, cancellationToken)
            ?? throw new AuthServiceException("Profile not found.", StatusCodes.Status404NotFound);

        var storedPlan = NormalizePlan(row.SubscriptionPlan);

        if (storedPlan is not ("premium" or "family"))
        {
            throw new AuthServiceException(
                "Нет платной подписки для отмены.",
                StatusCodes.Status400BadRequest
            );
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var updated = await PatchProfileSubscriptionAsync(
            userId,
            new Dictionary<string, object?>
            {
                ["subscription_plan"] = "free",
                ["subscription_expires_at"] = null,
                ["skips_today"] = 0,
                ["skips_reset_date"] = today.ToString("yyyy-MM-dd"),
            },
            cancellationToken,
            requireUpdatedRow: true
        );

        var status = BuildStatus(updated);

        return new CancelSubscriptionResponse(
            "Подписка отменена. Вы переведены на бесплатный тариф.",
            status.Plan,
            status
        );
    }

    public async Task<FakeCheckoutResponse> FakeCheckoutAsync(
        string userId,
        FakeCheckoutRequest request,
        CancellationToken cancellationToken)
    {
        var plan = (request.Plan ?? "").Trim().ToLowerInvariant();

        if (plan is not ("premium" or "family"))
        {
            throw new AuthServiceException("Plan must be premium or family.");
        }

        var months = Math.Clamp(request.Months, 1, 24);
        var amount = MonthlyPriceKzt(plan) * months;
        var bonusMonths = 0;

        PromoComputation? promoComp = null;
        if (!string.IsNullOrWhiteSpace(request.PromoCode))
        {
            promoComp = await promo.ValidateAsync(
                userId,
                request.PromoCode!,
                plan,
                months,
                cancellationToken
            );
            amount = promoComp.AmountAfter;
            bonusMonths = promoComp.BonusMonths;
        }

        var expiresAt = DateTimeOffset.UtcNow.AddMonths(months + bonusMonths);

        PaymentMethodDto? usedMethod = null;
        Guid? paymentMethodId = request.PaymentMethodId;

        if (paymentMethodId is not null)
        {
            usedMethod = await GetPaymentMethodForUserAsync(
                userId,
                paymentMethodId.Value,
                cancellationToken
            );

            if (usedMethod is null)
            {
                throw new AuthServiceException("Сохранённая карта не найдена.");
            }
        }
        else if (request.NewCard is not null)
        {
            if (request.SaveCard)
            {
                usedMethod = await UpsertPaymentMethodAsync(userId, request.NewCard, cancellationToken);
                paymentMethodId = usedMethod.Id;
            }
            else
            {
                ValidateNewCard(request.NewCard);
            }
        }
        else
        {
            throw new AuthServiceException("Укажите карту или выберите сохранённую.");
        }

        await PatchProfileSubscriptionAsync(
            userId,
            new
            {
                subscription_plan = plan,
                subscription_expires_at = expiresAt,
                skips_today = 0,
            },
            cancellationToken
        );

        await InsertPaymentAsync(userId, plan, months, amount, paymentMethodId, cancellationToken);

        if (promoComp is not null)
        {
            await promo.RedeemAsync(userId, plan, promoComp, cancellationToken);
        }

        var message = promoComp is null
            ? $"Подписка {plan} активна до {expiresAt:dd.MM.yyyy}."
            : bonusMonths > 0
                ? $"Промокод применён: +{bonusMonths} мес. Подписка {plan} активна до {expiresAt:dd.MM.yyyy}."
                : $"Промокод применён. Подписка {plan} активна до {expiresAt:dd.MM.yyyy}.";

        return new FakeCheckoutResponse(
            message,
            plan,
            expiresAt,
            usedMethod
        );
    }

    private static void ValidateNewCard(NewCardPaymentDto card)
    {
        var name = (card.CardholderName ?? "").Trim();
        var lastFour = (card.LastFour ?? "").Trim();
        var brand = (card.Brand ?? "").Trim().ToLowerInvariant();

        if (name.Length < 2)
        {
            throw new AuthServiceException("Укажите имя на карте.");
        }

        if (lastFour.Length != 4 || !lastFour.All(char.IsDigit))
        {
            throw new AuthServiceException("Некорректный номер карты.");
        }

        if (card.ExpMonth is < 1 or > 12)
        {
            throw new AuthServiceException("Некорректный срок действия.");
        }

        if (card.ExpYear is < 0 or > 99)
        {
            throw new AuthServiceException("Некорректный срок действия.");
        }

        var now = DateTime.UtcNow;
        var year = 2000 + card.ExpYear;
        var expiry = new DateTime(year, card.ExpMonth, DateTime.DaysInMonth(year, card.ExpMonth));

        if (expiry < now.Date)
        {
            throw new AuthServiceException("Срок действия карты истёк.");
        }

        if (string.IsNullOrWhiteSpace(brand))
        {
            throw new AuthServiceException("Не удалось определить тип карты.");
        }
    }

    private async Task<PaymentMethodDto?> GetPaymentMethodForUserAsync(
        string userId,
        Guid methodId,
        CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<PaymentMethodRow>(
            $"/rest/v1/user_payment_methods?id=eq.{methodId}"
            + $"&user_id=eq.{Uri.EscapeDataString(userId)}"
            + "&select=id,card_brand,last_four,exp_month,exp_year,cardholder_name,is_default"
            + "&limit=1",
            cancellationToken
        );

        var row = rows?.FirstOrDefault();
        return row is null ? null : MapPaymentMethod(row);
    }

    private async Task<PaymentMethodDto> UpsertPaymentMethodAsync(
        string userId,
        NewCardPaymentDto card,
        CancellationToken cancellationToken)
    {
        ValidateNewCard(card);

        var lastFour = card.LastFour.Trim();
        var brand = (card.Brand ?? "unknown").Trim().ToLowerInvariant();
        var name = card.CardholderName.Trim();

        var existing = await QueryAsync<PaymentMethodRow>(
            $"/rest/v1/user_payment_methods?user_id=eq.{Uri.EscapeDataString(userId)}"
            + $"&last_four=eq.{lastFour}"
            + $"&exp_month=eq.{card.ExpMonth}"
            + $"&exp_year=eq.{card.ExpYear}"
            + "&select=id,card_brand,last_four,exp_month,exp_year,cardholder_name,is_default"
            + "&limit=1",
            cancellationToken
        );

        if (existing?.FirstOrDefault() is { } found)
        {
            await PatchPaymentMethodAsync(
                found.Id!.Value,
                new
                {
                    card_brand = brand,
                    cardholder_name = name,
                    is_default = true,
                },
                cancellationToken
            );
            await ClearOtherDefaultCardsAsync(userId, found.Id!.Value, cancellationToken);

            return new PaymentMethodDto(
                found.Id!.Value,
                brand,
                lastFour,
                card.ExpMonth,
                card.ExpYear,
                name,
                true
            );
        }

        await ClearOtherDefaultCardsAsync(userId, null, cancellationToken);

        using var request = CreateSecretRequest(
            HttpMethod.Post,
            "/rest/v1/user_payment_methods",
            new
            {
                user_id = userId,
                card_brand = brand,
                last_four = lastFour,
                exp_month = card.ExpMonth,
                exp_year = card.ExpYear,
                cardholder_name = name,
                is_default = true,
            }
        );
        request.Headers.Add("Prefer", "return=representation");

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);

            if (detail.Contains("user_payment_methods", StringComparison.OrdinalIgnoreCase))
            {
                throw new AuthServiceException(
                    "Выполните SQL: backend/sql/add_payment_methods.sql в Supabase.",
                    StatusCodes.Status503ServiceUnavailable
                );
            }

            throw new AuthServiceException(
                "Не удалось сохранить карту.",
                StatusCodes.Status502BadGateway
            );
        }

        var created = await response.Content.ReadFromJsonAsync<List<PaymentMethodRow>>(
            cancellationToken: cancellationToken
        );

        var row = created?.FirstOrDefault()
            ?? throw new AuthServiceException(
                "Не удалось сохранить карту.",
                StatusCodes.Status502BadGateway
            );

        return MapPaymentMethod(row)!;
    }

    private async Task PatchPaymentMethodAsync(
        Guid id,
        object body,
        CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(
            HttpMethod.Patch,
            $"/rest/v1/user_payment_methods?id=eq.{id}",
            body
        );
        request.Headers.Add("Prefer", "return=minimal");
        await httpClient.SendAsync(request, cancellationToken);
    }

    private async Task ClearOtherDefaultCardsAsync(
        string userId,
        Guid? keepId,
        CancellationToken cancellationToken)
    {
        var path =
            $"/rest/v1/user_payment_methods?user_id=eq.{Uri.EscapeDataString(userId)}&is_default=eq.true";

        if (keepId is not null)
        {
            path += $"&id=neq.{keepId}";
        }

        using var request = CreateSecretRequest(HttpMethod.Patch, path, new { is_default = false });
        request.Headers.Add("Prefer", "return=minimal");
        await httpClient.SendAsync(request, cancellationToken);
    }

    private static PaymentMethodDto? MapPaymentMethod(PaymentMethodRow row)
    {
        if (row.Id is null || string.IsNullOrWhiteSpace(row.LastFour))
        {
            return null;
        }

        return new PaymentMethodDto(
            row.Id.Value,
            (row.CardBrand ?? "unknown").Trim().ToLowerInvariant(),
            row.LastFour!,
            row.ExpMonth,
            row.ExpYear,
            row.CardholderName ?? "",
            row.IsDefault
        );
    }

    public async Task<TrackDownloadResponse> GetDownloadAsync(
        string userId,
        string trackId,
        CancellationToken cancellationToken)
    {
        var row = await GetProfileSubscriptionRowAsync(userId, cancellationToken)
            ?? throw new AuthServiceException("Profile not found.", StatusCodes.Status404NotFound);

        var status = await ResolveStatusAsync(userId, row, cancellationToken);

        if (!status.CanDownload)
        {
            throw new AuthServiceException(
                "Скачивание доступно только с Premium или Family.",
                StatusCodes.Status403Forbidden
            );
        }

        var files = await QueryAsync<TrackFileRow>(
            $"/rest/v1/track_files?track_id=eq.{Uri.EscapeDataString(trackId)}&select=audio_url,file_format",
            cancellationToken
        );

        var file = files?.FirstOrDefault();
        var url = file?.AudioUrl;

        if (string.IsNullOrWhiteSpace(url))
        {
            throw new AuthServiceException("Файл трека не найден.", StatusCodes.Status404NotFound);
        }

        var tracks = await QueryAsync<TrackTitleRow>(
            $"/rest/v1/tracks?id=eq.{Uri.EscapeDataString(trackId)}&select=title&limit=1",
            cancellationToken
        );

        return new TrackDownloadResponse(
            url,
            tracks?.FirstOrDefault()?.Title ?? "track",
            file?.FileFormat ?? "mp3"
        );
    }

    private SubscriptionStatusResponse BuildStatus(ProfileSubscriptionRow row)
    {
        var storedPlan = NormalizePlan(row.SubscriptionPlan);
        var active = IsPlanActive(storedPlan, row.SubscriptionExpiresAt);
        var effective = active ? storedPlan : "free";
        var canCancel = storedPlan is "premium" or "family";

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var resetDate = ParseResetDate(row);
        var skips = resetDate == today ? row.SkipsToday : 0;
        var unlimited = effective is "premium" or "family";
        var remaining = unlimited ? 999 : Math.Max(0, FreeSkipLimit - skips);

        return new SubscriptionStatusResponse(
            Plan: effective,
            IsActive: active && effective != "free",
            CanCancel: canCancel,
            ExpiresAt: row.SubscriptionExpiresAt,
            SkipsToday: skips,
            SkipsLimit: FreeSkipLimit,
            SkipsRemaining: remaining,
            UnlimitedSkips: unlimited,
            NoAds: unlimited,
            CanDownload: unlimited,
            LosslessAudio: unlimited,
            ExclusiveMixes: unlimited,
            FamilySlots: effective == "family" ? 6 : 0,
            FamilyMixPlaylists: effective == "family" ? "enabled" : null
        );
    }

    private static string NormalizePlan(string? plan) =>
        (plan ?? "free").Trim().ToLowerInvariant() switch
        {
            "premium" => "premium",
            "family" => "family",
            _ => "free",
        };

    private static bool IsPlanActive(string plan, DateTimeOffset? expiresAt)
    {
        if (plan == "free")
        {
            return false;
        }

        return expiresAt is null || expiresAt > DateTimeOffset.UtcNow;
    }

    private async Task<PromoAdDto?> PickRandomAdAsync(CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<PromoAdRow>(
            "/rest/v1/promo_ads?is_active=eq.true&select=id,title,body,image_url,logo_url,play_music,music_url,duration_seconds",
            cancellationToken
        );

        if (rows is null || rows.Count == 0)
        {
            return new PromoAdDto(
                "default",
                "SoundBloom Premium",
                "Оформи Premium — без рекламы и с безлимитными пропусками.",
                null,
                "/SoundBloom/vite.svg",
                false,
                null,
                DefaultAdSeconds
            );
        }

        var pick = rows[Random.Shared.Next(rows.Count)];

        return new PromoAdDto(
            pick.Id ?? "ad",
            pick.Title ?? "SoundBloom",
            pick.Body ?? "",
            pick.ImageUrl,
            pick.LogoUrl,
            pick.PlayMusic,
            pick.MusicUrl,
            pick.DurationSeconds > 0 ? pick.DurationSeconds : DefaultAdSeconds
        );
    }

    private async Task<ProfileSubscriptionRow?> GetProfileSubscriptionRowAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await QueryAsync<ProfileSubscriptionRow>(
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId)}"
            + "&select=id,subscription_plan,subscription_expires_at,skips_today,skips_reset_date",
            cancellationToken
        );

        return rows?.FirstOrDefault();
    }

    private async Task<ProfileSubscriptionRow> PatchProfileSubscriptionAsync(
        string userId,
        object body,
        CancellationToken cancellationToken,
        bool requireUpdatedRow = false)
    {
        var path =
            $"/rest/v1/profiles?id=eq.{Uri.EscapeDataString(userId)}"
            + (
                requireUpdatedRow
                    ? "&select=id,subscription_plan,subscription_expires_at,skips_today,skips_reset_date"
                    : ""
            );

        using var request = CreateSecretRequest(HttpMethod.Patch, path);

        var json = body is Dictionary<string, object?> dict
            ? JsonSerializer.Serialize(dict, SupabasePatchJsonOptions)
            : JsonSerializer.Serialize(body, SupabasePatchJsonOptions);

        request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        request.Headers.Add(
            "Prefer",
            requireUpdatedRow ? "return=representation" : "return=minimal"
        );

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new AuthServiceException(
                string.IsNullOrWhiteSpace(detail)
                    ? "Не удалось обновить подписку."
                    : $"Не удалось обновить подписку: {detail}",
                StatusCodes.Status502BadGateway
            );
        }

        if (!requireUpdatedRow)
        {
            return new ProfileSubscriptionRow { Id = userId };
        }

        var rows = await response.Content.ReadFromJsonAsync<List<ProfileSubscriptionRow>>(
            cancellationToken: cancellationToken
        );

        var updated = rows?.FirstOrDefault();

        if (updated is null)
        {
            throw new AuthServiceException(
                "Профиль не найден. Проверьте, что выполнен SQL add_subscriptions.sql.",
                StatusCodes.Status404NotFound
            );
        }

        return updated;
    }

    private async Task InsertPaymentAsync(
        string userId,
        string plan,
        int months,
        int amountKzt,
        Guid? paymentMethodId,
        CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(
            HttpMethod.Post,
            "/rest/v1/subscription_payments",
            new
            {
                user_id = userId,
                plan,
                months,
                amount_kzt = amountKzt,
                payment_method_id = paymentMethodId,
            }
        );
        request.Headers.Add("Prefer", "return=minimal");
        await httpClient.SendAsync(request, cancellationToken);
    }

    private async Task<List<T>?> QueryAsync<T>(string path, CancellationToken cancellationToken)
    {
        using var request = CreateSecretRequest(HttpMethod.Get, path);
        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);

            if (detail.Contains("subscription_plan", StringComparison.OrdinalIgnoreCase)
                || detail.Contains("skips_today", StringComparison.OrdinalIgnoreCase))
            {
                throw new AuthServiceException(
                    "Выполните SQL: backend/sql/add_subscriptions.sql в Supabase.",
                    StatusCodes.Status503ServiceUnavailable
                );
            }

            return null;
        }

        return await response.Content.ReadFromJsonAsync<List<T>>(cancellationToken: cancellationToken);
    }

    private static DateOnly ParseResetDate(ProfileSubscriptionRow row)
    {
        if (!string.IsNullOrWhiteSpace(row.SkipsResetDateRaw)
            && DateOnly.TryParse(row.SkipsResetDateRaw, out var parsed))
        {
            return parsed;
        }

        return DateOnly.FromDateTime(DateTime.UtcNow);
    }

    private HttpRequestMessage CreateSecretRequest(
        HttpMethod method,
        string path,
        object? body = null)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            throw new AuthServiceException(
                "Supabase SecretKey required.",
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

    private sealed class ProfileSubscriptionRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("subscription_plan")]
        public string? SubscriptionPlan { get; set; }

        [JsonPropertyName("subscription_expires_at")]
        public DateTimeOffset? SubscriptionExpiresAt { get; set; }

        [JsonPropertyName("skips_today")]
        public int SkipsToday { get; set; }

        [JsonPropertyName("skips_reset_date")]
        public string? SkipsResetDateRaw { get; set; }
    }

    private sealed class PromoAdRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("body")]
        public string? Body { get; set; }

        [JsonPropertyName("image_url")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("logo_url")]
        public string? LogoUrl { get; set; }

        [JsonPropertyName("play_music")]
        public bool PlayMusic { get; set; }

        [JsonPropertyName("music_url")]
        public string? MusicUrl { get; set; }

        [JsonPropertyName("duration_seconds")]
        public int DurationSeconds { get; set; }
    }

    private sealed class TrackFileRow
    {
        [JsonPropertyName("audio_url")]
        public string? AudioUrl { get; set; }

        [JsonPropertyName("file_format")]
        public string? FileFormat { get; set; }
    }

    private sealed class TrackTitleRow
    {
        [JsonPropertyName("title")]
        public string? Title { get; set; }
    }

    private sealed class FamilyMemberRow
    {
        [JsonPropertyName("owner_id")]
        public string? OwnerId { get; set; }

        [JsonPropertyName("member_id")]
        public string? MemberId { get; set; }

        [JsonPropertyName("member_username")]
        public string? MemberUsername { get; set; }

        [JsonPropertyName("added_at")]
        public DateTimeOffset AddedAt { get; set; }
    }

    private sealed class ProfileLookupRow
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("avatar_url")]
        public string? AvatarUrl { get; set; }
    }

    private sealed class PaymentMethodRow
    {
        [JsonPropertyName("id")]
        public Guid? Id { get; set; }

        [JsonPropertyName("card_brand")]
        public string? CardBrand { get; set; }

        [JsonPropertyName("last_four")]
        public string? LastFour { get; set; }

        [JsonPropertyName("exp_month")]
        public int ExpMonth { get; set; }

        [JsonPropertyName("exp_year")]
        public int ExpYear { get; set; }

        [JsonPropertyName("cardholder_name")]
        public string? CardholderName { get; set; }

        [JsonPropertyName("is_default")]
        public bool IsDefault { get; set; }
    }
}
