using System.ComponentModel.DataAnnotations;
using FreeWaterTips.Api.Models;

namespace FreeWaterTips.Api.Utils;

public static class ValidationHelper
{
    public static bool IsValidLatitude(double lat) => lat >= -90 && lat <= 90;
    
    public static bool IsValidLongitude(double lng) => lng >= -180 && lng <= 180;
    
    public static bool IsValidRadius(double radius, double max = 50000) => radius > 0 && radius <= max;

    public static bool IsValidString(string? str, int minLength = 1, int maxLength = 1000)
    {
        return !string.IsNullOrWhiteSpace(str) && 
               str.Length >= minLength && 
               str.Length <= maxLength;
    }

    public static string SanitizeString(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Basic sanitization - remove potentially harmful characters
        return input.Trim()
            .Replace("<", "")
            .Replace(">", "")
            .Replace("\"", "")
            .Replace("'", "")
            .Replace("&", "");
    }

    public static (bool IsValid, List<string> Errors) ValidateCreateLocationRequest(CreateLocationRequest request)
    {
        var errors = new List<string>();

        if (!IsValidString(request.Name, 1, 200))
        {
            errors.Add("Name is required and must be 1-200 characters");
        }

        if (!IsValidString(request.Address, 1, 500))
        {
            errors.Add("Address is required and must be 1-500 characters");
        }

        if (!IsValidLatitude(request.Coordinates.Lat))
        {
            errors.Add("Invalid latitude value (must be between -90 and 90)");
        }

        if (!IsValidLongitude(request.Coordinates.Lng))
        {
            errors.Add("Invalid longitude value (must be between -180 and 180)");
        }

        if (!string.IsNullOrEmpty(request.Type) && !IsValidString(request.Type, 1, 50))
        {
            errors.Add("Type must be 1-50 characters");
        }

        if (!string.IsNullOrEmpty(request.Description) && request.Description.Length > 1000)
        {
            errors.Add("Description must be less than 1000 characters");
        }

        return (errors.Count == 0, errors);
    }

    public static (bool IsValid, List<string> Errors) ValidateNearbyQuery(NearbyLocationsQuery query)
    {
        var errors = new List<string>();

        if (!IsValidLatitude(query.Lat))
        {
            errors.Add("Invalid latitude value (must be between -90 and 90)");
        }

        if (!IsValidLongitude(query.Lng))
        {
            errors.Add("Invalid longitude value (must be between -180 and 180)");
        }

        if (!IsValidRadius(query.Radius))
        {
            errors.Add("Invalid radius value (must be between 0 and 50000 meters)");
        }

        return (errors.Count == 0, errors);
    }

    public static (bool IsValid, List<string> Errors) ValidateSearchQuery(SearchQuery query)
    {
        var errors = new List<string>();

        if (!IsValidString(query.Q, 1, 100))
        {
            errors.Add("Search query is required and must be 1-100 characters");
        }

        if (query.Limit <= 0 || query.Limit > 50)
        {
            errors.Add("Limit must be between 1 and 50");
        }

        return (errors.Count == 0, errors);
    }
}
