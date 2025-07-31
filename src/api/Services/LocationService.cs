using Microsoft.Azure.Cosmos;
using FreeWaterTips.Api.Models;

namespace FreeWaterTips.Api.Services;

public interface ILocationService
{
    Task<IEnumerable<Location>> GetLocationsAsync(LocationFilters filters);
    Task<IEnumerable<Location>> GetNearbyLocationsAsync(double lat, double lng, double radiusMeters);
    Task<IEnumerable<Location>> SearchLocationsAsync(string query, int limit);
    Task<Location> CreateLocationAsync(CreateLocationRequest request);
    Task<Location?> GetLocationByIdAsync(string id);
}

public class LocationService : ILocationService
{
    private readonly Container? _container;
    private readonly bool _useCosmosDb;

    public LocationService(Container? container = null)
    {
        _container = container;
        _useCosmosDb = container != null;
    }
    private static readonly List<Location> MockLocations = new()
    {
        new Location
        {
            Id = "1",
            Name = "Central Park Visitor Center",
            Address = "Central Park, New York, NY",
            Type = "park",
            City = "New York",
            Coordinates = new Coordinates { Lat = 40.7829, Lng = -73.9654 },
            Description = "Free water fountains available near the visitor center",
            Accessible = true,
            AlwaysAvailable = false,
            Rating = 4.5,
            CreatedAt = DateTime.Parse("2024-01-15T10:00:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-15T10:00:00Z"),
            Status = "active",
            Verified = true,
            Reports = 0
        },
        new Location
        {
            Id = "2",
            Name = "Starbucks Times Square",
            Address = "1585 Broadway, New York, NY",
            Type = "cafe",
            City = "New York",
            Coordinates = new Coordinates { Lat = 40.7580, Lng = -73.9855 },
            Description = "Ask barista for free water cup",
            Accessible = true,
            AlwaysAvailable = false,
            Rating = 4.2,
            CreatedAt = DateTime.Parse("2024-01-16T14:30:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-16T14:30:00Z"),
            Status = "active",
            Verified = true,
            Reports = 0
        },
        new Location
        {
            Id = "3",
            Name = "Washington Square Park",
            Address = "Washington Square Park, New York, NY",
            Type = "public-fountain",
            City = "New York",
            Coordinates = new Coordinates { Lat = 40.7308, Lng = -73.9973 },
            Description = "Public water fountain near the arch",
            Accessible = true,
            AlwaysAvailable = true,
            Rating = 4.0,
            CreatedAt = DateTime.Parse("2024-01-17T09:15:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-17T09:15:00Z"),
            Status = "active",
            Verified = true,
            Reports = 0
        },
        new Location
        {
            Id = "4",
            Name = "Brooklyn Bridge Park",
            Address = "Brooklyn Bridge Park, Brooklyn, NY",
            Type = "park",
            Coordinates = new Coordinates { Lat = 40.7023, Lng = -73.9969 },
            Description = "Multiple water fountains throughout the park",
            Accessible = true,
            AlwaysAvailable = true,
            Rating = 4.3,
            CreatedAt = DateTime.Parse("2024-01-18T11:20:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-18T11:20:00Z"),
            Status = "active",
            Verified = false,
            Reports = 0
        },
        new Location
        {
            Id = "5",
            Name = "McDonald's Penn Station",
            Address = "2 Penn Plaza, New York, NY",
            Type = "fast-food",
            Coordinates = new Coordinates { Lat = 40.7505, Lng = -73.9934 },
            Description = "Free water cups available at counter",
            Accessible = true,
            AlwaysAvailable = false,
            Rating = 3.8,
            CreatedAt = DateTime.Parse("2024-01-19T16:45:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-19T16:45:00Z"),
            Status = "active",
            Verified = false,
            Reports = 1
        },
        new Location
        {
            Id = "6",
            Name = "High Line Park",
            Address = "High Line, New York, NY",
            Type = "park",
            Coordinates = new Coordinates { Lat = 40.7480, Lng = -74.0048 },
            Description = "Water stations along the elevated park",
            Accessible = false,
            AlwaysAvailable = true,
            Rating = 4.6,
            CreatedAt = DateTime.Parse("2024-01-20T08:30:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-20T08:30:00Z"),
            Status = "active",
            Verified = true,
            Reports = 0
        },
        new Location
        {
            Id = "7",
            Name = "Bryant Park",
            Address = "Bryant Park, New York, NY",
            Type = "park",
            Coordinates = new Coordinates { Lat = 40.7536, Lng = -73.9832 },
            Description = "Drinking fountains near the restrooms",
            Accessible = true,
            AlwaysAvailable = false,
            Rating = 4.1,
            CreatedAt = DateTime.Parse("2024-01-21T13:15:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-21T13:15:00Z"),
            Status = "active",
            Verified = true,
            Reports = 0
        },
        new Location
        {
            Id = "8",
            Name = "Union Square Greenmarket",
            Address = "Union Square, New York, NY",
            Type = "public-fountain",
            Coordinates = new Coordinates { Lat = 40.7359, Lng = -73.9906 },
            Description = "Public water fountain in the square",
            Accessible = true,
            AlwaysAvailable = true,
            Rating = 3.9,
            CreatedAt = DateTime.Parse("2024-01-22T10:00:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-22T10:00:00Z"),
            Status = "active",
            Verified = false,
            Reports = 0
        },
        new Location
        {
            Id = "9",
            Name = "Chelsea Market",
            Address = "75 9th Ave, New York, NY",
            Type = "shopping-center",
            Coordinates = new Coordinates { Lat = 40.7420, Lng = -74.0065 },
            Description = "Water fountains near food court area",
            Accessible = true,
            AlwaysAvailable = false,
            Rating = 4.0,
            CreatedAt = DateTime.Parse("2024-01-23T14:20:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-23T14:20:00Z"),
            Status = "active",
            Verified = true,
            Reports = 0
        },
        new Location
        {
            Id = "10",
            Name = "Pier 25 Hudson River Park",
            Address = "Pier 25, New York, NY",
            Type = "park",
            Coordinates = new Coordinates { Lat = 40.7197, Lng = -74.0143 },
            Description = "Outdoor water fountains near playground",
            Accessible = true,
            AlwaysAvailable = true,
            Rating = 4.2,
            CreatedAt = DateTime.Parse("2024-01-24T09:45:00Z"),
            UpdatedAt = DateTime.Parse("2024-01-24T09:45:00Z"),
            Status = "active",
            Verified = false,
            Reports = 0
        }
    };

