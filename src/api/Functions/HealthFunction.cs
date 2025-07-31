using System.Net;
using FreeWaterTips.Api.Models;
using FreeWaterTips.Api.Utils;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace FreeWaterTips.Api.Functions;

public class HealthFunction
{
    private readonly ILogger<HealthFunction> logger;
    private static readonly DateTime StartTime = DateTime.UtcNow;

    public HealthFunction(ILogger<HealthFunction> logger)
    {
        this.logger = logger;
    }

    [Function("Health")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] 
        HttpRequestData req)
    {
        logger.LogInformation("Health check requested");

        try
        {
            var healthData = new HealthResponse
            {
                Status = "healthy",
                Version = "1.0.0",
                Timestamp = DateTime.UtcNow,
                Environment = Environment.GetEnvironmentVariable("AZURE_FUNCTIONS_ENVIRONMENT") ?? "development",
                UptimeSeconds = (DateTime.UtcNow - StartTime).TotalSeconds,
                Services = new Dictionary<string, string>
                {
                    ["api"] = "healthy",
                    ["database"] = "not_implemented" // Will be updated when data layer is implemented
                }
            };

            return await HttpResponseHelper.CreateSuccessResponseAsync(req, healthData);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Health check failed");
            return await HttpResponseHelper.CreateErrorResponseAsync(req, "Health check failed", HttpStatusCode.InternalServerError, ex.Message);
        }
    }
}
