using System.Text.Json.Serialization;

namespace FreeWaterTips.Api.Models;

public class Location
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Coordinates Coordinates { get; set; } = new();
    public string? Description { get; set; }
    public bool Accessible { get; set; }
    public bool AlwaysAvailable { get; set; }
    public double Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Status { get; set; } = "active";
    public bool Verified { get; set; }
    public int Reports { get; set; }
    public double? Distance { get; set; } // For nearby queries
}

public class Coordinates
{
    public double Lat { get; set; }
    public double Lng { get; set; }
}

public class CreateLocationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Coordinates Coordinates { get; set; } = new();
    public string? Description { get; set; }
    public bool Accessible { get; set; }
    public bool AlwaysAvailable { get; set; }
}

public class LocationFilters
{
    public string? Type { get; set; }
    public bool? Verified { get; set; }
    public bool? Accessible { get; set; }
    public bool? AlwaysAvailable { get; set; }
    public int Limit { get; set; } = 100;
}

public class NearbyLocationsQuery
{
    public double Lat { get; set; }
    public double Lng { get; set; }
    public double Radius { get; set; } = 5000; // Default 5km
}

public class SearchQuery
{
    public string Q { get; set; } = string.Empty;
    public int Limit { get; set; } = 50;
}
