using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Dtos;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", RegisterAsync);
        group.MapPost("/verify-email", VerifyEmailAsync);
        group.MapPost("/resend-code", ResendCodeAsync);
        group.MapPost("/login", LoginAsync);
        group.MapGet("/username/check", CheckUsernameAsync);
        group.MapPost("/username", SetUsernameAsync).RequireAuthorization();
        group.MapGet("/me", GetMeAsync).RequireAuthorization();
        group.MapPut("/avatar", UpdateAvatarAsync).RequireAuthorization();
        group.MapDelete("/avatar", RemoveAvatarAsync).RequireAuthorization();
        group.MapPost("/change-password", ChangePasswordAsync).RequireAuthorization();

        return group;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await authService.RegisterAsync(request, cancellationToken);
            return Results.Json(response, statusCode: StatusCodes.Status202Accepted);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> VerifyEmailAsync(
        VerifyEmailRequest request,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await authService.VerifyEmailAsync(request, cancellationToken);
            return Results.Ok(response);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> ResendCodeAsync(
        ResendCodeRequest request,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await authService.ResendCodeAsync(request, cancellationToken);
            return Results.Ok(response);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await authService.LoginAsync(request, cancellationToken);
            return Results.Ok(response);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CheckUsernameAsync(
        string username,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var response = await authService.CheckUsernameAsync(username, cancellationToken);
            return Results.Ok(response);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> SetUsernameAsync(
        SetUsernameRequest request,
        ClaimsPrincipal user,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Json(
                new { message = "Invalid session." },
                statusCode: StatusCodes.Status401Unauthorized
            );
        }

        try
        {
            var response = await authService.SetUsernameAsync(userId, request, cancellationToken);
            return Results.Ok(response);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetMeAsync(
        ClaimsPrincipal user,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        var profile = await authService.GetUserProfileAsync(userId, cancellationToken);

        if (profile is null)
        {
            return Results.NotFound(new { message = "Profile not found." });
        }

        return Results.Ok(profile);
    }

    private static async Task<IResult> UpdateAvatarAsync(
        UpdateAvatarRequest request,
        ClaimsPrincipal user,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var profile = await authService.UpdateAvatarAsync(
                userId,
                request.AvatarData,
                cancellationToken
            );
            return Results.Ok(profile);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> ChangePasswordAsync(
        ChangePasswordRequest request,
        ClaimsPrincipal user,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var response = await authService.ChangePasswordAsync(userId, request, cancellationToken);
            return Results.Ok(response);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RemoveAvatarAsync(
        ClaimsPrincipal user,
        SupabaseAuthService authService,
        CancellationToken cancellationToken
    )
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var profile = await authService.RemoveAvatarAsync(userId, cancellationToken);
            return Results.Ok(profile);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
