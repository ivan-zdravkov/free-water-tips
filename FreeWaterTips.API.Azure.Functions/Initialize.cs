using FreeWaterTips.DB.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace AzureFunctions;

public class Initialize
{
    private readonly ILogger<Initialize> logger;
    private readonly Client client;

    public Initialize(ILogger<Initialize> logger, Client client)
    {
        this.logger = logger;
        this.client = client;
    }

    [Function("Initialize")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
    {
        this.logger.LogInformation("Initiating Functions...");

        await this.client.Initialize();

        this.logger.LogInformation("Functions initialized.");

        return new OkObjectResult($"Welcome to Azure Functions!");
    }
}