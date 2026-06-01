using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public record CreateArtistRequest(
    [Required, MaxLength(120)] string Name,
    [Required, MaxLength(80)] string Genre,
    [Required, MaxLength(80)] string Country,
    [Required, MaxLength(80)] string City,
    [Required, MaxLength(120)] string ProSociety,
    [Required] bool TermsAccepted,
    [Required, MaxLength(4000)] string Description,
    string? ImageUrl,
    string? Facebook,
    string? Spotify,
    string? Twitter,
    [Required] int CareerStartYear
);

public record ArtistProfileResponse(
    string Id,
    string UserId,
    string Name,
    string Genre,
    string Country,
    string City,
    string ProSociety,
    string? Description,
    string? ImageUrl,
    int? CareerStartYear,
    ArtistSocialLinksResponse? SocialLinks
);

public record ArtistSocialLinksResponse(
    string? Facebook,
    string? Spotify,
    string? Twitter
);

public record ArtistStudioStateResponse(
    bool HasArtist,
    ArtistProfileResponse? Artist,
    IReadOnlyList<ArtistTrackListItemResponse> Tracks
);

public record ArtistTrackListItemResponse(
    string Id,
    string Title,
    string ReleaseDate,
    string Status,
    int PlayCount,
    int DownloadCount,
    string CreatedAt,
    string? CoverUrl,
    string? AudioFormat,
    string? RejectionReason
);

public record CreateArtistTrackRequest(
    [Required, MaxLength(200)] string Title,
    [Required] string ReleaseDate,
    string? ProCode,
    bool ProRelated,
    string? ProMembership,
    [Required] string AudioData,
    [Required, MaxLength(16)] string AudioFormat,
    bool IsInstrumental,
    string? LyricsText,
    string? Language,
    bool ExplicitLanguage,
    string? VocalType,
    string? CoverData,
    [Required, MaxLength(500)] string Authors,
    string? Description,
    [Required, MinLength(1), MaxLength(4)] List<string> Tags,
    string? ElectricAcoustic,
    string? Tempo,
    string? Energy,
    string? Mood,
    bool CommercialUse,
    [Required] string AllowDerivatives
);
