using System.Security.Claims;
using backend.Dtos;
using backend.Extensions;
using backend.Services;

namespace backend.Endpoints;

public static class CatalogEndpoints
{
    public static RouteGroupBuilder MapCatalogEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/catalog");

        group.MapGet("/tracks", SearchTracksAsync);
        group.MapGet("/tracks/featured", FeaturedTracksAsync);
        group.MapPost("/tracks/{trackId}/listen", RecordListenAsync);

        return group;
    }

    private static async Task<IResult> SearchTracksAsync(
        string? q,
        int? limit,
        CatalogService catalog,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Results.Ok(Array.Empty<CatalogTrackResponse>());
        }

        try
        {
            var tracks = await catalog.SearchAsync(q, limit ?? 20, cancellationToken);
            return Results.Ok(tracks);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> FeaturedTracksAsync(
        string? order,
        int? limit,
        string? tag,
        CatalogService catalog,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var normalizedOrder = string.Equals(order, "recent", StringComparison.OrdinalIgnoreCase)
                ? "recent"
                : "popular";

            var tracks = !string.IsNullOrWhiteSpace(tag)
                ? await catalog.ListByTagAsync(tag, limit ?? 14, cancellationToken)
                : await catalog.ListFeaturedAsync(normalizedOrder, limit ?? 14, cancellationToken);

            return Results.Ok(tracks);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RecordListenAsync(
        string trackId,
        RecordListenRequest? request,
        ClaimsPrincipal user,
        TrackAnalyticsService analytics,
        CancellationToken cancellationToken
    )
    {
        var listenerKey = request?.ListenerKey?.Trim();
        if (string.IsNullOrWhiteSpace(listenerKey))
        {
            return Results.BadRequest(new { message = "listenerKey is required." });
        }

        try
        {
            var userId = user.Identity?.IsAuthenticated == true ? user.GetUserId() : null;
            await analytics.RecordListenAsync(trackId, userId, listenerKey, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
