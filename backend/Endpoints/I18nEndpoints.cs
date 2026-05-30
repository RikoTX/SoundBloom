using backend.Services;

namespace backend.Endpoints;

public static class I18nEndpoints
{
    public static RouteGroupBuilder MapI18nEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/i18n");

        group.MapGet("/locales", GetLocales);
        group.MapGet("/{locale}", GetTranslationsAsync);

        return group;
    }

    private static IResult GetLocales(TranslationService translations)
    {
        return Results.Ok(translations.GetSupportedLocales());
    }

    private static async Task<IResult> GetTranslationsAsync(
        string locale,
        TranslationService translations,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var data = await translations.GetTranslationsAsync(locale, cancellationToken);
            return Results.Ok(new { locale = TranslationService.NormalizeLocale(locale), translations = data });
        }
        catch (AuthServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
