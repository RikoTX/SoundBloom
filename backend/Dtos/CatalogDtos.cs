namespace backend.Dtos;

public record CatalogTrackResponse(
    string Id,
    string Title,
    string Artist,
    string? Cover,
    string AudioUrl,
    string Source,
    int DurationSeconds,
    string Time,
    string? Album
);
