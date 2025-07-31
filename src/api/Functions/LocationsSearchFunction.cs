using System.Net;
using FreeWaterTips.Api.Models;
using FreeWaterTips.Api.Services;
using FreeWaterTips.Api.Utils;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace FreeWaterTips.Api.Functions;

public class LocationsSearchFunction
{
    private readonly ILogger<LocationsSearchFunction> logger;
    private readonly ILocationService _locationService;

    public LocationsSearchFunction(ILogger<LocationsSearchFunction> logger, ILocationService locationService)
    {
        this.logger = logger;
        _locationService = locationService;
    }

    [Function("LocationsSearch")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "locations/search")] 
        HttpRequestData req)
    {
        logger.LogInformation("Search locations requested");

        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            
            var searchQuery = new SearchQuery
            {
                Q = query["q"] ?? string.Empty,
                Limit = int.TryParse(query["limit"], out var limit) ? limit : 50
            };

            var (isValid, errors) = ValidationHelper.ValidateSearchQuery(searchQuery);
            if (!isValid)
            {
                return await HttpResponseHelper.CreateBadRequestAsync(req, "Invalid search parameters", string.Join(", ", errors));
            }

            var searchResults = await _locationService.SearchLocationsAsync(searchQuery.Q, searchQuery.Limit);
            var resultsList = searchResults.ToList();

            logger.LogInformation("Found {Count} locations matching query: \"{Query}\"", resultsList.Count, searchQuery.Q);
            return await HttpResponseHelper.CreateSuccessResponseAsync(req, resultsList);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to search locations");
            return await HttpResponseHelper.CreateErrorResponseAsync(req, "Failed to search locations", HttpStatusCode.InternalServerError, ex.Message);
        }
    }
}
