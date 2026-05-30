using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public record RegisterRequest(
    [Required, EmailAddress, MaxLength(320)] string Email,
    [Required, MinLength(6), MaxLength(128)] string Password
);

public record LoginRequest(
    [Required, EmailAddress, MaxLength(320)] string Email,
    [Required, MinLength(6), MaxLength(128)] string Password
);

public record VerifyEmailRequest(
    [Required, EmailAddress, MaxLength(320)] string Email,
    [Required, MinLength(4), MaxLength(10)] string Code
);

public record ResendCodeRequest([Required, EmailAddress, MaxLength(320)] string Email);

public record SetUsernameRequest(
    [Required, MinLength(3), MaxLength(20)] string Username
);

public record AuthResponse(
    string Token,
    string Username,
    string Email,
    bool NeedsUsername = false
);

public record MessageResponse(string Message);

public record UsernameAvailabilityResponse(bool Available, string Username);
