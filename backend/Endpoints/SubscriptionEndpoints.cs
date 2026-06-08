using backend.Dtos;
using backend.Extensions;
using backend.Services;

namespace backend.Endpoints;

public static class SubscriptionEndpoints
{
    public static void MapSubscriptionEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/subscription").RequireAuthorization();

        group.MapGet("/status", GetStatusAsync);
        group.MapGet("/payment-methods", GetPaymentMethodsAsync);
        group.MapPost("/skip", RecordSkipAsync);
        group.MapPost("/checkout", FakeCheckoutAsync);
        group.MapPost("/cancel", CancelSubscriptionAsync);
        group.MapGet("/tracks/{trackId}/download", DownloadTrackAsync);
        group.MapGet("/family", GetFamilyAsync);
        group.MapGet("/family/search", SearchFamilyUsersAsync);
        group.MapPost("/family/members", AddFamilyMemberAsync);
        group.MapDelete("/family/members/{memberId}", RemoveFamilyMemberAsync);
    }

    private static async Task<IResult> GetFamilyAsync(
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.GetFamilyAsync(userId, cancellationToken);
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> SearchFamilyUsersAsync(
        string q,
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.SearchUsersForFamilyAsync(userId, q, cancellationToken);
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> AddFamilyMemberAsync(
        AddFamilyMemberRequest request,
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.AddFamilyMemberAsync(
                userId,
                request.Username,
                cancellationToken
            );
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RemoveFamilyMemberAsync(
        string memberId,
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            await subscription.RemoveFamilyMemberAsync(userId, memberId, cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetStatusAsync(
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var status = await subscription.GetStatusAsync(userId, cancellationToken);
            return Results.Ok(status);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> GetPaymentMethodsAsync(
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var methods = await subscription.GetPaymentMethodsAsync(userId, cancellationToken);
            return Results.Ok(methods);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> RecordSkipAsync(
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.RecordSkipAsync(userId, cancellationToken);
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> FakeCheckoutAsync(
        FakeCheckoutRequest request,
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.FakeCheckoutAsync(userId, request, cancellationToken);
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CancelSubscriptionAsync(
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.CancelSubscriptionAsync(userId, cancellationToken);
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> DownloadTrackAsync(
        string trackId,
        System.Security.Claims.ClaimsPrincipal user,
        SubscriptionService subscription,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await subscription.GetDownloadAsync(userId, trackId, cancellationToken);
            return Results.Ok(result);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
