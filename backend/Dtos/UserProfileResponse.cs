namespace backend.Dtos;

public record UserProfileResponse(
    string UserId,
    string Email,
    string Username,
    string Role,
    string? AvatarUrl,
    bool MustChangePassword = false
);

public record UpdateAvatarRequest(string AvatarData);
