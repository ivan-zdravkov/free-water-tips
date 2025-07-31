using System.Net;
using Newtonsoft.Json;
using FreeWaterTips.Api.Models;
using FreeWaterTips.Api.Services;
using FreeWaterTips.Api.Utils;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace FreeWaterTips.Api.Functions;

public class LocationsFunction
{
    private readonly ILogger<LocationsFunction> logger;
    private readonly ILocationService _locationService;

    public LocationsFunction(ILogger<LocationsFunction> logger, ILocationService locationService)
    {
        this.logger = logger;
        _locationService = locationService;
    }

    [Function("Locations")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "locations")] 
        HttpRequestData req)
    {
        return req.Method.ToUpperInvariant() switch
        {
            "GET" => await GetLocationsAsync(req),
            "POST" => await CreateLocationAsync(req),
            _ => await HttpResponseHelper.CreateMethodNotAllowedAsync(req)
        };
    }

    private async Task<HttpResponseData> GetLocationsAsync(HttpRequestData req)
    {
        logger.LogInformation("Get locations requested");

        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            
            var filters = new LocationFilters
            {
                Type = query["type"],
                Verified = query["verified"] != null ? bool.Parse(query["verified"]!) : null,
                Accessible = query["accessible"] != null ? bool.Parse(query["accessible"]!) : null,
                AlwaysAvailable = query["alwaysAvailable"] != null ? bool.Parse(query["alwaysAvailable"]!) : null,
                Limit = int.TryParse(query["limit"], out var limit) ? limit : 100
            };

            var locations = await _locationService.GetLocationsAsync(filters);
            var locationsList = locations.ToList();

            logger.LogInformation("Returning {Count} locations", locationsList.Count);
            return await HttpResponseHelper.CreateSuccessResponseAsync(req, locationsList);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch locations");
            return await HttpResponseHelper.CreateErrorResponseAsync(req, "Failed to fetch locations", HttpStatusCode.InternalServerError, ex.Message);
        }
    }

    private async Task<HttpResponseData> CreateLocationAsync(HttpRequestData req)
    {
        logger.LogInformation("Create location requested");

        try
        {
            var body = await req.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(body))
            {
                return await HttpResponseHelper.CreateBadRequestAsync(req, "Request body is required");
            }

            var locationRequest = JsonConvert.DeserializeObject<CreateLocationRequest>(body, new JsonSerializerSettings
            {
                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
            });

            if (locationRequest == null)
            {
                return await HttpResponseHelper.CreateBadRequestAsync(req, "Invalid JSON format");
            }

            var (isValid, errors) = ValidationHelper.ValidateCreateLocationRequest(locationRequest);
            if (!isValid)
            {
                return await HttpResponseHelper.CreateBadRequestAsync(req, "Invalid location data", string.Join(", ", errors));
            }

            var newLocation = await _locationService.CreateLocationAsync(locationRequest);
            
            logger.LogInformation("Created new location with ID: {LocationId}", newLocation.Id);
            return await HttpResponseHelper.CreateSuccessResponseAsync(req, newLocation, HttpStatusCode.Created);
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Invalid JSON in request body");
            return await HttpResponseHelper.CreateBadRequestAsync(req, "Invalid JSON format", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create location");
            return await HttpResponseHelper.CreateErrorResponseAsync(req, "Failed to create location", HttpStatusCode.InternalServerError, ex.Message);
        }
    }
}