    private static List<Location> GetMockLocations()
    {
        return MockLocations.ToList();
    }

    public async Task<IEnumerable<Location>> GetLocationsAsync(LocationFilters filters)
    {
        if (!_useCosmosDb)
        {
            return GetMockLocations().Where(l => l.Status == "active").Take(filters.Limit);
        }

        try
        {
            var queryDefinition = new QueryDefinition("SELECT * FROM c WHERE c.status = @status");
            queryDefinition.WithParameter("@status", "active");

            if (!string.IsNullOrEmpty(filters.Type))
            {
                queryDefinition = new QueryDefinition("SELECT * FROM c WHERE c.status = @status AND c.type = @type");
                queryDefinition.WithParameter("@status", "active");
                queryDefinition.WithParameter("@type", filters.Type);
            }

            var query = _container!.GetItemQueryIterator<Location>(queryDefinition);
            var results = new List<Location>();

            while (query.HasMoreResults && results.Count < filters.Limit)
            {
                var response = await query.ReadNextAsync();
                results.AddRange(response);
            }

            return results.Take(filters.Limit);
        }
        catch
        {
            // Fallback to mock data if CosmosDB is not available
            return GetMockLocations().Where(l => l.Status == "active").Take(filters.Limit);
        }
    }

    public Task<IEnumerable<Location>> GetNearbyLocationsAsync(double lat, double lng, double radiusMeters)
    {
        // TODO: Replace with actual database query when data layer is implemented
        var locations = MockLocations
            .Where(l => l.Status == "active")
            .Select(l => new Location
            {
                Id = l.Id,
                Name = l.Name,
                Address = l.Address,
                Type = l.Type,
                Coordinates = l.Coordinates,
                Description = l.Description,
                Accessible = l.Accessible,
                AlwaysAvailable = l.AlwaysAvailable,
                Rating = l.Rating,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt,
                Status = l.Status,
                Verified = l.Verified,
                Reports = l.Reports,
                Distance = CalculateDistance(lat, lng, l.Coordinates.Lat, l.Coordinates.Lng)
            })
            .Where(l => l.Distance <= radiusMeters)
            .OrderBy(l => l.Distance);

        return Task.FromResult(locations.AsEnumerable());
    }

    public Task<IEnumerable<Location>> SearchLocationsAsync(string query, int limit)
    {
        // TODO: Replace with actual database search when data layer is implemented
        var searchQuery = query.ToLowerInvariant();
        
        var locations = MockLocations
            .Where(l => l.Status == "active")
            .Where(l => 
                l.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ||
                l.Address.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ||
                l.Type.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ||
                (l.Description?.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ?? false))
            .OrderBy(l => l.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ? 0 : 1) // Name matches first
            .ThenByDescending(l => l.Rating)
            .Take(Math.Min(limit, 50));

        return Task.FromResult(locations.AsEnumerable());
    }

    public Task<Location> CreateLocationAsync(CreateLocationRequest request)
    {
        // TODO: Replace with actual database insert when data layer is implemented
        var newLocation = new Location
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name.Trim(),
            Address = request.Address.Trim(),
            Type = string.IsNullOrEmpty(request.Type) ? "other" : request.Type.Trim(),
            Coordinates = request.Coordinates,
            Description = request.Description?.Trim(),
            Accessible = request.Accessible,
            AlwaysAvailable = request.AlwaysAvailable,
            Rating = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = "pending", // New locations start as pending
            Verified = false,
            Reports = 0
        };

        return Task.FromResult(newLocation);
    }

    public Task<Location?> GetLocationByIdAsync(string id)
    {
        // TODO: Replace with actual database query when data layer is implemented
        var location = MockLocations.FirstOrDefault(l => l.Id == id);
        return Task.FromResult(location);
    }

    private static double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371000; // Earth's radius in meters
        var dLat = ToRadians(lat2 - lat1);
        var dLng = ToRadians(lng2 - lng1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }
}
