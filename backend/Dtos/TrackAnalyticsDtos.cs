namespace backend.Dtos;

public record RecordListenRequest(string? ListenerKey);

public record TrackDailyPlaysResponse(string Date, int Count);

public record TrackAnalyticsResponse(
    string Id,
    string Title,
    string Status,
    string? CoverUrl,
    string? AudioUrl,
    string ArtistName,
    int PlayCount,
    int DownloadCount,
    int LikeCount,
    int UniqueListeners,
    int PlaysLast7Days,
    string ReleaseDate,
    string CreatedAt,
    string? Description,
    string Authors,
    string? Genre,
    string? Mood,
    string? Energy,
    string? Tempo,
    IReadOnlyList<string> Tags,
    string? RejectionReason,
    IReadOnlyList<TrackDailyPlaysResponse> PlaysByDay
);
