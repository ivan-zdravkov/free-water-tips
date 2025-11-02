namespace FreeWaterTips.Utils.Responses
{
    public class HealthResponse
    {
        public string Status { get; } = "Healthy";
        public DateTime Timestamp { get; } = DateTime.UtcNow;
        public string Environment { get; }
        public bool CosmosConnected { get; }

        public HealthResponse(string environment, bool cosmosConnected)
        {
            Environment = environment;
            CosmosConnected = cosmosConnected;
        }
    }
}
