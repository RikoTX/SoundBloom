using System.Security.Claims;
using backend.Constants;
using backend.Dtos;
using backend.Extensions;
using backend.Services;

namespace backend.Endpoints;

public static class PromoEndpoints
{
    public static void MapPromoEndpoints(this WebApplication app)
    {
        var admin = app.MapGroup("/api/admin/promos").RequireAuthorization();

        admin.MapGet("", GetPromosAsync);
        admin.MapPost("", CreatePromoAsync);
        admin.MapPatch("/{id}", UpdatePromoAsync);
        admin.MapDelete("/{id}", DeletePromoAsync);

        var user = app.MapGroup("/api/subscription/promo").RequireAuthorization();
        user.MapPost("/validate", ValidatePromoAsync);
    }

    private static async Task<IResult> GetPromosAsync(
        ClaimsPrincipal user,
        PromoService promos,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            return Results.Ok(await promos.GetPromosAsync(cancellationToken));
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> CreatePromoAsync(
        CreatePromoRequest request,
        ClaimsPrincipal user,
        PromoService promos,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            var created = await promos.CreatePromoAsync(request, GetActor(user), cancellationToken);
            return Results.Ok(created);
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> UpdatePromoAsync(
        string id,
        UpdatePromoRequest request,
        ClaimsPrincipal user,
        PromoService promos,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            await promos.UpdatePromoAsync(id, request, GetActor(user), cancellationToken);
            return Results.Ok(new { message = "Promo updated." });
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> DeletePromoAsync(
        string id,
        ClaimsPrincipal user,
        PromoService promos,
        CancellationToken cancellationToken
    )
    {
        if (!IsAdmin(user)) return Forbidden();

        try
        {
            await promos.DeletePromoAsync(id, GetActor(user), cancellationToken);
            return Results.NoContent();
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }

    private static async Task<IResult> ValidatePromoAsync(
        ValidatePromoRequest request,
        ClaimsPrincipal user,
        PromoService promos,
        CancellationToken cancellationToken
    )
    {
        var userId = user.GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Unauthorized();
        }

        var plan = (request.Plan ?? "").Trim().ToLowerInvariant();

        try
        {
            var comp = await promos.ValidateAsync(userId, request.Code, plan, 1, cancellationToken);

            var message = comp.BonusMonths > 0
                ? $"+{comp.BonusMonths} мес. бесплатно"
                : comp.DiscountType == "percent"
                    ? $"Скидка {comp.DiscountValue:0.#}%"
                    : $"Скидка {comp.AmountBefore - comp.AmountAfter} ₸";

            return Results.Ok(new PromoValidationResponse(
                true,
                comp.Code,
                comp.DiscountType,
                comp.DiscountValue,
                comp.AmountBefore,
                comp.AmountAfter,
                comp.BonusMonths,
                message
            ));
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
