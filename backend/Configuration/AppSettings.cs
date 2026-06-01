namespace backend.Configuration;

public class AppSettings
{
    public const string SectionName = "App";

    /// <summary>Public URL of the React app (with trailing path base if any).</summary>
    public string FrontendUrl { get; set; } = "http://localhost:5173/SoundBloom";
}
