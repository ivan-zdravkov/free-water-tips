using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Environment = FreeWaterTips.Utils.Environment;

namespace FreeWaterTips.DB.Cosmos
{
    public class Client
    {
        private readonly ILogger<Client> logger;
        private readonly CosmosClient cosmos;

        public Client(ILogger<Client> logger)
        {
            this.logger = logger;
            this.cosmos = new CosmosClient(Environment.CosmosDBEndpoint, Environment.CosmosDBKey);
        }

        public async Task Initialize()
        {

        }

        public async Task<bool> IsConnected()
        {
            try
            {
                AccountProperties account = await cosmos.ReadAccountAsync();

                return account != null;
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, "Cosmos DB connection check failed.");

                return false;
            }
        }
    }
}
