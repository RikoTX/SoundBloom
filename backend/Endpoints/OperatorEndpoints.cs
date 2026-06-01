using System.Security.Claims;
using backend.Constants;
using backend.Dtos;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Endpoints;

public static class OperatorEndpoints
{
    public static RouteGroupBuilder MapOperatorEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/operator").RequireAuthorization();

        group.MapGet("/tracks/pending", GetPendingTracksAsync);
        group.MapGet("/tracks/{trackId}", GetTrackDetailAsync);
        group.MapPost("/tracks/{trackId}/approve", ApproveTrackAsync);
        group.MapPost("/tracks/{trackId}/reject", RejectTrackAsync);

        return group;
    }

    private static bool CanModerate(ClaimsPrincipal user)
    {
        var role = user.FindFirstValue("role");
        return string.Equals(role, AppRoles.Operator, StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, AppRoles.Admin, StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<IResult> GetPendingTracksAsync(
        ClaimsPrincipal user,
        OperatorService operatorService,
        CancellationToken cancellationToken
    )
    {
        if (!CanModerate(user))
        {
            return Results.Json(new { message = "Operator access required." }, statusCode: StatusCodes.Status403Forbidden);
        }

        try
        {
            var tracks = await operatorService.GetPendingTracksAsync(cancellationToken);
            return Results.Ok(tracks);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetTrackDetailAsync(
        string trackId,
        ClaimsPrincipal user,
        OperatorService operatorService,
        CancellationToken cancellationToken
    )
    {
        if (!CanModerate(user))
        {
            return Results.Json(new { message = "Operator access required." }, statusCode: StatusCodes.Status403Forbidden);
        }

        try
        {
            var detail = await operatorService.GetTrackDetailAsync(trackId, cancellationToken);
            return Results.Ok(detail);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> ApproveTrackAsync(
        string trackId,
        ClaimsPrincipal user,
        OperatorService operatorService,
        CancellationToken cancellationToken
    )
    {
        if (!CanModerate(user))
        {
            return Results.Json(new { message = "Operator access required." }, statusCode: StatusCodes.Status403Forbidden);
        }

        try
        {
            await operatorService.ApproveTrackAsync(trackId, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RejectTrackAsync(
        string trackId,
        RejectTrackRequest request,
        ClaimsPrincipal user,
        OperatorService operatorService,
        CancellationToken cancellationToken
    )
    {
        if (!CanModerate(user))
        {
            return Results.Json(new { message = "Operator access required." }, statusCode: StatusCodes.Status403Forbidden);
        }

        try
        {
            await operatorService.RejectTrackAsync(trackId, request.Reason, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
