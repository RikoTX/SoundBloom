using System.Security.Claims;
using backend.Constants;
using backend.Dtos;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Endpoints;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin").RequireAuthorization();

        group.MapGet("/users", GetUsersAsync);
        group.MapPatch("/users/{userId}/role", UpdateUserRoleAsync);
        group.MapPatch("/users/{userId}", UpdateUserAsync);
        group.MapDelete("/users/{userId}", DeleteUserAsync);
        group.MapGet("/stats", GetStatsAsync);
        group.MapGet("/logs", GetLogsAsync);
        group.MapGet("/translations", GetTranslationsAsync);
        group.MapPut("/translations", UpsertTranslationAsync);
        group.MapPost("/translations", CreateTranslationKeyAsync);
        group.MapDelete("/translations/{key}/{locale}", DeleteTranslationAsync);

        return group;
    }

    private static async Task<IResult> GetUsersAsync(
        ClaimsPrincipal user,
        AdminService admin,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            admin.LogAccess(GetActor(user), "users");
            var users = await admin.GetUsersAsync(cancellationToken);
            return Results.Ok(users);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> UpdateUserRoleAsync(
        string userId,
        UpdateUserRoleRequest request,
        ClaimsPrincipal user,
        AdminService admin,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            await admin.UpdateUserRoleAsync(userId, request.Role, GetActor(user), cancellationToken);
            return Results.Ok(new { message = "Role updated." });
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> UpdateUserAsync(
        string userId,
        AdminUpdateUserRequest request,
        ClaimsPrincipal user,
        AdminService admin,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            var updated = await admin.UpdateUserAsync(
                userId,
                request,
                GetActor(user),
                cancellationToken
            );
            return Results.Ok(updated);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> DeleteUserAsync(
        string userId,
        ClaimsPrincipal user,
        AdminService admin,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        var actorUserId = user.GetUserId();
        if (string.IsNullOrWhiteSpace(actorUserId))
        {
            return Results.Unauthorized();
        }

        try
        {
            await admin.DeleteUserAsync(userId, actorUserId, GetActor(user), cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetStatsAsync(
        ClaimsPrincipal user,
        AdminService admin,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            admin.LogAccess(GetActor(user), "stats");
            var stats = await admin.GetStatsAsync(cancellationToken);
            return Results.Ok(stats);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static IResult GetLogsAsync(
        ClaimsPrincipal user,
        AdminService admin,
        int? limit
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        admin.LogAccess(GetActor(user), "logs");
        return Results.Ok(admin.GetLogs(limit ?? 100));
    }

    private static async Task<IResult> GetTranslationsAsync(
        ClaimsPrincipal user,
        TranslationService translations,
        AdminService admin,
        string? search,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            admin.LogAccess(GetActor(user), "translations");
            var rows = await translations.GetAdminTranslationsAsync(search, cancellationToken);
            return Results.Ok(rows);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> UpsertTranslationAsync(
        UpsertTranslationRequest request,
        ClaimsPrincipal user,
        TranslationService translations,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            await translations.UpsertTranslationAsync(request, GetActor(user), cancellationToken);
            return Results.Ok(new { message = "Translation saved." });
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CreateTranslationKeyAsync(
        CreateTranslationKeyRequest request,
        ClaimsPrincipal user,
        TranslationService translations,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            await translations.CreateTranslationKeyAsync(request, GetActor(user), cancellationToken);
            return Results.Ok(new { message = "Translation key created." });
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> DeleteTranslationAsync(
        string key,
        string locale,
        ClaimsPrincipal user,
        TranslationService translations,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            await translations.DeleteTranslationAsync(
                Uri.UnescapeDataString(key),
                locale,
                GetActor(user),
                cancellationToken
            );
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static bool IsAdmin(ClaimsPrincipal user) =>
        string.Equals(user.FindFirstValue("role"), AppRoles.Admin, StringComparison.OrdinalIgnoreCase);

    private static string GetActor(ClaimsPrincipal user) =>
        user.FindFirstValue("username")
        ?? user.FindFirstValue(ClaimTypes.Email)
        ?? user.GetUserId()
        ?? "admin";

    private static IResult Forbidden() =>
        Results.Json(new { message = "Admin access required." }, statusCode: StatusCodes.Status403Forbidden);
}
