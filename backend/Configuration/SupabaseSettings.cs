namespace backend.Configuration;

public class SupabaseSettings
{
    public const string SectionName = "Supabase";

    public string Url { get; set; } = string.Empty;

    public string PublishableKey { get; set; } = string.Empty;

    public string SecretKey { get; set; } = string.Empty;
}
