using System.Net;
using FreeWaterTips.Api.Models;
using FreeWaterTips.Api.Services;
using FreeWaterTips.Api.Utils;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace FreeWaterTips.Api.Functions;

public class LocationsNearbyFunction
{
    private readonly ILogger<LocationsNearbyFunction> logger;
    private readonly ILocationService _locationService;

    public LocationsNearbyFunction(ILogger<LocationsNearbyFunction> logger, ILocationService locationService)
    {
        this.logger = logger;
        _locationService = locationService;
    }

    [Function("LocationsNearby")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "locations/nearby")] 
        HttpRequestData req)
    {
        logger.LogInformation("Get nearby locations requested");

        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            
            if (!double.TryParse(query["lat"], out var lat) || !double.TryParse(query["lng"], out var lng))
            {
                return await HttpResponseHelper.CreateBadRequestAsync(req, "Latitude and longitude are required");
            }

            var radius = double.TryParse(query["radius"], out var r) ? r : 
                         double.TryParse(Environment.GetEnvironmentVariable("DEFAULT_SEARCH_RADIUS"), out var defaultRadius) ? defaultRadius : 5000;

            var nearbyQuery = new NearbyLocationsQuery
            {
                Lat = lat,
                Lng = lng,
                Radius = radius
            };

            var (isValid, errors) = ValidationHelper.ValidateNearbyQuery(nearbyQuery);
            if (!isValid)
            {
                return await HttpResponseHelper.CreateBadRequestAsync(req, "Invalid query parameters", string.Join(", ", errors));
            }

            var nearbyLocations = await _locationService.GetNearbyLocationsAsync(lat, lng, radius);
            var locationsList = nearbyLocations.ToList();

            logger.LogInformation("Found {Count} locations within {Radius}m of ({Lat}, {Lng})", 
                locationsList.Count, radius, lat, lng);
            
            return await HttpResponseHelper.CreateSuccessResponseAsync(req, locationsList);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch nearby locations");
            return await HttpResponseHelper.CreateErrorResponseAsync(req, "Failed to fetch nearby locations", HttpStatusCode.InternalServerError, ex.Message);
        }
    }
}
