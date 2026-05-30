namespace backend.Dtos;

public record LikeTrackRequest(
    string TrackId,
    string Source,
    string Title,
    string? Artist,
    string? Cover,
    string AudioUrl,
    string? Album
);

public record LikedTrackResponse(
    string Id,
    string TrackId,
    string Source,
    string Title,
    string? Artist,
    string? Cover,
    string AudioUrl,
    string? Album,
    DateTime CreatedAt
);

public record SaveAlbumRequest(
    string AlbumId,
    string Title,
    string? Artist,
    string? Cover,
    int? TrackCount
);

public record SavedAlbumResponse(
    string Id,
    string AlbumId,
    string Title,
    string? Artist,
    string? Cover,
    int? TrackCount,
    DateTime CreatedAt
);

public record SaveGenreRequest(string Tag, string Label, string? Cover);

public record SavedGenreResponse(
    string Id,
    string Tag,
    string Label,
    string? Cover,
    DateTime CreatedAt
);

public record SavePlaylistRequest(
    string PlaylistId,
    string Title,
    string? Cover,
    string? UserName
);

public record SavedPlaylistResponse(
    string Id,
    string PlaylistId,
    string Title,
    string? Cover,
    string? UserName,
    DateTime CreatedAt
);

public record LikeStatusResponse(bool Liked);

public record SaveStatusResponse(bool Saved);
