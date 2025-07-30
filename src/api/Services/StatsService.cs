using FreeWaterTips.Api.Models;

namespace FreeWaterTips.Api.Services;

public interface IStatsService
{
    Task<StatsResponse> GetStatsAsync();
}

public class StatsService : IStatsService
{
    private readonly ILocationService _locationService;

    public StatsService(ILocationService locationService)
    {
        _locationService = locationService;
    }

    public async Task<StatsResponse> GetStatsAsync()
    {
        // TODO: Replace with actual database queries when data layer is implemented
        // For now, calculate from mock data
        var allLocations = await _locationService.GetLocationsAsync(new LocationFilters { Limit = 1000 });
        var locationsList = allLocations.ToList();

        var stats = new StatsResponse
        {
            TotalLocations = locationsList.Count,
            VerifiedLocations = locationsList.Count(l => l.Verified),
            ActiveLocations = locationsList.Count(l => l.Status == "active"),
            AccessibleLocations = locationsList.Count(l => l.Accessible),
            AlwaysAvailableLocations = locationsList.Count(l => l.AlwaysAvailable),
            AverageRating = locationsList.Any() ? Math.Round(locationsList.Average(l => l.Rating), 1) : 0,
            LastUpdated = DateTime.UtcNow
        };

        // Calculate locations by type
        stats.LocationsByType = locationsList
            .GroupBy(l => l.Type)
            .ToDictionary(g => g.Key, g => g.Count());

        return stats;
    }
}
