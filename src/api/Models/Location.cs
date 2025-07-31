using Newtonsoft.Json;

namespace FreeWaterTips.Api.Models;

public class Location
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonProperty("address")]
    public string Address { get; set; } = string.Empty;
    
    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty;
    
    [JsonProperty("coordinates")]
    public Coordinates Coordinates { get; set; } = new();
    
    [JsonProperty("description")]
    public string? Description { get; set; }
    
    [JsonProperty("accessible")]
    public bool Accessible { get; set; }
    
    [JsonProperty("alwaysAvailable")]
    public bool AlwaysAvailable { get; set; }
    
    [JsonProperty("rating")]
    public double Rating { get; set; }
    
    [JsonProperty("createdAt")]
    public DateTime CreatedAt { get; set; }
    
    [JsonProperty("updatedAt")]
    public DateTime UpdatedAt { get; set; }
    
    [JsonProperty("status")]
    public string Status { get; set; } = "active";
    
    [JsonProperty("verified")]
    public bool Verified { get; set; }
    
    [JsonProperty("reports")]
    public int Reports { get; set; }
    
    [JsonProperty("city")]
    public string City { get; set; } = string.Empty; // Partition key
    
    [JsonIgnore]
    public double? Distance { get; set; } // For nearby queries, not stored in DB
}

public class Coordinates
{
    [JsonProperty("lat")]
    public double Lat { get; set; }
    
    [JsonProperty("lng")]
    public double Lng { get; set; }
}

public class CreateLocationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
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
