namespace backend.Dtos;

public record OperatorPendingTrackResponse(
    string Id,
    string Title,
    string ReleaseDate,
    string CreatedAt,
    string ArtistName,
    string ArtistEmail,
    string? Authors,
    string? CoverUrl
);

public record OperatorTrackDetailResponse(
    string Id,
    string Title,
    string ReleaseDate,
    string Status,
    string CreatedAt,
    string ArtistName,
    string ArtistEmail,
    string? Authors,
    string? Description,
    string? CoverUrl,
    string? AudioUrl,
    string? AudioFormat,
    bool IsInstrumental,
    string? LyricsText,
    string? Language,
    bool ExplicitLanguage,
    string? VocalType,
    string? ProCode,
    bool ProRelated,
    string? ProMembership,
    string? ElectricAcoustic,
    string? Tempo,
    string? Energy,
    string? Mood,
    bool CommercialUse,
    string? AllowDerivatives,
    IReadOnlyList<string> Tags
);

public record RejectTrackRequest(string Reason);
