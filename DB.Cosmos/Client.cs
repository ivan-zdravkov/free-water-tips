using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace DB.Cosmos
{
    public class Client
    {
        private readonly ILogger<Client> logger;
        private readonly CosmosClient cosmos;

        public Client(ILogger<Client> logger)
        {
            this.logger = logger;
            this.cosmos = new CosmosClient(Utils.Environment.CosmosDBEndpoint, Utils.Environment.CosmosDBKey);
        }

        public async Task Initialize()
        {

        }
    }
}
