namespace backend.Dtos;

public record ContactFormRequest(string Name, string Email, string Message);

public record ContactFormResponse(string Message);
