namespace backend.Dtos;

public record AdminUserResponse(
    string Id,
    string Email,
    string Username,
    bool UsernameSet,
    string Role,
    string? AvatarUrl,
    DateTimeOffset? CreatedAt
);

public record AdminStatsResponse(
    int Users,
    int Admins,
    int TranslationKeys,
    int TranslationRows,
    int LikedTracks,
    int SavedAlbums,
    int SavedGenres,
    int SavedPlaylists
);

public record AdminLogEntry(
    string Id,
    DateTimeOffset At,
    string Level,
    string Category,
    string Message,
    string? Actor
);

public record AdminTranslationRow(
    string Key,
    string Namespace,
    string? En,
    string? Ru,
    string? Kk
);

public record UpsertTranslationRequest(
    string Key,
    string Locale,
    string Value,
    string? Namespace
);

public record CreateTranslationKeyRequest(
    string Key,
    string? En,
    string? Ru,
    string? Kk,
    string? Namespace
);

public record UpdateUserRoleRequest(string Role);

public record AdminUpdateUserRequest(
    string? Username,
    string? Role,
    string? AvatarData,
    bool ClearAvatar = false
);
