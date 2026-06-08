namespace backend.Dtos;

public record PromoCodeDto(
    string Id,
    string Code,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    string AppliesTo,
    int? MaxRedemptions,
    int RedeemedCount,
    DateTimeOffset? StartsAt,
    DateTimeOffset? ExpiresAt,
    bool IsActive,
    DateTimeOffset? CreatedAt
);

public record CreatePromoRequest(
    string Code,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    string? AppliesTo,
    int? MaxRedemptions,
    DateTimeOffset? StartsAt,
    DateTimeOffset? ExpiresAt
);

public record UpdatePromoRequest(
    bool? IsActive,
    string? Description,
    DateTimeOffset? ExpiresAt,
    int? MaxRedemptions
);

public record ValidatePromoRequest(string Code, string Plan);

public record PromoValidationResponse(
    bool Valid,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    int AmountBefore,
    int AmountAfter,
    int BonusMonths,
    string Message
);
