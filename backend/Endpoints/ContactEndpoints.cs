using backend.Dtos;
using backend.Services;

namespace backend.Endpoints;

public static class ContactEndpoints
{
    public static void MapContactEndpoints(this WebApplication app)
    {
        app.MapPost("/api/contact", SubmitContactAsync)
            .AllowAnonymous()
            .DisableAntiforgery();
    }

    private static async Task<IResult> SubmitContactAsync(
        ContactFormRequest request,
        ContactMessageService contactMessages,
        ContactEmailService contactEmail,
        CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim() ?? "";
        var email = request.Email?.Trim() ?? "";
        var message = request.Message?.Trim() ?? "";

        if (name.Length < 2)
        {
            return Results.BadRequest(new { message = "Укажите имя (минимум 2 символа)." });
        }

        if (!email.Contains('@') || !email.Contains('.'))
        {
            return Results.BadRequest(new { message = "Укажите корректный email." });
        }

        if (message.Length < 10)
        {
            return Results.BadRequest(new { message = "Сообщение слишком короткое (минимум 10 символов)." });
        }

        if (name.Length > 120 || email.Length > 254 || message.Length > 5000)
        {
            return Results.BadRequest(new { message = "Слишком длинное сообщение." });
        }

        try
        {
            await contactMessages.SaveAsync(name, email, message, cancellationToken);

            if (contactEmail.CanSend)
            {
                try
                {
                    await contactEmail.SendAsync(name, email, message, cancellationToken);
                }
                catch
                {
                    // Сообщение уже в БД — не ломаем ответ пользователю.
                }
            }

            return Results.Ok(new ContactFormResponse("Сообщение отправлено. Спасибо!"));
        }
        catch (ContactServiceException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: ex.StatusCode);
        }
        catch (Exception)
        {
            return Results.Json(
                new { message = "Не удалось отправить. Проверьте backend и Supabase." },
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
