using System.Net;
using System.Net.Mail;
using backend.Configuration;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class ContactEmailService(
    IOptions<SmtpSettings> smtpOptions,
    IOptions<ContactSettings> contactOptions)
{
    private readonly SmtpSettings _smtp = smtpOptions.Value;
    private readonly ContactSettings _contact = contactOptions.Value;

    public bool CanSend => _smtp.IsConfigured && !string.IsNullOrWhiteSpace(GetInbox());

    public async Task SendAsync(
        string name,
        string email,
        string message,
        CancellationToken cancellationToken)
    {
        if (!CanSend)
        {
            throw new ContactServiceException(
                "Contact form email is not configured. Set Smtp and Contact:ToEmail in appsettings.local.json.",
                StatusCodes.Status503ServiceUnavailable);
        }

        var inbox = GetInbox();
        var subject = $"SoundBloom — сообщение от {name.Trim()}";
        var body =
            $"""
            Новое сообщение с формы «Контакты» SoundBloom

            Имя: {name.Trim()}
            Email: {email.Trim()}

            Сообщение:
            {message.Trim()}
            """;

        using var mail = new MailMessage
        {
            From = new MailAddress(_smtp.From, "SoundBloom"),
            Subject = subject,
            Body = body,
            IsBodyHtml = false,
        };
        mail.To.Add(inbox);
        mail.ReplyToList.Add(new MailAddress(email.Trim(), name.Trim()));

        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
        };

        if (!string.IsNullOrWhiteSpace(_smtp.User))
        {
            client.Credentials = new NetworkCredential(_smtp.User, _smtp.Password);
        }

        await client.SendMailAsync(mail, cancellationToken);
    }

    private string GetInbox() =>
        string.IsNullOrWhiteSpace(_contact.ToEmail) ? _smtp.From : _contact.ToEmail.Trim();
}

public class ContactServiceException(string message, int statusCode = StatusCodes.Status400BadRequest)
    : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
