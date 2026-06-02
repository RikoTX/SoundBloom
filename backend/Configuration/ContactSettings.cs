namespace backend.Configuration;

public class ContactSettings
{
    public const string SectionName = "Contact";

    /// <summary>Inbox for contact form submissions.</summary>
    public string ToEmail { get; set; } = string.Empty;
}
