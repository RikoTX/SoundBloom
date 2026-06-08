namespace backend.Dtos;

public record SubscriptionStatusResponse(
    string Plan,
    bool IsActive,
    bool CanCancel,
    DateTimeOffset? ExpiresAt,
    int SkipsToday,
    int SkipsLimit,
    int SkipsRemaining,
    bool UnlimitedSkips,
    bool NoAds,
    bool CanDownload,
    bool LosslessAudio,
    bool ExclusiveMixes,
    int FamilySlots,
    string? FamilyMixPlaylists
);

public record SkipTrackResponse(
    bool Allowed,
    bool ShowAd,
    int SkipsToday,
    int SkipsLimit,
    PromoAdDto? Ad
);

public record PromoAdDto(
    string Id,
    string Title,
    string Body,
    string? ImageUrl,
    string? LogoUrl,
    bool PlayMusic,
    string? MusicUrl,
    int DurationSeconds
);

public record NewCardPaymentDto(
    string CardholderName,
    string LastFour,
    string Brand,
    int ExpMonth,
    int ExpYear
);

public record FakeCheckoutRequest(
    string Plan,
    int Months = 1,
    Guid? PaymentMethodId = null,
    bool SaveCard = true,
    NewCardPaymentDto? NewCard = null,
    string? PromoCode = null
);

public record FakeCheckoutResponse(
    string Message,
    string Plan,
    DateTimeOffset ExpiresAt,
    PaymentMethodDto? PaymentMethod
);

public record PaymentMethodDto(
    Guid Id,
    string Brand,
    string LastFour,
    int ExpMonth,
    int ExpYear,
    string CardholderName,
    bool IsDefault
);

public record CancelSubscriptionResponse(
    string Message,
    string Plan,
    SubscriptionStatusResponse Status
);

public record TrackDownloadResponse(string DownloadUrl, string Title, string Format);

public record FamilyMemberDto(
    string UserId,
    string Username,
    string? AvatarUrl,
    DateTimeOffset AddedAt
);

public record FamilyInfoDto(
    bool IsOwner,
    bool IsMember,
    string Plan,
    int Slots,
    int Used,
    string? ManagedByUsername,
    IReadOnlyList<FamilyMemberDto> Members
);

public record AddFamilyMemberRequest(string Username);

public record UserSearchDto(string UserId, string Username, string? AvatarUrl);
