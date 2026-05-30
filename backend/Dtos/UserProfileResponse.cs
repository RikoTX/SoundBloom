namespace backend.Dtos;

public record UserProfileResponse(
    string UserId,
    string Email,
    string Username,
    string Role,
    string? AvatarUrl
);

public record UpdateAvatarRequest(string AvatarData);
