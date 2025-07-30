using System.Net;
using FreeWaterTips.Api.Services;
using FreeWaterTips.Api.Utils;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace FreeWaterTips.Api.Functions;

public class StatsFunction
{
    private readonly ILogger<StatsFunction> logger;
    private readonly IStatsService _statsService;

    public StatsFunction(ILogger<StatsFunction> logger, IStatsService statsService)
    {
        logger = logger;
        _statsService = statsService;
    }

    [Function("Stats")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stats")] 
        HttpRequestData req)
    {
        logger.LogInformation("Stats requested");

        try
        {
            var stats = await _statsService.GetStatsAsync();
            return await HttpResponseHelper.CreateSuccessResponseAsync(req, stats);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch stats");
            return await HttpResponseHelper.CreateErrorResponseAsync(req, "Failed to fetch statistics", HttpStatusCode.InternalServerError, ex.Message);
        }
    }
}
