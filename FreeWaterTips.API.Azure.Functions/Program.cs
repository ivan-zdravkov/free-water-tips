using FreeWaterTips.DB.Cosmos;
using FreeWaterTips.API.Azure.Functions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

builder.Services.AddScoped<Health>();
builder.Services.AddScoped<Initialize>();

builder.Services.AddSingleton<Client>();

builder.Build().Run();
