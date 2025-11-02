using FreeWaterTips.Utils.Responses;
using FreeWaterTips.DB.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Environment = FreeWaterTips.Utils.Environment;

namespace FreeWaterTips.API.Azure.Functions;

public class Health
{
    private readonly ILogger<Health> logger;
    private readonly Client client;

    public Health(ILogger<Health> logger, Client client)
    {
        this.logger = logger;
        this.client = client;
    }

    [Function("Health")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "health")] HttpRequest req)
    {
        return new OkObjectResult(new HealthResponse(
            environment: Environment.Name,
            cosmosConnected: await client.IsConnected()
        ));
    }
}
