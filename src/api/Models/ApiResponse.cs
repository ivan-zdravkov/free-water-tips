namespace FreeWaterTips.Api.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ApiError
{
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public int Code { get; set; }
}

public class HealthResponse
{
    public string Status { get; set; } = "healthy";
    public string Version { get; set; } = "1.0.0";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Environment { get; set; } = "development";
    public double UptimeSeconds { get; set; }
    public Dictionary<string, string> Services { get; set; } = new();
}

public class StatsResponse
{
    public int TotalLocations { get; set; }
    public int VerifiedLocations { get; set; }
    public int ActiveLocations { get; set; }
    public Dictionary<string, int> LocationsByType { get; set; } = new();
    public int AccessibleLocations { get; set; }
    public int AlwaysAvailableLocations { get; set; }
    public double AverageRating { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
