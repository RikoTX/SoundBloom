using System.Text;
using System.Text.Json;
using backend.Configuration;
using backend.Endpoints;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddOpenApi();
builder.Services.Configure<SupabaseSettings>(
    builder.Configuration.GetSection(SupabaseSettings.SectionName)
);
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection(AppSettings.SectionName));
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection(SmtpSettings.SectionName));

var supabaseSettings = builder.Configuration.GetSection(SupabaseSettings.SectionName).Get<SupabaseSettings>()
    ?? throw new InvalidOperationException("Supabase settings are missing from configuration.");

if (string.IsNullOrWhiteSpace(supabaseSettings.Url))
{
    throw new InvalidOperationException("Supabase:Url is required.");
}

if (string.IsNullOrWhiteSpace(supabaseSettings.PublishableKey))
{
    throw new InvalidOperationException("Supabase:PublishableKey is required.");
}

if (!string.IsNullOrWhiteSpace(supabaseSettings.SecretKey)
    && supabaseSettings.SecretKey.StartsWith("sb_publishable_", StringComparison.Ordinal))
{
    throw new InvalidOperationException(
        "Supabase:SecretKey must be the secret key (sb_secret_...), not the publishable key."
    );
}

if (string.IsNullOrWhiteSpace(supabaseSettings.SecretKey))
{
    Console.WriteLine(
        "WARNING: Supabase:SecretKey is missing. Registration will use public signup and may hit rate limits."
    );
}

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt settings are missing from configuration.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters long.");
}

builder.Services.AddHttpClient<SupabaseAuthService>();
builder.Services.AddHttpClient<UserLibraryService>();
builder.Services.AddHttpClient<TranslationService>();
builder.Services.AddHttpClient<AdminService>();
builder.Services.AddHttpClient<ArtistService>();
builder.Services.AddHttpClient<OperatorService>();
builder.Services.AddHttpClient<CatalogService>();
builder.Services.AddHttpClient<TrackAnalyticsService>();
builder.Services.AddSingleton<AdminLogStore>();
builder.Services.AddSingleton<UserInviteEmailService>();
builder.Services.AddSingleton<JwtTokenService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 30 * 1024 * 1024;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapLibraryEndpoints();
app.MapI18nEndpoints();
app.MapAdminEndpoints();
app.MapArtistEndpoints();
app.MapOperatorEndpoints();
app.MapCatalogEndpoints();

var adminLogs = app.Services.GetRequiredService<AdminLogStore>();
adminLogs.Add("info", "system", "SoundBloom admin API ready", "system");

app.Run();
