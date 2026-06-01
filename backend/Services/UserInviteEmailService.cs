using System.Net;
using System.Net.Mail;
using backend.Configuration;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class UserInviteEmailService(IOptions<SmtpSettings> smtpOptions)
{
    private readonly SmtpSettings _smtp = smtpOptions.Value;

    public async Task<bool> TrySendTemporaryPasswordAsync(
        string toEmail,
        string temporaryPassword,
        DateTimeOffset expiresAt,
        string loginUrl,
        CancellationToken cancellationToken
    )
    {
        if (!_smtp.IsConfigured)
        {
            return false;
        }

        var subject = "SoundBloom — ваш доступ к аккаунту";
        var body =
            $"""
            Здравствуйте!

            Для вас создан аккаунт SoundBloom.

            Вход: {loginUrl}
            Email: {toEmail}
            Временный пароль: {temporaryPassword}

            Пароль действует до {expiresAt:dd.MM.yyyy HH:mm} UTC.
            При первом входе система попросит задать новый пароль.

            Если вы не запрашивали доступ, проигнорируйте это письмо.
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
        return true;
    }
}
