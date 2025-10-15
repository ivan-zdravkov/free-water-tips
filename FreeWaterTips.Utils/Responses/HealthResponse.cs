namespace FreeWaterTips.Utils.Responses
{
    public class HealthResponse
    {
        public string Status { get; } = "Healthy";
        public DateTime Timestamp { get; } = DateTime.UtcNow;
        public string Environment { get; }
        public string AzureFunctionsEndpoint { get; }
        public string CosmosDBEndpoint { get; }

        public HealthResponse(string environment, string azureFunctionsEndpoint, string cosmosDBEndpoint)
        {
            Environment = environment;
            AzureFunctionsEndpoint = azureFunctionsEndpoint;
            CosmosDBEndpoint = cosmosDBEndpoint;
        }
    }
}
