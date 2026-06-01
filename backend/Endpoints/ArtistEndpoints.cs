using System.Security.Claims;
using backend.Dtos;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Endpoints;

public static class ArtistEndpoints
{
    public static RouteGroupBuilder MapArtistEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/artist").RequireAuthorization();

        group.MapGet("/studio", GetStudioAsync);
        group.MapPost("/register", RegisterArtistAsync);
        group.MapGet("/tracks", GetTracksAsync);
        group.MapPost("/tracks", CreateTrackAsync);
        group.MapDelete("/tracks/{trackId}", DeleteTrackAsync);
        group.MapGet("/tracks/{trackId}/analytics", GetTrackAnalyticsAsync);

        return group;
    }

    private static async Task<IResult> GetStudioAsync(
        ClaimsPrincipal user,
        ArtistService artistService,
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
            var state = await artistService.GetStudioStateAsync(userId, cancellationToken);
            return Results.Ok(state);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RegisterArtistAsync(
        CreateArtistRequest request,
        ClaimsPrincipal user,
        ArtistService artistService,
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
            var profile = await artistService.CreateArtistAsync(userId, request, cancellationToken);
            return Results.Ok(profile);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetTracksAsync(
        ClaimsPrincipal user,
        ArtistService artistService,
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
            var state = await artistService.GetStudioStateAsync(userId, cancellationToken);
            return Results.Ok(state.Tracks);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CreateTrackAsync(
        CreateArtistTrackRequest request,
        ClaimsPrincipal user,
        ArtistService artistService,
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
            var track = await artistService.CreateTrackAsync(userId, request, cancellationToken);
            return Results.Ok(track);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> DeleteTrackAsync(
        string trackId,
        ClaimsPrincipal user,
        ArtistService artistService,
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
            await artistService.DeleteTrackAsync(userId, trackId, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetTrackAnalyticsAsync(
        string trackId,
        ClaimsPrincipal user,
        TrackAnalyticsService analytics,
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
            var data = await analytics.GetArtistTrackAnalyticsAsync(
                trackId,
                userId,
                cancellationToken
            );
            return Results.Ok(data);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
