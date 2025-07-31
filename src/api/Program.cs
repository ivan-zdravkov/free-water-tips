using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using FreeWaterTips.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Configure Cosmos DB
        var cosmosEndpoint = Environment.GetEnvironmentVariable("COSMOS_ENDPOINT");
        var cosmosKey = Environment.GetEnvironmentVariable("COSMOS_KEY");
        var cosmosDatabaseName = Environment.GetEnvironmentVariable("COSMOS_DATABASE_NAME");
        
        if (!string.IsNullOrEmpty(cosmosEndpoint) && !string.IsNullOrEmpty(cosmosKey))
        {
            services.AddSingleton<CosmosClient>(serviceProvider =>
            {
                return new CosmosClient(cosmosEndpoint, cosmosKey, new CosmosClientOptions()
                {
                    SerializerOptions = new CosmosSerializationOptions()
                    {
                        PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                    }
                });
            });

            services.AddSingleton<Database>(serviceProvider =>
            {
                var cosmosClient = serviceProvider.GetRequiredService<CosmosClient>();
                return cosmosClient.GetDatabase(cosmosDatabaseName);
            });

            services.AddSingleton<Container>(serviceProvider =>
            {
                var database = serviceProvider.GetRequiredService<Database>();
                var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_NAME") ?? "Locations";
                return database.GetContainer(containerName);
            });
        }
        
        // Add custom services here
        services.AddSingleton<ILocationService, LocationService>();
        services.AddSingleton<IStatsService, StatsService>();
    })
    .ConfigureLogging(logging =>
    {
        logging.Services.Configure<LoggerFilterOptions>(options =>
        {
            LoggerFilterRule? defaultRule = options.Rules.FirstOrDefault(rule => rule.ProviderName
                == "Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider");
            if (defaultRule is not null)
            {
                options.Rules.Remove(defaultRule);
            }
        });
    })
    .Build();

host.Run();
