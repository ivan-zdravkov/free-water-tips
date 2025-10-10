using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace AzureFunctions;

public class Initialize
{
    private readonly ILogger<Initialize> logger;
    private readonly DB.Cosmos.Client cosmosClient;

    public Initialize(ILogger<Initialize> logger, DB.Cosmos.Client cosmosClient)
    {
        this.logger = logger;
        this.cosmosClient = cosmosClient;
    }

    [Function("Initialize")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
    {
        this.logger.LogInformation("Initiating Functions...");

        await this.cosmosClient.Initialize();

        this.logger.LogInformation("Functions initialized.");

        return new OkObjectResult($"Welcome to Azure Functions!");
    }
}