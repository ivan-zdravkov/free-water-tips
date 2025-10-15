using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Environment = FreeWaterTips.Utils.Environment;

#pragma warning disable CS8603
namespace FreeWaterTips.Shared.Services
{
    public interface IAzureFunctionsApiService
    {
        Task<T> GetAsync<T>(string endpoint);
        Task<T> PostAsync<T>(string endpoint, object data);
        Task<T> PutAsync<T>(string endpoint, object data);
        Task DeleteAsync(string endpoint);
    }


    public class AzureFunctionsApiService : IAzureFunctionsApiService
    {
        private readonly HttpClient httpClient;

        public AzureFunctionsApiService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
            this.httpClient.BaseAddress = new Uri(Environment.AzureFunctionsEndpoint);
        }

        public async Task<T> GetAsync<T>(string endpoint)
        {
            HttpResponseMessage response = (await this.httpClient.GetAsync(endpoint)).EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<T>(json);
        }

        public async Task<T> PostAsync<T>(string endpoint, object data)
        {
            StringContent content = new (
                JsonSerializer.Serialize(data),
                Encoding.UTF8,
                "application/json"
            );
            HttpResponseMessage response = (await this.httpClient.PostAsync(endpoint, content)).EnsureSuccessStatusCode();
            string json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(json);
        }

        public async Task<T> PutAsync<T>(string endpoint, object data)
        {
            StringContent content = new (
                JsonSerializer.Serialize(data),
                Encoding.UTF8,
                "application/json"
            );
            HttpResponseMessage response = (await this.httpClient.PutAsync(endpoint, content)).EnsureSuccessStatusCode();
            string json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(json);
        }

        public async Task DeleteAsync(string endpoint)
        {
            (await this.httpClient.DeleteAsync(endpoint)).EnsureSuccessStatusCode();
        }
    }
}
#pragma warning restore CS8603
