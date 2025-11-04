using FreeWaterTips.Utils.Enums;

namespace FreeWaterTips.Utils
{
    public static class Environment
    {
        public static string Name => System.Environment.GetEnvironmentVariable("ENVIRONMENT") ?? String.Empty;

        public static EnvironmentEnum Type => Name switch
        {
            "Development" => EnvironmentEnum.Development,
            "Testing" => EnvironmentEnum.Testing,
            "Production" => EnvironmentEnum.Production,
            _ => EnvironmentEnum.Development
        };

        public static bool IsDevelopment => Type == EnvironmentEnum.Development;

        public static bool IsTesting => Type == EnvironmentEnum.Testing;

        public static bool IsProduction => Type == EnvironmentEnum.Production;

        public static string CosmosDBEndpoint => System.Environment.GetEnvironmentVariable("COSMOS_DB_ENDPOINT") ??
            throw new Exception("Environment variable 'COSMOS_DB_ENDPOINT' missing.");

        public static string CosmosDBKey => System.Environment.GetEnvironmentVariable("COSMOS_DB_KEY") ??
            throw new Exception("Environment variable 'COSMOS_DB_KEY' missing.");
    }
}
