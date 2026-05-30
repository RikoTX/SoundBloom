namespace backend.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = "SoundBloom";

    public string Audience { get; set; } = "SoundBloom";

    public int ExpirationDays { get; set; } = 7;
}
