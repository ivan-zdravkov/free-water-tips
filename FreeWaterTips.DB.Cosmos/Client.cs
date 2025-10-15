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
    }
}
