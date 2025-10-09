using Utils.Enums;

namespace Utils
{
    public static class Environment
    {
        public static string Name => System.Environment.GetEnvironmentVariable("ENVIRONMENT") ?? "Development";

        public static EnvironmentEnum Type => Name switch
        {
            "Development" => EnvironmentEnum.Development,
            "Testing" => EnvironmentEnum.Testing,
            "Production" => EnvironmentEnum.Production,
            _ => throw new Exception($"Environment {Type} unknown.")
        };

        public static bool IsDevelopment => Type == EnvironmentEnum.Development;

        public static bool IsTesting => Type == EnvironmentEnum.Testing;

        public static bool IsProduction => Type == EnvironmentEnum.Production;

        public static string CosmosDBEndpoint => IsDevelopment ?
            Constants.COSMOS_DB_EMULATOR_ENDPOINT :
            System.Environment.GetEnvironmentVariable("COSMOS_DB_ENDPOINT") ??
            throw new Exception("Environment variable 'COSMOS_DB_ENDPOINT' missing.");

        public static string CosmosDBKey => IsDevelopment ?
            Constants.COSMOS_DB_EMULATOR_KEY :
            System.Environment.GetEnvironmentVariable("COSMOS_DB_KEY") ??
            throw new Exception("Environment variable 'COSMOS_DB_KEY' missing.");
    }
}
