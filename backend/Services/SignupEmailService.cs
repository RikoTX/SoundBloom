using System.Net;
using System.Net.Mail;
using backend.Configuration;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class SignupEmailService(IOptions<SmtpSettings> smtpOptions)
{
    private readonly SmtpSettings _smtp = smtpOptions.Value;

    public bool CanSend =>
        _smtp.IsConfigured && !string.IsNullOrWhiteSpace(_smtp.User) && !string.IsNullOrWhiteSpace(_smtp.Password);

    public async Task SendVerificationCodeAsync(
        string toEmail,
        string code,
        CancellationToken cancellationToken)
    {
        if (!CanSend)
        {
            throw new AuthServiceException(
                "Почта не настроена. Добавьте блок Smtp в backend/appsettings.local.json (Gmail + пароль приложения).",
                StatusCodes.Status503ServiceUnavailable);
        }

        var subject = "SoundBloom — код подтверждения";
        var body =
            $"""
            Здравствуйте!

            Ваш код для регистрации на SoundBloom: {code}

            Код действует 15 минут.
            Если вы не регистрировались, проигнорируйте это письмо.
            """;

        using var message = new MailMessage(_smtp.From, toEmail, subject, body);
        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
        };

        if (!string.IsNullOrWhiteSpace(_smtp.User))
        {
            client.Credentials = new NetworkCredential(_smtp.User, _smtp.Password);
        }

        await client.SendMailAsync(message, cancellationToken);
    }
}
