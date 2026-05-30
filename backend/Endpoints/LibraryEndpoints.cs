using System.Security.Claims;
using backend.Dtos;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Endpoints;

public static class LibraryEndpoints
{
    public static RouteGroupBuilder MapLibraryEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/library").RequireAuthorization();

        group.MapGet("/likes", GetLikesAsync);
        group.MapGet("/likes/{source}/{trackId}", CheckLikeAsync);
        group.MapPost("/likes", AddLikeAsync);
        group.MapDelete("/likes/{source}/{trackId}", RemoveLikeAsync);

        group.MapGet("/albums", GetSavedAlbumsAsync);
        group.MapGet("/albums/{albumId}", CheckAlbumAsync);
        group.MapPost("/albums", SaveAlbumAsync);
        group.MapDelete("/albums/{albumId}", RemoveAlbumAsync);

        group.MapGet("/genres", GetSavedGenresAsync);
        group.MapGet("/genres/{tag}", CheckGenreAsync);
        group.MapPost("/genres", SaveGenreAsync);
        group.MapDelete("/genres/{tag}", RemoveGenreAsync);

        group.MapGet("/playlists", GetSavedPlaylistsAsync);
        group.MapGet("/playlists/{playlistId}", CheckPlaylistAsync);
        group.MapPost("/playlists", SavePlaylistAsync);
        group.MapDelete("/playlists/{playlistId}", RemovePlaylistAsync);

        return group;
    }

    private static async Task<IResult> GetLikesAsync(
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var likes = await library.GetLikesAsync(userId, cancellationToken);
            return Results.Ok(likes);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CheckLikeAsync(
        string source,
        string trackId,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var liked = await library.IsLikedAsync(userId, source, trackId, cancellationToken);
            return Results.Ok(new LikeStatusResponse(liked));
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> AddLikeAsync(
        LikeTrackRequest request,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var like = await library.AddLikeAsync(userId, request, cancellationToken);
            return Results.Ok(like);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RemoveLikeAsync(
        string source,
        string trackId,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await library.RemoveLikeAsync(userId, source, trackId, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetSavedAlbumsAsync(
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var albums = await library.GetSavedAlbumsAsync(userId, cancellationToken);
            return Results.Ok(albums);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CheckAlbumAsync(
        string albumId,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var saved = await library.IsAlbumSavedAsync(userId, albumId, cancellationToken);
            return Results.Ok(new SaveStatusResponse(saved));
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> SaveAlbumAsync(
        SaveAlbumRequest request,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var album = await library.SaveAlbumAsync(userId, request, cancellationToken);
            return Results.Ok(album);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RemoveAlbumAsync(
        string albumId,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await library.RemoveSavedAlbumAsync(userId, albumId, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetSavedGenresAsync(
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var genres = await library.GetSavedGenresAsync(userId, cancellationToken);
            return Results.Ok(genres);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CheckGenreAsync(
        string tag,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var saved = await library.IsGenreSavedAsync(userId, tag, cancellationToken);
            return Results.Ok(new SaveStatusResponse(saved));
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> SaveGenreAsync(
        SaveGenreRequest request,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var genre = await library.SaveGenreAsync(userId, request, cancellationToken);
            return Results.Ok(genre);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RemoveGenreAsync(
        string tag,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await library.RemoveSavedGenreAsync(userId, tag, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetSavedPlaylistsAsync(
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var playlists = await library.GetSavedPlaylistsAsync(userId, cancellationToken);
            return Results.Ok(playlists);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CheckPlaylistAsync(
        string playlistId,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var saved = await library.IsPlaylistSavedAsync(userId, playlistId, cancellationToken);
            return Results.Ok(new SaveStatusResponse(saved));
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> SavePlaylistAsync(
        SavePlaylistRequest request,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var playlist = await library.SavePlaylistAsync(userId, request, cancellationToken);
            return Results.Ok(playlist);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RemovePlaylistAsync(
        string playlistId,
        ClaimsPrincipal user,
        UserLibraryService library,
        CancellationToken cancellationToken
    )
    {
        var userId = GetUserId(user);
        if (userId is null) return Results.Unauthorized();

        try
        {
            await library.RemoveSavedPlaylistAsync(userId, playlistId, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static string? GetUserId(ClaimsPrincipal user) => user.GetUserId();
}
